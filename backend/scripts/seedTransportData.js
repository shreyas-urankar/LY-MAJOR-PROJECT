// backend/scripts/seedTransportData.js
import mongoose from "mongoose";
import Transport from "../models/transportModel.js";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Clear existing data
        await Transport.deleteMany({ city: "Pune" });

        const data = [];
        const startDate = new Date('2024-01-01');

        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            data.push({
                city: "Pune",
                date: date,
                trafficIndex: 120 + Math.random() * 60,
                avgSpeed: 20 + Math.random() * 15,
                congestionLevel: 40 + Math.random() * 40,
                accidents: Math.floor(Math.random() * 5),
                publicTransportUsage: 800000 + Math.random() * 200000,
                dayOfWeek: date.getDay(),
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                hour: 12,
                location: {
                    type: "Point",
                    coordinates: [73.8567, 18.5204]
                }
            });
        }

        await Transport.insertMany(data);
        console.log(`✅ Seeded ${data.length} transport records`);

        mongoose.disconnect();
    } catch (error) {
        console.error("❌ Error seeding transport data:", error);
        process.exit(1);
    }
};

seedData();