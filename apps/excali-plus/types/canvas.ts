export type ToolType =
  | "select"
  | "rectangle"
  | "circle"
  | "diamond"
  | "arrow"
  | "line"
  | "pencil"
  | "text"
  | "image"
  | "eraser"
  | "hand";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type FillStyle = "solid" | "hachure" | "cross-hatch" | "none";

export type FontFamily = "hand-drawn" | "normal" | "monospace" | "comic-sans";

export type TextAlign = "left" | "center" | "right";

export type ArrowHead = "none" | "arrow" | "dot" | "bar";

export type EdgeStyle = "sharp" | "round";

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeStyle: StrokeStyle;
  strokeWidth: number;
  opacity: number;
  roughness: number;
  isDeleted: boolean;
  seed: number;
  version: number;
  createdAt: number;
  updatedAt: number;
  isLocked: boolean;
}

export interface RectangleElement extends BaseElement {
  type: "rectangle";
  edgeStyle: EdgeStyle;
  boundTextElementId: string | null;
}

export interface CircleElement extends BaseElement {
  type: "circle";
  boundTextElementId: string | null;
}

export interface DiamondElement extends BaseElement {
  type: "diamond";
  boundTextElementId: string | null;
}

export interface LineElement extends BaseElement {
  type: "line";
  points: Point[];
  lastCommittedPoint: Point | null;
}

export interface ArrowElement extends BaseElement {
  type: "arrow";
  points: Point[];
  startArrowHead: ArrowHead;
  endArrowHead: ArrowHead;
  startBinding: ElementBinding | null;
  endBinding: ElementBinding | null;
}

export interface PencilElement extends BaseElement {
  type: "pencil";
  points: Point[];
  simulatePressure: boolean;
  pressures: number[];
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  verticalAlign: "top" | "middle";
  fontWeight: "normal" | "bold";
  lineHeight: number;
  isEditing: boolean;
  autoResize: boolean;
  originalText: string;
  containerId: string | null;
}

export interface ImageElement extends BaseElement {
  type: "image";
  fileId: string;
  status: "pending" | "loaded" | "error";
  scale: [number, number];
}

export type ExcalidrawElement =
  | RectangleElement
  | CircleElement
  | DiamondElement
  | PencilElement
  | TextElement
  | ArrowElement
  | ImageElement
  | LineElement;

export type ElementType = ExcalidrawElement["type"];

export interface ElementBinding {
  elementId: string;
  focus: number;
  gap: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

export interface BinaryFile {
  id: string;
  mimeType: string;
  dataURL: string;
  created: number;
}
