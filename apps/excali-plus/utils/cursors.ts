export const CURSOR_MAP: Record<string, string> = {
  select: "default",
  hand: "grab",
  rectangle: "crosshair",
  circle: "crosshair",
  diamond: "crosshair",
  line: "crosshair",
  arrow: "crosshair",
  pencil: "crosshair",
  text: "text",
  eraser: "cell",
};

const CURSOR_COLORS = [
  "#e64980",
  "#7048e8",
  "#1c7ed6",
  "#0ca678",
  "#f08c00",
  "#e8590c",
  "#ae3ec9",
  "#2b8a3e",
];

export function cursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]!;
}
