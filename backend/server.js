import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";  // Add this import

import connectDB from "./config/db.js";
import dataRoutes from "./routes/dataRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import infrastructureRoutes from "./routes/infrastructureRoutes.js";
import populationRoutes from "./routes/populationRoutes.js";
<<<<<<< HEAD
import environmentRoutes from "./routes/environmentRoutes.js"; // ADD THIS LINE
=======
import transportRoutes from "./routes/transportRoutes.js";
>>>>>>> b8d9194d484115f8d56650dac80f4d1956e0cc58

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
<<<<<<< HEAD
app.use(cors());
=======
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8501'], // Frontend and Streamlit
  credentials: true
}));
>>>>>>> b8d9194d484115f8d56650dac80f4d1956e0cc58
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan('dev'));  // Add logging middleware

// DB connection
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Urban Growth Backend is running successfully!");
});

// API routes
app.use("/api/data", dataRoutes);
app.use("/api/users", userRoutes);
app.use("/api/infrastructure", infrastructureRoutes);
app.use("/api/population", populationRoutes);
<<<<<<< HEAD
app.use("/api/environment", environmentRoutes); // ADD THIS LINE
=======
app.use("/api/transport", transportRoutes);
>>>>>>> b8d9194d484115f8d56650dac80f4d1956e0cc58

// Debug route to test registration
app.post("/api/debug/register", async (req, res) => {
  console.log("Debug registration called with:", req.body);
  res.status(201).json({
    success: true,
    message: "Debug: Registration would be successful",
    user: { id: "debug_id", username: req.body.username },
    token: "debug_token"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
  console.log(`📝 Registration endpoint: http://localhost:${PORT}/api/users/register`);
});