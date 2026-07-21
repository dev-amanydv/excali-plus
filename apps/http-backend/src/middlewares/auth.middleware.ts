import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { BadRequestError, UnauthorizedError } from "./errors/errorTypes.js";

interface AuthJwtPayload extends JwtPayload {
  id: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : undefined;
  const token = bearerToken ?? req.cookies?.token;

  if (!token) {
    throw new BadRequestError("Authentication required. Please login.");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
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
