import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import dataRoutes from "./routes/dataRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import infrastructureRoutes from "./routes/infrastructureRoutes.js";
import populationRoutes from "./routes/populationRoutes.js";
import transportRoutes from "./routes/transportRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import environmentRoutes from "./routes/environmentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIX: CORS - MUST BE BEFORE OTHER MIDDLEWARE
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8501'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan('dev'));

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
app.use("/api/transport", transportRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/environment", environmentRoutes);

// Error handling
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