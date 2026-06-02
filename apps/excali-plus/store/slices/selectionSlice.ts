import { BoundingBox } from "@/types/canvas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectionState {
    selectedIds: string[];
    boundingBox: BoundingBox | null,
    isSelecting: boolean,
    marquee: {
        x: number,
        y: number,
        width: number,
        height: number,
    } | null,
    editingElementId: string | null,
    hoveredElementId: string | null,
}

const initialState: SelectionState = {
    selectedIds: [],
    boundingBox: null,
    isSelecting: false,
    marquee: null,
    editingElementId: null,
    hoveredElementId: null
}

const selectionSlice = createSlice({
    name: "selection",
    initialState,
    reducers: {
        selectElement(state, action: PayloadAction<string>){
            state.selectedIds = [action.payload]
        },
        selectElements(state, action: PayloadAction<string[]>){
            state.selectedIds = action.payload
        },
        addToSelection(state, action: PayloadAction<string>){
            if (!state.selectedIds.includes(action.payload)){
                state.selectedIds.push(action.payload)
            }
        },
        removeFromSelection(state, action: PayloadAction<string>){
            state.selectedIds = state.selectedIds.filter((id) => id !== action.payload)
        },
        toggleSelection(state, action: PayloadAction<string>){
            const id = action.payload;
            if (state.selectedIds.includes(id)){
                state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
            } else {
                state.selectedIds.push(id)
            }
        },
        clearSelection(state){
            state.selectedIds = [];
            state.boundingBox = null;
            state.marquee = null
        },
        selectAll(state, action: PayloadAction<string[]>){
            state.selectedIds = action.payload
        },
        setBoundingBox(state, action: PayloadAction<BoundingBox | null>){
            state.boundingBox = action.payload
        },
        setMarquee(state, action: PayloadAction<{x: number, y: number, width: number, height: number} | null>){
            state.marquee = action.payload;
            state.isSelecting = action.payload !== null
        },
        setEditingElement(state, action: PayloadAction<string | null>){
            state.editingElementId = action.payload
        },
        setHoveredElement(state, action: PayloadAction<string | null>){
            state.hoveredElementId = action.payload
        }
    }
});

export const {
    selectElement, selectElements, addToSelection, removeFromSelection, toggleSelection, clearSelection, selectAll, setBoundingBox, setMarquee, setEditingElement, setHoveredElement
} = selectionSlice.actions;

export default selectionSlice.reducer;