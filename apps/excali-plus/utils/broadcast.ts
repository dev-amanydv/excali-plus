import { ExcalidrawElement } from "@/types/canvas";

export function broadcastElement(
  socket: WebSocket | null | undefined,
  roomId: string | null | undefined,
  element: ExcalidrawElement,
) {
  if (!socket || !roomId || socket.readyState !== WebSocket.OPEN) return;
  socket.send(
    JSON.stringify({
      type: "onMouseUp",
      data: { ...element, roomId: Number(roomId) },
    }),
  );
}

export function broadcastDraw(
  socket: WebSocket | null | undefined,
  roomId: string | null | undefined,
  type: "onMouseDown" | "onMouseMove",
  element: ExcalidrawElement,
) {
  if (!socket || !roomId || socket.readyState !== WebSocket.OPEN) return;
  socket.send(
    JSON.stringify({
      type,
      data: { ...element, roomId: Number(roomId) },
    }),
  );
}

export function broadcastCursor(
  socket: WebSocket | null | undefined,
  roomId: string | null | undefined,
  cursor: { x: number; y: number; name: string },
) {
  if (!socket || !roomId || socket.readyState !== WebSocket.OPEN) return;
  socket.send(
    JSON.stringify({
      type: "cursor",
      data: { roomId: Number(roomId), ...cursor },
    }),
  );
}

export function broadcastDelete(
  socket: WebSocket | null | undefined,
  roomId: string | null | undefined,
  ids: string[],
) {
  if (!socket || !roomId || socket.readyState !== WebSocket.OPEN) return;
  socket.send(
    JSON.stringify({
      type: "delete-element",
      data: { roomId: Number(roomId), ids },
    }),
  );
}
