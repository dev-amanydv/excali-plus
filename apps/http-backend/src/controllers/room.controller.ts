import { BadRequestError } from "../middlewares/errors/errorTypes.js";
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
    const userId = req.userId as string;

    const roomId = await generateRoomId();
    const room = await prismaClient.room.create({
        data: {
            id: roomId,
            adminId: userId
        }
    });

    res.status(201).json({
        msg: "Room created successfully!",
        data: {
            roomId: room.id,
            room
        }
    })
})

const INT_COLUMNS = new Set([
    "y",
    "strokeWidth",
    "seed",
    "version",
    "fontSize",
]);

const ELEMENT_COLUMNS = [
    "type",
    "edgeStyle",
    "boundTextElementId",
    "points",
    "startArrowHead",
    "endArrowHead",
    "startBinding",
    "endBinding",
    "simulatePressure",
    "pressures",
    "text",
    "fontSize",
    "fontFamily",
    "textAlign",
    "verticalAlign",
    "fontWeight",
    "lineHeight",
    "isEditing",
    "autoResize",
    "originalText",
    "containerId",
    "x",
    "y",
    "width",
    "height",
    "angle",
    "strokeColor",
    "backgroundColor",
    "fillStyle",
    "strokeStyle",
    "strokeWidth",
    "opacity",
    "roughness",
    "isDeleted",
    "seed",
    "version",
    "isLocked",
] as const;

function pickElementColumns(raw: any): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key of ELEMENT_COLUMNS) {
        if (raw[key] === undefined) continue;
        out[key] =
            INT_COLUMNS.has(key) && typeof raw[key] === "number"
                ? Math.round(raw[key])
                : raw[key];
    }
    return out;
}

export const handleSaveElements = AsyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const roomId = Number(req.params.roomId);
    const elements = req.body?.elements;

    if (!Number.isFinite(roomId)) {
        throw new BadRequestError("Invalid room id");
    }
    if (!Array.isArray(elements)) {
        throw new BadRequestError("elements must be an array");
    }

    await Promise.all(
        elements.map((raw: any) => {
            if (!raw?.id) return Promise.resolve();
            const fields = pickElementColumns(raw);
            return prismaClient.elements.upsert({
                where: { id: raw.id },
                create: {
                    ...fields,
                    id: raw.id,
                    roomId,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any,
                update: {
                    ...fields,
                    roomId,
                    updatedAt: new Date(),
                },
            });
        }),
    );

    res.status(200).json({
        msg: "Elements saved",
        data: { count: elements.length },
    });
});
