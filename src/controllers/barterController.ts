// backend/controllers/barterController.ts

import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Item from "../models/Product";
import Barter from "../models/Barter";

// @desc    Initiate a barter request
// @route   POST /api/barter/initiate
// @access  Private (Protected) - requires a valid token via protect middleware

const initiateBarter = asyncHandler(async (req: any, res: any) => {
  console.log(req.user);

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

  const otherUserEmail = otherUser.email;
  const userEmail = req.user?.email;

  if (!otherUserEmail) {
    res.status(500);
    throw new Error("Could not retrieve the other user's email address");
  }

  // --- Create the Barter Document (pending) ---
  const barter = await Barter.create({
    productOfferedId,
    productRequestedId: productIdToBarterFor,
    offeredBy: req.user._id,
    requestedFrom: otherUser._id,
    status: "pending",
  });

  // --- Generate the approval/decline link ---
  const frontendUrl =
    process.env.FRONTEND_URL || "https://senior-frontend-eta.vercel.app";
  const approveDeclineLink = `${frontendUrl}/dakesh/respond?barterId=${barter._id}`;

  // --- Respond to frontend ---
  res.status(200).json({
    message: "Barter initiated successfully. Contact the other user.",
    otherUserEmail: otherUserEmail,
  });

  // --- Send Email to the other user with approve/decline link ---
  const mailOptions = {
    from: process.env.USER || "mhmdnab004@gmail.com",
    to: otherUserEmail,
    subject: "Barter Request Initiated",
    html: `
      <p>${userEmail} has initiated a barter request for your product.</p>
      <p>
        <a href="${approveDeclineLink}" style="padding:10px 18px; background:#522c5d; color:#fff; border-radius:6px; text-decoration:none;">
          Approve or Decline Barter
        </a>
      </p>
      <p>If you approve, both products will be marked as unavailable.</p>
      <p>Or copy and paste this link in your browser: <br/>${approveDeclineLink}</p>
    `,
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

// ... your decideBarter code stays the same ...

const decideBarter = asyncHandler(async (req, res) => {
  const { barterId } = req.params;
  const { decision } = req.body; // expects "approved" or "declined"

  // 1) Validate incoming decision value:
  if (!["approved", "declined"].includes(decision)) {
    res.status(400);
    throw new Error(
      "Invalid decision value. Must be 'approved' or 'declined'."
    );
  }

  // 2) Fetch the barter by ID:
  const barter = await Barter.findById(barterId);
  if (!barter) {
    res.status(404);
    throw new Error("Barter not found.");
  }

  // 3) Update item availability if approving, then set barter.status accordingly:
  if (decision === "approved") {
    // Mark both products as unavailable
    await Item.findByIdAndUpdate(barter.productOfferedId, {
      isAvailable: false,
    });
    await Item.findByIdAndUpdate(barter.productRequestedId, {
      isAvailable: false,
    });
    barter.status = "approved";
  } else {
    // If declined, only update the barter.status
    barter.status = "declined";
  }

  // 4) Save the updated barter document:
  await barter.save();

  // 5) Re‐query + populate so the front end receives all details:
  const populatedBarter = await Barter.findById(barter._id)
    .populate("productOfferedId")
    .populate("productRequestedId")
    .populate("offeredBy")
    .populate("requestedFrom");

  // 6) Return JSON with a message and the freshly populated barter object
  res.json({ message: `Barter ${decision}.`, barter: populatedBarter });
});

const getBarterById = asyncHandler(async (req, res) => {
  const { barterId } = req.params;
  const barter = await Barter.findById(barterId)
    .populate("productOfferedId")
    .populate("productRequestedId")
    .populate("offeredBy")
    .populate("requestedFrom");

  if (!barter) {
    res.status(404);
    throw new Error("Barter not found");
  }
  res.json(barter);
});

export { initiateBarter, decideBarter, getBarterById };
