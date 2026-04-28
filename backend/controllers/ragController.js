import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import Data from "../models/dataModel.js";
import mongoose from "mongoose";

// Initialize Google Gemini Embeddings
export const getEmbeddingsModel = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
  }
  return new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2", // The latest embedding model for Gemini
  });
};

// Initialize the Language Model (Google Gemini)
export const getChatModel = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
  }
  return new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest", // The latest fast and highly capable model
    temperature: 0.3,
  });
};

// Helper to generate a summary string of a Data document for embedding
export const generateDocumentSummary = (doc) => {
  return `
    City: ${doc.city || "Unknown"}
    Year: ${doc.year || "Unknown"}
    Action: ${doc.action || "Unknown"}
    User: ${doc.username || "Unknown"}
    Analysis Result: ${doc.analysisResult || "No analysis provided."}
    Pollution Level: ${doc.pollutionLevel || "Unknown"}
    Population: ${doc.population || "Unknown"}
    Density: ${doc.density || "Unknown"}
    Growth: ${doc.growth || "Unknown"}%
    Prediction: 
      Urban Area Percent: ${doc.prediction?.urbanAreaPercent || "Unknown"}
      Accuracy: ${doc.prediction?.accuracy || "Unknown"}
    Urban Data:
      Green Spaces: ${doc.urbanData?.greenSpaces || "Unknown"}
      Traffic Index: ${doc.urbanData?.trafficIndex || "Unknown"}
      Housing Index: ${doc.urbanData?.housingIndex || "Unknown"}
  `.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();
};

// ✅ Helper to generate an embedding for a specific text
export const generateEmbeddingForText = async (text) => {
  try {
    const embeddings = getEmbeddingsModel();
    const vector = await embeddings.embedQuery(text);
    return vector;
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    return [];
  }
};

// ✅ Chat Endpoint using RAG
export const chatWithRAG = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required." });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ 
        message: "RAG feature is not configured. Missing GOOGLE_API_KEY." 
      });
    }

    // Initialize the vector store using our existing Mongoose collection
    const vectorStore = new MongoDBAtlasVectorSearch(
      getEmbeddingsModel(),
      {
        collection: mongoose.connection.getClient().db().collection("datas"),
        indexName: "vector_index", // The name of the index in Atlas
        textKey: "analysisResult", // Fallback key if content is needed
        embeddingKey: "embedding",
      }
    );

    // Retrieve the top 5 most relevant documents
    const retriever = vectorStore.asRetriever(5);
    const retrievedDocs = await retriever.invoke(question);

    // Format the retrieved documents into a string context
    const context = retrievedDocs.map(doc => {
      // The retriever returns LangChain documents.
      // pageContent holds the 'textKey' (analysisResult).
      return `Content: ${doc.pageContent}\nMetadata: ${JSON.stringify(doc.metadata || {})}`;
    }).join("\n\n---\n\n");

    console.log(`🔍 Retrieved ${retrievedDocs.length} documents for context.`);

    // Set up the RAG Prompt
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert AI Urban Planning Assistant for the Smart Urban Expansion Analyzer.
      Your task is to answer the user's question using ONLY the provided historical data and predictions below.
      The context contains JSON-like data representing various cities, their population metrics, and our AI predictions.
      If the context does not contain the answer, politely say that you don't have that data in the system yet.
      
      User Question: {question}

      System Data Context:
      {context}

      Answer:
    `);

    // Create the chain
    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        context: () => context, // We manually pass context here
      },
      prompt,
      getChatModel(),
      new StringOutputParser(),
    ]);

    // Execute the chain
    const answer = await chain.invoke({ question });

    res.status(200).json({
      answer,
      sources: retrievedDocs.map(d => d.metadata?.city || "Unknown City")
    });

  } catch (error) {
    console.error("❌ RAG Chat Error:", error);
    res.status(500).json({
      message: "An error occurred while communicating with the AI assistant.",
      error: error.message
    });
  }
};
