import type { Middleware } from "@reduxjs/toolkit";
import { undo, redo } from "./slices/historySlice";
import { loadElements } from "./slices/canvasSlice";


export const historyMiddleware: Middleware = (store) => (next) => (action) => {
  if (undo.match(action)) {
    const state = store.getState() as {
      history: { undoStack: any[]; redoStack: any[] };
      [key: string]: any;
    };
    const undoStack = state.history.undoStack;

    if (undoStack.length === 0) return;

    const prevEntry = undoStack[undoStack.length - 1];
    next(action);

    store.dispatch(loadElements({ elements: prevEntry.elements, files: {} }));
    return;
  }

  if (redo.match(action)) {
    const state = store.getState() as {
      history: { undoStack: any[]; redoStack: any[] };
      [key: string]: any;
    };
    const redoStack = state.history.redoStack;

    if (redoStack.length === 0) return;

    const nextEntry = redoStack[redoStack.length - 1];
    next(action);
    store.dispatch(loadElements({ elements: nextEntry.elements, files: {} }));
    return;
  }

  return next(action);
};
