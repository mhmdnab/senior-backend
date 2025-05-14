// --- Imports ---
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import barterRoutes from "./routes/barterRoutes";
import productRoutes from "./routes/productRoutes";
import adminRoutes from "./routes/adminRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const app = express();
// app.use((req, res, next) => {
//   console.log(` incoming request: ${req.method} ${req.originalUrl}`);
//   next();
// });
// --- Middleware Setup ---
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.send("Backend is running ✨");
});

// --- Mounting Routes ---
app.use("/api/barter", barterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

// --- MongoDB Connection & Server Start ---
const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err: any) => console.error("❌ MongoDB connection error:", err));
