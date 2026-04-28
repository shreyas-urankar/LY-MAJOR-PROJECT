import express from "express";
import { chatWithRAG } from "../controllers/ragController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Protected chat route (only authenticated users can query the data)
router.post("/chat", verifyToken, chatWithRAG);

export default router;
