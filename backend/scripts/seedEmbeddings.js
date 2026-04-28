import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Data from "../models/dataModel.js";
import { generateDocumentSummary, generateEmbeddingForText } from "../controllers/ragController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedEmbeddings = async () => {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ Error: GOOGLE_API_KEY is missing from .env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const documents = await Data.find({ 
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } }
      ]
    });

    console.log(`Found ${documents.length} documents that need embeddings.`);

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      console.log(`[${i+1}/${documents.length}] Processing document ID: ${doc._id} (City: ${doc.city})`);
      
      const summaryText = generateDocumentSummary(doc);
      const vector = await generateEmbeddingForText(summaryText);
      
      if (vector && vector.length > 0) {
        doc.embedding = vector;
        await doc.save();
        console.log(`✅ Successfully embedded document ID: ${doc._id}`);
      } else {
        console.warn(`⚠️ Failed to generate embedding for document ID: ${doc._id}`);
      }

      // Respect OpenAI rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("🎉 All missing embeddings have been generated!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding embeddings:", error);
    process.exit(1);
  }
};

seedEmbeddings();
