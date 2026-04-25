import express from "express";
import { registerUser, loginUser, recoverUsername, resetPassword } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/recover-username", recoverUsername);
router.post("/reset-password", resetPassword);

export default router;