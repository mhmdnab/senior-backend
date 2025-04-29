import express from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ✨");
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: any) => console.log(err));
