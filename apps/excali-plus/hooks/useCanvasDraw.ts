import {
  addElement,
  deleteElement,
  moveElements,
  resizeElement,
  updateElement,
} from "@/store/slices/canvasSlice";
import { pushToHistory } from "@/store/slices/historySlice";
import {
  addToSelection,
  clearSelection,
  selectElement,
  selectElements,
  setBoundingBox,
  setEditingElement,
  setMarquee,
} from "@/store/slices/selectionSlice";
import { revertToSelect, type ToolOptions } from "@/store/slices/toolSlice";
import { panBy, zoomAtPoint } from "@/store/slices/uiSlice";
import { store, useAppDispatch } from "@/store/store";
import {
  CircleElement,
  DiamondElement,
  ExcalidrawElement,
  PencilElement,
  Point,
  RectangleElement,
  TextElement,
} from "@/types/canvas";
import {
  createCircleElement,
  createDiamondElement,
  createLineElement,
  createPencilElement,
  createRectangleElement,
  createArrowElement,
  createTextElement,
  createBoundTextElement,
} from "@/utils/elementFactory";
import {
  broadcastCursor,
  broadcastDelete,
  broadcastDraw,
  broadcastElement,
} from "@/utils/broadcast";
import { CURSOR_MAP } from "@/utils/cursors";
import {
  calculateCombinedBoundingBox,
  findElementAtPoint,
} from "@/utils/hitTest";
import {
  RESIZE_CURSORS,
  ResizeHandle,
  getHandleAtPoint,
  resizeBox,
} from "@/utils/resize";
import { renderCanvas, renderOverlay, getRotationHandlePosition } from "@/utils/renderCanvas";
import { mountTextArea } from "@/utils/textAreaManager";
import {
  BOUND_TEXT_PADDING,
  getFontString,
  measureLines,
  wrapText,
} from "@/utils/textMeasure";
import { getWheelZoomFactor, screenToWorld } from "@/utils/viewport";
import { useEffect } from "react";

function unrotatePoint(
  px: number,
  py: number,
  box: { x: number; y: number; width: number; height: number },
  angle: number,
) {
  if (!angle) return { x: px, y: py };
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const dx = px - cx;
  const dy = py - cy;
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

function normalizeElementSize(el: ExcalidrawElement) {
  if (el.width >= 0 && el.height >= 0) return null;

  const x = el.width < 0 ? el.x + el.width : el.x;
  const y = el.height < 0 ? el.y + el.height : el.y;
  const updates: {
    x: number;
    y: number;
    width: number;
    height: number;
    points?: Point[];
  } = {
    x,
    y,
    width: Math.abs(el.width),
    height: Math.abs(el.height),
  };

  if (el.type === "line" || el.type === "arrow" || el.type === "pencil") {
    updates.points = el.points.map((p) => ({
      x: p.x + el.x - x,
      y: p.y + el.y - y,
    }));
  }

  return updates;
}

const shapeCreators: Record<
  string,
  (x: number, y: number, options: ToolOptions) => ExcalidrawElement
> = {
  rectangle: createRectangleElement,
  circle: createCircleElement,
  diamond: createDiamondElement,
  line: createLineElement,
  arrow: createArrowElement,
  pencil: createPencilElement,
};

export function useCanvasDraw(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  socket?: WebSocket | null,
  roomId?: string | null,
  readOnly?: boolean,
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafPending = false;
    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let activeId: string | null = null;
    let isDraggingSelection = false;
    let dragIds: string[] = [];
    let lastDragPoint = { x: 0, y: 0 };
    let isResizing = false;
    let resizeHandle: ResizeHandle | null = null;
    let resizeStartElement: ExcalidrawElement | null = null;
    let isMarqueeSelecting = false;
    let isErasing = false;
    const pendingEraseIds = new Set<string>();
    let gestureStartElements: ExcalidrawElement[] | null = null;
    let gestureMoved = false;
    let isRotating = false;
    let rotationCenter = { x: 0, y: 0 };
    let isPanning = false;
    let lastPanPoint = { x: 0, y: 0 };
    let spacePressed = false;
    const activePointers = new Map<number, { x: number; y: number }>();
    let isPinching = false;
    let lastTouchCenter = { x: 0, y: 0 };
    let lastTouchDistance = 0;
    let lastTap = { time: 0, x: 0, y: 0 };
    let lastDrawSent = 0;
    let lastCursorSent = 0;

    const broadcastActiveDraw = (type: "onMouseDown" | "onMouseMove") => {
      if (!socket || !roomId || !activeId) return;
      const el = store
        .getState()
        .canvas.elements.find((item) => item.id === activeId);
      if (el) broadcastDraw(socket, roomId, type, el);
    };

    const maybeBroadcastCursor = (x: number, y: number) => {
      if (!socket || !roomId) return;
      const now = performance.now();
      if (now - lastCursorSent < 40) return;
      lastCursorSent = now;
      broadcastCursor(socket, roomId, {
        x,
        y,
        name: store.getState().user.name ?? "Anonymous",
      });
    };

    const getViewport = () => {
      const { zoom, scrollX, scrollY } = store.getState().ui;
      return { zoom, scrollX, scrollY };
    };

    const getElements = () =>
      store.getState().canvas.elements.filter((el) => !el.isDeleted);

    const draw = () => {
      rafPending = false;
      const state = store.getState();
      const viewport = {
        zoom: state.ui.zoom,
        scrollX: state.ui.scrollX,
        scrollY: state.ui.scrollY,
      };
      const elements = state.canvas.elements.filter((el) => !el.isDeleted);
      renderCanvas(ctx, canvas, elements, viewport, pendingEraseIds);

      const { boundingBox, selectedIds, marquee } = state.selection;
      const selectedAngle =
        selectedIds.length === 1
          ? elements.find((el) => el.id === selectedIds[0])?.angle ?? 0
          : 0;
      renderOverlay(ctx, canvas, viewport, {
        boundingBox,
        selectedIds,
        selectedAngle,
        marquee,
      });
    };

    const scheduleRender = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(draw);
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      scheduleRender();
    };
    resizeCanvas();
    document.fonts.ready.then(scheduleRender);

    let savedElements = store.getState().canvas.elements;
    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    const saveNow = () => {
      savedElements = store.getState().canvas.elements;
      localStorage.setItem("canvas", JSON.stringify(savedElements));
    };

    const persistLocally = !readOnly && !roomId;

    const unsubscribe = store.subscribe(() => {
      scheduleRender();
      if (persistLocally && store.getState().canvas.elements !== savedElements) {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveNow, 300);
      }
    });

    const applyToolCursor = () => {
      const activeTool = store.getState().tool.activeTool;
      if (spacePressed || activeTool === "hand") {
        canvas.style.cursor = "grab";
      } else {
        canvas.style.cursor = CURSOR_MAP[activeTool] ?? "crosshair";
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (activePointers.size === 2) {
          if (isDrawing && activeId) {
            dispatch(deleteElement([activeId]));
            isDrawing = false;
            activeId = null;
          }
          isDraggingSelection = false;
          dragIds = [];
          isRotating = false;
          isPanning = false;
          isPinching = true;
          const [p1, p2] = [...activePointers.values()];
          lastTouchCenter = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
          lastTouchDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          return;
        }
        if (activePointers.size > 2) return;
      }

      const state = store.getState();
      const activeTool = state.tool.activeTool;
      const toolOptions = state.tool.toolOptions;
      const elements = getElements();
      const selectedIds = state.selection.selectedIds;
      const boundingBox = state.selection.boundingBox;
      const viewport = getViewport();
      const point = screenToWorld(e.clientX, e.clientY, canvas, viewport);

      if (activeTool === "hand" || spacePressed || e.button === 1) {
        isPanning = true;
        lastPanPoint = { x: e.clientX, y: e.clientY };
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
        e.preventDefault();
        return;
      }

      if (e.button !== 0) return;
      canvas.setPointerCapture(e.pointerId);

      if (activeTool === "select") {
        if (boundingBox && selectedIds.length === 1) {
          const selectedEl = elements.find((el) => el.id === selectedIds[0]);
          const elAngle = selectedEl?.angle ?? 0;
          const rotHandle = getRotationHandlePosition(
            boundingBox,
            elAngle,
            viewport.zoom,
          );
          const dist = Math.hypot(point.x - rotHandle.x, point.y - rotHandle.y);
          if (dist <= 10 / viewport.zoom) {
            isRotating = true;
            rotationCenter = {
              x: boundingBox.x + boundingBox.width / 2,
              y: boundingBox.y + boundingBox.height / 2,
            };
            gestureStartElements = elements;
            gestureMoved = false;
            return;
          }

          if (selectedEl) {
            const local = unrotatePoint(point.x, point.y, boundingBox, elAngle);
            const handle = getHandleAtPoint(
              boundingBox,
              local.x,
              local.y,
              viewport.zoom,
            );
            if (handle) {
              isResizing = true;
              resizeHandle = handle;
              resizeStartElement = selectedEl;
              gestureStartElements = elements;
              gestureMoved = false;
              return;
            }
          }
        }

        let clickedElement = findElementAtPoint(elements, point.x, point.y);
        if (
          clickedElement &&
          clickedElement.type === "text" &&
          clickedElement.containerId
        ) {
          const containerId = clickedElement.containerId;
          const container = elements.find((el) => el.id === containerId);
          if (container) clickedElement = container;
        }

        handleSelectionClick(clickedElement, e.shiftKey);

        if (!clickedElement) {
          isMarqueeSelecting = true;
          dispatch(
            setMarquee({ x: point.x, y: point.y, width: 0, height: 0 }),
          );
          lastDragPoint = { x: point.x, y: point.y };
          return;
        }

        isDraggingSelection = true;
        lastDragPoint = { x: point.x, y: point.y };
        gestureStartElements = elements;
        gestureMoved = false;

        const currentSelection = store.getState().selection.selectedIds;
        const baseIds = currentSelection.includes(clickedElement.id)
          ? currentSelection
          : [clickedElement.id];
        dragIds = [...baseIds];
        baseIds.forEach((id) => {
          const el = elements.find((item) => item.id === id);
          if (
            el &&
            (el.type === "rectangle" ||
              el.type === "circle" ||
              el.type === "diamond") &&
            el.boundTextElementId
          ) {
            dragIds.push(el.boundTextElementId);
          }
        });
        return;
      }

      if (activeTool === "eraser") {
        isErasing = true;
        const hit = findElementAtPoint(elements, point.x, point.y);
        if (hit) {
          addToPendingErase(hit);
          scheduleRender();
        }
        return;
      }

      if (activeTool === "text") {
        const clickedText = findElementAtPoint(elements, point.x, point.y);
        if (clickedText && clickedText.type === "text") {
          dispatch(setEditingElement(clickedText.id));
          openTextEditor(clickedText);
          return;
        }

        dispatch(pushToHistory({ elements, actionType: "add-text" }));
        const newText = createTextElement(point.x, point.y, toolOptions);
        dispatch(addElement(newText));
        dispatch(setEditingElement(newText.id));
        openTextEditor(newText);
        return;
      }

      const create = shapeCreators[activeTool];
      if (!create) return;

      dispatch(pushToHistory({ elements, actionType: `add-${activeTool}` }));
      const newElement = create(point.x, point.y, toolOptions);
      dispatch(addElement(newElement));
      activeId = newElement.id;
      isDrawing = true;
      startX = point.x;
      startY = point.y;
      broadcastDraw(socket, roomId, "onMouseDown", newElement);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" && activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (isPinching) {
          if (activePointers.size < 2) return;
          const [p1, p2] = [...activePointers.values()];
          const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
          const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          dispatch(
            panBy({
              dx: center.x - lastTouchCenter.x,
              dy: center.y - lastTouchCenter.y,
            }),
          );
          if (lastTouchDistance > 0) {
            dispatch(
              zoomAtPoint({
                factor: distance / lastTouchDistance,
                x: center.x,
                y: center.y,
              }),
            );
          }

          lastTouchCenter = center;
          lastTouchDistance = distance;
          return;
        }
      }

      if (isPanning) {
        dispatch(
          panBy({
            dx: e.clientX - lastPanPoint.x,
            dy: e.clientY - lastPanPoint.y,
          }),
        );
        lastPanPoint = { x: e.clientX, y: e.clientY };
        return;
      }

      const state = store.getState();
      const activeTool = state.tool.activeTool;
      const elements = getElements();
      const selectedIds = state.selection.selectedIds;
      const viewport = getViewport();
      const point = screenToWorld(e.clientX, e.clientY, canvas, viewport);

      maybeBroadcastCursor(point.x, point.y);

      if (activeTool === "select" && isRotating && selectedIds.length === 1) {
        gestureMoved = true;
        const cx = rotationCenter.x;
        const cy = rotationCenter.y;

        const mouseAngle = Math.atan2(point.y - cy, point.x - cx);
        let newAngle = mouseAngle + Math.PI / 2;

        if (e.shiftKey) {
          const snapAngle = (15 * Math.PI) / 180;
          newAngle = Math.round(newAngle / snapAngle) * snapAngle;
        }

        dispatch(
          updateElement({
            id: selectedIds[0],
            updates: { angle: newAngle },
          }),
        );

        const el = elements.find((el) => el.id === selectedIds[0]);
        if (
          el &&
          (el.type === "rectangle" || el.type === "circle" || el.type === "diamond") &&
          el.boundTextElementId
        ) {
          dispatch(
            updateElement({
              id: el.boundTextElementId,
              updates: { angle: newAngle },
            }),
          );
        }

        if (el) {
          dispatch(
            setBoundingBox({
              x: el.x,
              y: el.y,
              height: el.height,
              width: el.width,
              angle: newAngle,
            }),
          );
        }
        return;
      }

      if (activeTool === "select" && isResizing && resizeStartElement && resizeHandle) {
        gestureMoved = true;
        const startEl = resizeStartElement;
        const local = unrotatePoint(point.x, point.y, startEl, startEl.angle);
        const box = resizeBox(startEl, resizeHandle, local.x, local.y);

        dispatch(
          resizeElement({
            id: startEl.id,
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
          }),
        );

        if (
          startEl.type === "line" ||
          startEl.type === "arrow" ||
          startEl.type === "pencil"
        ) {
          const sx = startEl.width !== 0 ? box.width / startEl.width : 1;
          const sy = startEl.height !== 0 ? box.height / startEl.height : 1;
          dispatch(
            updateElement({
              id: startEl.id,
              updates: {
                points: startEl.points.map((pt) => ({
                  x: pt.x * sx,
                  y: pt.y * sy,
                })),
              },
            }),
          );
        }

        dispatch(
          setBoundingBox({
            x: Math.min(box.x, box.x + box.width),
            y: Math.min(box.y, box.y + box.height),
            width: Math.abs(box.width),
            height: Math.abs(box.height),
            angle: startEl.angle,
          }),
        );
        return;
      }

      if (activeTool === "select" && isMarqueeSelecting) {
        dispatch(
          setMarquee({
            x: Math.min(lastDragPoint.x, point.x),
            y: Math.min(lastDragPoint.y, point.y),
            width: Math.abs(point.x - lastDragPoint.x),
            height: Math.abs(point.y - lastDragPoint.y),
          }),
        );
        return;
      }

      if (activeTool === "select" && isDraggingSelection && dragIds.length > 0) {
        const dx = point.x - lastDragPoint.x;
        const dy = point.y - lastDragPoint.y;
        if (dx === 0 && dy === 0) return;

        gestureMoved = true;
        dispatch(moveElements({ ids: dragIds, dx, dy }));

        const box = store.getState().selection.boundingBox;
        if (box) {
          dispatch(setBoundingBox({ ...box, x: box.x + dx, y: box.y + dy }));
        }
        lastDragPoint = { x: point.x, y: point.y };
        return;
      }

      if (isErasing) {
        const hit = findElementAtPoint(elements, point.x, point.y);
        if (hit && !pendingEraseIds.has(hit.id)) {
          addToPendingErase(hit);
          scheduleRender();
        }
        return;
      }

      if (activeTool === "select" && !isDrawing) {
        const box = state.selection.boundingBox;
        if (box && selectedIds.length === 1) {
          const el = elements.find((item) => item.id === selectedIds[0]);
          const elAngle = el?.angle ?? 0;
          const local = unrotatePoint(point.x, point.y, box, elAngle);
          const handle = getHandleAtPoint(box, local.x, local.y, viewport.zoom);
          if (handle) {
            canvas.style.cursor = RESIZE_CURSORS[handle];
            return;
          }
          const rotHandle = getRotationHandlePosition(box, elAngle, viewport.zoom);
          if (Math.hypot(point.x - rotHandle.x, point.y - rotHandle.y) <= 10 / viewport.zoom) {
            canvas.style.cursor = "grab";
            return;
          }
        }
        canvas.style.cursor = "default";
        return;
      }

      if (!isDrawing || !activeId) return;
      const width = point.x - startX;
      const height = point.y - startY;

      if (
        activeTool === "rectangle" ||
        activeTool === "circle" ||
        activeTool === "diamond"
      ) {
        dispatch(updateElement({ id: activeId, updates: { width, height } }));
      }

      if (activeTool === "line" || activeTool === "arrow") {
        dispatch(
          updateElement({
            id: activeId,
            updates: {
              width,
              height,
              points: [
                { x: 0, y: 0 },
                { x: width, y: height },
              ],
            },
          }),
        );
      }

      if (activeTool === "pencil") {
        const pencilElement = elements.find(
          (el) => el.id === activeId && el.type === "pencil",
        ) as PencilElement | undefined;
        if (pencilElement) {
          dispatch(
            updateElement({
              id: activeId,
              updates: {
                width,
                height,
                points: [...pencilElement.points, { x: width, y: height }],
              },
            }),
          );
        }
      }

      const now = performance.now();
      if (now - lastDrawSent > 40) {
        lastDrawSent = now;
        broadcastActiveDraw("onMouseMove");
      }
    };

    const pushGestureToHistory = (actionType: string) => {
      if (gestureMoved && gestureStartElements) {
        dispatch(
          pushToHistory({ elements: gestureStartElements, actionType }),
        );
      }
      gestureStartElements = null;
      gestureMoved = false;
    };

    const broadcastSelection = () => {
      const state = store.getState();
      const ids = new Set(state.selection.selectedIds);
      state.canvas.elements.forEach((el) => {
        const isBoundToSelected =
          el.type === "text" && el.containerId && ids.has(el.containerId);
        if (ids.has(el.id) || isBoundToSelected) {
          broadcastElement(socket, roomId, el);
        }
      });
    };

    const recenterBoundText = (container: ExcalidrawElement) => {
      if (
        (container.type === "rectangle" ||
          container.type === "circle" ||
          container.type === "diamond") &&
        container.boundTextElementId
      ) {
        const boundText = store
          .getState()
          .canvas.elements.find((el) => el.id === container.boundTextElementId);
        if (boundText) {
          dispatch(
            updateElement({
              id: boundText.id,
              updates: {
                x: container.x + container.width / 2 - boundText.width / 2,
                y: container.y + container.height / 2 - boundText.height / 2,
              },
            }),
          );
        }
      }
    };

    const endGesture = () => {
      if (isPanning) {
        isPanning = false;
        applyToolCursor();
        return;
      }

      if (isRotating) {
        isRotating = false;
        const moved = gestureMoved;
        pushGestureToHistory("rotate");
        if (moved) broadcastSelection();
        return;
      }

      if (isResizing) {
        isResizing = false;
        const resizedId = resizeStartElement?.id;
        resizeHandle = null;
        resizeStartElement = null;

        const el = store
          .getState()
          .canvas.elements.find((item) => item.id === resizedId);
        if (el) {
          const normalized = normalizeElementSize(el);
          if (normalized) {
            dispatch(updateElement({ id: el.id, updates: normalized }));
          }
          const finalEl = { ...el, ...(normalized ?? {}) };
          recenterBoundText(finalEl);
          dispatch(
            setBoundingBox({
              x: finalEl.x,
              y: finalEl.y,
              width: finalEl.width,
              height: finalEl.height,
              angle: finalEl.angle,
            }),
          );
        }
        const moved = gestureMoved;
        pushGestureToHistory("resize");
        if (moved) broadcastSelection();
        return;
      }

      if (isMarqueeSelecting) {
        isMarqueeSelecting = false;
        const marquee = store.getState().selection.marquee;
        dispatch(setMarquee(null));
        if (marquee && (marquee.width > 2 || marquee.height > 2)) {
          const elements = getElements();
          const hits = elements.filter((el) => {
            const ex = Math.min(el.x, el.x + el.width);
            const ey = Math.min(el.y, el.y + el.height);
            const ew = Math.abs(el.width);
            const eh = Math.abs(el.height);
            return (
              ex < marquee.x + marquee.width &&
              ex + ew > marquee.x &&
              ey < marquee.y + marquee.height &&
              ey + eh > marquee.y
            );
          });
          if (hits.length > 0) {
            dispatch(selectElements(hits.map((el) => el.id)));
            dispatch(setBoundingBox(calculateCombinedBoundingBox(hits)));
          }
        }
        return;
      }

      if (isErasing) {
        isErasing = false;
        if (pendingEraseIds.size > 0) {
          const elements = getElements();
          dispatch(pushToHistory({ elements, actionType: "erase" }));
          elements.forEach((el) => {
            if (
              el.type === "text" &&
              el.containerId &&
              pendingEraseIds.has(el.id) &&
              !pendingEraseIds.has(el.containerId)
            ) {
              dispatch(
                updateElement({
                  id: el.containerId,
                  updates: { boundTextElementId: null },
                }),
              );
            }
          });
          const erasedIds = [...pendingEraseIds];
          dispatch(deleteElement(erasedIds));
          dispatch(clearSelection());
          broadcastDelete(socket, roomId, erasedIds);
          pendingEraseIds.clear();
        }
        return;
      }

      if (isDraggingSelection) {
        isDraggingSelection = false;
        dragIds = [];
        const moved = gestureMoved;
        pushGestureToHistory("move");
        if (moved) broadcastSelection();
        return;
      }

      if (!isDrawing || !activeId) return;

      const drawnElement = store
        .getState()
        .canvas.elements.find((el) => el.id === activeId);
      isDrawing = false;
      activeId = null;

      if (drawnElement) {
        const normalized = normalizeElementSize(drawnElement);
        if (normalized) {
          dispatch(updateElement({ id: drawnElement.id, updates: normalized }));
        }
        const finalElement = { ...drawnElement, ...(normalized ?? {}) };

        broadcastElement(socket, roomId, finalElement);

        dispatch(selectElement(finalElement.id));
        dispatch(
          setBoundingBox({
            x: finalElement.x,
            y: finalElement.y,
            width: finalElement.width,
            height: finalElement.height,
            angle: finalElement.angle,
          }),
        );
      }

      dispatch(revertToSelect());
      applyToolCursor();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        activePointers.delete(e.pointerId);
        if (isPinching) {
          if (activePointers.size < 2) isPinching = false;
          return;
        }
      }

      endGesture();

      if (e.pointerType === "touch") {
        const now = Date.now();
        const isDoubleTap =
          now - lastTap.time < 300 &&
          Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 20;

        if (isDoubleTap) {
          lastTap = { time: 0, x: 0, y: 0 };
          handleDoubleClickAt(e.clientX, e.clientY);
        } else {
          lastTap = { time: now, x: e.clientX, y: e.clientY };
        }
      }
    };

    const addToPendingErase = (el: ExcalidrawElement) => {
      pendingEraseIds.add(el.id);
      if (
        (el.type === "rectangle" ||
          el.type === "circle" ||
          el.type === "diamond") &&
        el.boundTextElementId
      ) {
        pendingEraseIds.add(el.boundTextElementId);
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) isPinching = false;
      isPanning = false;
      isRotating = false;
      isDraggingSelection = false;
      dragIds = [];
      isResizing = false;
      resizeHandle = null;
      resizeStartElement = null;
      isDrawing = false;
      activeId = null;
      gestureStartElements = null;
      gestureMoved = false;
      if (isMarqueeSelecting) {
        isMarqueeSelecting = false;
        dispatch(setMarquee(null));
      }
      if (isErasing) {
        isErasing = false;
        pendingEraseIds.clear();
        scheduleRender();
      }
      applyToolCursor();
    };

    const handleDoubleClickAt = (clientX: number, clientY: number) => {
      const elements = getElements();
      const toolOptions = store.getState().tool.toolOptions;
      const point = screenToWorld(clientX, clientY, canvas, getViewport());
      const clickedElement = findElementAtPoint(elements, point.x, point.y);
      if (!clickedElement) return;

      if (clickedElement.type === "text") {
        const container = clickedElement.containerId
          ? (elements.find((el) => el.id === clickedElement.containerId) as
              | RectangleElement
              | CircleElement
              | DiamondElement
              | undefined)
          : undefined;

        dispatch(pushToHistory({ elements, actionType: "edit-text" }));
        dispatch(
          updateElement({
            id: clickedElement.id,
            updates: { isEditing: true },
          }),
        );
        dispatch(setEditingElement(clickedElement.id));
        openTextEditor(clickedElement, container);
        return;
      }

      if (
        clickedElement.type === "rectangle" ||
        clickedElement.type === "circle" ||
        clickedElement.type === "diamond"
      ) {
        const container = clickedElement as
          | RectangleElement
          | CircleElement
          | DiamondElement;

        if (container.boundTextElementId) {
          const existingText = elements.find(
            (el) => el.id === container.boundTextElementId && el.type === "text",
          ) as TextElement | undefined;
          if (existingText) {
            dispatch(pushToHistory({ elements, actionType: "edit-text" }));
            dispatch(
              updateElement({
                id: existingText.id,
                updates: { isEditing: true },
              }),
            );
            dispatch(setEditingElement(existingText.id));
            openTextEditor(existingText, container);
            return;
          }
        }

        dispatch(pushToHistory({ elements, actionType: "add-bound-text" }));
        const boundText = createBoundTextElement(container, toolOptions);
        dispatch(addElement(boundText));
        dispatch(
          updateElement({
            id: container.id,
            updates: { boundTextElementId: boundText.id },
          }),
        );
        dispatch(setEditingElement(boundText.id));
        openTextEditor(boundText, container);
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      handleDoubleClickAt(e.clientX, e.clientY);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        dispatch(
          zoomAtPoint({
            factor: getWheelZoomFactor(e),
            x: e.clientX,
            y: e.clientY,
          }),
        );
      } else {
        dispatch(panBy({ dx: -e.deltaX, dy: -e.deltaY }));
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
      spacePressed = true;
      if (!isPanning) canvas.style.cursor = "grab";
      e.preventDefault();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      spacePressed = false;
      if (!isPanning) applyToolCursor();
    };

    function handleSelectionClick(
      clickedElement: ExcalidrawElement | null,
      shiftKey: boolean,
    ) {
      const elements = getElements();
      const selectedIds = store.getState().selection.selectedIds;

      if (!clickedElement) {
        dispatch(clearSelection());
        return;
      }

      if (shiftKey) {
        dispatch(addToSelection(clickedElement.id));
        const allSelected = [...selectedIds, clickedElement.id];
        const selectedElements = elements.filter((el) =>
          allSelected.includes(el.id),
        );
        dispatch(setBoundingBox(calculateCombinedBoundingBox(selectedElements)));
      } else if (!selectedIds.includes(clickedElement.id)) {
        dispatch(clearSelection());
        dispatch(selectElement(clickedElement.id));
        dispatch(
          setBoundingBox({
            x: clickedElement.x,
            y: clickedElement.y,
            width: clickedElement.width,
            height: clickedElement.height,
            angle: clickedElement.angle,
          }),
        );
      }
    }

    function openTextEditor(
      element: TextElement,
      container?: RectangleElement | CircleElement | DiamondElement,
    ) {
      const { zoom, scrollX, scrollY } = store.getState().ui;

      const containerBounds = container
        ? {
            id: container.id,
            x: container.x,
            y: container.y,
            width: container.width,
            height: container.height,
            angle: container.angle,
          }
        : undefined;

      mountTextArea({
        element,
        zoom,
        scrollX,
        scrollY,
        container: containerBounds,
        onInput: (text, width, height) => {
          const updates: Partial<TextElement> = {
            text,
            originalText: text,
            width,
            height,
            isEditing: true,
          };

          if (containerBounds) {
            const requiredHeight = height + BOUND_TEXT_PADDING * 2;

            if (requiredHeight > containerBounds.height) {
              const grow = requiredHeight - containerBounds.height;
              containerBounds.y -= grow / 2;
              containerBounds.height = requiredHeight;

              dispatch(
                updateElement({
                  id: containerBounds.id,
                  updates: {
                    y: containerBounds.y,
                    height: containerBounds.height,
                  },
                }),
              );

              dispatch(
                setBoundingBox({
                  x: containerBounds.x,
                  y: containerBounds.y,
                  width: containerBounds.width,
                  height: containerBounds.height,
                  angle: containerBounds.angle,
                }),
              );
            }

            updates.x =
              containerBounds.x + containerBounds.width / 2 - width / 2;
            updates.y =
              containerBounds.y + containerBounds.height / 2 - height / 2;
          }

          dispatch(updateElement({ id: element.id, updates }));
        },
        onCommit: (text) => {
          if (text.trim() === "") {
            dispatch(deleteElement([element.id]));
            broadcastDelete(socket, roomId, [element.id]);
            if (containerBounds) {
              dispatch(
                updateElement({
                  id: containerBounds.id,
                  updates: { boundTextElementId: null },
                }),
              );
            }
          } else {
            const font = getFontString(element);
            const lines = containerBounds
              ? wrapText(
                  text,
                  font,
                  containerBounds.width - BOUND_TEXT_PADDING * 2,
                )
              : text.split("\n");
            const size = measureLines(
              lines,
              font,
              element.fontSize,
              element.lineHeight,
            );

            const updates: Partial<TextElement> = {
              text,
              originalText: text,
              width: size.width,
              height: size.height,
              isEditing: false,
            };

            if (containerBounds) {
              updates.x =
                containerBounds.x + containerBounds.width / 2 - size.width / 2;
              updates.y =
                containerBounds.y +
                containerBounds.height / 2 -
                size.height / 2;
            }

            dispatch(updateElement({ id: element.id, updates }));

            const latest = store.getState().canvas.elements;
            const committedText = latest.find((el) => el.id === element.id);
            if (committedText) broadcastElement(socket, roomId, committedText);
            if (containerBounds) {
              const committedContainer = latest.find(
                (el) => el.id === containerBounds.id,
              );
              if (committedContainer) {
                broadcastElement(socket, roomId, committedContainer);
              }
            }
          }
          dispatch(setEditingElement(null));
          dispatch(revertToSelect());
        },
      });
    }

    // Always keep the resize listener so the read-only view stays crisp; wheel is
    // attached in read-only mode too so viewers can pan/zoom.
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    if (!readOnly) {
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerCancel);
      canvas.addEventListener("dblclick", onDoubleClick);
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      if (persistLocally) window.addEventListener("beforeunload", saveNow);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("dblclick", onDoubleClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("beforeunload", saveNow);
      unsubscribe();
      if (saveTimer) {
        clearTimeout(saveTimer);
        if (persistLocally) saveNow();
      }
    };
  }, [canvasRef, dispatch, socket, roomId, readOnly]);
}
