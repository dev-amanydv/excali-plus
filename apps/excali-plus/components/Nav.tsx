import { useAppDispatch, useAppSelector } from "@/store/store";
import { setActiveTool, toogleToolLock } from "@/store/slices/toolSlice";
import { selectActiveTool } from "@/store/selectors";
import { ToolType } from "@/types/canvas";

export default function Nav() {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectActiveTool);

  const toolClass = (tool: ToolType) =>
    `rounded-lg h-[36px] w-[36px] flex justify-center items-center cursor-pointer ${
      activeTool === tool ? "bg-[#E0DFFE]" : "hover:bg-[#F1F0FE]"
    }`;

  return (
    <div className="h-[44px] bg-white gap-[2px] grid grid-rows-[auto] grid-flow-col auto-cols-min w-[506px] border rounded-[.5rem] shadow-[0px_0px_.93px_0px_rgba(0,0,0,.17),0px_0px_3.13px_0px_rgba(0,0,0,.08),0px_7px_14px_0px_rgba(0,0,0,.05)] z-20 border-[#ECECEC] p-[4px] absolute top-10 mx-auto">
      <div>
        <label
          className=" hover:bg-[#F1F0FE] rounded-lg h-[36px] w-[36px] flex justify-center items-center cursor-pointer"
          onClick={() => dispatch(toogleToolLock())}
          title="Keep selected tool active after drawing — Q"
        >
          <div className="ToolIcon__icon">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 20 20"
              className="size-[16px]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g>
                <path
                  d="M13.542 8.542H6.458a2.5 2.5 0 0 0-2.5 2.5v3.75a2.5 2.5 0 0 0 2.5 2.5h7.084a2.5 2.5 0 0 0 2.5-2.5v-3.75a2.5 2.5 0 0 0-2.5-2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                ></path>
                <path
                  d="M10 13.958a1.042 1.042 0 1 0 0-2.083 1.042 1.042 0 0 0 0 2.083Z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                ></path>
                <mask
                  id="UnlockedIcon"
                  maskUnits="userSpaceOnUse"
                  x="6"
                  y="1"
                  width="9"
                  height="9"
                  style={{ maskType: "alpha" }}
                >
                  <path
                    stroke="none"
                    d="M6.399 9.561V5.175c0-.93.401-1.823 1.116-2.48a3.981 3.981 0 0 1 2.693-1.028c1.01 0 1.98.37 2.694 1.027.715.658 1.116 1.55 1.116 2.481"
                    fill="#fff"
                  ></path>
                </mask>
                <g mask="url(#UnlockedIcon)">
                  <path
                    stroke="none"
                    d="M5.149 9.561v1.25h2.5v-1.25h-2.5Zm5.06-7.894V.417v1.25Zm2.559 3.508v1.25h2.5v-1.25h-2.5ZM7.648 8.51V5.175h-2.5V8.51h2.5Zm0-3.334c0-.564.243-1.128.713-1.561L6.668 1.775c-.959.883-1.52 2.104-1.52 3.4h2.5Zm.713-1.561a2.732 2.732 0 0 1 1.847-.697v-2.5c-1.31 0-2.585.478-3.54 1.358L8.36 3.614Zm1.847-.697c.71 0 1.374.26 1.847.697l1.694-1.839a5.231 5.231 0 0 0-3.54-1.358v2.5Zm1.847.697c.47.433.713.997.713 1.561h2.5c0-1.296-.56-2.517-1.52-3.4l-1.693 1.839Z"
                    fill="currentColor"
                  ></path>
                </g>
              </g>
            </svg>
          </div>
        </label>
      </div>
      <div>
        <label
          className={toolClass("hand")}
          onClick={() => dispatch(setActiveTool("hand"))}
          title="Hand (panning) — H"
        >
          <div className="">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.25">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5"></path>
                <path d="M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5"></path>
                <path d="M14 5.5a1.5 1.5 0 0 1 3 0v6.5"></path>
                <path d="M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"></path>
              </g>
            </svg>
          </div>
        </label>
      </div>
      <div>
        <label
          className={toolClass("select")}
          onClick={() => dispatch(setActiveTool("select"))}
          title="Selection — V"
        >
          <div className="ToolIcon__icon">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 22 22"
              className="size-[16px]"
              fill="none"
              strokeWidth="1.25"
            >
              <g
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path
                  d="M6 6l4.153 11.793a0.365 .365 0 0 0 .331 .207a0.366 .366 0 0 0 .332 -.207l2.184 -4.793l4.787 -1.994a0.355 .355 0 0 0 .213 -.323a0.355 .355 0 0 0 -.213 -.323l-11.787 -4.36z"
                  fill="currentColor"
                ></path>
                <path d="M13.5 13.5l4.5 4.5"></path>
              </g>
            </svg>
          </div>
        </label>
      </div>
      <div>
        <label
          className={toolClass("rectangle")}
          onClick={() => dispatch(setActiveTool("rectangle"))}
          title="Rectangle — R"
        >
          <div>
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              </g>
            </svg>
          </div>
        </label>
      </div>
      <div>
        <label
          className={toolClass("diamond")}
          onClick={() => dispatch(setActiveTool("diamond"))}
          title="Diamond — D"
        >
          <div className="ToolIcon__icon text-black">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M10.5 20.4l-6.9 -6.9c-.781 -.781 -.781 -2.219 0 -3l6.9 -6.9c.781 -.781 2.219 -.781 3 0l6.9 6.9c.781 .781 .781 2.219 0 3l-6.9 6.9c-.781 .781 -2.219 .781 -3 0z"></path>
              </g>
            </svg>
            <span className="ToolIcon__keybinding hidden">3</span>
          </div>{" "}
        </label>
      </div>
      <div>
        <label
          className={toolClass("line")}
          onClick={() => dispatch(setActiveTool("line"))}
          title="Line — L"
        >
          <div className="ToolIcon__icon text-black">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 20 20"
              className="size-[16px]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.167 10h11.666" strokeWidth="1.5"></path>
            </svg>
            <span className="ToolIcon__keybinding hidden">6</span>
          </div>
        </label>
      </div>

      <div>
        <label
          className={toolClass("arrow")}
          onClick={() => dispatch(setActiveTool("arrow"))}
          title="Arrow — A"
        >
          <div className="ToolIcon__icon text-black">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <line x1="15" y1="16" x2="19" y2="12"></line>
                <line x1="15" y1="8" x2="19" y2="12"></line>
              </g>
            </svg>
            <span className="ToolIcon__keybinding hidden">5</span>
          </div>
        </label>
      </div>
      <div>
        <label
          className={toolClass("circle")}
          onClick={() => dispatch(setActiveTool("circle"))}
          title="Circle — O"
        >
          <div className="ToolIcon__icon text-black">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="9"></circle>
              </g>
            </svg>
            <span className="ToolIcon__keybinding hidden">4</span>
          </div>
        </label>
      </div>
      <div>
        <label
          className={toolClass("pencil")}
          onClick={() => dispatch(setActiveTool("pencil"))}
          title="Pencil — P"
        >
          <div className="ToolIcon__icon text-black">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 20 20"
              className="size-[16px]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.25">
                <path
                  clipRule="evenodd"
                  d="m7.643 15.69 7.774-7.773a2.357 2.357 0 1 0-3.334-3.334L4.31 12.357a3.333 3.333 0 0 0-.977 2.357v1.953h1.953c.884 0 1.732-.352 2.357-.977Z"
                ></path>
                <path d="m11.25 5.417 3.333 3.333"></path>
              </g>
            </svg>
            <span className="ToolIcon__keybinding hidden">7</span>
          </div>
        </label>
      </div>
      <div>
        <label
          className={toolClass("text")}
          onClick={() => dispatch(setActiveTool("text"))}
          title="Text — T"
        >
          <div className="ToolIcon__icon text-black">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="4" y1="20" x2="7" y2="20"></line>
                <line x1="14" y1="20" x2="21" y2="20"></line>
                <line x1="6.9" y1="15" x2="13.8" y2="15"></line>
                <line x1="10.2" y1="6.3" x2="16" y2="20"></line>
                <polyline points="5 20 11 4 13 4 20 20"></polyline>
              </g>
            </svg>
          </div>
        </label>
      </div>
      <div>
        <label
          className="hover:bg-[#F1F0FE] rounded-lg h-[36px] w-[36px] flex justify-center items-center cursor-pointer"
          title="Image"
        >
          <div className="ToolIcon__icon text-black">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 20 20"
              className="size-[16px]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.25">
                <path d="M12.5 6.667h.01"></path>
                <path d="M4.91 2.625h10.18a2.284 2.284 0 0 1 2.285 2.284v10.182a2.284 2.284 0 0 1-2.284 2.284H4.909a2.284 2.284 0 0 1-2.284-2.284V4.909a2.284 2.284 0 0 1 2.284-2.284Z"></path>
                <path d="m3.333 12.5 3.334-3.333c.773-.745 1.726-.745 2.5 0l4.166 4.166"></path>
                <path d="m11.667 11.667.833-.834c.774-.744 1.726-.744 2.5 0l1.667 1.667"></path>
              </g>
            </svg>
            <span className="ToolIcon__keybinding hidden">9</span>
          </div>
        </label>
      </div>
      <div>
        <label
          className={toolClass("eraser")}
          onClick={() => dispatch(setActiveTool("eraser"))}
          title="Eraser — E"
        >
          <div className="ToolIcon__icon text-black">
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g strokeWidth="1.5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3"></path>
                <path d="M18 13.3l-6.3 -6.3"></path>
              </g>
            </svg>
            <span className="ToolIcon__keybinding hidden">0</span>
          </div>
        </label>
      </div>
      <div>
        <label
          className="hover:bg-[#F1F0FE] rounded-lg h-[36px] w-[36px] flex justify-center items-center cursor-pointer"
          title="Library"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 24 24"
            className="size-[16px] text-black"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g strokeWidth="1.5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12 3l-4 7h8z"></path>
              <path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
              <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
            </g>
          </svg>
        </label>
      </div>
    </div>
  );
}
