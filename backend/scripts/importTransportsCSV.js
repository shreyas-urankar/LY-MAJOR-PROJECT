import mongoose from "mongoose";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Transport from "../models/transportModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

const importCSVData = async () => {
  try {
    console.log("🚀 Starting CSV import...");
    
    // Clear existing data for Pune (optional)
    await Transport.deleteMany({ city: "Pune" });
    console.log("🧹 Cleared existing Pune transport data");
    
    const csvFilePath = path.join(__dirname, "..", "..", "data", "pune_traffic_data_2010_2026.csv");
    
    if (!fs.existsSync(csvFilePath)) {
      console.error("❌ CSV file not found at:", csvFilePath);
      console.log("📋 Creating sample data instead...");
      
      // Create sample data if CSV doesn't exist
      await createSampleData();
      return;
    }
    
    const transportData = [];
    
    // Read CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const date = new Date(row.date);
        transportData.push({
          city: row.city || "Pune",
          date: date,
          trafficIndex: parseFloat(row.trafficIndex) || 0,
          avgSpeed: parseFloat(row.avgSpeed) || 0,
          congestionLevel: parseFloat(row.congestionLevel) || 0,
          accidents: parseInt(row.accidents) || 0,
          publicTransportUsage: parseInt(row.publicTransportUsage) || 0,
          dayOfWeek: date.getDay(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          hour: 12, // Default to noon
          location: {
            type: "Point",
            coordinates: [73.8567, 18.5204] // Pune coordinates
          }
        });
      })
      .on('end', async () => {
        console.log(`📊 Read ${transportData.length} records from CSV`);
        
        // Insert in batches of 100
        const batchSize = 100;
        for (let i = 0; i < transportData.length; i += batchSize) {
          const batch = transportData.slice(i, i + batchSize);
          await Transport.insertMany(batch);
          console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}`);
        }
        
        console.log("🎉 CSV import completed successfully!");
        console.log(`📈 Total records in database: ${await Transport.countDocuments()}`);
        process.exit(0);
      });
    
  } catch (error) {
    console.error("❌ Import error:", error);
    process.exit(1);
  }
};

const createSampleData = async () => {
  try {
    const sampleData = [];
    const startDate = new Date(2024, 0, 1);
    
    // Create 365 days of sample data
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Simulate traffic patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const month = date.getMonth();
      
      // Base values
      let trafficIndex = 150;
      let avgSpeed = 25;
      let congestionLevel = 40;
      
      // Adjust for weekends
      if (isWeekend) {
        trafficIndex -= 20;
        avgSpeed += 5;
        congestionLevel -= 10;
      }
      
      // Adjust for rush hours (simulate)
      for (let hour = 0; hour < 24; hour += 3) { // Every 3 hours
        const hourDate = new Date(date);
        hourDate.setHours(hour);
        
        let hourTrafficIndex = trafficIndex;
        let hourAvgSpeed = avgSpeed;
        let hourCongestion = congestionLevel;
        
        // Rush hour adjustments
        if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
          hourTrafficIndex += 40;
          hourAvgSpeed -= 10;
          hourCongestion += 30;
        }
        
        // Night time adjustments
        if (hour >= 22 || hour <= 5) {
          hourTrafficIndex -= 30;
          hourAvgSpeed += 15;
          hourCongestion -= 20;
        }
        
        sampleData.push({
          city: "Pune",
          date: hourDate,
          trafficIndex: Math.max(50, Math.min(200, hourTrafficIndex + (Math.random() * 20 - 10))),
          avgSpeed: Math.max(10, Math.min(60, hourAvgSpeed + (Math.random() * 5 - 2.5))),
          congestionLevel: Math.max(10, Math.min(100, hourCongestion + (Math.random() * 15 - 7.5))),
          accidents: Math.floor(Math.random() * 5),
          publicTransportUsage: 800000 + Math.floor(Math.random() * 200000),
          dayOfWeek: dayOfWeek,
          month: month + 1,
          year: date.getFullYear(),
          hour: hour,
          location: {
            type: "Point",
            coordinates: [73.8567 + (Math.random() * 0.1 - 0.05), 18.5204 + (Math.random() * 0.1 - 0.05)]
          }
        });
      }
    }
    
    // Insert sample data
    await Transport.insertMany(sampleData);
    console.log(`✅ Created ${sampleData.length} sample records`);
    console.log("🎉 Sample data import completed successfully!");
    
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  }
};

// Run the import
connectDB().then(() => {
  importCSVData();
});