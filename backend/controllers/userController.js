import User from "../models/userModel.js";
import Data from "../models/dataModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Register User
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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
    });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
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