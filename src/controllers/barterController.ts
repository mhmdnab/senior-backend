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
  // 1) Ensure user is authenticated
  if (!req.user?._id) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  const { productIdToBarterFor, productOfferedId } = req.body;

  // 2) Basic validation of IDs
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

  // 3) Load the “offered” product from the database
  const productOffered = await Item.findById(productOfferedId);
  if (!productOffered) {
    res.status(404);
    throw new Error("Product you offered for barter not found");
  }
  // Verify ownership
  if (productOffered.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You do not own the product you are offering for barter");
  }

  // 4) Load the “requested” product (the one we want to barter for), and populate its owner
  const productToBarterFor = await Item.findById(productIdToBarterFor).populate(
    "owner"
  );
  if (!productToBarterFor) {
    res.status(404);
    throw new Error("The product you want to barter for was not found");
  }

  // 5) ENSURE CATEGORIES MATCH
  if (productOffered.category !== productToBarterFor.category) {
    res.status(400);
    throw new Error("Both products must be in the same category to barter");
  }

  // 6) Ensure user is not trying to barter for their own product
  const otherUser = productToBarterFor.owner;
  if (otherUser && otherUser._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error(
      "You cannot initiate a barter request for your own product"
    );
  }

  // 7) Now we can create the Barter document
  const barter = await Barter.create({
    productOfferedId,
    productRequestedId: productIdToBarterFor,
    offeredBy: req.user._id,
    requestedFrom: otherUser._id,
    status: "pending",
  });

  // 8) Build the approve/decline link for the owner of the “requested” product
  const frontendUrl =
    process.env.FRONTEND_URL || "https://senior-frontend-eta.vercel.app";
  const approveDeclineLink = `${frontendUrl}/dakesh/respond?barterId=${barter._id}`;

  // 9) Respond immediately so front-end can show success
  res.status(200).json({
    message: "Barter initiated successfully. Contact the other user.",
    otherUserEmail: otherUser.email,
  });

  // 10) Send an e-mail to the owner of the “requested” product
  const userEmail = req.user.email; // the initiator’s email
  const mailOptions = {
    from: process.env.USER || "your-gmail@gmail.com",
    to: otherUser.email,
    subject: "Barter Request Initiated",
    html: `
      <p>${userEmail} has initiated a barter request for your product.</p>
      <p>
        <a href="${approveDeclineLink}" style="padding:10px 18px; background:#522c5d; color:#fff; border-radius:6px; text-decoration:none;">
          Approve or Decline Barter
        </a>
      </p>
      <p>If you approve, both products will be marked as unavailable.</p>
      <p>Or copy/paste this link: <br/>${approveDeclineLink}</p>
    `,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
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

const decideBarter = asyncHandler(async (req: any, res: any) => {
  const { barterId } = req.params;
  const { decision } = req.body; // expects "approved" or "declined"

  // 1) Validate incoming decision value
  if (!["approved", "declined"].includes(decision)) {
    res.status(400);
    throw new Error(
      "Invalid decision value. Must be 'approved' or 'declined'."
    );
  }

  // 2) Fetch the barter by ID, populating products and both users
  const barter = await Barter.findById(barterId)
    .populate("productOfferedId")
    .populate("productRequestedId")
    .populate("offeredBy", "username email")
    .populate("requestedFrom", "username email");

  if (!barter) {
    res.status(404);
    throw new Error("Barter not found.");
  }

  // 3) Update item availability if approved, and set barter.status
  if (decision === "approved") {
    await Item.findByIdAndUpdate((barter.productOfferedId as any)._id, {
      isAvailable: false,
    });
    await Item.findByIdAndUpdate((barter.productRequestedId as any)._id, {
      isAvailable: false,
    });
    barter.status = "approved";
  } else {
    // decision === "declined"
    barter.status = "declined";
  }

  // 4) Save the updated barter document
  await barter.save();

  // 5) Send email to the barter initiator (offeredBy) whether approved or declined
  {
    // Cast through any so TypeScript allows .username / .email
    const initiator = barter.offeredBy as any as {
      username: string;
      email: string;
    };
    const approver = barter.requestedFrom as any as {
      username: string;
      email: string;
    };

    // Build common transporter:
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587, // or 465 for SSL
      secure: false,
      auth: {
        user: process.env.USER, // e.g. "mhmdnab004@gmail.com"
        pass: process.env.PASS, // your Gmail app password or account password
      },
    });

    let subject: string;
    let html: string;

    if (decision === "approved") {
      subject = "✅ Your barter has been approved!";
      html = `
        <p>Hi ${initiator.username},</p>
        <p>Your barter request (ID: ${barter._id}) has been approved by ${
        approver.username
      }.</p>
        <p><strong>Products involved:</strong></p>
        <ul>
          <li>You offered: <strong>${
            (barter.productOfferedId as any).title
          }</strong></li>
          <li>They approved: <strong>${
            (barter.productRequestedId as any).title
          }</strong></li>
        </ul>
        <p>Both items are now marked as <em>unavailable</em> on the platform.</p>
        <p>Thank you for using Dakesh!</p>
        <br/>
        <p>If you have any questions, simply reply to this email.</p>
      `;
    } else {
      // decision === "declined"
      subject = "❌ Your barter request was declined";
      html = `
        <p>Hi ${initiator.username},</p>
        <p>We’re sorry to inform you that your barter request (ID: ${
          barter._id
        }) was declined by ${approver.username}.</p>
        <p><strong>Products involved:</strong></p>
        <ul>
          <li>You offered: <strong>${
            (barter.productOfferedId as any).title
          }</strong></li>
          <li>You requested: <strong>${
            (barter.productRequestedId as any).title
          }</strong></li>
        </ul>
        <p>Feel free to browse other items on Dakesh or try again later.</p>
        <p>Thank you for using Dakesh!</p>
        <br/>
        <p>If you have any questions, simply reply to this email.</p>
      `;
    }

    const mailOptions = {
      from: process.env.USER || "mhmdnab004@gmail.com",
      to: initiator.email,
      subject,
      html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending decision email:", error);
      } else {
        console.log(`Decision email (${decision}) sent:`, info.response);
      }
    });
  }

  // 6) Re‐fetch the barter so it’s fully populated for the response
  const populatedBarter = await Barter.findById(barter._id)
    .populate("productOfferedId")
    .populate("productRequestedId")
    .populate("offeredBy", "username email")
    .populate("requestedFrom", "username email");

  // 7) Send the final JSON response
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
