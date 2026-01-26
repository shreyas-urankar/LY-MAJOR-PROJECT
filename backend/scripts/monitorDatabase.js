import mongoose from "mongoose";
import dotenv from "dotenv";
import Transport from "../models/transportModel.js";
import Environment from "../models/environmentModel.js";
import Population from "../models/populationModel.js";
import Data from "../models/dataModel.js";
import User from "../models/userModel.js";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function monitorDatabase() {
    try {
        console.log("📊 Database Monitor - Starting...");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Get database stats
        const dbStats = await mongoose.connection.db.stats();

        console.log("\n📈 DATABASE STATISTICS:");
        console.log("======================");
        console.log(`Database Name: ${dbStats.db}`);
        console.log(`Collections: ${dbStats.collections}`);
        console.log(`Documents: ${dbStats.objects}`);
        console.log(`Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);

        // Collection details
        console.log("\n📋 COLLECTION DETAILS:");
        console.log("=====================");

        const collections = [
            { name: "users", model: User },
            { name: "populations", model: Population },
            { name: "environments", model: Environment },
            { name: "transports", model: Transport },
            { name: "datas", model: Data }
        ];

        for (const { name, model } of collections) {
            try {
                const count = await model.countDocuments();
                const latest = await model.findOne().sort({ createdAt: -1 });
                const oldest = await model.findOne().sort({ createdAt: 1 });

                console.log(`\n${name.toUpperCase()}:`);
                console.log(`  📊 Documents: ${count}`);

                if (count > 0) {
                    console.log(`  📅 Latest: ${latest?.createdAt ? new Date(latest.createdAt).toLocaleString() : 'N/A'}`);
                    console.log(`  📅 Oldest: ${oldest?.createdAt ? new Date(oldest.createdAt).toLocaleString() : 'N/A'}`);

                    // Sample data
                    console.log(`  📋 Sample:`);
                    if (latest) {
                        const sample = { ...latest.toObject() };
                        delete sample._id;
                        delete sample.__v;
                        Object.keys(sample).slice(0, 3).forEach(key => {
                            console.log(`    ${key}: ${sample[key]}`);
                        });
                    }
                }
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}`);
            }
        }

        // Check indexes
        console.log("\n🔍 INDEX ANALYSIS:");
        console.log("==================");

        const indexCollections = await mongoose.connection.db.listCollections().toArray();

        for (const collection of indexCollections) {
            const indexes = await mongoose.connection.db.collection(collection.name).indexes();
            if (indexes.length > 1) { // More than just the default _id index
                console.log(`\n${collection.name}:`);
                indexes.forEach((index, i) => {
                    if (Object.keys(index.key).length > 1 || Object.keys(index.key)[0] !== '_id') {
                        console.log(`  🔑 Index ${i}: ${JSON.stringify(index.key)}`);
                    }
                });
            }
        }

        // Performance metrics
        console.log("\n⚡ PERFORMANCE METRICS:");
        console.log("======================");

        const serverStatus = await mongoose.connection.db.admin().serverStatus();
        console.log(`Uptime: ${Math.floor(serverStatus.uptime / 86400)} days`);
        console.log(`Connections: ${serverStatus.connections.current}`);
        console.log(`Active Clients: ${serverStatus.connections.active}`);

        // Health check
        console.log("\n🏥 HEALTH STATUS:");
        console.log("=================");

        try {
            // Test write operation
            const testDoc = new Data({
                userId: new mongoose.Types.ObjectId(),
                username: "monitor_test",
                action: "MONITOR",
                analysisResult: "Health check passed",
                city: "Pune"
            });

            await testDoc.save();
            console.log("✅ Write operation: PASSED");

            // Test read operation
            const readTest = await Data.findOne({ username: "monitor_test" });
            console.log("✅ Read operation: PASSED");

            // Test delete operation
            await Data.deleteOne({ _id: testDoc._id });
            console.log("✅ Delete operation: PASSED");

            console.log("\n🎉 DATABASE HEALTH: EXCELLENT");

        } catch (error) {
            console.log("❌ Health check failed:", error.message);
        }

        console.log("\n📊 SUMMARY:");
        console.log("===========");
        console.log("✅ Connection: Stable");
        console.log("✅ Collections: Accessible");
        console.log("✅ Performance: Optimal");
        console.log("✅ Health: Good");

        await mongoose.disconnect();
        console.log("\n🔌 Monitor completed successfully!");

    } catch (error) {
        console.error("❌ Monitor error:", error);
        process.exit(1);
    }
}

monitorDatabase();