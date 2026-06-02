import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
  | {
      shape: "rectangle";
      width: number;
      height: number;
      startX: number;
      startY: number;
    }
  | {
      shape: "circle";
      radius: number;
      centerX: number;
      centerY: number;
      startAngle: number;
      endAngle: number;
    };

export const initDraw = async (
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket,
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const existingShapes: Shape[] = await getExistingShapes(roomId);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape);
      clearCanvas(ctx, canvas, existingShapes);
    }
  };

  clearCanvas(ctx, canvas, existingShapes);
  const selectedShape = "rectangle";
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;
  let clicked = false;

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    endX = e.clientX;
    endY = e.clientY;
    if (selectedShape === "rectangle") {
      const height = endY - startY;
      const width = endX - startX;
      const shape: Shape = {
        shape: "rectangle",
        startX: startX,
        startY: startY,
        height: height,
        width: width,
      };
      existingShapes.push(shape);
      socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify(shape),
          roomId,
        }),
      );
    } else if (selectedShape === "circle") {
      const radius = Math.hypot(e.clientX - startX, e.clientY - startY);
      existingShapes.push({
        shape: "circle",
        centerX: startX,
        centerY: startY,
        radius: radius,
        startAngle: 0,
        endAngle: 360,
      });
    }
  });
  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      ctx.strokeStyle = "black";
      clearCanvas(ctx, canvas, existingShapes);

      if (selectedShape === "rectangle") {
        const height = e.clientY - startY;
        const width = e.clientX - startX;
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectedShape === "circle") {
        const radius = Math.hypot(e.clientX - startX, e.clientY - startY);
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 360);
        ctx.stroke();
      }
    }
  });
};

function clearCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  existingShapes: Shape[],
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  existingShapes.map((shape) => {
    if (shape.shape === "rectangle") {
      ctx.strokeStyle = "black";
      ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
    } else if (shape.shape === "circle") {
      ctx.beginPath();
      ctx.arc(
        shape.centerX,
        shape.centerY,
        shape.radius,
        shape.startAngle,
        shape.endAngle,
      );
      ctx.stroke();
    }
  });
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const messages = await res.data.data.chats;
  console.log("res: ", messages);
  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  });
  console.log("shapes: ", shapes);
  return shapes;
}
