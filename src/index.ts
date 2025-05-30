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
import path from "path";

dotenv.config();
const app = express();
// --- Middleware Setup ---
const FRONTEND_URLS = [
  "https://senior-frontend-eta.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!incomingOrigin) return callback(null, true);

      if (FRONTEND_URLS.includes(incomingOrigin)) {
        // echo back the exact origin
        callback(null, incomingOrigin);
      } else {
        callback(
          new Error(`CORS policy: origin ${incomingOrigin} not allowed`),
          false
        );
      }
    },
    credentials: true, // send Access-Control-Allow-Credentials: true
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      // send Access-Control-Allow-Headers
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.send("Backend is running ✨");
});

// --- Routes ---
app.use("/api/barter", barterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

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
