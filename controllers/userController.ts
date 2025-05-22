import User from "../models/User";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

const getUserProfile = asyncHandler(async (req: any, res: any) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const updateUserProfile = asyncHandler(async (req: any, res: any) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const rounds = 10;
      user.password = await bcrypt.hash(req.body.password, rounds);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      message: "Profile updated successfully",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const updatePassword = async (req: any, res: any) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export { getUserProfile, updateUserProfile };
