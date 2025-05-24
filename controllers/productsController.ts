// productsController.ts

import asyncHandler from "express-async-handler";
import Item from "../models/Product";
import User from "../models/User";

const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const filter = category
    ? { category: { $regex: new RegExp(`^${category}$`, "i") } }
    : {};

  const products = await Item.find(filter).populate("owner", "username");

  res.status(200).json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  console.log(req.params.id);
  const product = await Item.findById(req.params.id).populate(
    "owner",
    "username"
  );
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404);
    throw new Error("Product Not Found");
  }
});

const addProduct = asyncHandler(async (req: any, res: any) => {
  const { title, description, category } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }

  if (!req.user?._id) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Image file is required");
  }

  // Build relative URL to serve later via /uploads
  const imageUrl = `/uploads/${req.file.filename}`;

  const item = new Item({
    title,
    description,
    category,
    images: [imageUrl],
    owner: req.user._id,
  });

  const createdItem = await item.save();
  res.status(201).json(createdItem);
});

const getUserProducts = asyncHandler(async (req: any, res: any) => {
  try {
    if (!req.user?._id) {
      res.status(401);
      throw new Error("User not authenticated");
    }

    const products = await Item.find({ owner: req.user.id }).populate(
      "owner",
      "username"
    );

    res.status(200).json(products);
  } catch (error: any) {
    throw error;
  }
});

export const deleteProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Item.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getProducts, addProduct, getProductById, getUserProducts };
