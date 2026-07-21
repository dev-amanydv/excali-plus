import {
  deleteElement,
  duplicateElements,
  updateElement,
} from "@/store/slices/canvasSlice";
import { pushToHistory, redo, undo } from "@/store/slices/historySlice";
import {
  clearSelection,
  selectAll,
  selectElements,
  setBoundingBox,
} from "@/store/slices/selectionSlice";
import { setActiveTool, toogleToolLock } from "@/store/slices/toolSlice";
import { AppDispatch, store, useAppDispatch } from "@/store/store";
import { ToolType } from "@/types/canvas";
import { broadcastDelete, broadcastElement } from "@/utils/broadcast";
import { calculateCombinedBoundingBox } from "@/utils/hitTest";
import { useEffect } from "react";

const TOOL_HOTKEYS: Record<string, ToolType> = {
  v: "select",
  "1": "select",
  h: "hand",
  r: "rectangle",
  "2": "rectangle",
  d: "diamond",
  "3": "diamond",
  o: "circle",
  "4": "circle",
  a: "arrow",
  "5": "arrow",
  l: "line",
  "6": "line",
  p: "pencil",
  "7": "pencil",
  t: "text",
  "8": "text",
  e: "eraser",
  "0": "eraser",
};

function getVisibleElements() {
  return store.getState().canvas.elements.filter((el) => !el.isDeleted);
}

function deleteSelection(
  dispatch: AppDispatch,
  socket?: WebSocket | null,
  roomId?: string | null,
) {
  const selectedIds = store.getState().selection.selectedIds;
  if (selectedIds.length === 0) return;
  const elements = getVisibleElements();

  dispatch(pushToHistory({ elements, actionType: "delete" }));

  const toDelete = new Set(selectedIds);
  elements.forEach((el) => {
    if (!toDelete.has(el.id)) return;
    if (
      (el.type === "rectangle" ||
        el.type === "circle" ||
        el.type === "diamond") &&
      el.boundTextElementId
    ) {
      toDelete.add(el.boundTextElementId);
    }
    if (el.type === "text" && el.containerId && !toDelete.has(el.containerId)) {
      dispatch(
        updateElement({
          id: el.containerId,
          updates: { boundTextElementId: null },
        }),
      );
    }
  });

  dispatch(deleteElement([...toDelete]));
  dispatch(clearSelection());
  broadcastDelete(socket, roomId, [...toDelete]);
}

function duplicateSelection(
  dispatch: AppDispatch,
  socket?: WebSocket | null,
  roomId?: string | null,
) {
  const selectedIds = store.getState().selection.selectedIds;
  if (selectedIds.length === 0) return;
  const elements = getVisibleElements();

  dispatch(pushToHistory({ elements, actionType: "duplicate" }));

  const toDuplicate = new Set(selectedIds);
  elements.forEach((el) => {
    if (
      toDuplicate.has(el.id) &&
      (el.type === "rectangle" ||
        el.type === "circle" ||
        el.type === "diamond") &&
      el.boundTextElementId
    ) {
      toDuplicate.add(el.boundTextElementId);
    }
  });

  const countBefore = store.getState().canvas.elements.length;
  dispatch(duplicateElements([...toDuplicate]));

  const copies = store.getState().canvas.elements.slice(countBefore);
  if (copies.length === 0) return;

  copies.forEach((el) => broadcastElement(socket, roomId, el));

  const copyIds = copies
    .filter((el) => !(el.type === "text" && el.containerId))
    .map((el) => el.id);
  dispatch(selectElements(copyIds));
  dispatch(setBoundingBox(calculateCombinedBoundingBox(copies)));
}

export function useKeyboardShortcuts(
  socket?: WebSocket | null,
  roomId?: string | null,
  readOnly?: boolean,
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (readOnly) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "INPUT" ||
        target.isContentEditable
      ) {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "z") {
        e.preventDefault();
        const elements = store.getState().canvas.elements;
        if (e.shiftKey) {
          dispatch(redo(elements));
        } else {
          dispatch(undo(elements));
        }
        return;
      }

      if (mod && key === "y") {
        e.preventDefault();
        dispatch(redo(store.getState().canvas.elements));
        return;
      }

      if (mod && key === "a") {
        e.preventDefault();
        const elements = getVisibleElements();
        if (elements.length > 0) {
          dispatch(selectAll(elements.map((el) => el.id)));
          dispatch(setBoundingBox(calculateCombinedBoundingBox(elements)));
        }
        return;
      }

      if (mod && key === "d") {
        e.preventDefault();
        duplicateSelection(dispatch, socket, roomId);
        return;
      }

      if (mod) return;

      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        deleteSelection(dispatch, socket, roomId);
        return;
      }

      if (key === "escape") {
        dispatch(clearSelection());
        return;
      }

      if (key === "q") {
        dispatch(toogleToolLock());
        return;
      }

      const tool = TOOL_HOTKEYS[key];
      if (tool) {
        dispatch(setActiveTool(tool));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, socket, roomId, readOnly]);
}
