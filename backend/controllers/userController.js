import User from "../models/userModel.js";
import Data from "../models/dataModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Register User
export const registerUser = async (req, res) => {
  try {
    const { username, password, securityQuestion, securityAnswer } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Check if user exists (case insensitive)
    const existingUser = await User.findOne({
      username: { $regex: new RegExp("^" + username + "$", "i") },
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      securityQuestion,
      securityAnswer
    });

    const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, {
      expiresIn: '24h'  
    });

    // ✅ Save REGISTER event in Data collection
    const registrationData = new Data({
      userId: newUser._id,
      username: newUser.username,
      action: "REGISTER",
      analysisResult: "User registered successfully",
      city: "System",
    });
    
    await registrationData.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username },
      token,
    });
    
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Save LOGIN event in Data collection
    const loginData = new Data({
      userId: user._id,
      username: user.username,
      action: "LOGIN",
      analysisResult: "User logged in successfully",
      city: "System",
    });
    
    await loginData.save();

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username },
    });
    
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Login error",
      error: error.message,
    });
  }
};

// ✅ Recover Username
export const recoverUsername = async (req, res) => {
  try {
    const { securityAnswer } = req.body;

    if (!securityAnswer) {
      return res.status(400).json({ success: false, message: "Security answer is required." });
    }

    const user = await User.findOne({ 
      securityAnswer: { $regex: new RegExp("^" + securityAnswer + "$", "i") } 
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that security answer." });
    }

    res.json({ success: true, username: user.username });
  } catch (error) {
    console.error("❌ Recover Username Error:", error);
    res.status(500).json({ success: false, message: "Server error during recovery.", error: error.message });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { username, securityAnswer, newPassword } = req.body;

    if (!username || !newPassword) {
      return res.status(400).json({ success: false, message: "Username and new password are required." });
    }

    const user = await User.findOne({ 
      username: { $regex: new RegExp("^" + username + "$", "i") } 
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Only check security answer if the user actually has one set (for backward compatibility with old accounts)
    if (user.securityAnswer) {
      if (!securityAnswer || user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
        return res.status(401).json({ success: false, message: "Incorrect security answer." });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error during password reset.", error: error.message });
  }
};