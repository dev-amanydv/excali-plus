"use client";
import { selectZoom } from "@/store/selectors";
import { resetView, zoomAtPoint } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";

export default function ZoomControls() {
  const dispatch = useAppDispatch();
  const zoom = useAppSelector(selectZoom);

  const zoomBy = (factor: number) => {
    dispatch(
      zoomAtPoint({
        factor,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }),
    );
  };

  return (
    <div className="fixed bottom-4 max-sm:bottom-[calc(env(safe-area-inset-bottom)+64px)] left-4 z-20 flex items-center bg-white border border-[#ECECEC] rounded-[.5rem] shadow-[0px_0px_.93px_0px_rgba(0,0,0,.17),0px_0px_3.13px_0px_rgba(0,0,0,.08),0px_7px_14px_0px_rgba(0,0,0,.05)]">
      <button
        className="h-[36px] w-[36px] flex justify-center items-center rounded-l-[.5rem] hover:bg-[#F1F0FE] cursor-pointer text-lg"
        onClick={() => zoomBy(1 / 1.2)}
        title="Zoom out"
      >
        −
      </button>
      <button
        className="h-[36px] w-[56px] flex justify-center items-center hover:bg-[#F1F0FE] cursor-pointer text-xs tabular-nums"
        onClick={() => dispatch(resetView())}
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        className="h-[36px] w-[36px] flex justify-center items-center rounded-r-[.5rem] hover:bg-[#F1F0FE] cursor-pointer text-lg"
        onClick={() => zoomBy(1.2)}
        title="Zoom in"
      >
        +
      </button>
    </div>
  );
}
