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
  const userId = authenticateUser(token) as string;
  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId: userId,
    rooms: [],
    ws,
  });

  console.log("Connected Clients: ", users)

  ws.on("message", async function message(data) {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.type === "join-room") {
      const user = users.find((x) => x.ws === ws);
      if (!user?.rooms.includes(parsedData.roomId)) {
        user?.rooms.push(parsedData.roomId)
      }
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

    if (parsedData.type === "onMouseDown") {
      const roomId = parsedData.data.roomId;
      try {
        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            console.log("act roomId: ", user.rooms)
            console.log(user)
            user.ws.send(
              JSON.stringify({
                type: "draw",
                data: parsedData.data
              }),
            );
          }
        });
      } catch (error) {
        console.log("Error in broadcsting event: ", error);
      }
    }
    if (parsedData.type === "onMouseMove") {
      const roomId = parsedData.data.roomId;
      try {
        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            console.log("act roomId: ", user.rooms)
            console.log(user)
            user.ws.send(
              JSON.stringify({
                type: "draw",
                data: parsedData.data
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
        const res = await prismaClient.elements.create({
          data: { ...parsedData.data, createdAt: new Date(), updatedAt: new Date(), userId },
        });
        console.log("RESPONSE: ", res)
        console.log("sent roomId: ", roomId, " type: ", typeof (roomId))
        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            console.log("act roomId: ", user.rooms)
            console.log(user)
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
  });

  ws.on("close", () => {
    console.log("Server closed");
  });
});
