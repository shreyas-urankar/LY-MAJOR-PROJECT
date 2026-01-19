import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Routes
import dataRoutes from "./routes/dataRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import populationRoutes from "./routes/populationRoutes.js";
import transportRoutes from "./routes/transportRoutes.js"; // Add this line

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Database connection
connectDB();

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Urban Growth Backend is running successfully!");
});

// API Routes
app.use("/api/data", dataRoutes);
app.use("/api/users", userRoutes);
app.use("/api/population", populationRoutes);
app.use("/api/transport", transportRoutes); // Add this line

app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});