// productRoutes.js

import express from "express";
import {
  getProducts,
  addProduct,
  getProductById,
  getUserProducts,
} from "../controllers/productsController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
router.get("/", getProducts);
router.get("/my-products", protect, getUserProducts);
router.post("/", protect, addProduct);
router.get("/:id", getProductById);

export default router;
