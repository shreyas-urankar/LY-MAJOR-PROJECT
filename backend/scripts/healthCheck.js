import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function healthCheck() {
    try {
        console.log("🏥 Running Health Check...");

        // Test connection
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database connection: OK");

        // Test ping
        await mongoose.connection.db.admin().ping();
        console.log("✅ Database ping: OK");

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Collections found: ${collections.length}`);

        // Show status
        const dbStats = await mongoose.connection.db.stats();
        console.log(`✅ Database stats:`);
        console.log(`   - Documents: ${dbStats.objects}`);
        console.log(`   - Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);

        await mongoose.disconnect();
        console.log("\n🎉 Health Check: ALL SYSTEMS GO!");

    } catch (error) {
        console.error("❌ Health Check FAILED:", error.message);
        process.exit(1);
    }
}

healthCheck();