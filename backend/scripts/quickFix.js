import mongoose from "mongoose";
import dotenv from "dotenv";
import Population from "../models/populationModel.js";
import Transport from "../models/transportModel.js";
import Environment from "../models/environmentModel.js";
import Data from "../models/dataModel.js";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function quickFix() {
    try {
        console.log("⚡ Running Quick Fix...");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Fix Population source values
        console.log("\n1. Fixing Population source values...");
        const populationUpdates = await Population.updateMany(
            { source: { $nin: ["Census", "WorldBank", "UN", "Estimated", "Predicted", "Mock", "Sample", "Import"] } },
            { $set: { source: "Census" } }
        );
        console.log(`   ✅ Fixed ${populationUpdates.modifiedCount} Population documents`);

        // 2. Update Population age groups if still undefined
        console.log("\n2. Checking Population age groups...");
        const populations = await Population.find();

        for (const pop of populations) {
            if (!pop.ageGroups || pop.ageGroups.size === 0 || pop.ageGroups.get("0-14") === undefined) {
                // Set default age groups based on year
                let ageGroups = new Map();

                if (pop.year === 2001) {
                    ageGroups.set("0-14", 28.5);
                    ageGroups.set("15-24", 20.3);
                    ageGroups.set("25-54", 38.2);
                    ageGroups.set("55-64", 8.1);
                    ageGroups.set("65+", 4.9);
                } else if (pop.year === 2011) {
                    ageGroups.set("0-14", 26.5);
                    ageGroups.set("15-24", 22.1);
                    ageGroups.set("25-54", 38.5);
                    ageGroups.set("55-64", 8.7);
                    ageGroups.set("65+", 4.2);
                } else if (pop.year === 2021) {
                    ageGroups.set("0-14", 24.1);
                    ageGroups.set("15-24", 24.8);
                    ageGroups.set("25-54", 39.2);
                    ageGroups.set("55-64", 9.4);
                    ageGroups.set("65+", 2.5);
                } else if (pop.year === 2024) {
                    ageGroups.set("0-14", 23.0);
                    ageGroups.set("15-24", 25.5);
                    ageGroups.set("25-54", 39.5);
                    ageGroups.set("55-64", 9.6);
                    ageGroups.set("65+", 2.4);
                } else {
                    // Default
                    ageGroups.set("0-14", 25.0);
                    ageGroups.set("15-24", 22.0);
                    ageGroups.set("25-54", 38.0);
                    ageGroups.set("55-64", 10.0);
                    ageGroups.set("65+", 5.0);
                }

                await Population.updateOne(
                    { _id: pop._id },
                    { $set: { ageGroups: Object.fromEntries(ageGroups) } }
                );
                console.log(`   ✅ Fixed age groups for ${pop.city} ${pop.year}`);
            }
        }

        // 3. Create more Transport data for dashboard
        console.log("\n3. Creating Transport data...");
        const transportCount = await Transport.countDocuments();

        if (transportCount < 50) {
            console.log(`   Only ${transportCount} transport records found. Creating more...`);

            const sampleData = [];
            const userId = new mongoose.Types.ObjectId();
            const now = new Date();

            // Create data for last 30 days
            for (let i = 0; i < 30; i++) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);

                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const month = date.getMonth() + 1;

                // Create data for different times of day
                const times = [8, 12, 18]; // Morning, Noon, Evening

                for (const hour of times) {
                    let congestion = 40;
                    let speed = 30;
                    let trafficIndex = 140;

                    // Weekend adjustments
                    if (isWeekend) {
                        congestion -= 10;
                        speed += 5;
                        trafficIndex -= 20;
                    }

                    // Rush hour adjustments
                    if (hour === 8 || hour === 18) { // Morning and evening rush
                        congestion += 25;
                        speed -= 10;
                        trafficIndex += 40;
                    }

                    // Add randomness
                    congestion += Math.random() * 15 - 7.5;
                    speed += Math.random() * 5 - 2.5;
                    trafficIndex += Math.random() * 20 - 10;

                    // Clamp values
                    congestion = Math.max(10, Math.min(100, Math.round(congestion)));
                    speed = Math.max(10, Math.min(60, Math.round(speed * 10) / 10));
                    trafficIndex = Math.max(50, Math.min(250, Math.round(trafficIndex)));

                    sampleData.push({
                        city: "Pune",
                        date: new Date(date.setHours(hour, Math.floor(Math.random() * 60), 0)),
                        trafficIndex: trafficIndex,
                        avgSpeed: speed,
                        congestionLevel: congestion,
                        accidents: Math.floor(Math.random() * 2),
                        publicTransportUsage: 800000 + Math.floor(Math.random() * 400000),
                        dayOfWeek: dayOfWeek,
                        month: month,
                        year: date.getFullYear(),
                        hour: hour,
                        userId: userId,
                        username: "system",
                        source: "Mock"
                    });
                }
            }

            await Transport.insertMany(sampleData);
            console.log(`   ✅ Created ${sampleData.length} transport records`);
        } else {
            console.log(`   ✅ Transport collection has ${transportCount} records (good!)`);
        }

        // 4. Show summary
        console.log("\n📊 QUICK FIX COMPLETED!");
        console.log("=======================");

        const stats = {
            populations: await Population.countDocuments(),
            transports: await Transport.countDocuments(),
            environments: await Environment.countDocuments(),
            datas: await Data.countDocuments()
        };

        Object.entries(stats).forEach(([collection, count]) => {
            console.log(`${collection}: ${count} documents`);
        });

        // Show sample population data
        console.log("\n📈 Sample Population Data:");
        const samplePop = await Population.find().sort({ year: 1 }).limit(3);
        samplePop.forEach(pop => {
            console.log(`   ${pop.year}: ${(pop.totalPopulation / 1000000).toFixed(2)}M, ${pop.growthRate}% growth`);
            if (pop.ageGroups && pop.ageGroups.size > 0) {
                console.log(`      Age Groups: 0-14: ${pop.ageGroups.get("0-14") || "N/A"}%`);
            }
        });

        await mongoose.disconnect();
        console.log("\n🎉 Quick fix completed successfully!");
        console.log("\n🚀 Now run: npm run test:db");

    } catch (error) {
        console.error("❌ Quick fix failed:", error);
        process.exit(1);
    }
}

quickFix();