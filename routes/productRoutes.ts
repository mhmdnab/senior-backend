// productRoutes.ts

import express from "express";
import {
  getProducts,
  addProduct,
  getProductById,
  getUserProducts,
  deleteProduct,
} from "../controllers/productsController";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddlware";

const router = express.Router();
router.get("/", getProducts);
router.get("/my-products", protect, getUserProducts);
router.post("/", protect, upload.single("image"), addProduct);
router.delete("/:id", protect, deleteProduct);
router.get("/:id", getProductById);

export default router;
