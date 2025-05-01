import express from "express";
import {
  getProducts,
  getProductById,
  addProduct,
  getUserProducts,
} from "../controllers/productsController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/my-products", protect, getUserProducts);
router.post("/", addProduct);

export default router;
