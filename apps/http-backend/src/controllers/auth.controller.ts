import { CreateUserSchema, SigninSchema } from "@repo/common/types";
import { Request, Response } from "express";
import {
  BadRequestError,
  ConflictError,
} from "../middlewares/errors/errorTypes.js";
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import bcrypt from "bcrypt";
import AsyncHandler from "../utils/AsyncHandler.js";


const google_client_secret = process.env.GOOGLE_CLIENT_SECRET!;

export const handleSignup = AsyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type;
  if (type == 'google') {
    const credential = req.body.credential;
    const decoded = jwt.verify(credential, google_client_secret)
    console.log(decoded)
  }
  console.log(type)
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    throw new BadRequestError("Invalid body type");
  }

  const userExist = await prismaClient.user.findUnique({
    where: {
      email: parsedData.data.email,
    },
  });

  if (userExist) {
    throw new ConflictError("User with this email already exists");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(
    parsedData.data.password,
    saltRounds,
  );

  const newUser = await prismaClient.user.create({
    data: {
      name: parsedData.data.name,
      email: parsedData.data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  const token = jwt.sign({ email: newUser.email, id: newUser.id }, JWT_SECRET, {
    expiresIn: "14d",
    issuer: "SharedCanvas",
    audience: "Users",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 14 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(201).json({
    msg: "Account created successfully",
    data: {
      user: newUser,
    },
  });
}
)

export const handleLogin = AsyncHandler(async (req: Request, res: Response) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    throw new BadRequestError("Invalid body type")
  }

  const user = await prismaClient.user.findUnique({
    where: {
      email: parsedData.data.email,
    }
  })

  if (!user) {
    throw new BadRequestError("Invalid email or password")
  }

  const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError('Invalid email or password')
  }

  const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, {
    expiresIn: '14d',
    issuer: "SharedCanvas",
    audience: "User"
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "none",
    path: '/',
    maxAge: 14 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    msg: "Logged in successfully!",
    data: {
      user: {
        id: user.id,
        email: user.email,
        avatar: user.avatar,
        name: user.name
      }
    }
  })
}
)