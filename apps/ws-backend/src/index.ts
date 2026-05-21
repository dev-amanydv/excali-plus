import "dotenv/config";
import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import WebSocket from "ws";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 9000 });
console.log(`Websocket is running at port: ${9000}`)
interface AuthJwtPayload extends JwtPayload {
  userId?: string;
}

interface Users {
  userId: string;
  rooms: number[];
  ws: WebSocket;
}

let users: Users[] = [];

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
  const url = request.url;
  if (!url) return;

  const queryParams = new URLSearchParams(url?.split("?")[1]);
  const token = queryParams.get("token") ?? "";
  const userId = authenticateUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId: userId,
    rooms: [],
    ws,
  });

  console.log(users)

  ws.on("message", async function message(data) {
    const parsedData = JSON.parse(data as unknown as string);

    if (parsedData.type === "join-room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
      console.log("AFTER", users);
      user?.ws.send(
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
      user.rooms = user?.rooms.filter((x) => x !== parsedData.roomId);
      user.ws.send(`Room: ${parsedData.roomId} leaved successfully`);
    }

    if (parsedData.type === "draw") {
      const roomId = parsedData.roomId;
      const { id, type, edgeStyle, boundTextElementId, points, startArrowHead, endArrowHead, startBinding, endBinding, simulatePressure, pressures, text, fontSize, fontFamily, textAlign, verticalAlign, fontWeight, lineHeight, isEditing, autoResize, originalText, containerId, x, y, width, height, angle, strokeColor, strokeStyle, backgroundColor, fillStyle, strokeWidth, opacity, roughness, isDeleted, seed, version, createdAt, updatedAt, isLocked } = parsedData;

      console.log(parsedData);

      try {
        const res = await prismaClient.elements.create({
          data: parsedData.data,
        });
        console.log("RESPONSE: ", res)
        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "draw",
                data: parsedData.data
              }),
            );
          }
        });
      } catch (error) {
        console.log("Error saving message: ", error);
      }
    }
  });

  ws.on("close", () => {
    console.log("Server closed");
  });
});
