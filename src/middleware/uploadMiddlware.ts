// src/middleware/uploadMiddleware.ts
import multer from "multer";
import path from "path";

// 1) On *any* environment, write into `${process.cwd()}/uploads`
const uploadsDir = path.join(process.cwd(), "uploads");
console.log("🔍 (uploadMiddleware) process.cwd():", process.cwd());
console.log("🔍 (uploadMiddleware) Multer will write to:", uploadsDir);

console.log("Multer will write to           :", uploadsDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({ storage, fileFilter });
