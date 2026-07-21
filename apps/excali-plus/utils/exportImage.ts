import { ExcalidrawElement } from "@/types/canvas";
import { calculateCombinedBoundingBox } from "@/utils/hitTest";
import { renderCanvas } from "@/utils/renderCanvas";

const EXPORT_PADDING = 20;

export function exportToPng(elements: ExcalidrawElement[]) {
  const visible = elements.filter((el) => !el.isDeleted);
  const bbox = calculateCombinedBoundingBox(visible);
  if (!bbox) return;

  const dpr = window.devicePixelRatio || 1;
  const width = bbox.width + EXPORT_PADDING * 2;
  const height = bbox.height + EXPORT_PADDING * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const viewport = {
    zoom: 1,
    scrollX: -bbox.x + EXPORT_PADDING,
    scrollY: -bbox.y + EXPORT_PADDING,
  };
  renderCanvas(ctx, canvas, visible, viewport, undefined, "#ffffff");

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "excali-plus.png";
    link.click();
    URL.revokeObjectURL(url);
  });
}
