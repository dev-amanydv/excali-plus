export interface Viewport {
  zoom: number;
  scrollX: number;
  scrollY: number;
}

export function screenToWorld(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  viewport: Viewport,
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left - viewport.scrollX) / viewport.zoom,
    y: (clientY - rect.top - viewport.scrollY) / viewport.zoom,
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  canvas: HTMLCanvasElement,
  viewport: Viewport,
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: worldX * viewport.zoom + viewport.scrollX + rect.left,
    y: worldY * viewport.zoom + viewport.scrollY + rect.top,
  };
}

export function getWheelZoomFactor(e: WheelEvent) {
  return Math.pow(1.0015, -e.deltaY);
}
