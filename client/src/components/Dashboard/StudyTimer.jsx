import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Play,
  Pause,
  Square,
  Swords,
  Loader2,
  ExternalLink, // 🔥 NEW ICON FOR PiP
} from "lucide-react";

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

  // 🔥 PiP Window Reference
  const pipWindowRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;
  const battleActive = battle?.status === "active";
  const opponent =
    String(battle?.challengerId?._id) === String(myId)
      ? battle?.opponentId
      : battle?.challengerId;

  // ============================
  // 🕒 FORMAT TIME FUNCTION
  // ============================
  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
  };

  // ============================
  // 🚀 PiP WINDOW SYNC
  // ============================
  // Jab bhi 'seconds' update ho, PiP window ka time bhi update karo
  useEffect(() => {
    if (pipWindowRef.current && pipWindowRef.current.document) {
      const timeElement =
        pipWindowRef.current.document.getElementById("pip-time");
      if (timeElement) {
        timeElement.innerText = formatTime(seconds);
      }
    }
  }, [seconds]);

  // ============================
  // 🪟 OPEN FLOATING TIMER (PiP)
  // ============================
  const openFloatingTimer = async () => {
    if (!("documentPictureInPicture" in window)) {
      return alert(
        "Bhai, tumhara browser is feature ko support nahi karta. Chrome update karo!",
      );
    }

    try {
      // Create PiP Window
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 300,
        height: 150,
      });

      pipWindowRef.current = pipWindow;

      // Inject UI inside the floating window
      pipWindow.document.body.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          background: #0f172a; 
          color: #fff; 
          font-family: system-ui, sans-serif;
          margin: 0;
          overflow: hidden;
        ">
          <div style="font-size: 10px; color: #818cf8; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px; font-weight: 900;">
            ⚡ Skill Vault
          </div>
          <div id="pip-time" style="font-size: 48px; font-weight: 900; letter-spacing: 2px; color: #10b981; font-variant-numeric: tabular-nums;">
            ${formatTime(seconds)}
          </div>
        </div>
      `;

      // Agar user ne galti se choti window band kar di
      pipWindow.addEventListener("pagehide", () => {
        pipWindowRef.current = null;
      });
    } catch (error) {
      console.error("PiP failed", error);
    }
  };

  // ============================
  // 💾 SAVE SESSION DATA
  // ============================
  const handleFinalSave = async (isTermination) => {
    if (seconds < 1) return alert("Bhai, thoda toh padh lo! 😂");
    try {
      setSaving(true);
      const payload = {
        userId: myId,
        duration: seconds,
        breakReason:
          feedback.reason.trim() ||
          (isTermination ? "Commander Exit" : "System Pause"),
        workDone: feedback.work.trim() || "Deep Study Protocol Completed",
        date: new Date().toISOString().split("T")[0],
        startTime: new Date(Date.now() - seconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        isStrictValid: feedback.work.trim().length > 5,
      };

      await axios.post(
        `https://backend-6hhv.onrender.com/api/sessions/save`,
        payload,
      );

      if (isTermination && battleActive) {
        await onBattleLose({
          battleId: battle._id,
          loserId: myId,
          reason: "Session Terminated",
        });
      }

      onSessionSaved(seconds);
      setShowModal(false);
      setFeedback({ reason: "", work: "" });

      // Agar PiP khuli hui thi toh band kar do
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

  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 p-5 sm:p-8 shadow-sm transition-all duration-300">
      {/* 1. Top Section (Timer & Battle Status) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
              Neural Mission Clock
            </h3>
            {/* 🔥 NEW PIP BUTTON */}
            <button
              onClick={openFloatingTimer}
              title="Pop out Floating Timer"
              className="text-indigo-400 hover:text-indigo-600 bg-indigo-50 p-1.5 rounded-lg transition-colors active:scale-95"
            >
              <ExternalLink size={14} />
            </button>
          </div>
          <div className="text-5xl sm:text-6xl font-black text-indigo-600 font-mono italic tracking-tighter leading-none">
            {formatTime(seconds)}
          </div>
        </div>

        {battleActive && (
          <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center gap-2 self-start sm:self-auto">
            <Swords
              size={16}
              className="text-rose-500 animate-pulse sm:w-[18px] sm:h-[18px]"
            />
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-rose-600 italic">
              Vs {opponent?.name}
            </span>
          </div>
        )}
      </div>

      {/* 2. Controls Section */}
      <div className="flex gap-2 sm:gap-3">
        {!isActive ? (
          <button
            onClick={() => setIsActive(true)}
            className="flex-1 bg-indigo-600 text-white py-4 sm:py-5 rounded-xl sm:rounded-[2rem] font-black uppercase italic text-[10px] sm:text-xs shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.98] transition-all"
          >
            <Play
              size={16}
              fill="currentColor"
              className="sm:w-[18px] sm:h-[18px]"
            />{" "}
            {seconds > 0 ? "Resume" : "Initiate"}
          </button>
        ) : (
          <button
            onClick={() => {
              setIsActive(false);
              setShowModal(true);
              setModalMode("pause");
            }}
            className="flex-1 bg-amber-500 text-white py-4 sm:py-5 rounded-xl sm:rounded-[2rem] font-black uppercase italic text-[10px] sm:text-xs shadow-lg shadow-amber-100 flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.98] transition-all"
          >
            <Pause
              size={16}
              fill="currentColor"
              className="sm:w-[18px] sm:h-[18px]"
            />{" "}
            System Pause
          </button>
        )}

        {(isActive || seconds > 0) && (
          <button
            onClick={() => {
              setIsActive(false);
              setShowModal(true);
              setModalMode("terminate");
            }}
            className="w-14 sm:w-20 bg-rose-500 text-white rounded-xl sm:rounded-[2rem] flex items-center justify-center shadow-lg shadow-rose-100 active:scale-[0.98] transition-all shrink-0"
          >
            <Square
              size={18}
              fill="currentColor"
              className="sm:w-[20px] sm:h-[20px]"
            />
          </button>
        )}
      </div>

      {/* 3. Mission Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-md rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <h4 className="text-lg sm:text-xl font-black text-slate-800 uppercase italic mb-4 sm:mb-6">
              Log Mission Data
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <input
                placeholder="Break Reason..."
                className="w-full bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-100"
                onChange={(e) =>
                  setFeedback({ ...feedback, reason: e.target.value })
                }
              />
              <textarea
                placeholder="Work Achieved..."
                className="w-full bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-20 sm:h-24 resize-none border border-slate-100"
                onChange={(e) =>
                  setFeedback({ ...feedback, work: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={() => handleFinalSave(modalMode === "terminate")}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs active:scale-[0.98] transition-transform"
              >
                {saving ? (
                  <Loader2 className="animate-spin mx-auto w-4 h-4 sm:w-5 sm:h-5" />
                ) : modalMode === "terminate" ? (
                  "Terminate"
                ) : (
                  "Save Log"
                )}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (modalMode === "pause") setIsActive(true);
                }}
                className="flex-1 bg-slate-100 text-slate-600 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs hover:bg-slate-200 transition-colors active:scale-[0.98]"
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
