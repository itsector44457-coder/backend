import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Play,
  Pause,
  Square,
  Swords,
  Loader2,
  ExternalLink,
} from "lucide-react";

const STORAGE_KEY = "skillvault_timer";

// ── localStorage helpers ──────────────────────────────────────
const saveToStorage = (data) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

const clearStorage = () => localStorage.removeItem(STORAGE_KEY);

// ─────────────────────────────────────────────────────────────

const StudyTimer = ({
  isActive,
  setIsActive,
  seconds,
  setSeconds,
  onSessionSaved,
  battle,
  onBattleLose,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("pause");
  const [feedback, setFeedback] = useState({ reason: "", work: "" });
  const [saving, setSaving] = useState(false);

  // ── Refs ──────────────────────────────────────────────────
  const workerRef = useRef(null); // Web Worker
  const startTimeRef = useRef(null); // Epoch ms jab timer shuru hua
  const startDateRef = useRef(null); // "YYYY-MM-DD" jab timer shuru hua (midnight fix)
  const hiddenTimeRef = useRef(null); // Epoch ms jab tab hide hua
  const pipWindowRef = useRef(null); // PiP window ref

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;
  const battleActive = battle?.status === "active";
  const opponent =
    String(battle?.challengerId?._id) === String(myId)
      ? battle?.opponentId
      : battle?.challengerId;

  // ── Format HH:MM:SS ──────────────────────────────────────
  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
  };

  // ── LAYER 1: Web Worker ───────────────────────────────────
  // Alag thread mein chalta hai — browser throttle nahi karta
  useEffect(() => {
    const worker = new Worker("/timerWorker.js");
    workerRef.current = worker;

    worker.onmessage = () => {
      setSeconds((prev) => {
        const next = prev + 1;
        const stored = loadFromStorage();
        if (stored?.isRunning) {
          saveToStorage({ ...stored, seconds: next });
        }
        return next;
      });
    };

    return () => worker.terminate();
  }, []);

  // ── LAYER 3: localStorage Recovery on Mount ───────────────
  // Page refresh / crash ke baad timer wapas restore karo
  useEffect(() => {
    const stored = loadFromStorage();
    if (!stored) return;

    if (stored.isRunning && stored.startEpoch) {
      // Missed seconds calculate karo
      const missedSeconds = Math.floor((Date.now() - stored.startEpoch) / 1000);
      const recovered = stored.seconds + missedSeconds;

      setSeconds(recovered);
      setIsActive(true);
      workerRef.current?.postMessage("start");

      // Refs restore karo
      startTimeRef.current = stored.startEpoch;
      startDateRef.current =
        stored.startDate ||
        new Date(stored.startEpoch).toISOString().split("T")[0];
    } else if (!stored.isRunning && stored.seconds > 0) {
      // Paused state restore
      setSeconds(stored.seconds);
      startDateRef.current = stored.startDate || null;
    }
  }, []);

  // ── Start/Stop Worker based on isActive ──────────────────
  useEffect(() => {
    if (isActive) {
      workerRef.current?.postMessage("start");

      // Pehli baar start ho raha hai
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        // ✅ MIDNIGHT FIX: Start wali date capture karo
        startDateRef.current = new Date().toISOString().split("T")[0];
      }

      saveToStorage({
        isRunning: true,
        seconds,
        startEpoch: startTimeRef.current,
        startDate: startDateRef.current, // ✅ Save karo taaki refresh pe bhi mile
      });
    } else {
      workerRef.current?.postMessage("stop");
      saveToStorage({
        isRunning: false,
        seconds,
        startDate: startDateRef.current,
      });
    }
  }, [isActive]);

  // ── LAYER 2: Visibility API ───────────────────────────────
  // Screen off / tab switch — missed time recover karo
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab chhupi — time note karo
        if (isActive) {
          hiddenTimeRef.current = Date.now();
        }
      } else {
        // Tab wapas aayi — missed seconds add karo
        if (isActive && hiddenTimeRef.current) {
          const missedMs = Date.now() - hiddenTimeRef.current;
          const missedSeconds = Math.floor(missedMs / 1000);
          hiddenTimeRef.current = null;

          if (missedSeconds > 0) {
            setSeconds((prev) => {
              const next = prev + missedSeconds;
              saveToStorage({
                isRunning: true,
                seconds: next,
                startEpoch: startTimeRef.current,
                startDate: startDateRef.current,
              });
              return next;
            });
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive]);

  // ── PiP Sync ──────────────────────────────────────────────
  useEffect(() => {
    if (pipWindowRef.current?.document) {
      const el = pipWindowRef.current.document.getElementById("pip-time");
      if (el) el.innerText = formatTime(seconds);
    }
  }, [seconds]);

  // ── Open Floating Timer ───────────────────────────────────
  const openFloatingTimer = async () => {
    if (!("documentPictureInPicture" in window)) {
      return alert("Chrome 116+ required for floating timer!");
    }
    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 280,
        height: 140,
      });
      pipWindowRef.current = pipWindow;
      pipWindow.document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;justify-content:center;
          align-items:center;height:100vh;background:#ffffff;color:#0f172a;
          font-family:system-ui,sans-serif;margin:0;overflow:hidden;">
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;
            letter-spacing:1px;margin-bottom:4px;font-weight:600;">
            Study Focus
          </div>
          <div id="pip-time" style="font-size:40px;font-weight:700;color:#4f46e5;
            font-variant-numeric:tabular-nums;letter-spacing:-1px;">
            ${formatTime(seconds)}
          </div>
        </div>`;
      pipWindow.addEventListener("pagehide", () => {
        pipWindowRef.current = null;
      });
    } catch (err) {
      console.error("PiP failed:", err);
    }
  };

  // ── Save Session ──────────────────────────────────────────
  const handleFinalSave = async (isTermination) => {
    if (seconds < 1) return alert("Bhai thoda toh padh lo! 😂");

    // 24 ghante se zyada — warn karo par save karo
    if (seconds > 86400) {
      const confirm = window.confirm(
        "Bhai 24 ghante se zyada?! Neend nahi aayi? Save kar dete hain! 😭",
      );
      if (!confirm) return;
    }

    try {
      setSaving(true);

      // ✅ MIDNIGHT FIX: startDate use karo — save wali date nahi
      const sessionDate =
        startDateRef.current || new Date().toISOString().split("T")[0];

      await axios.post("https://backend-6hhv.onrender.com/api/sessions/save", {
        userId: myId,
        duration: seconds,
        breakReason:
          feedback.reason.trim() ||
          (isTermination ? "Commander Exit" : "System Pause"),
        workDone: feedback.work.trim() || "Deep Study Protocol Completed",
        date: sessionDate, // ✅ 11 PM shuru → date = us din ki, chahe 3 AM ko save karo
        startTime: new Date(Date.now() - seconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        isStrictValid: feedback.work.trim().length > 5,
      });

      if (isTermination && battleActive) {
        await onBattleLose({
          battleId: battle._id,
          loserId: myId,
          reason: "Session Terminated",
        });
      }

      // ── Full Cleanup ──
      onSessionSaved(seconds);
      setSeconds(0);
      setIsActive(false);
      startTimeRef.current = null;
      startDateRef.current = null;
      hiddenTimeRef.current = null;
      clearStorage();
      workerRef.current?.postMessage("stop");

      setShowModal(false);
      setFeedback({ reason: "", work: "" });

      if (pipWindowRef.current) {
        pipWindowRef.current.close();
        pipWindowRef.current = null;
      }

      alert("Session Synced to Hub! 🚀");
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || "Server Error"}`);
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Focus Timer
            </h3>
            <button
              onClick={openFloatingTimer}
              title="Pop out Floating Timer"
              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"
            >
              <ExternalLink size={14} />
            </button>

            {/* Live indicator */}
            {isActive && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                LIVE
              </span>
            )}
          </div>

          <div className="text-4xl sm:text-5xl font-bold text-slate-800 font-mono tracking-tight leading-none">
            {formatTime(seconds)}
          </div>

          {/* ✅ Start date dikhao — user ko pata rahe */}
          {startDateRef.current && (
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              Started: {startDateRef.current}
            </div>
          )}
        </div>

        {battleActive && (
          <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-2 self-start sm:self-auto">
            <Swords size={14} className="text-rose-500" />
            <span className="text-xs font-semibold text-rose-600">
              Vs {opponent?.name}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isActive ? (
          <button
            onClick={() => setIsActive(true)}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            {seconds > 0 ? "Resume" : "Start Focus"}
          </button>
        ) : (
          <button
            onClick={() => {
              setIsActive(false);
              setShowModal(true);
              setModalMode("pause");
            }}
            className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
          >
            <Pause size={16} fill="currentColor" />
            Pause
          </button>
        )}

        {(isActive || seconds > 0) && (
          <button
            onClick={() => {
              setIsActive(false);
              setShowModal(true);
              setModalMode("terminate");
            }}
            className="w-14 sm:w-16 bg-white text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors shrink-0"
            title="Stop & Save"
          >
            <Square size={16} fill="currentColor" />
          </button>
        )}
      </div>

      {/* Save Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <h4 className="text-lg font-bold text-slate-800 mb-1">
              {modalMode === "terminate" ? "End Session" : "Pause Session"}
            </h4>

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-3 mb-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Time Logged
                </p>
                <p className="text-lg font-bold text-indigo-600 font-mono">
                  {formatTime(seconds)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Session Date
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {/* ✅ Start date dikhao — midnight cross hua ho toh bhi sahi */}
                  {startDateRef.current ||
                    new Date().toISOString().split("T")[0]}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                placeholder="Why stopping? (e.g., Break, Done)"
                className="w-full bg-slate-50 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200"
                onChange={(e) =>
                  setFeedback({ ...feedback, reason: e.target.value })
                }
              />
              <textarea
                placeholder="What did you work on?"
                className="w-full bg-slate-50 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none border border-slate-200"
                onChange={(e) =>
                  setFeedback({ ...feedback, work: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleFinalSave(modalMode === "terminate")}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors flex justify-center items-center"
              >
                {saving ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Save Log"
                )}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (modalMode === "pause") setIsActive(true);
                }}
                className="flex-1 bg-white text-slate-600 border border-slate-200 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
