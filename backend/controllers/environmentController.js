import Environment from "../models/environmentModel.js";
import Data from "../models/dataModel.js";

// Get environment data
export const getEnvironmentData = async (req, res) => {
  try {
    console.log("🌿 Environment API called by:", req.user.username);
    console.log("📦 Request query:", req.query);
    console.log("🔑 User ID:", req.user.id);
    
    const { city, range = "week" } = req.query;
    const userId = req.user.id;
    
    let query = { userId };
    
    if (city && city !== "all") {
      query.city = city;
    }
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    query.createdAt = { $gte: startDate };
    
    const data = await Environment.find(query).sort({ createdAt: -1 }).limit(100);
    
    console.log(`✅ Found ${data.length} environment records`);
    
    // If no data, return mock data for demonstration
    if (data.length === 0) {
      console.log("📊 No data found, generating mock data");
      const mockData = generateMockData(city || "Pune", range);
      return res.status(200).json({
        success: true,
        message: "Using mock environment data for demonstration",
        data: mockData
      });
    }
    
    res.status(200).json({
      success: true,
      message: "✅ Environment data fetched successfully!",
      count: data.length,
      data
    });
  } catch (error) {
    console.error("❌ Get Environment Data Error:", error);
    res.status(500).json({
      success: false,
      message: "❌ Error retrieving environment data",
      error: error.message
    });
  }
};

// Save environment data
export const saveEnvironmentData = async (req, res) => {
  try {
    console.log("💾 Saving environment data...");
    console.log("👤 Request from user:", req.user.username);
    console.log("📦 Request body:", req.body);
    console.log("🔑 User ID:", req.user.id);
    
    const {
      city,
      aqi,
      pm25,
      pm10,
      co2,
      greenCover,
      waterQuality,
      temperature,
      humidity,
      windSpeed,
      pollutionLevel
    } = req.body;
    
    const userId = req.user.id;
    const username = req.user.username;
    
    // 1. Save to Environment collection
    const newEnvironment = new Environment({
      userId,
      username,
      city: city || "Pune",
      aqi: aqi || 85,
      pm25: pm25 || 42,
      pm10: pm10 || 78,
      co2: co2 || 455,
      greenCover: greenCover || 24.5,
      waterQuality: waterQuality || 72,
      temperature: temperature || 28,
      humidity: humidity || 65,
      windSpeed: windSpeed || 12,
      pollutionLevel: pollutionLevel || "Moderate",
      source: "User"
    });
    
    const savedEnv = await newEnvironment.save();
    console.log("✅ Environment data saved with ID:", savedEnv._id);
    
    // 2. Also save to main Data collection
    const analysisResult = `AQI: ${aqi}, Pollution: ${pollutionLevel}, Green: ${greenCover}%`;
    
    const mainData = new Data({
      userId,
      username,
      action: "ENVIRONMENT_UPDATE",
      analysisResult,
      city: city || "Pune",
      pollutionLevel: pollutionLevel || "Moderate",
      urbanData: {
        greenSpaces: greenCover || 24.5,
        trafficIndex: 65,
        housingIndex: 72,
        employmentRate: 85
      }
    });
    
    await mainData.save();
    console.log("✅ Also saved to main Data collection");
    
    res.status(201).json({
      success: true,
      message: "✅ Environment data saved successfully!",
      data: savedEnv,
      savedToMainCollection: true
    });
  } catch (error) {
    console.error("❌ Save Environment Data Error:", error);
    res.status(500).json({
      success: false,
      message: "❌ Error saving environment data",
      error: error.message
    });
  }
};

// Get environment analytics
export const getEnvironmentAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const analytics = await Environment.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$city",
          avgAQI: { $avg: "$aqi" },
          avgPM25: { $avg: "$pm25" },
          avgGreenCover: { $avg: "$greenCover" },
          totalRecords: { $sum: 1 },
          latestAQI: { $last: "$aqi" }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: "✅ Environment analytics generated!",
      analytics
    });
  } catch (error) {
    console.error("❌ Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "❌ Error generating environment analytics",
      error: error.message
    });
  }
};

// Get city comparison
export const getCityComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cities = ["Pune", "Mumbai", "Delhi", "Bangalore", "Chennai"];
    const comparison = [];
    
    for (const city of cities) {
      const latest = await Environment.findOne({ userId, city }).sort({ createdAt: -1 });
      
      if (latest) {
        comparison.push({
          city,
          aqi: latest.aqi,
          pm25: latest.pm25,
          pm10: latest.pm10,
          greenCover: latest.greenCover,
          pollutionLevel: latest.pollutionLevel,
          lastUpdated: latest.createdAt
        });
      } else {
        // Mock data for cities without records
        comparison.push({
          city,
          aqi: Math.floor(Math.random() * 150) + 30,
          pm25: Math.floor(Math.random() * 80) + 10,
          pm10: Math.floor(Math.random() * 120) + 20,
          greenCover: Math.floor(Math.random() * 30) + 10,
          pollutionLevel: ["Good", "Moderate", "Unhealthy"][Math.floor(Math.random() * 3)],
          lastUpdated: new Date()
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: "✅ City comparison generated!",
      comparison
    });
  } catch (error) {
    console.error("❌ City Comparison Error:", error);
    res.status(500).json({
      success: false,
      message: "❌ Error generating city comparison",
      error: error.message
    });
  }
};

// Helper function to generate mock data
const generateMockData = (city, range) => {
  const mockData = [];
  const now = new Date();
  let days = range === "week" ? 7 : range === "month" ? 30 : 365;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    const baseAQI = 80 + Math.sin(i * 0.3) * 20 + Math.random() * 10;
    const pm25 = 30 + Math.sin(i * 0.4) * 15 + Math.random() * 8;
    const pm10 = 50 + Math.sin(i * 0.35) * 20 + Math.random() * 12;
    const co2 = 400 + Math.sin(i * 0.25) * 50 + Math.random() * 30;
    const greenCover = 25 + Math.sin(i * 0.1) * 5 + Math.random() * 3;
    
    mockData.push({
      city,
      date: date.toISOString().split('T')[0],
      aqi: Math.round(baseAQI),
      pm25: Math.round(pm25),
      pm10: Math.round(pm10),
      co2: Math.round(co2),
      greenCover: Math.round(greenCover * 10) / 10,
      waterQuality: Math.round(65 + Math.sin(i * 0.2) * 15),
      temperature: Math.round(28 + Math.sin(i * 0.15) * 5),
      humidity: Math.round(60 + Math.sin(i * 0.25) * 15),
      windSpeed: Math.round(8 + Math.sin(i * 0.3) * 4),
      pollutionLevel: baseAQI <= 50 ? "Good" : baseAQI <= 100 ? "Moderate" : "Unhealthy"
    });
  }
  
  return mockData;
};
// .......