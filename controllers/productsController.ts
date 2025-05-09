// productsController.ts

import asyncHandler from "express-async-handler";
import Item from "../models/Product";

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
  const product = await Item.findById(req.params.id);
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404);
    throw new Error("Product Not Found");
  }
});

const addProduct = asyncHandler(async (req: any, res: any) => {
  const { title, description, category, images } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }
  console.log(req.user.id);
  if (!req.user?.id) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  const item = new Item({
    title,
    description,
    category,
    images,
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

export { getProducts, addProduct, getProductById, getUserProducts };
