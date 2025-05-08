import User from "../models/User";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
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

export { getUserProfile, updateUserProfile };
