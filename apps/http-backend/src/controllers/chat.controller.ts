import { prismaClient } from "@repo/db/client";
import AsyncHandler from "../utils/AsyncHandler.js";

export const getRoomChats = AsyncHandler(async (req, res) => {
    const roomId = Number(req.params.roomId);

    const chats = await prismaClient.elements.findMany({
        where: {
            roomId: roomId,
            isDeleted: false,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    res.status(200).json({
        status: "success",
        data: {
            chats,
        },
    });
});
