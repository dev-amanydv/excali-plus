"use client";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectActiveTool, selectToolOptions } from "@/store/selectors";
import { ToolType } from "@/types/canvas";
import { updateToolOptions } from "@/store/slices/toolSlice";

const SHAPE_TOOLS: ToolType[] = [
  "rectangle",
  "circle",
  "diamond",
  "line",
  "arrow",
  "pencil",
];

const STROKE_COLORS = [
  { color: "#1e1e1e", label: "Black" },
  { color: "#e03131", label: "Red" },
  { color: "#2f9e44", label: "Green" },
  { color: "#1971c2", label: "Blue" },
  { color: "#f08c00", label: "Orange" },
];

const BG_COLORS = [
  { color: "transparent", label: "Transparent" },
  { color: "#ffc9c9", label: "Light red" },
  { color: "#b2f2bb", label: "Light green" },
  { color: "#a5d8ff", label: "Light blue" },
  { color: "#ffec99", label: "Light yellow" },
];

function StrokeWidthBaseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.167 10h11.666" strokeWidth="1.25" />
    </svg>
  );
}

function StrokeWidthBoldIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10h10" strokeWidth="2.5" />
    </svg>
  );
}

function StrokeWidthExtraBoldIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10h10" strokeWidth="3.75" />
    </svg>
  );
}

function StrokeStyleSolidIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 40 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <path d="M6 10H34" strokeWidth={2} />
    </svg>
  );
}

function StrokeStyleDashedIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 24 24"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g strokeWidth="2">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 12h2" />
        <path d="M17 12h2" />
        <path d="M11 12h2" />
      </g>
    </svg>
  );
}

function StrokeStyleDottedIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 24 24"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g strokeWidth="2">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 12v.01" />
        <path d="M8 12v.01" />
        <path d="M12 12v.01" />
        <path d="M16 12v.01" />
        <path d="M20 12v.01" />
      </g>
    </svg>
  );
}

function SloppinessArchitectIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M2.5 12.038c1.655-.885 5.9-3.292 8.568-4.354 2.668-1.063.101 2.821 1.32 3.104 1.218.283 5.112-1.814 5.112-1.814"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function SloppinessArtistIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M2.5 12.563c1.655-.886 5.9-3.293 8.568-4.355 2.668-1.062.101 2.822 1.32 3.105 1.218.283 5.112-1.814 5.112-1.814m-13.469 2.23c2.963-1.586 6.13-5.62 7.468-4.998 1.338.623-1.153 4.11-.132 5.595 1.02 1.487 6.133-1.43 6.133-1.43"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function SloppinessCartoonistIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M2.5 11.936c1.737-.879 8.627-5.346 10.42-5.268 1.795.078-.418 5.138.345 5.736.763.598 3.53-1.789 4.235-2.147M2.929 9.788c1.164-.519 5.47-3.28 6.987-3.114 1.519.165 1 3.827 2.121 4.109 1.122.281 3.839-2.016 4.606-2.42"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function EdgeSharpIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path d="M3.33334 9.99998V6.66665C3.33334 6.04326 3.33403 4.9332 3.33539 3.33646C4.95233 3.33436 6.06276 3.33331 6.66668 3.33331H10" />
      <path d="M13.3333 3.33331V3.34331" />
      <path d="M16.6667 3.33331V3.34331" />
      <path d="M16.6667 6.66669V6.67669" />
      <path d="M16.6667 10V10.01" />
      <path d="M3.33334 13.3333V13.3433" />
      <path d="M16.6667 13.3333V13.3433" />
      <path d="M3.33334 16.6667V16.6767" />
      <path d="M6.66666 16.6667V16.6767" />
      <path d="M10 16.6667V16.6767" />
      <path d="M13.3333 16.6667V16.6767" />
      <path d="M16.6667 16.6667V16.6767" />
    </svg>
  );
}

function EdgeRoundIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 24 24"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 12v-4a4 4 0 0 1 4 -4h4" />
      <line x1="16" y1="4" x2="16" y2="4.01" />
      <line x1="20" y1="4" x2="20" y2="4.01" />
      <line x1="20" y1="8" x2="20" y2="8.01" />
      <line x1="20" y1="12" x2="20" y2="12.01" />
      <line x1="4" y1="16" x2="4" y2="16.01" />
      <line x1="20" y1="16" x2="20" y2="16.01" />
      <line x1="4" y1="20" x2="4" y2="20.01" />
      <line x1="8" y1="20" x2="8" y2="20.01" />
      <line x1="12" y1="20" x2="12" y2="20.01" />
      <line x1="16" y1="20" x2="16" y2="20.01" />
      <line x1="20" y1="20" x2="20" y2="20.01" />
    </svg>
  );
}

function SendToBackIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 24 24"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      style={{ transform: "rotate(180deg)" }}
    >
      <g strokeWidth={1.5}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 10l0 10" />
        <path d="M12 10l4 4" />
        <path d="M12 10l-4 4" />
        <path d="M4 4l16 0" />
      </g>
    </svg>
  );
}

function SendBackwardIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 24 24"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      style={{ transform: "rotate(180deg)" }}
    >
      <g strokeWidth={1.5}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5l0 14" />
        <path d="M16 9l-4 -4" />
        <path d="M8 9l4 -4" />
      </g>
    </svg>
  );
}

function BringForwardIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 24 24"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <g strokeWidth={1.5}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5l0 14" />
        <path d="M16 9l-4 -4" />
        <path d="M8 9l4 -4" />
      </g>
    </svg>
  );
}

function BringToFrontIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 24 24"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <g strokeWidth={1.5}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 10l0 10" />
        <path d="M12 10l4 4" />
        <path d="M12 10l-4 4" />
        <path d="M4 4l16 0" />
      </g>
    </svg>
  );
}

function CrossHatchPattern() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect
        x="1"
        y="1"
        width="20"
        height="20"
        rx="3"
        fill="white"
        stroke="#d4d4d4"
        strokeWidth="1"
      />
      <line x1="5" y1="1" x2="1" y2="5" stroke="#bbb" strokeWidth="0.7" />
      <line x1="9" y1="1" x2="1" y2="9" stroke="#bbb" strokeWidth="0.7" />
      <line x1="13" y1="1" x2="1" y2="13" stroke="#bbb" strokeWidth="0.7" />
      <line x1="17" y1="1" x2="1" y2="17" stroke="#bbb" strokeWidth="0.7" />
      <line x1="21" y1="1" x2="1" y2="21" stroke="#bbb" strokeWidth="0.7" />
      <line x1="21" y1="5" x2="5" y2="21" stroke="#bbb" strokeWidth="0.7" />
      <line x1="21" y1="9" x2="9" y2="21" stroke="#bbb" strokeWidth="0.7" />
      <line x1="21" y1="13" x2="13" y2="21" stroke="#bbb" strokeWidth="0.7" />
      <line x1="21" y1="17" x2="17" y2="21" stroke="#bbb" strokeWidth="0.7" />
    </svg>
  );
}

function FillHachureIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
        strokeWidth="1.25"
      />
      <mask
        id="FillHachureIcon"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x={2}
        y={2}
        width={16}
        height={16}
      >
        <path
          d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </mask>
      <g mask="url(#FillHachureIcon)">
        <path
          d="M2.258 15.156 15.156 2.258M7.324 20.222 20.222 7.325m-20.444 5.35L12.675-.222m-8.157 18.34L17.416 5.22"
          strokeWidth="1.25"
        />
      </g>
    </svg>
  );
}

function FillCrossHatchIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g clipPath="url(#a-crosshatch)">
        <path
          d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
          strokeWidth="1.25"
        />
        <mask
          id="FillCrossHatchIcon"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x={-1}
          y={-1}
          width={22}
          height={22}
        >
          <path
            d="M2.426 15.044 15.044 2.426M7.383 20 20 7.383M0 12.617 12.617 0m-7.98 17.941L17.256 5.324m-2.211 12.25L2.426 4.956M20 12.617 7.383 0m5.234 20L0 7.383m17.941 7.98L5.324 2.745"
            strokeWidth="1.25"
          />
        </mask>
        <g mask="url(#FillCrossHatchIcon)">
          <path
            d="M14.121 2H5.88A3.879 3.879 0 0 0 2 5.879v8.242A3.879 3.879 0 0 0 5.879 18h8.242A3.879 3.879 0 0 0 18 14.121V5.88A3.879 3.879 0 0 0 14.121 2Z"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="a-crosshatch">
          <path fill="#fff" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function FillSolidIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 20 20"
      className="size-[16px]"
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g clipPath="url(#a-solid)">
        <path
          d="M4.91 2.625h10.18a2.284 2.284 0 0 1 2.285 2.284v10.182a2.284 2.284 0 0 1-2.284 2.284H4.909a2.284 2.284 0 0 1-2.284-2.284V4.909a2.284 2.284 0 0 1 2.284-2.284Z"
          strokeWidth="1.25"
        />
      </g>
      <defs>
        <clipPath id="a-solid">
          <path fill="#fff" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function FontFamilyHandDrawnIcon() {
  return (
    <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="size-[16px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="m13.333 4.167 2.5 2.5M14.583 2.917a1.768 1.768 0 0 1 2.5 2.5L6.667 15.833 2.5 17.5l1.667-4.167L14.583 2.917Z" strokeWidth="1.25" />
    </svg>
  );
}

function FontFamilyNormalIcon() {
  return (
    <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="size-[16px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.833 16.667v-8.334c0-2.3 1.867-4.166 4.167-4.166s4.167 1.866 4.167 4.166v8.334M5.833 11.667h8.334" strokeWidth="1.25" />
    </svg>
  );
}

function FontFamilyCodeIcon() {
  return (
    <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="size-[16px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.667 5.833 2.5 10l4.167 4.167M13.333 5.833 17.5 10l-4.167 4.167M11.667 3.333l-3.334 13.334" strokeWidth="1.25" />
    </svg>
  );
}

function FontFamilySerifIcon() {
  return (
    <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="size-[16px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.167 16.667h3.333M12.5 16.667h3.333M8.333 3.333h3.334M10 3.333l-4.167 13.334M10 3.333l4.167 13.334M7.917 11.667h4.166" strokeWidth="1.25" />
    </svg>
  );
}

function TextAlignLeftIcon() {
  return (
    <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="size-[16px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.333 5.833h13.334M3.333 10h8.334M3.333 14.167h13.334" strokeWidth="1.25" />
    </svg>
  );
}

function TextAlignCenterIcon() {
  return (
    <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="size-[16px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.333 5.833h13.334M5.833 10h8.334M3.333 14.167h13.334" strokeWidth="1.25" />
    </svg>
  );
}

function TextAlignRightIcon() {
  return (
    <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="size-[16px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.333 5.833h13.334M8.333 10h8.334M3.333 14.167h13.334" strokeWidth="1.25" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11.5px] font-medium text-[#868e96] mb-[6px] select-none">
      {children}
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`h-[28px] w-[28px] rounded-[4px] flex items-center justify-center cursor-pointer border-none transition-colors duration-100
        ${active ? "bg-[#E0DFFE] text-[#6965db]" : "bg-[#F1F0FF] text-[#495057] hover:bg-[#E8E7FE]"}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

export default function ToolOptionsPanel() {
  const activeTool = useAppSelector(selectActiveTool);
  const toolOptions = useAppSelector(selectToolOptions);
  const dispatch = useAppDispatch();

  const isShapeTool = SHAPE_TOOLS.includes(activeTool);
  const isTextTool = activeTool === "text";

  if (!isShapeTool && !isTextTool) return null;

  function handleStrokeChange(color: string) {
    dispatch(updateToolOptions({ strokeColor: color }));
  }

  function handleBackgroundChange(color: string) {
    dispatch(updateToolOptions({ backgroundColor: color }));
  }

  function handleEdgeChange(type: "sharp" | "round") {
    dispatch(updateToolOptions({ edgeStyle: type }));
  }

  function handleStrokeWidthChange(width: number) {
    dispatch(updateToolOptions({ strokeWidth: width }));
  }

  function handleStrokeStyleChange(type: "solid" | "dashed" | "dotted") {
    dispatch(updateToolOptions({ strokeStyle: type }));
  }

  function handleRoughnessChange(value: number) {
    dispatch(updateToolOptions({ roughness: value }));
  }

  function handleFillStyleChange(style: "hachure" | "cross-hatch" | "solid") {
    dispatch(updateToolOptions({ fillStyle: style }));
  }

  function handleFontSizeChange(size: number) {
    dispatch(updateToolOptions({ fontSize: size }));
  }

  function handleFontFamilyChange(family: "hand-drawn" | "normal" | "monospace" | "comic-sans") {
    dispatch(updateToolOptions({ fontFamily: family }));
  }

  function handleTextAlignChange(align: "left" | "center" | "right") {
    dispatch(updateToolOptions({ textAlign: align }));
  }


  return (
    <div
      className="absolute top-[100px] left-[12px] z-30 bg-white border border-[#e2e2e2] rounded-lg p-[14px] flex flex-col gap-[14px] select-none"
      style={{
        width: 196,
        boxShadow:
          "0px 0px .93px 0px rgba(0,0,0,.17), 0px 0px 3.13px 0px rgba(0,0,0,.08), 0px 7px 14px 0px rgba(0,0,0,.05)",
      }}
    >
      <div>
        <SectionLabel>Stroke</SectionLabel>
        <div className="flex items-center gap-[6px]">
          {STROKE_COLORS.map(({ color, label }) => (
            <button
              key={color}
              title={label}
              onClick={() => handleStrokeChange(color)}
              type="button"
              className={`h-[22px] w-[22px] rounded-[4px] cursor-pointer transition-all duration-100
                ${toolOptions.strokeColor === color ? "ring-[1.5px] ring-[#6965db] ring-offset-1" : "hover:scale-105"}`}
              style={{
                backgroundColor: color,
                borderColor: color === "#1e1e1e" ? "#1e1e1e" : "#d4d4d4",
              }}
            />
          ))}
          <div className="h-5 w-px bg-[#F1F0FE]" />
          <div className="ml-auto">
            <div
              className="h-[22px] w-[22px] rounded-[4px] border border-[#d4d4d4] cursor-pointer"
              style={{ backgroundColor: toolOptions.strokeColor }}
              title="Pick color"
            />
          </div>
        </div>
      </div>

      {isShapeTool && (
        <div>
          <SectionLabel>Background</SectionLabel>
          <div className="flex items-center gap-[6px]">
            {BG_COLORS.map(({ color, label }) => (
              <button
                key={color}
                title={label}
                type="button"
                onClick={() => handleBackgroundChange(color)}
                className={`h-[22px] w-[22px] rounded-[4px] cursor-pointer transition-all duration-100
                  ${toolOptions.backgroundColor === color ? "ring-[1.5px] ring-[#6965db] ring-offset-1" : "hover:scale-105"}`}
                style={{
                  backgroundColor: color === "transparent" ? "white" : color,
                  borderColor: "#d4d4d4",
                }}
              />
            ))}
            <div className="h-5 w-px bg-[#F1F0FE]" />
            <div className="ml-auto cursor-pointer">
              <CrossHatchPattern />
            </div>
          </div>
        </div>
      )}

      {isShapeTool && toolOptions.backgroundColor !== "transparent" && (
        <div>
          <SectionLabel>Fill</SectionLabel>
          <div className="flex items-center gap-[6px]">
            <OptionButton
              active={toolOptions.fillStyle === "hachure"}
              onClick={() => handleFillStyleChange("hachure")}
              title="Hachure"
            >
              <FillHachureIcon />
            </OptionButton>
            <OptionButton
              active={toolOptions.fillStyle === "cross-hatch"}
              onClick={() => handleFillStyleChange("cross-hatch")}
              title="Cross-hatch"
            >
              <FillCrossHatchIcon />
            </OptionButton>
            <OptionButton
              active={toolOptions.fillStyle === "solid"}
              onClick={() => handleFillStyleChange("solid")}
              title="Solid"
            >
              <FillSolidIcon />
            </OptionButton>
          </div>
        </div>
      )}

      {isShapeTool && (
        <div>
          <SectionLabel>Stroke width</SectionLabel>
        <div className="flex items-center gap-[6px]">
          <OptionButton
            active={toolOptions.strokeWidth <= 1}
            onClick={() => handleStrokeWidthChange(1)}
            title="Thin"
          >
            <StrokeWidthBaseIcon />
          </OptionButton>
          <OptionButton
            active={toolOptions.strokeWidth === 2}
            onClick={() => handleStrokeWidthChange(2)}
            title="Bold"
          >
            <StrokeWidthBoldIcon />
          </OptionButton>
          <OptionButton
            onClick={() => handleStrokeWidthChange(3)}
            active={toolOptions.strokeWidth >= 3}
            title="Extra bold"
          >
            <StrokeWidthExtraBoldIcon />
          </OptionButton>
        </div>
        </div>
      )}

      {isShapeTool && (
        <div>
          <SectionLabel>Stroke style</SectionLabel>
        <div className="flex items-center gap-[6px]">
          <OptionButton
            active={toolOptions.strokeStyle === "solid"}
            onClick={() => handleStrokeStyleChange("solid")}
            title="Solid"
          >
            <StrokeStyleSolidIcon />
          </OptionButton>
          <OptionButton
            onClick={() => handleStrokeStyleChange("dashed")}
            active={toolOptions.strokeStyle === "dashed"}
            title="Dashed"
          >
            <StrokeStyleDashedIcon />
          </OptionButton>
          <OptionButton
            active={toolOptions.strokeStyle === "dotted"}
            onClick={() => handleStrokeStyleChange("dotted")}
            title="Dotted"
          >
            <StrokeStyleDottedIcon />
          </OptionButton>
        </div>
        </div>
      )}

      {isShapeTool && (
        <div>
          <SectionLabel>Sloppiness</SectionLabel>
        <div className="flex items-center gap-[6px]">
          <OptionButton
            active={toolOptions.roughness === 0}
            onClick={() => handleRoughnessChange(0)}
            title="Architect"
          >
            <SloppinessArchitectIcon />
          </OptionButton>
          <OptionButton
            active={toolOptions.roughness === 1}
            onClick={() => handleRoughnessChange(1)}
            title="Artist"
          >
            <SloppinessArtistIcon />
          </OptionButton>
          <OptionButton
            active={toolOptions.roughness === 2}
            onClick={() => handleRoughnessChange(2)}
            title="Cartoonist"
          >
            <SloppinessCartoonistIcon />
          </OptionButton>
        </div>
        </div>
      )}

      {isShapeTool && (
        <div>
          <SectionLabel>Edges</SectionLabel>
        <div className="flex items-center gap-[6px]">
          <OptionButton
            active={toolOptions.edgeStyle === "sharp"}
            onClick={() => handleEdgeChange("sharp")}
            title="Sharp"
          >
            <EdgeSharpIcon />
          </OptionButton>
          <OptionButton
            active={toolOptions.edgeStyle === "round"}
            onClick={() => handleEdgeChange("round")}
            title="Round"
          >
            <EdgeRoundIcon />
          </OptionButton>
        </div>
        </div>
      )}

      {isTextTool && (
        <div>
          <SectionLabel>Font family</SectionLabel>
          <div className="flex items-center gap-[6px]">
            <OptionButton
              active={toolOptions.fontFamily === "hand-drawn"}
              onClick={() => handleFontFamilyChange("hand-drawn")}
              title="Hand-drawn"
            >
              <FontFamilyHandDrawnIcon />
            </OptionButton>
            <OptionButton
              active={toolOptions.fontFamily === "normal"}
              onClick={() => handleFontFamilyChange("normal")}
              title="Normal"
            >
              <FontFamilyNormalIcon />
            </OptionButton>
            <OptionButton
              active={toolOptions.fontFamily === "monospace"}
              onClick={() => handleFontFamilyChange("monospace")}
              title="Code"
            >
              <FontFamilyCodeIcon />
            </OptionButton>
            <div className="h-5 w-px bg-[#F1F0FE]" />
            <OptionButton
              active={toolOptions.fontFamily === "comic-sans"}
              onClick={() => handleFontFamilyChange("comic-sans")}
              title="Comic Sans"
            >
              <FontFamilySerifIcon />
            </OptionButton>
          </div>
        </div>
      )}

      {isTextTool && (
        <div>
          <SectionLabel>Font size</SectionLabel>
          <div className="flex items-center gap-[6px]">
            <OptionButton
              active={toolOptions.fontSize === 16}
              onClick={() => handleFontSizeChange(16)}
              title="Small"
            >
              S
            </OptionButton>
            <OptionButton
              active={toolOptions.fontSize === 20}
              onClick={() => handleFontSizeChange(20)}
              title="Medium"
            >
              M
            </OptionButton>
            <OptionButton
              active={toolOptions.fontSize === 28}
              onClick={() => handleFontSizeChange(28)}
              title="Large"
            >
              L
            </OptionButton>
            <OptionButton
              active={toolOptions.fontSize === 36}
              onClick={() => handleFontSizeChange(36)}
              title="Extra Large"
            >
              XL
            </OptionButton>
          </div>
        </div>
      )}

      {isTextTool && (
        <div>
          <SectionLabel>Text align</SectionLabel>
          <div className="flex items-center gap-[6px]">
            <OptionButton
              active={toolOptions.textAlign === "left"}
              onClick={() => handleTextAlignChange("left")}
              title="Left"
            >
              <TextAlignLeftIcon />
            </OptionButton>
            <OptionButton
              active={toolOptions.textAlign === "center"}
              onClick={() => handleTextAlignChange("center")}
              title="Center"
            >
              <TextAlignCenterIcon />
            </OptionButton>
            <OptionButton
              active={toolOptions.textAlign === "right"}
              onClick={() => handleTextAlignChange("right")}
              title="Right"
            >
              <TextAlignRightIcon />
            </OptionButton>
          </div>
        </div>
      )}

      <div>
        <SectionLabel>Opacity</SectionLabel>
        <div className="flex flex-col gap-[4px]">
          <input
            type="range"
            min={0}
            max={100}
            value={toolOptions.opacity}
            readOnly
            className="w-full h-[6px] accent-[#6965db] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#868e96] select-none">
            <span>0</span>
            <span>{toolOptions.opacity}</span>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Layers</SectionLabel>
        <div className="flex items-center gap-[6px]">
          <OptionButton title="Send to back">
            <SendToBackIcon />
          </OptionButton>
          <OptionButton title="Send backward">
            <SendBackwardIcon />
          </OptionButton>
          <OptionButton title="Bring forward">
            <BringForwardIcon />
          </OptionButton>
          <OptionButton title="Bring to front">
            <BringToFrontIcon />
          </OptionButton>
        </div>
      </div>
    </div>
  );
}
