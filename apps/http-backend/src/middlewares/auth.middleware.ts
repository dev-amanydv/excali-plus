import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./errors/errorTypes.js";

interface AuthJwtPayload extends JwtPayload {
  userId: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.cookies) {
    throw new Error(
      "cookie-parser middleware not configured. Add app.use(cookieParser()) before routes.",
    );
  }
  const token = req.cookies.token;
  console.log("token: ", token)
  if (!token) {
    throw new BadRequestError("Authentication required. Please login.");
  }

  try {
    const decoded = jwt.verify(token, "secret") as AuthJwtPayload;
    req.userId = decoded.id;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError'){
        throw new UnauthorizedError('Token expired. Please login again.')
    };
    if (error.name === "JsonWebTokenError") {
        throw new UnauthorizedError("Invalid token. Please login again.");
    }
    throw Error
  }
};
