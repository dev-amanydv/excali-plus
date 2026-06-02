import {
  ArrowHead,
  EdgeStyle,
  FillStyle,
  FontFamily,
  StrokeStyle,
  TextAlign,
  ToolType,
} from "@/types/canvas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToolOptions {
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  roughness: number;
  edgeStyle: EdgeStyle;
  fontSize: number;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  startArrowHead: ArrowHead;
  endArrorHead: ArrowHead;
}

interface ToolState {
  activeTool: ToolType;
  toolOptions: ToolOptions;
  isToolLocked: boolean;
  lastUsedTool: ToolType;
  cursorPosition: { x: number; y: number };
}

const defaultOptions: ToolOptions = {
  strokeColor: "#1e1e1e",
  backgroundColor: "transparent",
  fillStyle: "solid",
  strokeStyle: "solid",
  strokeWidth: 2,
  opacity: 100,
  roughness: 1,
  edgeStyle: "round",
  fontSize: 20,
  fontFamily: "normal",
  textAlign: "left",
  startArrowHead: "none",
  endArrorHead: "arrow",
};

const initialState: ToolState = {
  activeTool: "select",
  toolOptions: defaultOptions,
  isToolLocked: false,
  lastUsedTool: "rectangle",
  cursorPosition: { x: 0, y: 0 },
};

const toolSlice = createSlice({
  name: "tool",
  initialState,
  reducers: {
    setActiveTool(state, action: PayloadAction<ToolType>) {
      state.lastUsedTool = state.activeTool;
      state.activeTool = action.payload;
    },
    revertToSelect(state) {
      if (!state.isToolLocked) {
        state.activeTool = "select";
      }
    },
    toogleToolLock(state) {
      state.isToolLocked = !state.isToolLocked;
    },
    updateToolOptions(state, action: PayloadAction<Partial<ToolOptions>>) {
      state.toolOptions = { ...state.toolOptions, ...action.payload };
    },
    updateCursorPosition(
      state,
      action: PayloadAction<{ x: number; y: number }>,
    ) {
      state.cursorPosition = action.payload;
    },
    resetToolOptions(state) {
      state.toolOptions = defaultOptions;
    },
  },
});

export const {
  setActiveTool,
  revertToSelect,
  toogleToolLock,
  updateToolOptions,
  updateCursorPosition,
  resetToolOptions,
} = toolSlice.actions;

export default toolSlice.reducer;
