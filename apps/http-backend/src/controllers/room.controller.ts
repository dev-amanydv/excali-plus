import { CreateRoomSchema } from "@repo/common/types"
import { BadRequestError, ConflictError, NotFoundError } from "../middlewares/errors/errorTypes.js";
import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import AsyncHandler from "../utils/AsyncHandler.js";

async function generateRoomId() {
    while (true) {
        const roomId = Math.floor(100000 + Math.random() * 900000)
        const roomExist = await prismaClient.room.findUnique({
            where: {
                id: roomId
            }
        })
        if (!roomExist) return roomId
    }
}

export const handleCreateRoom = AsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.body;
    const userId = req.userId as string;

    if (!id) return
    const roomId = await generateRoomId();
    const room = await prismaClient.room.create({
        data: {
            id: roomId,
            adminId: userId
        }
    });

    res.status(203).json({
        msg: "Room created successfully!",
        data: {
            room
        }
    })
})