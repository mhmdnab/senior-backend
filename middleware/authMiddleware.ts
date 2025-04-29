import jwt from "jsonwebtoken";
import User from "../models/User";
import asyncHandler from "express-async-handler";

const authUser = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      interface MyJwtPayload extends jwt.JwtPayload {
        id: string;
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as MyJwtPayload;

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized");
  }
});

export { authUser };
