import mongoose from "mongoose";
import dotenv from "dotenv";
import Transport from "../models/transportModel.js";
import Environment from "../models/environmentModel.js";
import Population from "../models/populationModel.js";
import Data from "../models/dataModel.js";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function fixAll() {
    try {
        console.log("🔧 Fixing all database issues...");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Fix Transport collection
        console.log("\n1. Fixing Transport collection...");
        const transportUpdates = await Transport.updateMany(
            { source: { $nin: ["API", "User", "System", "Test", "Mock", "Prediction"] } },
            { $set: { source: "Mock" } }
        );
        console.log(`   ✅ Fixed ${transportUpdates.modifiedCount} Transport documents`);

        // 2. Fix Data collection - update invalid action values
        console.log("\n2. Fixing Data collection actions...");
        const validActions = ["LOGIN", "REGISTER", "PREDICT", "VIEW_DASHBOARD", "ENVIRONMENT_UPDATE", "TRANSPORT_UPDATE", "TEST", "MONITOR", "LOGOUT", "SYSTEM"];

        // Find documents with invalid action values
        const invalidDataDocs = await Data.find({
            action: { $nin: validActions }
        });

        let dataFixedCount = 0;
        for (const doc of invalidDataDocs) {
            // Map old actions to new ones
            let newAction = "PREDICT";

            if (doc.analysisResult?.includes("logout") || doc.analysisResult?.includes("Logout")) {
                newAction = "LOGOUT";
            } else if (doc.analysisResult?.includes("system") || doc.analysisResult?.includes("System")) {
                newAction = "SYSTEM";
            } else if (doc.analysisResult?.includes("environment") || doc.analysisResult?.includes("Environment")) {
                newAction = "ENVIRONMENT_UPDATE";
            } else if (doc.analysisResult?.includes("transport") || doc.analysisResult?.includes("Transport")) {
                newAction = "TRANSPORT_UPDATE";
            } else if (doc.analysisResult?.includes("login") || doc.analysisResult?.includes("Login")) {
                newAction = "LOGIN";
            } else if (doc.analysisResult?.includes("register") || doc.analysisResult?.includes("Register")) {
                newAction = "REGISTER";
            }

            await Data.updateOne(
                { _id: doc._id },
                { $set: { action: newAction } }
            );
            dataFixedCount++;
        }
        console.log(`   ✅ Fixed ${dataFixedCount} Data documents`);

        // 3. Fix Population age groups
        console.log("\n3. Fixing Population age groups...");
        const populations = await Population.find({ city: "Pune" });

        for (const pop of populations) {
            // Check if ageGroups is undefined or empty
            if (!pop.ageGroups ||
                Object.keys(pop.ageGroups).length === 0 ||
                pop.ageGroups["0-14"] === undefined) {

                // Calculate age groups based on year
                let ageGroups;
                if (pop.year === 2001) {
                    ageGroups = {
                        "0-14": 28.5,
                        "15-24": 20.3,
                        "25-54": 38.2,
                        "55-64": 8.1,
                        "65+": 4.9
                    };
                } else if (pop.year === 2011) {
                    ageGroups = {
                        "0-14": 26.5,
                        "15-24": 22.1,
                        "25-54": 38.5,
                        "55-64": 8.7,
                        "65+": 4.2
                    };
                } else if (pop.year === 2021) {
                    ageGroups = {
                        "0-14": 24.1,
                        "15-24": 24.8,
                        "25-54": 39.2,
                        "55-64": 9.4,
                        "65+": 2.5
                    };
                } else if (pop.year === 2024) {
                    ageGroups = {
                        "0-14": 23.0,
                        "15-24": 25.5,
                        "25-54": 39.5,
                        "55-64": 9.6,
                        "65+": 2.4
                    };
                } else {
                    // Default age distribution
                    ageGroups = {
                        "0-14": 25.0,
                        "15-24": 22.0,
                        "25-54": 38.0,
                        "55-64": 10.0,
                        "65+": 5.0
                    };
                }

                await Population.updateOne(
                    { _id: pop._id },
                    { $set: { ageGroups: ageGroups } }
                );
                console.log(`   ✅ Fixed age groups for year ${pop.year}`);
            }
        }

        // 4. Create sample transport data if none exists
        console.log("\n4. Checking Transport data...");
        const transportCount = await Transport.countDocuments();

        if (transportCount === 0) {
            console.log("   Creating initial transport data...");

            const sampleData = [];
            const userId = new mongoose.Types.ObjectId();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6); // Last 6 months

            for (let i = 0; i < 180; i++) { // 6 months of data
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);

                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const hour = 8 + (i % 10); // Varying hours 8-17

                // Base values
                let congestion = 40;
                let speed = 30;
                let trafficIndex = 140;

                // Adjust for weekends
                if (isWeekend) {
                    congestion -= 10;
                    speed += 5;
                    trafficIndex -= 20;
                }

                // Adjust for rush hour
                if (hour >= 8 && hour <= 10 || hour >= 17 && hour <= 19) {
                    congestion += 25;
                    speed -= 10;
                    trafficIndex += 40;
                }

                // Add some randomness
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
                    accidents: Math.floor(Math.random() * 3),
                    publicTransportUsage: 1000000 + Math.floor(Math.random() * 400000),
                    dayOfWeek: dayOfWeek,
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    hour: hour,
                    userId: userId,
                    username: "system",
                    source: "Mock"
                });
            }

            await Transport.insertMany(sampleData);
            console.log(`   ✅ Created ${sampleData.length} sample transport records`);
        } else {
            console.log(`   ℹ️ Transport collection already has ${transportCount} records`);

            // Update any transport records without required fields
            const incompleteTransports = await Transport.find({
                $or: [
                    { trafficIndex: { $exists: false } },
                    { avgSpeed: { $exists: false } },
                    { congestionLevel: { $exists: false } }
                ]
            });

            if (incompleteTransports.length > 0) {
                for (const transport of incompleteTransports) {
                    const updates = {};
                    if (!transport.trafficIndex) updates.trafficIndex = 150;
                    if (!transport.avgSpeed) updates.avgSpeed = 28;
                    if (!transport.congestionLevel) updates.congestionLevel = 45;

                    await Transport.updateOne(
                        { _id: transport._id },
                        { $set: updates }
                    );
                }
                console.log(`   ✅ Fixed ${incompleteTransports.length} incomplete transport records`);
            }
        }

        // 5. Fix any Environment records without required fields
        console.log("\n5. Checking Environment data...");
        const incompleteEnvironments = await Environment.find({
            $or: [
                { aqi: { $exists: false } },
                { pm25: { $exists: false } },
                { greenCover: { $exists: false } }
            ]
        });

        if (incompleteEnvironments.length > 0) {
            for (const env of incompleteEnvironments) {
                const updates = {};
                if (!env.aqi) updates.aqi = 85;
                if (!env.pm25) updates.pm25 = 42;
                if (!env.pm10) updates.pm10 = 78;
                if (!env.co2) updates.co2 = 455;
                if (!env.greenCover) updates.greenCover = 24.5;
                if (!env.waterQuality) updates.waterQuality = 72;
                if (!env.temperature) updates.temperature = 28;
                if (!env.humidity) updates.humidity = 65;
                if (!env.windSpeed) updates.windSpeed = 12;
                if (!env.pollutionLevel) updates.pollutionLevel = "Moderate";

                await Environment.updateOne(
                    { _id: env._id },
                    { $set: updates }
                );
            }
            console.log(`   ✅ Fixed ${incompleteEnvironments.length} incomplete environment records`);
        }

        // Show final status
        console.log("\n📊 FINAL STATUS:");
        console.log("================");

        const collections = [
            { name: "populations", model: Population },
            { name: "environments", model: Environment },
            { name: "transports", model: Transport },
            { name: "datas", model: Data }
        ];

        for (const { name, model } of collections) {
            const count = await model.countDocuments();
            console.log(`\n${name.toUpperCase()}: ${count} documents`);

            if (count > 0) {
                const sample = await model.findOne();
                if (sample) {
                    // Create a clean preview
                    const preview = {};
                    Object.keys(sample.toObject()).slice(0, 4).forEach(key => {
                        if (key !== '_id' && key !== '__v') {
                            preview[key] = sample[key];
                        }
                    });
                    console.log(`  Sample preview:`, preview);
                }
            }
        }

        await mongoose.disconnect();
        console.log("\n🎉 All fixes applied successfully!");
        console.log("\n🚀 Next steps:");
        console.log("1. Test database: npm run test:db");
        console.log("2. Monitor database: npm run monitor:db");
        console.log("3. Start server: npm run dev");
        console.log("4. Check frontend: http://localhost:5173");

    } catch (error) {
        console.error("❌ Error fixing issues:", error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    fixAll();
}

export { fixAll };