import User from "../models/User";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req: any, res: any) => {
  const user = await User.findById(req.user._id); // Assuming authUser middleware adds user to req

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      // Add other user fields you want to return
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

export const updateUserProfile = async (req: any, res: any) => {
  const user = await User.findById(req.user._id);

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
      // Add other updated user fields
      message: "Profile updated successfully",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};
