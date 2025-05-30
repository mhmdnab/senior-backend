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
import User from "../models/User";
import Item from "../models/Product";
import Barter from "../models/Barter";

const router = express.Router();

router.use(protect, isAdmin);
router.get("/stats", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Item.countDocuments();
    const bartersCount = await Barter.countDocuments({ status: "pending" });
    res.json({
      users: usersCount,
      products: productsCount,
      barters: bartersCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/barters", async (req, res) => {
  try {
    const barters = await Barter.find()
      .populate("offeredBy", "username")
      .populate("requestedFrom", "username")
      .populate("productOfferedId", "title")
      .populate("productRequestedId", "title")
      .sort({ createdAt: -1 });

    res.json(barters);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch barters" });
  }
});
router.get("/products", getAllProducts);
router.delete("/product/:id", deleteProduct);

router.get("/users", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
