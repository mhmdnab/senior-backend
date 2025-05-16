import express from "express";
import {
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
  getAllProducts,
  deleteProduct,
} from "../controllers/adminController";
import { protect, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/products", getAllProducts);
router.delete("/product/:id", deleteProduct);

router.get("/users", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
