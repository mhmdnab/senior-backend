// productRoutes.js

import express from "express";
import {
  getProducts,
  addProduct,
  getProductById,
  getUserProducts,
  deleteProduct,
} from "../controllers/productsController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
router.get("/", getProducts);
router.get("/my-products", protect, getUserProducts);
router.post("/", protect, addProduct);
router.delete("/:id", protect, deleteProduct);
router.get("/:id", getProductById);

export default router;
