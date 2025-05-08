import express from "express";
import { protect } from "../middleware/authMiddleware";
import { initiateBarter } from "../controllers/barterController";

const router = express.Router();

router.post("/initiate", protect, initiateBarter);
router.get("/test", (req, res) => {
  res.send("Test route works!");
});

export default router;
