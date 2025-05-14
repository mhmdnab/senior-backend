// backend/controllers/barterController.ts

import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Item from "../models/Product";

// @desc    Initiate a barter request
// @route   POST /api/barter/initiate
// @access  Private (Protected) - requires a valid token via protect middleware

const initiateBarter = asyncHandler(async (req: any, res: any) => {
  if (!req.user?._id) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  const { productIdToBarterFor, productOfferedId } = req.body;

  if (!productIdToBarterFor || !productOfferedId) {
    res.status(400);
    throw new Error("Missing product IDs in request body");
  }

  if (
    !mongoose.Types.ObjectId.isValid(productIdToBarterFor) ||
    !mongoose.Types.ObjectId.isValid(productOfferedId)
  ) {
    res.status(400);
    throw new Error("Invalid product ID format");
  }

  const productOffered = await Item.findById(productOfferedId);

  if (!productOffered) {
    res.status(404);
    throw new Error("Product you offered for barter not found");
  }

  if (productOffered.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You do not own the product you are offering for barter");
  }

  const productToBarterFor = await Item.findById(productIdToBarterFor).populate(
    "owner"
  );

  if (!productToBarterFor) {
    res.status(404);
    throw new Error("The product you want to barter for was not found");
  }

  const otherUser = productToBarterFor.owner;

  if (otherUser && otherUser._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error(
      "You cannot initiate a barter request for your own product"
    );
  }

  const otherUserEmail = otherUser?.email;

  if (!otherUserEmail) {
    res.status(500);
    throw new Error("Could not retrieve the other user's email address");
  }

  res.status(200).json({
    message: "Barter initiated successfully. Contact the other user.",
    otherUserEmail: otherUserEmail,
  });

  const mailOptions = {
    from: "mhmdnab004@gmail.com",
    to: otherUserEmail,
    subject: "Barter Request Initiated",
    text: `You have initiated a barter request for your product. Please contact them to proceed.`,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587, // or 465 for SSL
    secure: false,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
});

export { initiateBarter };
