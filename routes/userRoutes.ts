// userRoutes.ts

import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware"; // Assuming correct path

const router = express.Router();

// --- Logging middleware inside the router (Add this) ---
router.use((req, res, next) => {
  console.log(` User router received path: ${req.path}`);
  next();
});
// --- End logging middleware inside the router ---

// Define /test route FIRST
router.get("/test", (req, res) => {
  console.log("Hitting /api/users/test route");
  res.send("Test route works!");
});

// Define /profile route SECOND
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
