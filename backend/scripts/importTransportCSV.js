import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
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

const createSampleData = async () => {
    try {
        console.log("📊 Creating sample transport data...");

        // Clear existing data
        await Transport.deleteMany({ source: "Sample" });
        console.log("🧹 Cleared existing sample data");

        const sampleData = [];
        const startDate = new Date(2024, 0, 1);
        const userId = new mongoose.Types.ObjectId();

        // Create 365 days of sample data
        for (let i = 0; i < 365; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            // Simulate traffic patterns
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const month = date.getMonth();
            const isMonsoon = month >= 6 && month <= 9; // June to September

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

            // Adjust for monsoon (worse traffic)
            if (isMonsoon) {
                trafficIndex += 15;
                avgSpeed -= 3;
                congestionLevel += 10;
            }

            // Generate data for different times of day
            const times = [7, 10, 13, 16, 19, 22]; // 7 AM, 10 AM, 1 PM, 4 PM, 7 PM, 10 PM

            for (const hour of times) {
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

                // Add some randomness
                hourTrafficIndex += Math.random() * 20 - 10;
                hourAvgSpeed += Math.random() * 5 - 2.5;
                hourCongestion += Math.random() * 15 - 7.5;

                // Ensure values are within bounds
                hourTrafficIndex = Math.max(50, Math.min(200, hourTrafficIndex));
                hourAvgSpeed = Math.max(10, Math.min(60, hourAvgSpeed));
                hourCongestion = Math.max(10, Math.min(100, hourCongestion));

                sampleData.push({
                    city: "Pune",
                    date: hourDate,
                    trafficIndex: Math.round(hourTrafficIndex),
                    avgSpeed: Math.round(hourAvgSpeed * 10) / 10,
                    congestionLevel: Math.round(hourCongestion),
                    accidents: Math.floor(Math.random() * 3),
                    publicTransportUsage: 800000 + Math.floor(Math.random() * 200000),
                    dayOfWeek: dayOfWeek,
                    month: month + 1,
                    year: date.getFullYear(),
                    hour: hour,
                    location: {
                        type: "Point",
                        coordinates: [73.8567 + (Math.random() * 0.1 - 0.05), 18.5204 + (Math.random() * 0.1 - 0.05)]
                    },
                    userId: userId,
                    username: "system",
                    source: "Mock"
                });
            }
        }

        // Insert in batches of 500
        const batchSize = 500;
        let totalInserted = 0;

        for (let i = 0; i < sampleData.length; i += batchSize) {
            const batch = sampleData.slice(i, i + batchSize);
            await Transport.insertMany(batch);
            totalInserted += batch.length;
            console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${totalInserted}/${sampleData.length}`);
        }

        console.log(`\n🎉 Created ${sampleData.length} sample transport records`);

        // Show summary
        const stats = await Transport.aggregate([
            { $match: { source: "Sample" } },
            {
                $group: {
                    _id: "$city",
                    avgTrafficIndex: { $avg: "$trafficIndex" },
                    avgSpeed: { $avg: "$avgSpeed" },
                    avgCongestion: { $avg: "$congestionLevel" },
                    totalRecords: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            console.log("\n📊 Sample Data Statistics:");
            console.log("==========================");
            console.log(`City: ${stats[0]._id}`);
            console.log(`Total Records: ${stats[0].totalRecords}`);
            console.log(`Average Traffic Index: ${stats[0].avgTrafficIndex.toFixed(2)}`);
            console.log(`Average Speed: ${stats[0].avgSpeed.toFixed(2)} km/h`);
            console.log(`Average Congestion: ${stats[0].avgCongestion.toFixed(2)}%`);
        }

    } catch (error) {
        console.error("❌ Error creating sample data:", error);
    }
};

// Run the import
connectDB().then(async () => {
    try {
        const csvFilePath = path.join(__dirname, "..", "..", "data", "pune_traffic_data_2010_2026.csv");

        if (fs.existsSync(csvFilePath)) {
            console.log("📂 Found CSV file:", csvFilePath);
            console.log("💡 Note: CSV import not implemented. Creating sample data instead.");
            await createSampleData();
        } else {
            console.log("📋 CSV file not found. Creating sample data...");
            await createSampleData();
        }

        console.log("\n✅ Transport data import completed!");
        console.log("🚀 Next steps:");
        console.log("   1. Start the backend: npm run dev");
        console.log("   2. Test the API: http://localhost:5000/api/transport");
        console.log("   3. Access from frontend: http://localhost:5173/transport");

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error("❌ Import error:", error);
        process.exit(1);
    }
});