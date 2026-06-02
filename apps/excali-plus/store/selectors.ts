import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const selectAllElements = (state: RootState) => state.canvas.elements;

export const selectVisibleElements = createSelector(
  selectAllElements,
  (elements) => elements.filter((el) => !el.isDeleted),
);

export const selectElementById = (id: string) => createSelector(selectAllElements, (elements) => elements.find((el) => el.id === id))

export const selectSelectedIds = (state: RootState) => state.selection.selectedIds;

export const selectSelectedElements = createSelector(
    selectVisibleElements,
    selectSelectedIds,
    (elements, ids) => {
        const idSet = new Set(ids);
        return elements.filter((el) => idSet.has(el.id))
    }
)

export const selectHasSelection = createSelector(selectSelectedIds, (ids) => ids.length > 0);

export const selectIsMultiSelect = createSelector(selectSelectedIds, (ids) => ids.length > 1)

export const selectActiveTool = (state: RootState) => state.tool.activeTool;

export const selectToolOptions = (state: RootState) => state.tool.toolOptions;

export const selectZoom = (state: RootState) => state.ui.zoom;

export const selectScroll = (state: RootState) => ({
    x: state.ui.scrollX,
    y: state.ui.scrollY
});

export const selectCanUndo = (state: RootState) => state.history.undoStack.length > 0;

export const selectCanRedo = (state: RootState) => state.history.redoStack.length > 0;



