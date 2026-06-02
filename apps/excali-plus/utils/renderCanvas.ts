import { BoundingBox, ExcalidrawElement } from "@/types/canvas";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import { getStroke } from "perfect-freehand";

const FONT_FAMILY_MAP: Record<string, string> = {
  "hand-drawn": "Caveat, cursive",
  "normal":     "Inter, sans-serif",
  "monospace":  "'Courier New', monospace",
};

export const ROTATION_HANDLE_OFFSET = 25;

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  elements: ExcalidrawElement[],
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const rc = rough.canvas(canvas);

  elements.forEach((el) => {
    
    if (el.isDeleted) return;
    ctx.save();
    ctx.globalAlpha = el.opacity / 100;

    if (el.angle !== 0) {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(el.angle);
      ctx.translate(-cx, -cy);
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
        drawText(ctx, el);
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
) {
  if (el.isDeleted) return;
  if (el.isEditing) return;
  if (!el.text.trim()) return;

  ctx.font = `${el.fontSize}px ${FONT_FAMILY_MAP[el.fontFamily]}`;
  ctx.fillStyle = el.strokeColor;
  ctx.textAlign = el.textAlign;
  ctx.textBaseline = "top";

  let textX = el.x;
  if (el.textAlign === "center") textX = el.x + el.width / 2;
  if (el.textAlign === "right") textX = el.x + el.width;

  const lineHeight = el.fontSize * el.lineHeight;
  let lines: string[] = [];

  if (el.containerId) {
    const maxWidth = el.width - 10; 
    const rawLines = el.text.split("\n");
    
    rawLines.forEach((rawLine) => {
      const words = rawLine.split(" ");
      let currentLine = words[0] || "";
      
      for (let j = 1; j < words.length; j++) {
        const word = words[j];
        const measureWidth = ctx.measureText(currentLine + " " + word).width;
        
        if (measureWidth < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    });
  } else {
    lines = el.text.split("\n");
  }

  lines.forEach((line, i) => {
    ctx.fillText(line, textX, el.y + i * lineHeight);
  });
}

export function renderSelectionHighlight (
  ctx: CanvasRenderingContext2D,
  boundingBox: BoundingBox | null,
  selectedIds: string[],
  angle: number = 0
) {
  if (!boundingBox || selectedIds.length === 0) return;

  const cx = boundingBox.x + boundingBox.width / 2;
  const cy = boundingBox.y + boundingBox.height / 2;

  ctx.save();

  if (angle !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.translate(-cx, -cy);
  }

  ctx.strokeStyle = '#6865D4';
  ctx.lineWidth = 2;

  ctx.strokeRect(boundingBox.x - 5, boundingBox.y - 5, boundingBox.width + 10, boundingBox.height + 10)

  const handleSize = 8;
  const handles = [
    { x: boundingBox.x - 5, y: boundingBox.y - 5 },
    { x: boundingBox.x + boundingBox.width + 5, y: boundingBox.y - 5 },
    { x: boundingBox.x + boundingBox.width + 5, y: boundingBox.y + boundingBox.height + 5 },
    { x: boundingBox.x - 5, y: boundingBox.y + boundingBox.height + 5 },
    { x: cx, y: boundingBox.y - 5 },
    { x: cx, y: boundingBox.y + boundingBox.height + 5 },
    { x: boundingBox.x - 5, y: cy },
    { x: boundingBox.x + boundingBox.width + 5, y: cy },
  ];

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = "#6865D4";
  ctx.lineWidth = 1;

  handles.forEach((handle) => {
    ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
    ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
  });

  const rotHandleY = boundingBox.y - 5 - ROTATION_HANDLE_OFFSET;
  const rotHandleX = cx;

  ctx.beginPath();
  ctx.strokeStyle = "#6865D4";
  ctx.lineWidth = 1.5;
  ctx.moveTo(rotHandleX, boundingBox.y - 5);
  ctx.lineTo(rotHandleX, rotHandleY);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(rotHandleX, rotHandleY, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#6865D4";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

export function getRotationHandlePosition(
  boundingBox: BoundingBox,
  angle: number = 0
): { x: number; y: number } {
  const cx = boundingBox.x + boundingBox.width / 2;
  const cy = boundingBox.y + boundingBox.height / 2;
  const hx = cx;
  const hy = boundingBox.y - 5 - ROTATION_HANDLE_OFFSET;

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
