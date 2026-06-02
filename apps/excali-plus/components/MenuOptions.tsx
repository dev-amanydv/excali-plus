"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setTheme } from "@/store/slices/uiSlice";
import { clearCanvas } from "@/store/slices/canvasSlice";
import { useRouter } from "next/navigation";

const Icons = {
  Hamburger: () => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Folder: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Export: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Bolt: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Help: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Excalidraw: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93A10 10 0 1 0 4.93 19.07" />
      <path d="M15.54 8.46a5 5 0 1 0-7.07 7.07" />
    </svg>
  ),
  GitHub: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.58 9.58 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Discord: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  ),
  SignUp: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  ),
  Sliders: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <line x1="8" y1="3" x2="8" y2="9" />
      <line x1="16" y1="9" x2="16" y2="15" />
    </svg>
  ),
  Chevron: () => (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Monitor: () => (
    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};


type ThemeType = "light" | "dark";

const CANVAS_BG_COLORS = [
  { color: "#ffffff", border: "#d0cfe8" },
  { color: "#f4f4f4", border: "transparent" },
  { color: "#e8e8e8", border: "transparent" },
  { color: "#fdf6e3", border: "transparent" },
  { color: "#f0ece4", border: "transparent" },
  { color: "#e4ddd4", border: "transparent" },
];


function Divider() {
  return <div className="h-px bg-black/10 dark:bg-white/10 my-1" />;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  purple?: boolean;
  bold?: boolean;
  chevron?: boolean;
  onClick?: () => void;
  inDev?: boolean
}

function MenuItem({ icon, label, shortcut, purple, bold, chevron, onClick, inDev }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3.5 py-[7px] text-sm
        hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-75
        ${purple ? "text-[#6965db]" : "text-gray-800 dark:text-gray-200"}
      `}
    >
      <span className={`w-[22px] h-[22px] flex items-center justify-center shrink-0 ${purple ? "text-[#6965db]" : "text-gray-500 dark:text-gray-400"}`}>
        {icon}
      </span>
      <span className={`flex-1 relative text-left ${bold ? "font-medium" : "font-normal"}`}>
        {label} {inDev && <span className="text-[11px] ml-1 absolute -top-1 text-neutral-500 bg-neutral-100 px-1 rounded border border-neutral-300">soon</span>}
      </span>
      {shortcut && (
        <span className={`text-xs font-mono tracking-tight ${purple ? "text-[#6965db]/80" : "text-gray-400 dark:text-gray-500"}`}>
          {shortcut}
        </span>
      )}
      {chevron && (
        <span className="text-gray-400 dark:text-gray-500 ml-1">
          <Icons.Chevron />
        </span>
      )}
    </button>
  );
}


export default function ExcalidrawMenu() {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((s) => s.ui.theme);
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [selectedBg, setSelectedBg] = useState(0);

  const handleClearCanvas = () => {
    if (confirm("This will clear the canvas. Are you sure?")) {
      dispatch(clearCanvas());
      setOpen(false);
    }
  };

  const handleCanvasBackground = (color: string) => {
    const canvas = window.document.getElementById("canvas");
    if (!canvas) return;
    canvas.style.backgroundColor = color
  }

  const handleTheme = (t: ThemeType) => {
    dispatch(setTheme(t));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Main menu"
      >
        <Icons.Hamburger />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute top-12 left-0 w-[300px] bg-white dark:bg-gray-900 border border-black/10 dark:border-white/10 rounded-xl z-50 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">

            <div className="py-1.5">
              <MenuItem icon={<Icons.Folder />}  label="Open"         inDev={true}      shortcut="Cmd+O" />
              <MenuItem icon={<Icons.Save />}    label="Save to..." />
              <MenuItem icon={<Icons.Export />}  label="Export image..."     shortcut="Cmd+Shift+E" />
              <MenuItem icon={<Icons.Users />}   label="Live collaboration..." />
            </div>

            <Divider />

            <div className="py-1.5">
              <MenuItem icon={<Icons.Bolt />}   label="Command palette" inDev={true} shortcut="Cmd+/" purple bold />
              <MenuItem icon={<Icons.Search />} label="Find on canvas" inDev={true}  shortcut="Cmd+F" />
            </div>

            <Divider />

            <div className="py-1.5">
              <MenuItem icon={<Icons.Help />}  label="Help"             shortcut="?" inDev={true}/>
              <MenuItem icon={<Icons.Trash />} label="Reset the canvas" onClick={handleClearCanvas} />
            </div>

            <Divider />

            <div className="py-1.5">
              <MenuItem icon={<Icons.Excalidraw />} onClick={() => router.push('/')} label="Know more!" />
              <MenuItem icon={<Icons.GitHub />} onClick={() => window.open("https://github.com/dev-amanydv/excali-plus", "_blank", "noopener,noreferrer")}     label="GitHub" />
              <MenuItem icon={<Icons.Twitter />} onClick={() => window.open("https://x.com/amandoestwt", "_blank", "noopener,noreferrer")}    label="Follow us" />
            </div>

            <Divider />

            <div className="py-1.5">
              <MenuItem icon={<Icons.SignUp />} label="Sign up" purple bold inDev={true} />
            </div>

            <Divider />

            <div className="py-1.5">
              <MenuItem icon={<Icons.Sliders />} label="Preferences" chevron inDev={true} />

              <div className="flex items-center px-3.5 py-1.5 text-sm text-gray-800 dark:text-gray-200">
                <span className="flex-1">Theme</span>
                <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                  {(["light", "dark"] as ThemeType[]).map((t, i) => (
                    <button
                      key={t}
                      onClick={() => handleTheme(t)}
                      className={`
                        w-[30px] h-[28px] rounded-md flex items-center justify-center transition-colors
                        ${currentTheme === t
                          ? "bg-[#6965db] text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }
                      `}
                      aria-label={t}
                    >
                      {t === "light" && <Icons.Sun />}
                      {t === "dark"  && <Icons.Moon />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-3.5 py-1">
                <select className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer appearance-none">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>

              <div className="px-3.5 pt-1 pb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Canvas background</p>
                <div className="flex gap-1.5">
                  {CANVAS_BG_COLORS.map((bg, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedBg(i);
                        handleCanvasBackground(bg.color)
                      }}
                      className={`
                        w-7 h-7 rounded-md transition-all
                        ${selectedBg === i
                          ? "ring-2 ring-[#6965db] ring-offset-1"
                          : "ring-1 ring-black/10 dark:ring-white/10 hover:ring-black/20"
                        }
                      `}
                      style={{ backgroundColor: bg.color }}
                      aria-label={`Canvas background ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}