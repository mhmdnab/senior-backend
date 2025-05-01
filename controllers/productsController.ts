import mongoose from "mongoose";
import Product from "../models/Product";
import asyncHandler from "express-async-handler";

const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const filter = category
    ? { category: { $regex: new RegExp(`^${category}$`, "i") } }
    : {};

  const products = await Product.find(filter).populate("owner", "username");

  res.status(200).json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const addProduct = asyncHandler(async (req, res) => {
  const { title, description, category, images } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }

  const item = new Product({
    title,
    description,
    category,
    images,
    owner: new mongoose.Types.ObjectId("67fd269ad453645455009b4c"), // assuming you have authentication and set req.user
  });

  const createdItem = await item.save();
  res.status(201).json(createdItem);
});

const getUserProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ owner: req.user._id });
  res.status(200).json(products);
});

export { getProductById, getProducts, addProduct, getUserProducts };
