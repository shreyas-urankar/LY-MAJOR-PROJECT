import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function backupDatabase() {
    try {
        console.log("💾 Starting database backup...");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Create backup directory
        const backupDir = path.join(__dirname, "..", "..", "backups");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

        const backupData = {
            timestamp: new Date().toISOString(),
            collections: {}
        };

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();

        console.log(`\n📥 Backing up ${collections.length} collections:`);

        for (const collection of collections) {
            const data = await mongoose.connection.db.collection(collection.name).find().toArray();
            backupData.collections[collection.name] = data;
            console.log(`   ✅ ${collection.name}: ${data.length} documents`);
        }

        // Write backup to file
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

        console.log(`\n💾 Backup saved to: ${backupFile}`);
        console.log(`📊 Total size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);

        // List recent backups
        console.log("\n📋 Recent backups:");
        const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
            .sort()
            .reverse()
            .slice(0, 5);

        backupFiles.forEach((file, index) => {
            const stats = fs.statSync(path.join(backupDir, file));
            console.log(`   ${index + 1}. ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
        });

        // Clean up old backups (keep last 10)
        const allBackups = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
            .sort();

        if (allBackups.length > 10) {
            const toDelete = allBackups.slice(0, allBackups.length - 10);
            toDelete.forEach(file => {
                fs.unlinkSync(path.join(backupDir, file));
                console.log(`   🗑️  Deleted old backup: ${file}`);
            });
        }

        await mongoose.disconnect();
        console.log("\n✅ Backup completed successfully!");

    } catch (error) {
        console.error("❌ Backup failed:", error);
        process.exit(1);
    }
}

backupDatabase();