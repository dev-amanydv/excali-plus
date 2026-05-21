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

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      console.log(parsedData)
      try {
        const res = await prismaClient.chat.create({
          data: {
            message: message,
            roomId: Number(roomId),
            userId: userId,
          },
        });

        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "chat",
                message: res.message,
                roomId: res.roomId,
                userId: res.userId,
                id: res.id
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
