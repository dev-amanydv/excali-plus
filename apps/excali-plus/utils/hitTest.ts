import { ExcalidrawElement } from "@/types/canvas";

export function findElementAtPoint(elements: ExcalidrawElement[], x: number, y: number) {
    for (let i = elements.length - 1; i >= 0; i--){
        const el = elements[i];

        if (el.isDeleted) continue;
        if (isPointInElement(el, x, y)) return el;
    };
    return null;
}

export function isPointInElement (
    element: ExcalidrawElement,
    x: number,
    y: number
): boolean {
    let px = x;
    let py = y;

    if (element.angle !== 0) {
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const cos = Math.cos(-element.angle);
        const sin = Math.sin(-element.angle);
        
        px = cx + dx * cos - dy * sin;
        py = cy + dx * sin + dy * cos;
    }

    const minX = Math.min(element.x, element.x + element.width);
    const minY = Math.min(element.y, element.y + element.height);
    const maxX = Math.max(element.x, element.x + element.width);
    const maxY = Math.max(element.y, element.y + element.height);
    
    return px >= minX && px <= maxX && py <= maxY && py >= minY;
}