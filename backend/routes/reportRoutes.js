import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
    generateReport,
    getReportSummary,
    generateModuleDashboardReport
} from "../controllers/reportController.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/comprehensive", verifyToken, generateReport); // Comprehensive dashboard report
router.get("/summary", verifyToken, getReportSummary);
router.get("/dashboard/:module", verifyToken, generateModuleDashboardReport);

// Add a root route that redirects or handles basic report
router.get("/", verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "Report API is working. Use /comprehensive for full report or /dashboard/:module for module reports.",
        endpoints: {
            comprehensive: "/api/reports/comprehensive",
            moduleReport: "/api/reports/dashboard/:module",
            summary: "/api/reports/summary"
        }
    });
});

export default router;