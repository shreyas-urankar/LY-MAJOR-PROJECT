import express from "express";
import {
    getTransportData,
    getTransportAnalytics,
    saveTransportData,
    predictCongestion,
    importCSVData,
    getTrafficAlerts
} from "../controllers/transportcontroller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/", verifyToken, getTransportData);
router.get("/analytics", verifyToken, getTransportAnalytics);
router.get("/alerts", verifyToken, getTrafficAlerts);
router.post("/", verifyToken, saveTransportData);
router.post("/predict", verifyToken, predictCongestion);
router.post("/import", verifyToken, importCSVData);

// Public test endpoint
router.get("/test", (req, res) => {
    res.json({
        message: "Transport API is working",
        timestamp: new Date().toISOString()
    });
});

export default router;