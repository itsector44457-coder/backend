import { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Eraser,
  Trash2,
  Minus,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";

// ── Pen sizes ─────────────────────────────────────────────────
const PEN_SIZES = [
  { label: "S", size: 2 },
  { label: "M", size: 5 },
  { label: "L", size: 10 },
];

// ── Colors ────────────────────────────────────────────────────
const COLORS = [
  { hex: "#1e293b", label: "Black" },
  { hex: "#6366f1", label: "Indigo" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#10b981", label: "Green" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#ffffff", label: "White" },
];

// ─────────────────────────────────────────────────────────────

export default function Scratchpad({ defaultOpen = false }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const historyRef = useRef([]); // undo stack
  const redoRef = useRef([]); // redo stack

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [tool, setTool] = useState("pen"); // "pen" | "eraser"
  const [color, setColor] = useState("#1e293b");
  const [penSize, setPenSize] = useState(3);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ── Canvas setup ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // White background
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Restore last drawing if canvas was re-opened
    if (historyRef.current.length > 0) {
      const last = historyRef.current[historyRef.current.length - 1];
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = last;
    }
  }, [isOpen]);

  // ── Save snapshot to history ──────────────────────────────
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toDataURL());
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  // ── Get point from mouse or touch ────────────────────────
  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // ── Draw smooth line ──────────────────────────────────────
  const drawLine = useCallback(
    (from, to) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      ctx.save();
      ctx.scale(1 / dpr, 1 / dpr);
      ctx.scale(dpr, dpr);

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = penSize * 6;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = penSize;
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();
    },
    [tool, color, penSize],
  );

  // ── Pointer events ────────────────────────────────────────
  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      saveSnapshot();
      isDrawingRef.current = true;
      lastPointRef.current = getPoint(e);

      // Draw a dot on single tap
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const pt = lastPointRef.current;
      ctx.beginPath();
      ctx.arc(
        pt.x,
        pt.y,
        tool === "eraser" ? penSize * 3 : penSize / 2,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,0)" : color;
      if (tool === "eraser") ctx.globalCompositeOperation = "destination-out";
      else ctx.globalCompositeOperation = "source-over";
      ctx.fill();
    },
    [saveSnapshot, tool, color, penSize],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const current = getPoint(e);
      drawLine(lastPointRef.current, current);
      lastPointRef.current = current;
    },
    [drawLine],
  );

  const onPointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  // ── Undo ─────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const current = canvas.toDataURL();

    redoRef.current.push(current);
    const prev = historyRef.current.pop();
    setCanRedo(true);
    setCanUndo(historyRef.current.length > 0);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, rect.width, rect.height);

    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = prev;
  }, []);

  // ── Redo ─────────────────────────────────────────────────
  const redo = useCallback(() => {
    if (redoRef.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const next = redoRef.current.pop();

    historyRef.current.push(canvas.toDataURL());
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);

    ctx.clearRect(0, 0, rect.width, rect.height);
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = next;
  }, []);

  // ── Clear ─────────────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveSnapshot();
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [saveSnapshot]);

  // ── Download ──────────────────────────────────────────────
  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "scratchpad.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
      if (e.key === "e") setTool("eraser");
      if (e.key === "p") setTool("pen");
      if (e.key === "Delete" || (e.key === "Backspace" && e.ctrlKey))
        clearCanvas();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, undo, redo, clearCanvas]);

  // ─────────────────────────────────────────────────────────
  return (
    <div className="w-full mt-3">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
          isOpen
            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
            : "bg-white text-slate-500 border-slate-100 hover:border-indigo-300 hover:text-indigo-500"
        }`}
      >
        <Pencil size={13} />
        Scratchpad
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="mt-2 bg-white border-2 border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm animate-in slide-in-from-top-2 duration-200">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-50 flex-wrap bg-slate-50/50">
            {/* Pen / Eraser */}
            <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-0.5">
              <ToolBtn
                active={tool === "pen"}
                onClick={() => setTool("pen")}
                title="Pen (P)"
              >
                <Pencil size={14} />
              </ToolBtn>
              <ToolBtn
                active={tool === "eraser"}
                onClick={() => setTool("eraser")}
                title="Eraser (E)"
              >
                <Eraser size={14} />
              </ToolBtn>
            </div>

            {/* Pen sizes */}
            <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-0.5">
              {PEN_SIZES.map((ps) => (
                <button
                  key={ps.label}
                  onClick={() => setPenSize(ps.size)}
                  title={`Size ${ps.label}`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-[10px] font-black ${
                    penSize === ps.size
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {ps.label}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex gap-1 items-center">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setColor(c.hex);
                    setTool("pen");
                  }}
                  title={c.label}
                  className={`w-5 h-5 rounded-full transition-all border-2 ${
                    color === c.hex && tool === "pen"
                      ? "scale-125 border-indigo-500"
                      : "border-slate-200 hover:scale-110"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Undo / Redo */}
            <div className="flex gap-1">
              <ToolBtn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7v6h6" />
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
              </ToolBtn>
              <ToolBtn onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 7v6h-6" />
                  <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
                </svg>
              </ToolBtn>
            </div>

            {/* Clear */}
            <ToolBtn onClick={clearCanvas} title="Clear All" danger>
              <Trash2 size={14} />
            </ToolBtn>

            {/* Download */}
            <ToolBtn onClick={downloadCanvas} title="Save as PNG">
              <Download size={14} />
            </ToolBtn>
          </div>

          {/* Canvas */}
          <div
            className="relative"
            style={{
              height: "220px",
              cursor: tool === "eraser" ? "cell" : "crosshair",
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none"
              style={{
                display: "block",
                background: "#fafafa",
                // Subtle grid background for numerical work
                backgroundImage:
                  "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            />

            {/* Hint — shown when canvas is empty */}
            {historyRef.current.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 italic">
                  Draw your rough work here...
                </p>
              </div>
            )}
          </div>

          {/* Footer shortcuts hint */}
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-50 flex items-center gap-4 flex-wrap">
            {[
              ["P", "Pen"],
              ["E", "Eraser"],
              ["Ctrl+Z", "Undo"],
              ["Ctrl+Y", "Redo"],
            ].map(([key, label]) => (
              <span
                key={key}
                className="text-[9px] font-black text-slate-300 uppercase tracking-widest"
              >
                <kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-400 mr-1">
                  {key}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Toolbar button helper ─────────────────────────────────────
function ToolBtn({ children, active, onClick, disabled, title, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        disabled
          ? "text-slate-200 cursor-not-allowed"
          : danger
            ? "text-rose-400 hover:bg-rose-50 hover:text-rose-600"
            : active
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
