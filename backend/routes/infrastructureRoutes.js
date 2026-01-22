import express from "express";
import {
    getAllInfrastructure,
    getInfrastructureByCity,
    addInfrastructureData,
    getInfrastructureAnalytics,
    getInfrastructureTrends,
    getInfrastructureScorecard
} from "../controllers/infrastructureController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllInfrastructure);
router.get("/city/:city", getInfrastructureByCity);
router.get("/city/:city/:year", getInfrastructureByCity);
router.get("/analytics", getInfrastructureAnalytics);
router.get("/trends/:city", getInfrastructureTrends);
router.get("/scorecard/:city", getInfrastructureScorecard);
router.get("/scorecard/:city/:year", getInfrastructureScorecard);

// Protected route
router.post("/", verifyToken, addInfrastructureData);

export default router;