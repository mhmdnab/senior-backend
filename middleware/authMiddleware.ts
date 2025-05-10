// authMiddleware.ts

import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction, RequestHandler } from "express";

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

// export const authUser = asyncHandler(async (req: any, res: any, next: any) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       interface MyJwtPayload extends jwt.JwtPayload {
//         id: string;
//       }

//       const decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET as string
//       ) as MyJwtPayload;

//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (error) {
//       // Removed internal console.error
//       res.status(401);
//       throw new Error("Not authorized");
//     }
//   }
//   if (!token) {
//     res.status(401);
//     throw new Error("Not authorized");
//   }
// });

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, token missing" });
    return;
  }

  const token = authHeader.split(" ")[1];
  // console.log("Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    req.user = { _id: decoded.id };
    console.log("req.user:", req.user._id);
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
