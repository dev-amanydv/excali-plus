"use client";
import { useEffect, useRef, useState } from "react";
import Nav from "./Nav";
import ToolOptionsPanel from "./ToolOptionsPanel";
import ZoomControls from "./ZoomControls";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectActiveTool } from "@/store/selectors";
import { deleteElement, loadElements, upsertElement } from "@/store/slices/canvasSlice";
import { useCanvasDraw } from "@/hooks/useCanvasDraw";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import ExcalidrawMenu from "./MenuOptions";
import ShareOption from "./ShareOptions";
import { CURSOR_MAP, cursorColor } from "@/utils/cursors";
import { worldToScreen } from "@/utils/viewport";

interface RemoteCursor {
  x: number;
  y: number;
  name: string;
  updatedAt: number;
}

export default function Canvas({
  roomId,
  socket,
  view = false,
}: {
  roomId?: string | null;
  socket?: WebSocket | null;
  view?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectActiveTool);
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});

  useEffect(() => {
    if (roomId) return;
    const rawElements = localStorage.getItem("canvas");
    if (!rawElements) return;
    const elements = JSON.parse(rawElements);
    dispatch(loadElements({ elements, files: {} }));
  }, [roomId, dispatch]);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      switch (parsedData.type) {
        case "draw":
        case "onMouseUp":
          dispatch(upsertElement(parsedData.data));
          break;
        case "delete-element":
          dispatch(deleteElement(parsedData.data.ids));
          break;
        case "cursor": {
          const { userId, x, y, name } = parsedData.data;
          setCursors((prev) => ({
            ...prev,
            [userId]: { x, y, name: name ?? "Anonymous", updatedAt: Date.now() },
          }));
          break;
        }
        case "presence": {
          if (parsedData.data.event === "leave") {
            setCursors((prev) => {
              const next = { ...prev };
              delete next[parsedData.data.userId];
              return next;
            });
          }
          break;
        }
      }
    };
  }, [socket, dispatch]);

  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      setCursors((prev) => {
        const now = Date.now();
        let changed = false;
        const next: Record<string, RemoteCursor> = {};
        for (const [id, c] of Object.entries(prev)) {
          if (now - c.updatedAt < 5000) next[id] = c;
          else changed = true;
        }
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [socket]);

  useCanvasDraw(canvasRef, view ? null : socket, view ? null : roomId, view);
  useKeyboardShortcuts(view ? null : socket, view ? null : roomId, view);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {!view && (
        <>
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
        </>
      )}
      {view && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-full bg-black/70 text-white text-xs px-3 py-1.5">
          Read-only view
        </div>
      )}
      <ZoomControls />
      <canvas
        id="canvas"
        style={{
          cursor: view ? "default" : CURSOR_MAP[activeTool] ?? "crosshair",
          touchAction: "none",
        }}
        ref={canvasRef}
        className="absolute inset-0 bg-white"
      ></canvas>
      <RemoteCursors cursors={cursors} canvasRef={canvasRef} />
    </div>
  );
}

function RemoteCursors({
  cursors,
  canvasRef,
}: {
  cursors: Record<string, RemoteCursor>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  const viewport = useAppSelector((s) => ({
    zoom: s.ui.zoom,
    scrollX: s.ui.scrollX,
    scrollY: s.ui.scrollY,
  }));
  const canvas = canvasRef.current;
  if (!canvas) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {Object.entries(cursors).map(([userId, c]) => {
        const p = worldToScreen(c.x, c.y, canvas, viewport);
        const color = cursorColor(userId);
        return (
          <div
            key={userId}
            className="absolute"
            style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
              <path d="M5 2l14 7-6 2-2 6z" />
            </svg>
            <span
              className="ml-3 rounded px-1.5 py-0.5 text-[11px] text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {c.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
