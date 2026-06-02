import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import canvasReducer from "./slices/canvasSlice";
import toolReducer from "./slices/toolSlice";
import historyReducer from "./slices/historySlice";
import selectionReducer from "./slices/selectionSlice";
import uiReducer from "./slices/uiSlice";
import userReducer from "./slices/userSlice"
import { historyMiddleware } from "./historyMiddleware";

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    tool: toolReducer,
    history: historyReducer,
    selection: selectionReducer,
    ui: uiReducer,
    user: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["canvas.elements", "history.undoStack"],
      },
    }).concat(historyMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;