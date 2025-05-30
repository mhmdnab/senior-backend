import User from "../models/User";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

export const getUserProfile = asyncHandler(async (req: any, res: any) => {
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

export const updateProfile = asyncHandler(async (req: any, res) => {
  const userId = req.user._id;
  const { email, oldPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  user.email = email || user.email;
  if (newPassword) user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  res
    .status(200)
    .json({ message: "Profile updated successfully", email: user.email });
});
