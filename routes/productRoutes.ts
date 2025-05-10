// productRoutes.js

import express from "express";
import {
  getProducts,
  addProduct,
  getProductById,
} from "../controllers/productsController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, addProduct);

export default router;
