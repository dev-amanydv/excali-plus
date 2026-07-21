import "dotenv/config";
import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import WebSocket from "ws";
import { prismaClient } from "@repo/db/client";

const PORT = Number(process.env.PORT) || 9000;
const wss = new WebSocketServer({ port: PORT });
console.log(`Websocket is running at port: ${PORT}`)
interface AuthJwtPayload extends JwtPayload {
  id?: string;
}

interface Users {
  userId: string;
  rooms: number[];
  ws: WebSocket;
}

let users: Users[] = [];

const INT_COLUMNS = new Set(["y", "strokeWidth", "seed", "version", "fontSize"]);
const ELEMENT_COLUMNS = [
  "type", "edgeStyle", "boundTextElementId", "points", "startArrowHead",
  "endArrowHead", "startBinding", "endBinding", "simulatePressure", "pressures",
  "text", "fontSize", "fontFamily", "textAlign", "verticalAlign", "fontWeight",
  "lineHeight", "isEditing", "autoResize", "originalText", "containerId",
  "x", "y", "width", "height", "angle", "strokeColor", "backgroundColor",
  "fillStyle", "strokeStyle", "strokeWidth", "opacity", "roughness",
  "isDeleted", "seed", "version", "isLocked",
];

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

function authenticateUser(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
    if (!decoded || !decoded.id) {
      return false;
    }
    return decoded.id;
  } catch (error) {
    console.error("Error authenticateUser: ", error);
    return false;
  }
}

wss.on("connection", (ws, request) => {
  console.log("new client connected");

  let userId: string | null = null;

  ws.on("message", async function message(data) {
    const parsedData = JSON.parse(data.toString());

    if (parsedData.type === "auth") {
      const uid = authenticateUser(parsedData.token) as string;
      if (!uid) {
        ws.close(4001, "Token expired or invalid");
        return;
      }
      userId = uid;
      users.push({ userId: uid, rooms: [], ws });
      console.log("Connected Clients: ", users)
      return;
    }

    if (!userId) return;

    if (parsedData.type === "join-room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) return;
      if (!user.rooms.includes(parsedData.roomId)) {
        user.rooms.push(parsedData.roomId);
      }
      users.forEach((user) => {
        if (user.ws !== ws && user.rooms.includes(parsedData.roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "presence",
              data: { event: "join", userId: user.userId },
            }),
          );
        }
      });
      user.ws.send(
        JSON.stringify({
          msg: `Room: ${parsedData.roomId} joined!`,
        }),
      );
    }

    if (parsedData.type === "leave-room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
      users.forEach((user) => {
        if (user.ws !== ws && user.rooms.includes(parsedData.roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "presence",
              data: { event: "leave", userId: user.userId },
            }),
          );
        }
      });
      user.ws.send(`Room: ${parsedData.roomId} leaved successfully`);
    }

    if (parsedData.type === "cursor") {
      const roomId = parsedData.data?.roomId;
      const sender = users.find((x) => x.ws === ws);
      if (roomId === undefined || !sender) return;
      users.forEach((peer) => {
        if (peer.ws !== ws && peer.rooms.includes(roomId)) {
          peer.ws.send(
            JSON.stringify({
              type: "cursor",
              data: {
                userId: sender.userId,
                x: parsedData.data.x,
                y: parsedData.data.y,
                name: parsedData.data.name,
              },
            }),
          );
        }
      });
    }

    if (parsedData.type === "onMouseDown" || parsedData.type === "onMouseMove") {
      const roomId = parsedData.data.roomId;
      try {
        users.forEach((user) => {
          if (user.ws !== ws && user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "draw",
                data: parsedData.data,
              }),
            );
          }
        });
      } catch (error) {
        console.log("Error in broadcsting event: ", error);
      }
    }

    if (parsedData.type === "onMouseUp") {
      const roomId = parsedData.data.roomId;
      try {
        const fields = pickElementColumns(parsedData.data);
        await prismaClient.elements.upsert({
          where: { id: parsedData.data.id },
          create: {
            ...fields,
            id: parsedData.data.id,
            roomId,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
          update: { ...fields, roomId, updatedAt: new Date() },
        });
        users.forEach((user) => {
          if (user.ws !== ws && user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "onMouseUp",
                data: parsedData.data
              }),
            );
          }
        });
      } catch (error) {
        console.log("Error saving message: ", error);
      }
    }

    if (parsedData.type === "delete-element") {
      const roomId = parsedData.data.roomId;
      const ids: string[] = parsedData.data.ids ?? [];
      if (ids.length === 0) return;
      try {
        await prismaClient.elements.updateMany({
          where: { id: { in: ids } },
          data: { isDeleted: true, updatedAt: new Date() },
        });
        users.forEach((user) => {
          if (user.ws !== ws && user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "delete-element",
                data: { roomId, ids }
              }),
            );
          }
        });
      } catch (error) {
        console.log("Error deleting elements: ", error);
      }
    }
  });

  ws.on("close", () => {
    const leaving = users.find((x) => x.ws === ws);
    if (leaving) {
      leaving.rooms.forEach((roomId) => {
        users.forEach((peer) => {
          if (peer.ws !== ws && peer.rooms.includes(roomId)) {
            peer.ws.send(
              JSON.stringify({
                type: "presence",
                data: { event: "leave", userId: leaving.userId },
              }),
            );
          }
        });
      });
    }
    users = users.filter((x) => x.ws !== ws);
    console.log("client disconnected. Connected clients:", users.length);
  });
});
