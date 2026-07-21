import { BoundingBox, ExcalidrawElement } from "@/types/canvas";
import { Viewport } from "@/utils/viewport";
import {
  BOUND_TEXT_PADDING,
  getFontString,
  wrapText,
} from "@/utils/textMeasure";
import { getHandlePositions } from "@/utils/resize";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import { getStroke } from "perfect-freehand";

export const ROTATION_HANDLE_OFFSET = 25;

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  elements: ExcalidrawElement[],
  viewport: Viewport,
  pendingEraseIds?: Set<string>,
  background?: string,
) {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.setTransform(
    dpr * viewport.zoom,
    0,
    0,
    dpr * viewport.zoom,
    dpr * viewport.scrollX,
    dpr * viewport.scrollY,
  );
  const rc = rough.canvas(canvas);
  const elementsById = new Map(elements.map((el) => [el.id, el]));

  elements.forEach((el) => {
    if (el.isDeleted) return;
    ctx.save();
    ctx.globalAlpha = pendingEraseIds?.has(el.id)
      ? 0.3
      : el.opacity / 100;

    let rotationCx = el.x + el.width / 2;
    let rotationCy = el.y + el.height / 2;
    let angle = el.angle;

    if (el.type === "text" && el.containerId) {
      const container = elementsById.get(el.containerId);
      if (container) {
        rotationCx = container.x + container.width / 2;
        rotationCy = container.y + container.height / 2;
        angle = container.angle;
      }
    }

    if (angle !== 0) {
      ctx.translate(rotationCx, rotationCy);
      ctx.rotate(angle);
      ctx.translate(-rotationCx, -rotationCy);
    }

    const roughOptions: Options = {
      seed: el.seed,
      roughness: el.roughness,
      strokeWidth: el.strokeWidth,
      stroke: el.strokeColor,
      fill:
        el.backgroundColor !== "transparent" ? el.backgroundColor : undefined,
      fillStyle:
        el.fillStyle === "none"
          ? undefined
          : (el.fillStyle as "solid" | "hachure" | "cross-hatch"),
      strokeLineDash:
        el.strokeStyle === "dashed"
          ? [12, 8]
          : el.strokeStyle === "dotted"
            ? [3, 6]
            : undefined,
    };

    switch (el.type) {
      case "rectangle":
        drawRectangle(rc, ctx, el, roughOptions);
        break;

      case "circle":
        drawCircle(rc, el, roughOptions);
        break;

      case "diamond":
        drawDiamond(rc, el, roughOptions);
        break;

      case "line":
        drawLine(rc, el, roughOptions);
        break;

      case "arrow":
        drawArrow(rc, el, roughOptions);
        break;

      case "pencil":
        drawPencil(ctx, el);
        break;

      case "text":
        drawText(ctx, el, elementsById);
        break;
    }
    ctx.restore();
  });
}

function drawRectangle(
  rc: ReturnType<typeof rough.canvas>,
  ctx: CanvasRenderingContext2D,
  el: Extract<ExcalidrawElement, { type: "rectangle" }>,
  options: Options,
) {
  if (el.edgeStyle === "round") {
    const radius = Math.min(
      Math.min(Math.abs(el.width), Math.abs(el.height)) * 0.25,
      32,
    );
    const x = el.x;
    const y = el.y;
    const w = el.width;
    const h = el.height;
    const r = radius;

    const nx = w < 0 ? x + w : x;
    const ny = h < 0 ? y + h : y;
    const nw = Math.abs(w);
    const nh = Math.abs(h);
    const nr = Math.min(r, nw / 2, nh / 2);

    const path = `M ${nx + nr} ${ny} 
      L ${nx + nw - nr} ${ny} 
      Q ${nx + nw} ${ny} ${nx + nw} ${ny + nr} 
      L ${nx + nw} ${ny + nh - nr} 
      Q ${nx + nw} ${ny + nh} ${nx + nw - nr} ${ny + nh} 
      L ${nx + nr} ${ny + nh} 
      Q ${nx} ${ny + nh} ${nx} ${ny + nh - nr} 
      L ${nx} ${ny + nr} 
      Q ${nx} ${ny} ${nx + nr} ${ny} Z`;

    rc.path(path, options);
  } else {
    rc.rectangle(el.x, el.y, el.width, el.height, options);
  }
}

function drawCircle(
  rc: ReturnType<typeof rough.canvas>,
  el: Extract<ExcalidrawElement, { type: "circle" }>,
  options: Options,
) {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  rc.ellipse(cx, cy, Math.abs(el.width), Math.abs(el.height), options);
}

function drawDiamond(
  rc: ReturnType<typeof rough.canvas>,
  el: Extract<ExcalidrawElement, { type: "diamond" }>,
  options: Options,
) {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const points: [number, number][] = [
    [cx, el.y],
    [el.x + el.width, cy],
    [cx, el.y + el.height],
    [el.x, cy],
  ];
  rc.polygon(points, options);
}

function drawLine(
  rc: ReturnType<typeof rough.canvas>,
  el: Extract<ExcalidrawElement, { type: "line" }>,
  options: Options,
) {
  if (el.points.length < 2) return;
  const points: [number, number][] = el.points.map((p) => [
    el.x + p.x,
    el.y + p.y,
  ]);
  rc.linearPath(points, options);
}

function drawArrow(
  rc: ReturnType<typeof rough.canvas>,
  el: Extract<ExcalidrawElement, { type: "arrow" }>,
  options: Options,
) {
  if (el.points.length < 2) return;

  const points: [number, number][] = el.points.map((p) => [
    el.x + p.x,
    el.y + p.y,
  ]);
  rc.linearPath(points, options);

  const lastPoint = points[points.length - 1]!;
  const secondLast = points[points.length - 2]!;

  const angle = Math.atan2(
    lastPoint[1] - secondLast[1],
    lastPoint[0] - secondLast[0],
  );

  const arrowLength = 15;
  const arrowAngle = Math.PI / 6; 

  const x1 = lastPoint[0] - arrowLength * Math.cos(angle - arrowAngle);
  const y1 = lastPoint[1] - arrowLength * Math.sin(angle - arrowAngle);
  const x2 = lastPoint[0] - arrowLength * Math.cos(angle + arrowAngle);
  const y2 = lastPoint[1] - arrowLength * Math.sin(angle + arrowAngle);

  rc.line(lastPoint[0], lastPoint[1], x1, y1, options);
  rc.line(lastPoint[0], lastPoint[1], x2, y2, options);
}

function drawPencil(
  ctx: CanvasRenderingContext2D,
  el: Extract<ExcalidrawElement, { type: "pencil" }>,
) {
  if (el.points.length < 2) return;

  const pointsForFreehand = el.points.map((p) => [el.x + p.x, el.y + p.y]);

  const stroke = getStroke(pointsForFreehand, {
    size: el.strokeWidth * 3,
    thinning: el.simulatePressure ? 0.3 : 0.1,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: el.simulatePressure !== false,
  });

  const pathData = getSvgPathFromStroke(stroke);
  const path = new Path2D(pathData);

  ctx.fillStyle = el.strokeColor;
  ctx.fill(path);
}

function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"] as (string | number)[],
  );

  d.push("Z");
  return d.join(" ");
}

function drawText(
  ctx: CanvasRenderingContext2D,
  el: Extract<ExcalidrawElement, { type: "text" }>,
  elementsById: Map<string, ExcalidrawElement>,
) {
  if (el.isDeleted) return;
  if (el.isEditing) return;
  if (!el.text.trim()) return;

  const font = getFontString(el);
  ctx.font = font;
  ctx.fillStyle = el.strokeColor;
  ctx.textBaseline = "top";

  const lineHeight = el.fontSize * el.lineHeight;
  const container = el.containerId
    ? elementsById.get(el.containerId)
    : undefined;

  if (container) {
    const maxWidth = container.width - BOUND_TEXT_PADDING * 2;
    const lines = wrapText(el.text, font, maxWidth);
    const textHeight = lines.length * lineHeight;
    const centerX = container.x + container.width / 2;
    const startY = container.y + container.height / 2 - textHeight / 2;

    ctx.textAlign = "center";
    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, startY + i * lineHeight);
    });
    return;
  }

  ctx.textAlign = el.textAlign;
  let textX = el.x;
  if (el.textAlign === "center") textX = el.x + el.width / 2;
  if (el.textAlign === "right") textX = el.x + el.width;

  el.text.split("\n").forEach((line, i) => {
    ctx.fillText(line, textX, el.y + i * lineHeight);
  });
}

export interface OverlayState {
  boundingBox: BoundingBox | null;
  selectedIds: string[];
  selectedAngle: number;
  marquee?: { x: number; y: number; width: number; height: number } | null;
}

export function renderOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  viewport: Viewport,
  overlay: OverlayState,
) {
  const dpr = window.devicePixelRatio || 1;
  const zoom = viewport.zoom;
  ctx.setTransform(
    dpr * zoom,
    0,
    0,
    dpr * zoom,
    dpr * viewport.scrollX,
    dpr * viewport.scrollY,
  );

  const { boundingBox, selectedIds, selectedAngle, marquee } = overlay;

  if (boundingBox && selectedIds.length > 0) {
    const pad = 5 / zoom;
    const cx = boundingBox.x + boundingBox.width / 2;
    const cy = boundingBox.y + boundingBox.height / 2;
    const isMultiSelect = selectedIds.length > 1;

    ctx.save();

    if (selectedAngle !== 0) {
      ctx.translate(cx, cy);
      ctx.rotate(selectedAngle);
      ctx.translate(-cx, -cy);
    }

    ctx.strokeStyle = "#6865D4";
    ctx.lineWidth = 2 / zoom;
    if (isMultiSelect) ctx.setLineDash([5 / zoom, 5 / zoom]);
    ctx.strokeRect(
      boundingBox.x - pad,
      boundingBox.y - pad,
      boundingBox.width + pad * 2,
      boundingBox.height + pad * 2,
    );
    ctx.setLineDash([]);

    if (!isMultiSelect) {
      const handleSize = 8 / zoom;

      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#6865D4";
      ctx.lineWidth = 1 / zoom;

      getHandlePositions(boundingBox, zoom).forEach((handle) => {
        ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      });

      const rotHandleX = cx;
      const rotHandleY = boundingBox.y - pad - ROTATION_HANDLE_OFFSET / zoom;

      ctx.beginPath();
      ctx.strokeStyle = "#6865D4";
      ctx.lineWidth = 1.5 / zoom;
      ctx.moveTo(rotHandleX, boundingBox.y - pad);
      ctx.lineTo(rotHandleX, rotHandleY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rotHandleX, rotHandleY, 5 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#6865D4";
      ctx.lineWidth = 1.5 / zoom;
      ctx.stroke();
    }

    ctx.restore();
  }

  if (marquee) {
    ctx.save();
    ctx.fillStyle = "rgba(104, 101, 212, 0.08)";
    ctx.strokeStyle = "#6865D4";
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([5 / zoom, 5 / zoom]);
    ctx.fillRect(marquee.x, marquee.y, marquee.width, marquee.height);
    ctx.strokeRect(marquee.x, marquee.y, marquee.width, marquee.height);
    ctx.restore();
  }
}

export function getRotationHandlePosition(
  boundingBox: BoundingBox,
  angle: number = 0,
  zoom: number = 1,
): { x: number; y: number } {
  const cx = boundingBox.x + boundingBox.width / 2;
  const cy = boundingBox.y + boundingBox.height / 2;
  const hx = cx;
  const hy = boundingBox.y - (5 + ROTATION_HANDLE_OFFSET) / zoom;

  if (angle === 0) return { x: hx, y: hy };

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = hx - cx;
  const dy = hy - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}
