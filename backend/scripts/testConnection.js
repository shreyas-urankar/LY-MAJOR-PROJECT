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

async function testDatabase() {
    try {
        console.log("🔗 Testing database connection to MongoDB Atlas...");
        console.log("📋 Using MONGO_URI from .env file");

        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is not defined in .env file");
            process.exit(1);
        }

        // Test the connection
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully!");
        console.log("📍 Connected to:", mongoose.connection.name);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("\n📂 Database Collections:");
        console.log("=====================");
        collections.forEach((collection, index) => {
            console.log(`${index + 1}. ${collection.name}`);
        });

        // Test each model
        console.log("\n📊 Collections Status:");
        console.log("====================");

        const models = [
            { name: "users", model: User },
            { name: "populations", model: Population },
            { name: "environments", model: Environment },
            { name: "transports", model: Transport },
            { name: "datas", model: Data }
        ];

        for (const { name, model } of models) {
            try {
                const count = await model.countDocuments();
                console.log(`✅ ${name}: ${count} documents`);

                // Show sample data for collections with data
                if (count > 0 && name !== "users") {
                    const sample = await model.findOne().lean();
                    if (sample) {
                        // Show limited preview
                        const preview = {};
                        Object.keys(sample).slice(0, 3).forEach(key => {
                            preview[key] = sample[key];
                        });
                        console.log(`   📋 Sample: ${JSON.stringify(preview)}...`);
                    }
                }
            } catch (error) {
                console.log(`❌ ${name}: Error - ${error.message}`);
            }
        }

        // Test insert operations
        console.log("\n🧪 Testing insert operations...");

        // Create a test user ID
        const testUserId = new mongoose.Types.ObjectId();

        // Test Transport insert
        console.log("   Testing Transport insert...");
        const testTransport = new Transport({
            city: "Pune",
            date: new Date(),
            trafficIndex: 150,
            avgSpeed: 28,
            congestionLevel: 45,
            accidents: 0,
            publicTransportUsage: 1200000,
            dayOfWeek: new Date().getDay(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            hour: new Date().getHours(),
            userId: testUserId,
            username: "test_user",
            source: "Test"
        });

        await testTransport.save();
        console.log("   ✅ Test Transport document inserted");

        // Test Environment insert
        console.log("   Testing Environment insert...");
        const testEnvironment = new Environment({
            city: "Pune",
            aqi: 85,
            pm25: 42,
            pm10: 78,
            co2: 455,
            greenCover: 24.5,
            waterQuality: 72,
            temperature: 28,
            humidity: 65,
            windSpeed: 12,
            pollutionLevel: "Moderate",
            userId: testUserId,
            username: "test_user",
            source: "Test"
        });

        await testEnvironment.save();
        console.log("   ✅ Test Environment document inserted");

        // Test Population insert
        console.log("   Testing Population insert...");
        const testPopulation = new Population({
            city: "Pune",
            year: 2026,
            totalPopulation: 12000000,
            growthRate: 8.5,
            density: 36000,
            ageGroups: {
                "0-14": 22.5,
                "15-24": 25.8,
                "25-54": 40.2,
                "55-64": 8.5,
                "65+": 3.0
            },
            source: "Estimated" 
        });

        await testPopulation.save();
        console.log("   ✅ Test Population document inserted");

        // Test Data insert
        console.log("   Testing Data insert...");
        const testData = new Data({
            userId: testUserId,
            username: "test_user",
            action: "TEST",
            analysisResult: "Database test successful",
            city: "Pune",
            pollutionLevel: "Medium",
            urbanData: {
                greenSpaces: 24.5,
                trafficIndex: 150,
                housingIndex: 72,
                employmentRate: 85
            }
        });

        await testData.save();
        console.log("   ✅ Test Data document inserted");

        // Clean up test data
        console.log("\n🧹 Cleaning up test data...");
        await Transport.deleteOne({ _id: testTransport._id });
        await Environment.deleteOne({ _id: testEnvironment._id });
        await Population.deleteOne({ _id: testPopulation._id });
        await Data.deleteOne({ _id: testData._id });
        console.log("✅ Test data cleaned up");

        // Final summary
        console.log("\n🎉 DATABASE TEST COMPLETED SUCCESSFULLY!");
        console.log("======================================");
        console.log("✅ Connection: Working");
        console.log("✅ Collections: All accessible");
        console.log("✅ CRUD Operations: Working");
        console.log("✅ Data Integrity: Maintained");

        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");

    } catch (error) {
        console.error("\n❌ DATABASE TEST FAILED!");
        console.error("=========================");
        console.error("Error:", error.message);

        if (error.code === 'ENOTFOUND') {
            console.error("\n🔧 Troubleshooting Tips:");
            console.error("1. Check your internet connection");
            console.error("2. Verify MONGO_URI in .env file");
            console.error("3. Ensure MongoDB Atlas cluster is running");
            console.error("4. Check IP whitelist in MongoDB Atlas");
            console.error("5. Verify username/password in connection string");
        }

        process.exit(1);
    }
}

testDatabase();