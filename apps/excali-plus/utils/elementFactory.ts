import type { ToolOptions } from "@/store/slices/toolSlice";
import {
  ArrowElement,
  CircleElement,
  DiamondElement,
  LineElement,
  PencilElement,
  RectangleElement,
  TextElement,
} from "@/types/canvas";
import { nanoid } from "@reduxjs/toolkit";

export function createRectangleElement(
  startX: number,
  startY: number,
  options: ToolOptions,
): RectangleElement {
  return {
    id: nanoid(),
    type: "rectangle",
    x: startX,
    y: startY,
    height: 0,
    width: 0,
    angle: 0,
    strokeColor: options.strokeColor,
    backgroundColor: options.backgroundColor,
    fillStyle: options.fillStyle,
    strokeWidth: options.strokeWidth,
    strokeStyle: options.strokeStyle,
    opacity: options.opacity,
    roughness: options.roughness,
    edgeStyle: options.edgeStyle,
    boundTextElementId: null,
    isDeleted: false,
    isLocked: false,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createCircleElement(
  startX: number,
  startY: number,
  options: ToolOptions,
): CircleElement {
  return {
    id: nanoid(),
    type: "circle",
    x: startX,
    y: startY,
    height: 0,
    width: 0,
    angle: 0,
    strokeColor: options.strokeColor,
    backgroundColor: options.backgroundColor,
    fillStyle: options.fillStyle,
    strokeWidth: options.strokeWidth,
    strokeStyle: options.strokeStyle,
    opacity: options.opacity,
    roughness: options.roughness,
    boundTextElementId: null,
    isDeleted: false,
    isLocked: false,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createDiamondElement(
  startX: number,
  startY: number,
  options: ToolOptions,
): DiamondElement {
  return {
    id: nanoid(),
    type: "diamond",
    x: startX,
    y: startY,
    height: 0,
    width: 0,
    angle: 0,
    strokeColor: options.strokeColor,
    backgroundColor: options.backgroundColor,
    fillStyle: options.fillStyle,
    strokeWidth: options.strokeWidth,
    strokeStyle: options.strokeStyle,
    opacity: options.opacity,
    roughness: options.roughness,
    boundTextElementId: null,
    isDeleted: false,
    isLocked: false,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createLineElement(
  startX: number,
  startY: number,
  options: ToolOptions,
): LineElement {
  return {
    id: nanoid(),
    type: "line",
    strokeColor: options.strokeColor,
    strokeStyle: options.strokeStyle,
    strokeWidth: options.strokeWidth,
    points: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    lastCommittedPoint: null,
    x: startX,
    y: startY,
    width: 0,
    height: 0,
    angle: 0,
    backgroundColor: options.backgroundColor,
    fillStyle: options.fillStyle,
    opacity: options.opacity,
    roughness: options.roughness,
    isDeleted: false,
    isLocked: false,
    seed: Math.floor(Math.random() * 1000000),
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function createPencilElement(
  startX: number,
  startY: number,
  options: ToolOptions
): PencilElement {
  return {
    id: nanoid(),
    type: "pencil",
    strokeColor: options.strokeColor,
    strokeStyle: options.strokeStyle,
    strokeWidth: options.strokeWidth,
    x: startX,
    y: startY,
    height: 0,
    width: 0,
    fillStyle: options.fillStyle,
    points: [{x: 0, y: 0 }, {x: 0, y:0 }],
    pressures: [12],
    backgroundColor: options.backgroundColor,
    opacity: options.opacity,
    isDeleted: false,
    isLocked: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    roughness: options.roughness,
    angle: 0,
    version: 1,
    seed: Math.floor(Math.random() * 100000),
    simulatePressure: true
  }
}

export function createArrowElement (startX: number, startY: number, options: ToolOptions): ArrowElement {
  return {
    id: nanoid(),
    type: "arrow",
    strokeColor: options.strokeColor,
    strokeStyle: options.strokeStyle,
    strokeWidth: options.strokeWidth,
    backgroundColor: options.backgroundColor,
    fillStyle: options.fillStyle,
    opacity: options.opacity,
    roughness: options.roughness,
    isDeleted: false,
    isLocked: false,
    version: 1,
    x: startX,
    y: startY,
    width: 0,
    height: 0,
    angle: 0,
    points: [],
    startArrowHead: "arrow",
    endArrowHead: "none",
    startBinding: null ,
    endBinding: null,
    seed: Math.floor(Math.random() * 100000),
    updatedAt: Date.now(),
    createdAt: Date.now()
  }
}

export function createTextElement (
  startX: number,
  startY: number,
  options: ToolOptions
): TextElement {
  return {
    id: nanoid(),
    strokeColor: options.strokeColor,
    strokeWidth: options.strokeWidth,
    fillStyle: options.fillStyle,
    strokeStyle: options.strokeStyle,
    angle: 0,
    roughness: options.roughness,
    x: startX,
    y: startY,
    width: 10,
    fontWeight: "normal",
    autoResize: true, 
    originalText: "",
    height: options.fontSize * 1.5,
    opacity: options.opacity,
    backgroundColor: options.backgroundColor,
    type: "text",
    fontFamily: options.fontFamily,
    fontSize: options.fontSize,
    text: "",
    textAlign: options.textAlign,
    verticalAlign: "top",
    lineHeight: 1.5,
    isEditing: true,
    isDeleted: false,
    isLocked: false,
    containerId: null,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    updatedAt: Date.now(),
    createdAt: Date.now()
  }
}

export function createBoundTextElement(
  container: { id: string; x: number; y: number; width: number; height: number; strokeColor: string },
  options: ToolOptions
): TextElement {
  const fontSize = options.fontSize ?? 20;
  const lineHeight = 1.5;
  const textHeight = fontSize * lineHeight;
  const cx = container.x + container.width / 2;
  const cy = container.y + container.height / 2;

  return {
    id: nanoid(),
    type: "text",
    x: cx,
    y: cy - textHeight / 2,
    width: 10,
    height: textHeight,
    angle: 0,
    strokeColor: container.strokeColor,
    strokeWidth: 1,
    backgroundColor: "transparent",
    fillStyle: "none",
    strokeStyle: "solid",
    opacity: 100,
    roughness: 0,
    fontSize,
    fontFamily: options.fontFamily ?? "hand-drawn",
    fontWeight: "normal",
    text: "",
    originalText: "",
    textAlign: "center",
    verticalAlign: "middle",
    lineHeight,
    isEditing: true,
    autoResize: true,
    isDeleted: false,
    isLocked: false,
    containerId: container.id,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}