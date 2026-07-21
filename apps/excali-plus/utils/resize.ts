import { BoundingBox } from "@/types/canvas";

export type ResizeHandle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

export const RESIZE_CURSORS: Record<ResizeHandle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

export function getHandlePositions(box: BoundingBox, zoom: number) {
  const pad = 5 / zoom;
  const left = box.x - pad;
  const top = box.y - pad;
  const right = box.x + box.width + pad;
  const bottom = box.y + box.height + pad;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  return [
    { handle: "nw" as ResizeHandle, x: left, y: top },
    { handle: "ne" as ResizeHandle, x: right, y: top },
    { handle: "se" as ResizeHandle, x: right, y: bottom },
    { handle: "sw" as ResizeHandle, x: left, y: bottom },
    { handle: "n" as ResizeHandle, x: cx, y: top },
    { handle: "s" as ResizeHandle, x: cx, y: bottom },
    { handle: "w" as ResizeHandle, x: left, y: cy },
    { handle: "e" as ResizeHandle, x: right, y: cy },
  ];
}

export function getHandleAtPoint(
  box: BoundingBox,
  worldX: number,
  worldY: number,
  zoom: number,
): ResizeHandle | null {
  const radius = 8 / zoom;
  for (const pos of getHandlePositions(box, zoom)) {
    if (Math.hypot(worldX - pos.x, worldY - pos.y) <= radius) {
      return pos.handle;
    }
  }
  return null;
}

export function resizeBox(
  start: { x: number; y: number; width: number; height: number },
  handle: ResizeHandle,
  worldX: number,
  worldY: number,
) {
  let x1 = start.x;
  let y1 = start.y;
  let x2 = start.x + start.width;
  let y2 = start.y + start.height;

  if (handle.includes("w")) x1 = worldX;
  if (handle.includes("e")) x2 = worldX;
  if (handle.includes("n")) y1 = worldY;
  if (handle.includes("s")) y2 = worldY;

  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}
