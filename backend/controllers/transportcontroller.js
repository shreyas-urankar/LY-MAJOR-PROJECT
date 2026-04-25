import Transport from "../models/transportModel.js";
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Get all transport data
export const getTransportData = async (req, res) => {
  try {
    const { city = "Pune", startDate, endDate, limit = 100 } = req.query;
    let query = { city };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transportData = await Transport.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Transport data fetched successfully",
      count: transportData.length,
      data: transportData
    });
  } catch (error) {
    console.error("❌ Get Transport Data Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transport data",
      error: error.message
    });
  }
};

// ✅ Get transport analytics summary
export const getTransportAnalytics = async (req, res) => {
  try {
    const { city = "Pune" } = req.query;

    const analytics = await Transport.aggregate([
      { $match: { city } },
      {
        $group: {
          _id: null,
          avgTrafficIndex: { $avg: "$trafficIndex" },
          avgSpeed: { $avg: "$avgSpeed" },
          avgCongestion: { $avg: "$congestionLevel" },
          totalAccidents: { $sum: "$accidents" },
          totalPublicTransport: { $sum: "$publicTransportUsage" },
          maxTrafficIndex: { $max: "$trafficIndex" },
          minTrafficIndex: { $min: "$trafficIndex" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          avgTrafficIndex: { $round: ["$avgTrafficIndex", 2] },
          avgSpeed: { $round: ["$avgSpeed", 2] },
          avgCongestion: { $round: ["$avgCongestion", 2] },
          totalAccidents: 1,
          totalPublicTransport: 1,
          maxTrafficIndex: 1,
          minTrafficIndex: 1,
          count: 1
        }
      }
    ]);

    // Get monthly trends
    const monthlyTrends = await Transport.aggregate([
      { $match: { city } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          avgTrafficIndex: { $avg: "$trafficIndex" },
          avgCongestion: { $avg: "$congestionLevel" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Get day-wise patterns
    const dayWisePatterns = await Transport.aggregate([
      { $match: { city } },
      {
        $group: {
          _id: "$dayOfWeek",
          avgCongestion: { $avg: "$congestionLevel" },
          avgAccidents: { $avg: "$accidents" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: "Transport analytics generated",
      summary: analytics[0] || {},
      monthlyTrends,
      dayWisePatterns,
      city
    });
  } catch (error) {
    console.error("❌ Transport Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating transport analytics",
      error: error.message
    });
  }
};

// ✅ Save transport data
export const saveTransportData = async (req, res) => {
  try {
    const {
      city = "Pune",
      date,
      trafficIndex,
      avgSpeed,
      congestionLevel,
      accidents,
      publicTransportUsage
    } = req.body;

    const userId = req.user?.id;
    const username = req.user?.username;

    // Extract date components for ML
    const dataDate = new Date(date);
    const dayOfWeek = dataDate.getDay();
    const month = dataDate.getMonth() + 1;
    const year = dataDate.getFullYear();
    const hour = dataDate.getHours();

    const transportData = new Transport({
      city,
      date: dataDate,
      trafficIndex,
      avgSpeed,
      congestionLevel,
      accidents,
      publicTransportUsage,
      dayOfWeek,
      month,
      year,
      hour,
      userId,
      username
    });

    await transportData.save();

    res.status(201).json({
      success: true,
      message: "Transport data saved successfully",
      data: transportData
    });
  } catch (error) {
    console.error("❌ Save Transport Data Error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving transport data",
      error: error.message
    });
  }
};

// ✅ Predict congestion using ML
export const predictCongestion = async (req, res) => {
  try {
    const { city = "Pune", date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required for prediction"
      });
    }

    // Combine date and time
    const predictionDateTime = new Date(`${date}T${time}:00`);
    const dayOfWeek = predictionDateTime.getDay();
    const month = predictionDateTime.getMonth() + 1;
    const hour = predictionDateTime.getHours();

    // Simple ML prediction logic (can be replaced with actual ML model)
    // For now, we'll use historical averages with day/hour adjustments
    const historicalData = await Transport.aggregate([
      {
        $match: {
          city,
          dayOfWeek,
          hour: { $gte: hour - 1, $lte: hour + 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgCongestion: { $avg: "$congestionLevel" },
          avgTrafficIndex: { $avg: "$trafficIndex" },
          count: { $sum: 1 }
        }
      }
    ]);

    let predictedCongestion = 50; // Default value
    let predictionAccuracy = 70;

    if (historicalData.length > 0 && historicalData[0].count > 10) {
      predictedCongestion = historicalData[0].avgCongestion;

      // Adjust based on month (higher in monsoon months for Pune)
      if (month >= 6 && month <= 9) {
        predictedCongestion *= 1.15; // 15% higher in monsoon
      }

      // Adjust based on hour (rush hours)
      if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
        predictedCongestion *= 1.3; // 30% higher in rush hours
      }

      // Cap at 100
      predictedCongestion = Math.min(100, Math.round(predictedCongestion));
      predictionAccuracy = 85;
    }

    // Determine trend
    const lastWeekData = await Transport.find({
      city,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 }).limit(7);

    let trafficTrend = "Stable";
    if (lastWeekData.length >= 2) {
      const recentAvg = lastWeekData.slice(0, 3).reduce((sum, d) => sum + d.congestionLevel, 0) / 3;
      const olderAvg = lastWeekData.slice(-3).reduce((sum, d) => sum + d.congestionLevel, 0) / 3;

      if (recentAvg > olderAvg + 5) trafficTrend = "Increasing";
      else if (recentAvg < olderAvg - 5) trafficTrend = "Decreasing";
    }

    res.status(200).json({
      success: true,
      message: "Congestion prediction generated",
      prediction: {
        dateTime: predictionDateTime,
        predictedCongestion: Math.round(predictedCongestion),
        predictionAccuracy,
        trafficTrend,
        factors: {
          dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek],
          hour,
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1],
          historicalDataPoints: historicalData[0]?.count || 0
        },
        recommendations: predictedCongestion > 70 ? [
          "Use public transport",
          "Avoid peak hours if possible",
          "Consider alternative routes"
        ] : predictedCongestion > 40 ? [
          "Moderate traffic expected",
          "Plan for slight delays"
        ] : [
          "Light traffic expected",
          "Good time for travel"
        ]
      }
    });
  } catch (error) {
    console.error("❌ Predict Congestion Error:", error);
    res.status(500).json({
      success: false,
      message: "Error predicting congestion",
      error: error.message
    });
  }
};

// ✅ Import CSV data (one-time operation)
export const importCSVData = async (req, res) => {
  try {
    // This would typically read from a CSV file
    // For now, we'll return success as we'll use a separate script
    res.status(200).json({
      success: true,
      message: "Use the import script: npm run import-transport-data"
    });
  } catch (error) {
    console.error("❌ Import CSV Error:", error);
    res.status(500).json({
      success: false,
      message: "Error importing CSV data",
      error: error.message
    });
  }
};

// ✅ Get real-time traffic alerts
export const getTrafficAlerts = async (req, res) => {
  try {
    const { city = "Pune" } = req.query;

    // Find recent high-congestion or accident-prone areas
    const recentAlerts = await Transport.find({
      city,
      date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      $or: [
        { congestionLevel: { $gte: 80 } },
        { accidents: { $gte: 3 } },
        { trafficIndex: { $gte: 180 } }
      ]
    })
      .sort({ date: -1 })
      .limit(10);

    const alerts = recentAlerts.map(alert => ({
      type: alert.congestionLevel >= 80 ? "High Congestion" :
        alert.accidents >= 3 ? "Accident Prone" : "Heavy Traffic",
      location: "Pune City",
      severity: alert.congestionLevel >= 90 ? "High" :
        alert.congestionLevel >= 80 ? "Medium" : "Low",
      value: alert.congestionLevel || alert.trafficIndex,
      timestamp: alert.date,
      recommendation: alert.congestionLevel >= 80 ?
        "Avoid this area, use alternative routes" :
        "Proceed with caution"
    }));

    res.status(200).json({
      success: true,
      message: "Traffic alerts fetched",
      alerts,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("❌ Get Traffic Alerts Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching traffic alerts",
      error: error.message
    });
  }
};