import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";
import { authUser } from "../middleware/authMiddleware";

const router = express.Router();

router
  .route("/profile")
  .get(authUser, getUserProfile)
  .put(authUser, updateUserProfile);
export default router;
