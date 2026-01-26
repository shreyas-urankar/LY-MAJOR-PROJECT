import express from "express";
<<<<<<< HEAD
import {
    getTransportData,
    getTransportAnalytics,
    saveTransportData,
    predictCongestion,
    importCSVData,
    getTrafficAlerts
=======
import { 
  getTransportData, 
  getTransportAnalytics, 
  saveTransportData, 
  predictCongestion,
  importCSVData,
  getTrafficAlerts
>>>>>>> b8d9194d484115f8d56650dac80f4d1956e0cc58
} from "../controllers/transportController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/", verifyToken, getTransportData);
router.get("/analytics", verifyToken, getTransportAnalytics);
router.get("/alerts", verifyToken, getTrafficAlerts);
router.post("/", verifyToken, saveTransportData);
router.post("/predict", verifyToken, predictCongestion);
router.post("/import", verifyToken, importCSVData);

<<<<<<< HEAD
// Public test endpoint
router.get("/test", (req, res) => {
    res.json({
        message: "Transport API is working",
        timestamp: new Date().toISOString()
    });
});

=======
>>>>>>> b8d9194d484115f8d56650dac80f4d1956e0cc58
export default router;