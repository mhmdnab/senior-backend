// NEW: memoryStorage version
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    (cb as any)(new Error("Only image files are allowed!"), false);
  }
};

// Now Multer will populate req.file.buffer instead of saving to /uploads/
export const upload = multer({ storage, fileFilter });

//(cb as any)
