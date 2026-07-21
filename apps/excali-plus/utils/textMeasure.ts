export const BOUND_TEXT_PADDING = 10;

export const FONT_FAMILY_MAP: Record<string, string> = {
  "hand-drawn": "Caveat, cursive",
  "normal": "Inter, sans-serif",
  "monospace": "'Courier New', monospace",
};

let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureContext() {
  if (!measureCtx) {
    measureCtx = document.createElement("canvas").getContext("2d")!;
  }
  return measureCtx;
}

export function getFontString(element: {
  fontSize: number;
  fontFamily: string;
}) {
  const family = FONT_FAMILY_MAP[element.fontFamily] ?? "sans-serif";
  return `${element.fontSize}px ${family}`;
}

export function measureTextWidth(text: string, font: string) {
  const ctx = getMeasureContext();
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function wrapText(text: string, font: string, maxWidth: number) {
  const lines: string[] = [];

  const breakLongWord = (word: string) => {
    let current = "";
    for (const char of word) {
      if (current && measureTextWidth(current + char, font) > maxWidth) {
        lines.push(current);
        current = char;
      } else {
        current += char;
      }
    }
    return current;
  };

  text.split("\n").forEach((paragraph) => {
    let currentLine = "";
    paragraph.split(" ").forEach((word) => {
      const candidate = currentLine ? currentLine + " " + word : word;
      if (measureTextWidth(candidate, font) <= maxWidth) {
        currentLine = candidate;
        return;
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      if (measureTextWidth(word, font) > maxWidth) {
        currentLine = breakLongWord(word);
      } else {
        currentLine = word;
      }
    });
    lines.push(currentLine);
  });

  return lines;
}

export function measureLines(
  lines: string[],
  font: string,
  fontSize: number,
  lineHeight: number,
) {
  let width = 0;
  lines.forEach((line) => {
    width = Math.max(width, measureTextWidth(line, font));
  });
  return { width, height: lines.length * fontSize * lineHeight };
}
