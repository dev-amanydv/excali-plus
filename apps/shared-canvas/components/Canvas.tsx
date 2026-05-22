"use client";
import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";
import Nav from "./Nav";
import ToolOptionsPanel from "./ToolOptionsPanel";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectActiveTool } from "@/store/selectors";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { addElement, loadElements } from "@/store/slices/canvasSlice";
import { useCanvasDraw } from "@/hooks/useCanvasDraw";
import ExcalidrawMenu from "./MenuOptions";
import ShareOption from "./ShareOptions";

const CURSOR_MAP: Record<string, string> = {
  select: "default",
  hand: "grab",
  rectangle: "crosshair",
  circle: "crosshair",
  diamond: "crosshair",
  line: "crosshair",
  arrow: "crosshair",
  pencil: "url('/cursors/pencil.cur'), crosshair",
  text: "text",
  eraser: "url('/cursors/eraser.cur'), cell",
};

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectActiveTool);

  useEffect(() => {
    const loadExisting = async () => {
      // const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
      // const messages = res.data.data.chats;

      // const elements = messages.map((x: { message: string }) =>
      //   JSON.parse(x.message),
      // );
      const rawElements = localStorage.getItem("canvas");
      if (!rawElements) return;
      const elements = JSON.parse(rawElements)
      dispatch(loadElements({ elements, files: {} }));
    };
    loadExisting();
  }, [roomId, dispatch]);

  useEffect(() => {
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message)
        if (message.type === "chat"){
            const element = JSON.parse(message.message);
            dispatch(addElement(element))
        }
    }
  }, [socket, dispatch]);

  useCanvasDraw(canvasRef, socket, roomId);

  return (
    <div className="relative w-screen h-screen">
      <div className="flex justify-center w-full">
        <Nav />
      </div>
      <div className="absolute top-11 left-3 z-20">
        <ExcalidrawMenu />
      </div>
      <div className="h-full w-full">
        <ShareOption />
      </div>
      <ToolOptionsPanel />
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          cursor: CURSOR_MAP[activeTool] ?? "crosshair",
          imageRendering: "pixelated",
          backgroundColor: "white"
        }}
        ref={canvasRef}
        className="absolute inset-0 bg-white"
      ></canvas>
    </div>
  );
}
