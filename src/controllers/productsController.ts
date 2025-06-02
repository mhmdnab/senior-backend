// productsController.ts

import asyncHandler from "express-async-handler";
import Item from "../models/Product";
import { supabaseAdmin } from "../utils/supabase"; // your Supabase client
import { v4 as uuidv4 } from "uuid";

const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;

  // Always require isAvailable: true
  const filter: any = { isAvailable: true };

  // If a category was provided, add a case-insensitive regex on category
  if (category) {
    filter.category = { $regex: new RegExp(`^${category}$`, "i") };
  }

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
  if (!req.file || !req.file.buffer) {
    res.status(400);
    throw new Error("Image file is required");
  }

  // 1) Create a unique filename for Supabase
  const originalName = req.file.originalname; // e.g. "photo.jpg"
  const ext = originalName.substring(originalName.lastIndexOf(".") + 1); // "jpg"
  const uuidName = `${uuidv4()}.${ext}`; // e.g. "a1b2c3d4-...-xyz.jpg"
  const supabasePath = `products/${uuidName}`;

  // 2) Upload buffer to Supabase Storage bucket called "images"
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("images")
    .upload(supabasePath, req.file.buffer, {
      contentType: req.file.mimetype,
      cacheControl: "public, max-age=31536000",
      upsert: false,
    });

  if (uploadError) {
    console.error("🛑 Supabase upload error:", uploadError);
    res.status(500);
    throw new Error("Failed to upload image to Supabase Storage");
  }

  // 3) Retrieve the public URL from Supabase
  const { data } = supabaseAdmin.storage
    .from("images")
    .getPublicUrl(supabasePath);

  // NOTE: there is no “error” returned by getPublicUrl in the latest typings;
  //       instead you get “data.publicUrl.”
  const publicUrl = data.publicUrl; // <-- THIS is how you access the URL.

  if (!publicUrl) {
    console.error(
      "⚠️ Supabase getPublicUrl returned no URL (data.publicUrl is falsy)"
    );
    res.status(500);
    throw new Error("Could not retrieve public URL for uploaded image");
  }

  // 4) Save the new Product into MongoDB, storing the Supabase URL
  const item = new Item({
    title,
    description,
    category,
    images: [publicUrl], // store the full Supabase public URL string
    owner: req.user._id,
    isAvailable: true,
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
