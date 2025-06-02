import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail";

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

export const forgotPassword = async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with that email");
  }

  // 1) generate a random token (not saved to DB yet)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2) hash it and set to resetPasswordToken field
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  await user.save({ validateBeforeSave: false });

  // 3) build reset URL (client‐side route)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // 4) email text
  const message = `You requested a password reset. Click or copy/paste the link below into your browser within 15 minutes:\n\n${resetUrl}\n\nIf you didn't request this, please ignore.`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password reset request",
      text: message,
    });
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    // if email fails, clear the reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Email could not be sent");
  }
};

// @route   PUT /api/auth/reset-password/:token
// @desc    Verify token & set new password
// @access  Public
export const resetPassword = async (req: any, res: any) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error("Please provide a new password");
  }

  // hash the token received in URL to compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // find user by hashed token and ensure token isn’t expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token is invalid or has expired");
  }

  // set the new password & clear reset fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated" });
};
