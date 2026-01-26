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

async function resetDatabase() {
    try {
        console.log("⚠️ WARNING: This will reset all data in the database!");
        console.log("Are you sure? (yes/no): ");

        // Wait for user confirmation
        await new Promise(resolve => {
            process.stdin.once('data', (data) => {
                const answer = data.toString().trim().toLowerCase();
                if (answer === 'yes' || answer === 'y') {
                    resolve();
                } else {
                    console.log("❌ Operation cancelled by user");
                    process.exit(0);
                }
            });
        });

        console.log("\n🔄 Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        console.log("\n🧹 Clearing collections...");

        // Clear collections (except users)
        const collectionsToClear = [
            { name: "Transport", model: Transport },
            { name: "Environment", model: Environment },
            { name: "Population", model: Population },
            { name: "Data", model: Data }
        ];

        for (const { name, model } of collectionsToClear) {
            const count = await model.countDocuments();
            if (count > 0) {
                await model.deleteMany({});
                console.log(`✅ Cleared ${name}: ${count} documents removed`);
            } else {
                console.log(`ℹ️ ${name}: Already empty`);
            }
        }

        console.log("\n✅ Database reset completed!");
        console.log("📊 Current status:");

        const status = {
            "users": await User.countDocuments(),
            "populations": await Population.countDocuments(),
            "environments": await Environment.countDocuments(),
            "transports": await Transport.countDocuments(),
            "datas": await Data.countDocuments()
        };

        Object.entries(status).forEach(([collection, count]) => {
            console.log(`   ${collection}: ${count} documents`);
        });

        console.log("\n💡 Next steps:");
        console.log("   1. Run: npm run import:population");
        console.log("   2. Run: npm run import:transport");
        console.log("   3. Start server: npm run dev");

        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from database");

    } catch (error) {
        console.error("❌ Error resetting database:", error);
        process.exit(1);
    }
}

resetDatabase();