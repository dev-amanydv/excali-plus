import {
  selectActiveTool,
  selectAllElements,
  selectElementById,
  selectSelectedIds,
  selectToolOptions,
  selectVisibleElements,
} from "@/store/selectors";
import {
  addElement,
  deleteElement,
  updateElement,
} from "@/store/slices/canvasSlice";
import { pushToHistory } from "@/store/slices/historySlice";
import {
  addToSelection,
  clearSelection,
  removeFromSelection,
  selectElement,
  selectElements,
  setBoundingBox,
  setEditingElement,
} from "@/store/slices/selectionSlice";
import { revertToSelect } from "@/store/slices/toolSlice";
import { store, useAppDispatch, useAppSelector } from "@/store/store";
import {
  BoundingBox,
  CircleElement,
  DiamondElement,
  ExcalidrawElement,
  PencilElement,
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
import { findElementAtPoint } from "@/utils/hitTest";
import { renderCanvas, renderSelectionHighlight, getRotationHandlePosition } from "@/utils/renderCanvas";
import { mountTextArea } from "@/utils/textAreaManager";
import { useEffect, useRef } from "react";

function calculateCombinedBoundingBox(
  elements: ExcalidrawElement[],
): BoundingBox | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    minX = Math.min(Infinity, el.x);
    minY = Math.min(Infinity, el.y);
    maxX = Math.max(-Infinity, el.x + el.width);
    maxY = Math.max(-Infinity, el.y + el.height);
  });

  return {
    x: minX,
    y: minY,
    height: maxY - minY,
    width: maxX - minX,
    angle: 0,
  };
}

export function useCanvasDraw(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  socket?: WebSocket | null,
  roomId?: string | null,
) {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectActiveTool);
  const toolOptions = useAppSelector(selectToolOptions);
  const elements = useAppSelector(selectVisibleElements);
  const selectedIds = useAppSelector(selectSelectedIds);
  const boundingBox = useAppSelector((state) => state.selection.boundingBox);
  const isDrawing = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const activeId = useRef<string | null>(null);
  const hasLoadedInitialData = useRef(false);
  const isDraggingSelection = useRef(false);
  const draggedElementId = useRef<string | null>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragElementStartPos = useRef({
    x: 0,
    y: 0,
  });
  const isRotating = useRef(false);
  const rotationCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      hasLoadedInitialData.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderCanvas(ctx, canvas, elements);
    const selectedAngle =
      selectedIds.length === 1
        ? elements.find((el) => el.id === selectedIds[0])?.angle ?? 0
        : 0;
    renderSelectionHighlight(ctx, boundingBox, selectedIds, selectedAngle);
    if (hasLoadedInitialData.current) {
      localStorage.setItem("canvas", JSON.stringify(elements));
    }
  }, [elements, canvasRef, boundingBox, selectedIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2x");

    const onMouseDown = (e: MouseEvent) => {
      if (activeTool === "hand") return;
      if (activeTool === "select") {
        if (boundingBox && selectedIds.length === 1) {
          const selectedEl = elements.find((el) => el.id === selectedIds[0]);
          const elAngle = selectedEl?.angle ?? 0;
          const rotHandle = getRotationHandlePosition(boundingBox, elAngle);
          const dist = Math.hypot(e.clientX - rotHandle.x, e.clientY - rotHandle.y);
          if (dist <= 10) {
            isRotating.current = true;
            rotationCenter.current = {
              x: boundingBox.x + boundingBox.width / 2,
              y: boundingBox.y + boundingBox.height / 2,
            };
            return;
          }
        }

        const clickedElement = findElementAtPoint(elements, e.clientX, e.clientY);
        handleSelectionClick(e);
        if (!clickedElement) return;
        isDraggingSelection.current = true;
        draggedElementId.current = clickedElement.id;
        dragStartX.current = e.clientX;
        dragStartY.current = e.clientY;
        dragElementStartPos.current = {
          x: clickedElement.x,
          y: clickedElement.y,
        };
        return;
      }
      isDrawing.current = true;
      startX.current = e.clientX;
      startY.current = e.clientY;
      if (activeTool === "rectangle") {
        dispatch(
          pushToHistory({
            elements,
            actionType: "add-rectangle",
          }),
        );

        const newRect = createRectangleElement(
          e.clientX,
          e.clientY,
          toolOptions,
        );
        dispatch(addElement(newRect));
        activeId.current = newRect.id;
      }
      if (activeTool === "circle") {
        dispatch(
          pushToHistory({
            elements,
            actionType: "add-circle",
          }),
        );

        const newCircle = createCircleElement(
          e.clientX,
          e.clientY,
          toolOptions,
        );
        dispatch(addElement(newCircle));
        activeId.current = newCircle.id;
      }
      if (activeTool === "diamond") {
        dispatch(
          pushToHistory({
            elements,
            actionType: "add-diamond",
          }),
        );

        const newDiamond = createDiamondElement(
          e.clientX,
          e.clientY,
          toolOptions,
        );

        dispatch(addElement(newDiamond));
        activeId.current = newDiamond.id;
      }

      if (activeTool === "line") {
        dispatch(
          pushToHistory({
            elements,
            actionType: "add-line",
          }),
        );

        const newLine = createLineElement(e.clientX, e.clientY, toolOptions);
        dispatch(addElement(newLine));
        activeId.current = newLine.id;
      }

      if (activeTool === "arrow") {
        dispatch(
          pushToHistory({
            elements,
            actionType: "add-arrow",
          }),
        );

        const newArrow = createArrowElement(e.clientX, e.clientY, toolOptions);
        dispatch(addElement(newArrow));
        activeId.current = newArrow.id;
      }

      if (activeTool === "pencil") {
        dispatch(
          pushToHistory({
            elements,
            actionType: "add-pencil",
          }),
        );

        const newPencil = createPencilElement(
          e.clientX,
          e.clientY,
          toolOptions,
        );
        dispatch(addElement(newPencil));
        activeId.current = newPencil.id;
      }

      if (activeTool === "text") {
        const clickedText = findElementAtPoint(elements, e.clientX, e.clientY);

        if (clickedText && clickedText.type === "text") {
          openTextEditor(clickedText);
        }

        dispatch(
          pushToHistory({
            elements,
            actionType: "add-text",
          }),
        );

        const newText = createTextElement(e.clientX, e.clientY, toolOptions);

        dispatch(addElement(newText));
        dispatch(setEditingElement(newText.id));
        openTextEditor(newText);
        return;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (activeTool === "select" && isRotating.current && selectedIds.length === 1) {
        const cx = rotationCenter.current.x;
        const cy = rotationCenter.current.y;
        
        
        let mouseAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
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
            })
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

      if (
        activeTool === "select" &&
        isDraggingSelection.current &&
        draggedElementId.current
      ) {
        const dx = e.clientX - dragStartX.current;
        const dy = e.clientY - dragStartY.current;

        const newX = dragElementStartPos.current.x + dx;
        const newY = dragElementStartPos.current.y + dy;

        dispatch(
          updateElement({
            id: draggedElementId.current,
            updates: {
              x: newX,
              y: newY,
            },
          }),
        );

        const el = elements.find((el) => el.id === draggedElementId.current);
        if (
          el &&
          (el.type === "rectangle" || el.type === "circle" || el.type === "diamond") &&
          el.boundTextElementId
        ) {
          const boundText = elements.find(
            (t) => t.id === el.boundTextElementId && t.type === "text",
          );
          if (boundText) {
            dispatch(
              updateElement({
                id: boundText.id,
                updates: {
                  x: newX + el.width / 2 - boundText.width / 2,
                  y: newY + el.height / 2 - boundText.height / 2,
                },
              }),
            );
          }
        }

        if (el) {
          dispatch(
            setBoundingBox({
              x: newX,
              y: newY,
              height: el.height,
              width: el.width,
              angle: 0,
            }),
          );
        }
        return;
      }
      if (!isDrawing.current || !activeId.current) return;
      const width = e.clientX - startX.current;
      const height = e.clientY - startY.current;

      if (activeTool === "rectangle") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
            },
          }),
        );
      }
      if (activeTool === "circle") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
            },
          }),
        );
      }
      if (activeTool === "diamond") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
            },
          }),
        );
      }
      if (activeTool === "line") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
              points: [
                { x: 0, y: 0 },
                {
                  x: e.clientX - startX.current,
                  y: e.clientY - startY.current,
                },
              ],
            },
          }),
        );
      }

      if (activeTool === "arrow") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
              points: [
                { x: 0, y: 0 },
                {
                  x: e.clientX - startX.current,
                  y: e.clientY - startY.current,
                },
              ],
            },
          }),
        );
      }

      if (activeTool === "pencil") {
        const pencilElement = elements.find(
          (el) => el.id === activeId.current && el.type === "pencil",
        ) as PencilElement;
        if (pencilElement) {
          dispatch(
            updateElement({
              id: activeId.current,
              updates: {
                width,
                height,
                points: [
                  ...pencilElement.points,
                  {
                    x: e.clientX - startX.current,
                    y: e.clientY - startY.current,
                  },
                ],
              },
            }),
          );
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isRotating.current) {
        isRotating.current = false;
        return;
      }

      isDraggingSelection.current = false;
      draggedElementId.current = null;
      if (!isDrawing.current || !activeId.current) return;

      const width = e.clientX - startX.current;
      const height = e.clientY - startY.current;

      if (activeTool === "rectangle") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
            },
          }),
        );
        const finalEl = store.getState().canvas.elements.find((el) => el.id === activeId.current)
        if (finalEl && socket && roomId){
          socket.send(JSON.stringify({
          type: "onMouseUp",
          data: {
            ...finalEl, roomId: Number(roomId)
          }
        }))
        }
      }
      if (activeTool === "circle") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
            },
          }),
        );
      }
      if (activeTool === "diamond") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
            },
          }),
        );
      }
      if (activeTool === "line") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
              points: [
                { x: 0, y: 0 },
                {
                  x: e.clientX - startX.current,
                  y: e.clientY - startY.current,
                },
              ],
            },
          }),
        );
      }
      if (activeTool === "arrow") {
        dispatch(
          updateElement({
            id: activeId.current,
            updates: {
              width,
              height,
              points: [
                { x: 0, y: 0 },
                {
                  x: e.clientX - startX.current,
                  y: e.clientY - startY.current,
                },
              ],
            },
          }),
        );
      }
      if (activeTool === "pencil") {
        const pencilElement = elements.find(
          (el) => el.id === activeId.current && el.type === "pencil",
        ) as PencilElement;
        if (pencilElement) {
          dispatch(
            updateElement({
              id: activeId.current,
              updates: {
                width,
                height,
                points: [
                  ...pencilElement.points,
                  {
                    x: e.clientX - startX.current,
                    y: e.clientY - startY.current,
                  },
                ],
              },
            }),
          );
        }
      }

      if (activeId.current) {
        const allElements = store.getState().canvas.elements;
        const drawnElement = allElements.find(
          (el) => el.id === activeId.current,
        );

        if (drawnElement) {
          dispatch(selectElement(drawnElement.id));

          dispatch(
            setBoundingBox({
              x: drawnElement.x,
              y: drawnElement.y,
              width: drawnElement.width,
              height: drawnElement.height,
              angle: drawnElement.angle,
            }),
          );
        }
      }

      isDrawing.current = false;
      activeId.current = null;
      dispatch(revertToSelect());
    };

    const onDoubleClick = (e: MouseEvent) => {
      const clickedElement = findElementAtPoint(elements, e.clientX, e.clientY);
      if (!clickedElement) return;

      if (clickedElement.type === "text") {
        dispatch(
          updateElement({
            id: clickedElement.id,
            updates: {
              isEditing: true,
            },
          }),
        );
        dispatch(setEditingElement(clickedElement.id));
        openTextEditor(clickedElement);
        return;
      }

      if (
        clickedElement.type === "rectangle" ||
        clickedElement.type === "circle" ||
        clickedElement.type === "diamond"
      ) {
        const container = clickedElement as RectangleElement | CircleElement | DiamondElement;

        if (container.boundTextElementId) {
          const existingText = elements.find(
            (el) => el.id === container.boundTextElementId && el.type === "text",
          ) as TextElement | undefined;
          if (existingText) {
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

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("dblclick", onDoubleClick);

    function handleSelectionClick(e: MouseEvent) {
      if (activeTool !== "select") return;

      const clickedElement = findElementAtPoint(elements, e.clientX, e.clientY);

      if (clickedElement) {
        if (e.shiftKey) {
          dispatch(addToSelection(clickedElement.id));
          const allSelected = [...selectedIds, clickedElement.id];
          const selectedElements = elements.filter((el) =>
            allSelected.includes(el.id),
          );
          const combinedBox = calculateCombinedBoundingBox(selectedElements);
          dispatch(setBoundingBox(combinedBox));
        } else {
          if (!selectedIds.includes(clickedElement.id)) {
            dispatch(clearSelection())
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
      } else {
        dispatch(clearSelection());
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

      const initialContainerHeight = container?.height ?? 0;

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
            const PADDING = 20; 
            const requiredHeight = height + PADDING;
            
            const newContainerHeight = Math.max(initialContainerHeight, requiredHeight);
            
            if (newContainerHeight !== containerBounds.height) {
              containerBounds.height = newContainerHeight;
              
              dispatch(
                updateElement({
                  id: containerBounds.id,
                  updates: { height: newContainerHeight },
                })
              );
              
              dispatch(
                setBoundingBox({
                  x: containerBounds.x,
                  y: containerBounds.y,
                  width: containerBounds.width,
                  height: newContainerHeight,
                  angle: containerBounds.angle,
                })
              );
            }

            updates.x = containerBounds.x + containerBounds.width / 2 - width / 2;
            updates.y = containerBounds.y + containerBounds.height / 2 - height / 2;
          }

          dispatch(
            updateElement({
              id: element.id,
              updates,
            }),
          );
        },
        onCommit: (text, width, height) => {
          if (text.trim() === "") {
            dispatch(deleteElement([element.id]));
            if (containerBounds) {
              dispatch(
                updateElement({
                  id: containerBounds.id,
                  updates: { boundTextElementId: null },
                }),
              );
            }
          } else {
            const updates: Partial<TextElement> = {
              text,
              originalText: text,
              width,
              height,
              isEditing: false,
            };

            if (containerBounds) {
              updates.x = containerBounds.x + containerBounds.width / 2 - width / 2;
              updates.y = containerBounds.y + containerBounds.height / 2 - height / 2;
            }

            dispatch(
              updateElement({
                id: element.id,
                updates,
              }),
            );
          }
          dispatch(setEditingElement(null));
          dispatch(revertToSelect());
        },
      });
    }

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("dblclick", onDoubleClick);
    };
  }, [activeTool, toolOptions, elements, dispatch, roomId, socket, canvasRef]);
}
