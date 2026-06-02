import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";



interface UIState {
    zoom: number,
    scrollX: number,
    scrollY: number,
    showGrid: boolean,
    snapToGrid: boolean,
    gridSize: number,
    showStats: boolean,
    theme: "dark" | "light",
    isExportDialogOpen: boolean,
    isShortcutDialogOpen: boolean,
    isColorPickerOpen: boolean,
    sidebarWidth: number,
    isMobileMenuOpen: boolean,
}

const initialState: UIState = {
    zoom: 1,
    scrollX: 0,
    scrollY: 0,
    showGrid: false,
    snapToGrid: false,
    gridSize: 20,
    showStats: false,
    theme: "light",
    isExportDialogOpen: false,
    isShortcutDialogOpen: false,
    isColorPickerOpen: false,
    sidebarWidth: 260,
    isMobileMenuOpen: false,
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5.0;

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setZoom(state, action: PayloadAction<number>){
            state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, action.payload))
        },
        zoomAtPoint(state, action: PayloadAction<{delta: number, x: number, y: number}>){
            const { delta, x, y } = action.payload;
            const prevZoom = state.zoom;
            const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, delta + prevZoom));

            state.scrollX = x - (x - state.scrollX) * (newZoom / prevZoom);
            state.scrollY = y - (y - state.scrollY) * (newZoom / prevZoom);
            state.zoom = newZoom;
        },
        resetZoom(state){
            state.zoom = 1;
        },
        setScroll(state, action: PayloadAction<{ x: number, y: number}>){
            state.scrollX = action.payload.x;
            state.scrollY = action.payload.y;
        },
        panBy(state, action: PayloadAction<{dx: number, dy: number}>){
            state.scrollX += action.payload.dx;
            state.scrollY += action.payload.dy
            //state.scrollX = state.scrollX + action.payload.dx
            //state.scrollY = state.scrollY + action.payload.dy
        },
        resetView(state){
            state.zoom = 1;
            state.scrollX = 0;
            state.scrollY = 0;
        },
        toggleGrid(state){
            state.showGrid = !state.showGrid
        },
        toogleSnapToGrid(state){
            state.snapToGrid = !state.snapToGrid
        },
        setTheme(state, action: PayloadAction<"light" | "dark">){
            state.theme = action.payload
        },
        setExportDialogOpen(state, action: PayloadAction<boolean>){
            state.isExportDialogOpen = action.payload
        },
        setShortcutDialogOpen(state, action: PayloadAction<boolean>) {
            state.isShortcutDialogOpen = action.payload;
        },
    }
});

export const {
    setZoom, zoomAtPoint, resetZoom, setScroll, panBy, resetView, toggleGrid, toogleSnapToGrid, setTheme, setExportDialogOpen, setShortcutDialogOpen
} = uiSlice.actions;

export default uiSlice.reducer;