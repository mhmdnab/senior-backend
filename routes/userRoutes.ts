// userRoutes.ts

import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware"; // Assuming correct path

const router = express.Router();

// Define /profile route SECOND
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
