// controllers/dataController.js
import Data from "../models/dataModel.js";
import { generateDocumentSummary, generateEmbeddingForText } from "./ragController.js";

// ✅ Save prediction / urban data
export const saveData = async (req, res) => {
  try {
    const {
      analysisResult,
      pollutionLevel,
      city,
      population,
      density,
      growth,
      year,
      prediction,
      urbanData,
    } = req.body;

    // ✅ take user from token
    const userId = req.user.id;
    const username = req.user.username;

    // ✅ Force city to Pune if not provided or wrongly sent as "system"
    let finalCity = city;
    if (!finalCity || finalCity.toLowerCase() === "system") {
      finalCity = "Pune";
    }

    const newData = new Data({
      userId,
      username,
      action: "PREDICT",
      analysisResult,
      pollutionLevel: pollutionLevel || "Medium",
      city: finalCity,
      population,
      density,
      growth,
      year,
      prediction,
      urbanData,
    });

    // Generate vector embedding for RAG
    try {
      if (process.env.GOOGLE_API_KEY) {
        const summaryText = generateDocumentSummary(newData);
        const vector = await generateEmbeddingForText(summaryText);
        newData.embedding = vector;
      }
    } catch (embErr) {
      console.warn("⚠️ Failed to generate embedding for new data:", embErr.message);
    }

    await newData.save();

    res.status(201).json({
      message: "✅ Data saved successfully!",
      data: newData,
    });
  } catch (error) {
    console.error("❌ Save Data Error:", error);
    res.status(500).json({
      message: "❌ Error saving data",
      error: error.message,
    });
  }
};

// ✅ Get all stored data
export const getData = async (req, res) => {
  try {
    const data = await Data.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username");

    res.status(200).json({
      message: "✅ Data fetched successfully!",
      data,
    });
  } catch (error) {
    console.error("❌ Get Data Error:", error);
    res.status(500).json({
      message: "❌ Error retrieving data",
      error: error.message,
    });
  }
};

// ✅ Urban analytics summary
export const getUrbanAnalytics = async (req, res) => {
  try {
    const analytics = await Data.aggregate([
      {
        $group: {
          _id: "$city",
          totalRecords: { $sum: 1 },
          avgPollution: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$pollutionLevel", "Low"] }, then: 1 },
                  { case: { $eq: ["$pollutionLevel", "Medium"] }, then: 2 },
                  { case: { $eq: ["$pollutionLevel", "High"] }, then: 3 },
                ],
                default: 2,
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      message: "✅ Urban analytics generated!",
      analytics,
    });
  } catch (error) {
    console.error("❌ Analytics Error:", error);
    res.status(500).json({
      message: "❌ Error generating analytics",
      error: error.message,
    });
  }
};