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
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../middlewares/errors/AppError.js";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const handleGoogleSession = AsyncHandler(async (req: Request, res: Response) => {
  const credential = req.body.credential;
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  })

  const payload = ticket.getPayload();
  if (!payload) {
    throw new AppError('Invalid Token', 401)
  }
  const userExist = await prismaClient.user.findUnique({
    where: {
      email: payload?.email as string
    }, select: {
      id: true,
      name: true,
      avatar: true,
      email: true,
    }
  })
  if (!userExist) {
    const newUser = await prismaClient.user.create({
      data: {
        name: payload?.name as string,
        provider: "GOOGLE",
        email: payload?.email as string,
        avatar: payload?.picture
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
      }
    })
    const refreshToken = jwt.sign({ email: newUser.email, id: newUser.id }, JWT_SECRET, {
      expiresIn: "7d",
      issuer: "ExcaliPlus",
      audience: "User",
    });

    const accessToken = jwt.sign({ email: newUser.email, id: newUser.id }, JWT_SECRET, {
      expiresIn: "1h",
      issuer: "ExcaliPlus",
      audience: "User",
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1 * 60 * 60 * 1000,
      path: "/"
    })

    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1 * 60 * 60 * 1000,
      path: "/"
    })
    
    return res.status(201).json({
      msg: "Account created successfully",
      data: {
        user: newUser,
        refreshToken: refreshToken
      }
    })
  }
  const refreshToken = jwt.sign({ email: userExist?.email, id: userExist?.id }, JWT_SECRET, {
    expiresIn: "7d",
    issuer: "ExcaliPlus",
    audience: "User",
  });

  await prismaClient.user.update({
    where: {
      id: userExist.id
    },
    data: {
      refreshToken: refreshToken
    }
  })
  const accessToken = jwt.sign({ email: userExist?.email, id: userExist?.id }, JWT_SECRET, {
    expiresIn: "1h",
    issuer: "ExcaliPlus",
    audience: "User",
  });

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 1 * 60 * 60 * 1000,
    path: "/"
  })

  res.status(201).json({
    msg: "Logged in successfully",
    data: {
      user: userExist,
      refreshToken: refreshToken
    }
  })
}
)

export const handleSignup = AsyncHandler(async (req: Request, res: Response) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    throw new BadRequestError("Invalid body type");
  }

  const userExist = await prismaClient.user.findUnique({
    where: {
      email: parsedData.data.email,
    },
  });
  if (userExist && userExist.provider === "GOOGLE"){
    throw new BadRequestError("use continue with google")
  }
  if (userExist) {
    throw new ConflictError("User with this email already exists");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(
    parsedData.data.password,
    saltRounds,
  );

  const avatarApi = `https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(parsedData.data.email)}`

  const newUser = await prismaClient.user.create({
    data: {
      name: parsedData.data.name,
      email: parsedData.data.email,
      password: hashedPassword,
      avatar: avatarApi
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });

  const refreshToken = jwt.sign({ email: newUser.email, id: newUser.id }, JWT_SECRET, {
    expiresIn: "7d",
    issuer: "ExcaliPlus",
    audience: "User",
  });

  await prismaClient.user.update({
    where: {
      email: parsedData.data.email
    },
    data: {
      refreshToken: refreshToken
    }
  })

  const accessToken = jwt.sign({
    email: newUser.email,
    id: newUser.id
  }, JWT_SECRET, {
    expiresIn: '1h',
    issuer: "ExcaliPlus",
    audience: "User"
  })

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 1 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(201).json({
    msg: "Account created successfully",
    data: {
      user: newUser,
      refreshToken: refreshToken
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
    },
  })
  if (user && user.provider === "GOOGLE"){
    throw new BadRequestError('use continue with google')
  }
  if (!user) {
    throw new BadRequestError("Invalid email or password")
  }

  const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password!);
  if (!isPasswordValid) {
    throw new BadRequestError('Invalid email or password')
  }

  const accesstoken = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, {
    expiresIn: '1h',
    issuer: "ExcaliPlus",
    audience: "User"
  });

  const refreshToken = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, {
    expiresIn: '7d',
    issuer: "ExcaliPlus",
    audience: "User"
  });

  res.cookie("token", accesstoken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "none",
    path: '/',
    maxAge: 1 * 60 * 60 * 1000
  });

  res.status(200).json({
    msg: "Logged in successfully!",
    data: {
      user: {
        id: user.id,
        email: user.email,
        avatar: user.avatar,
        name: user.name,
        createdAt: user.createdAt
      },
      refreshToken: refreshToken
    }
  })
}
)