import { BinaryFile, ElementBinding, ExcalidrawElement, Point } from "@/types/canvas";
import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

interface CanvasState {
  elements: ExcalidrawElement[];
  files: Record<string, BinaryFile>;
}

const initialState: CanvasState = {
  elements: [],
  files: {},
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    addElement(state, action: PayloadAction<ExcalidrawElement>) {
      state.elements.push(action.payload);
    },
    updateElement(
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<ExcalidrawElement>;
      }>,
    ) {
      const { id, updates } = action.payload;
      const index = state.elements.findIndex((el) => el.id === id);

      if (index === -1) return;

      state.elements[index] = {
        ...state.elements[index],
        ...updates,
        version: state.elements[index].version + 1,
        updatedAt: Date.now(),
      } as ExcalidrawElement;
    },
    deleteElement(state, action: PayloadAction<string[]>) {
      const ids = new Set(action.payload);
      state.elements.forEach((el) => {
        if (ids.has(el.id)) {
          el.isDeleted = true;
        }
      });
    },
    duplicateElements(state, action: PayloadAction<string[]>) {
      const ids = new Set(action.payload);
      const toDuplicate = state.elements.filter((el) => {
        ids.has(el.id) && !el.isDeleted;
      });
      const OFFSET = 10;
      const duplicates = toDuplicate.map((el) => ({
        ...el,
        id: nanoid(),
        x: el.x + OFFSET,
        y: el.x + OFFSET,
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      state.elements.push(...duplicates);
    },
    moveElements(
      state,
      action: PayloadAction<{ ids: string[]; dx: number; dy: number }>,
    ) {
      const { ids, dx, dy } = action.payload;
      const idSet = new Set(ids);
      state.elements.forEach((el) => {
        if (idSet.has(el.id)) {
          el.x += dx;
          el.y += dy;
          el.version += 1;
          el.updatedAt = Date.now();
        }
      });
    },
    resizeElement(state, action: PayloadAction<{id: string, x: number, y: number, height: number, width: number}>){
        const { id, x, y, width, height } = action.payload;
        const index = state.elements.findIndex((el) => el.id === id);

        if (index === -1) return;

        state.elements[index] = {
            ...state.elements[index],
            x: x,
            y: y,
            height: height,
            width: width,
            version: state.elements[index].version + 1,
            updatedAt: Date.now()
        }
    },
    rotateElement(state, action: PayloadAction<{ids: string[], angle: number}>){
        const { ids, angle } = action.payload;
        const idsSet = new Set(ids);
        
        state.elements.forEach((el) => {
            if (idsSet.has(el.id)){
                el.angle = angle,
                el.version += 1,
                el.updatedAt = Date.now()
            }
        })
    },
    bringToFront(state, action: PayloadAction<string[]>){
        const ids = new Set(action.payload);
        const [targets, rest] = partion(state.elements, (el) => ids.has(el.id));
        state.elements = [...rest, ...targets]
    },
    sendToBack(state, action: PayloadAction<string[]>){
        const ids = new Set(action.payload);
        const [targets, rest] = partion(state.elements, (el) => ids.has(el.id))
        state.elements = [...targets, ...rest]
    },
    bringForward(state, action: PayloadAction<string[]>){
      const ids = new Set(action.payload);
      ids.forEach((id) => {
        const i = state.elements.findIndex((el) => el.id === id);
        if (i < state.elements.length - 1){
          [state.elements[i], state.elements[i+1]] = [state.elements[i+1], state.elements[i]]
        }
      })
    },
    bringBackward(state, action: PayloadAction<string[]>){
      const ids = new Set(action.payload);
      ids.forEach((id) => {
        const i = state.elements.findIndex((el) => el.id === id);
        if (i > 0){
          [state.elements[i], state.elements[i-1]] = [state.elements[i-1], state.elements[i]]
        }
      })
    },
    appendPointToElement(state, action: PayloadAction<{id: string, point: Point}>){
      const { id, point } = action.payload;
      const element = state.elements.find((el) => el.id === id);
      if (element && (element.type === 'pencil' || element.type === "arrow" || element.type === "line")){
          element.points.push(point);
          element.version +=1;
          element.updatedAt = Date.now()
      }
    },
    updateTextContent(state, action: PayloadAction<{id: string, text: string}>){
      const { id, text } = action.payload;
      const element = state.elements.find((el) => el.id === id && el.type === "text");
      if (element && element.type === "text"){
        element.text = text;
        element.version += 1;
        element.updatedAt = Date.now()
      }
    },
    setTextEditing(state, action: PayloadAction<{id: string, isEditing: boolean}>){
      const { id, isEditing } = action.payload;
      const element = state.elements.find((el) => el.id === id && el.type === "text");
      if (element && element.type === "text"){
        element.isEditing = isEditing
      }
    },
    updateArrowBinding(state, action: PayloadAction<{id: string, startBinding: ElementBinding | null, endBinding: ElementBinding | null}>){
      const { id, startBinding, endBinding } = action.payload;
      const element = state.elements.find((e) => e.id === id && e.type === "arrow");
      if (element && element.type === "arrow"){
        if (element.startBinding !== undefined) element.startBinding = startBinding;
        if (element.endBinding !== undefined) element.endBinding = endBinding;
      }
    },
    addFile(state, action: PayloadAction<BinaryFile>){
      state.files[action.payload.id] = action.payload;
    },
    clearCanvas(state) {
      state.elements = [],
      state.files = {}
    },
    loadElements(state, action: PayloadAction<{elements: ExcalidrawElement[], files: Record<string, BinaryFile>}>){
      state.elements = action.payload.elements;
      state.files = action.payload.files ?? {};
    }
  },
});


function partion<T>(arr: T[], predicate: (item: T) => boolean ): [T[], T[]]{
    const truthy: T[] = []
    const falsy: T[] = []
    arr.forEach((item) => (predicate(item) ? truthy : falsy).push(item));
    return [truthy, falsy]
}

export const {
  addElement, updateElement, deleteElement, duplicateElements, updateTextContent, moveElements, resizeElement, rotateElement, sendToBack, bringToFront, bringBackward, bringForward, appendPointToElement, updateArrowBinding, addFile, clearCanvas, loadElements, setTextEditing
} = canvasSlice.actions;

export default canvasSlice.reducer;