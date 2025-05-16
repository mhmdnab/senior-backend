import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const register = async (req: any, res: any) => {
  const { username, email, password } = req.body;

  try {
    console.log("📥 Register request:", { username, email });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ Email already in use:", email);
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();

    console.log("✅ User registered:", savedUser);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err: any) {
    console.error("❌ Registration error:", err.message);
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    // Send response with token and user data
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
