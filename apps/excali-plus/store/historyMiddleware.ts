import type { Middleware } from "@reduxjs/toolkit";
import { undo, redo } from "./slices/historySlice";
import { loadElements } from "./slices/canvasSlice";
import { clearSelection } from "./slices/selectionSlice";
import type { ExcalidrawElement } from "@/types/canvas";

interface HistoryEntry {
  elements: ExcalidrawElement[];
}

interface StateWithHistory {
  history: { undoStack: HistoryEntry[]; redoStack: HistoryEntry[] };
}

export const historyMiddleware: Middleware = (store) => (next) => (action) => {
  if (undo.match(action)) {
    const state = store.getState() as StateWithHistory;
    const undoStack = state.history.undoStack;

    if (undoStack.length === 0) return;

    const prevEntry = undoStack[undoStack.length - 1];
    next(action);

    store.dispatch(loadElements({ elements: prevEntry.elements, files: {} }));
    store.dispatch(clearSelection());
    return;
  }

  if (redo.match(action)) {
    const state = store.getState() as StateWithHistory;
    const redoStack = state.history.redoStack;

    if (redoStack.length === 0) return;

    const nextEntry = redoStack[redoStack.length - 1];
    next(action);

    store.dispatch(loadElements({ elements: nextEntry.elements, files: {} }));
    store.dispatch(clearSelection());
    return;
  }

  return next(action);
};
