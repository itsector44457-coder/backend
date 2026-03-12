import React from "react";
import {
  Flame,
  Zap,
  Swords,
  NotebookPen,
  Settings,
  Trophy,
  CheckCircle2, // Naya icon add kiya
} from "lucide-react";

const Topbar = ({
  currentUserName,
  myField,
  todayDeepSeconds = 0,
  streakCount = 0,
  battlePoints = 0,
  setQuickCaptureOpen,
  resourceDeckEnabled,
  toggleResourceDeck,
  setSettingsOpen,
  // 👇 2 Naye Props Check-in ke liye
  hasCheckedInToday = true,
  onCheckIn,
}) => {
  const formatHours = (sec) => {
    if (!sec || isNaN(sec)) return "0.0h";
    return `${(sec / 3600).toFixed(1)}h`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-md px-4 py-3 xl:px-6 xl:py-5 border-b border-slate-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 xl:gap-4 sticky top-0 z-[90]">
      {/* 1. Commander Identity & Mobile Actions */}
      <div className="flex items-center justify-between w-full xl:w-auto">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="hidden sm:flex w-10 h-10 xl:w-12 xl:h-12 rounded-xl xl:rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center text-slate-400 shrink-0">
            <Zap
              className="text-indigo-600 w-4 h-4 xl:w-5 xl:h-5"
              fill="currentColor"
            />
          </div>
          <div className="min-w-0">
            <h2 className="display font-black text-base sm:text-lg text-slate-900 uppercase italic tracking-tight truncate pr-2">
              Commander: {currentUserName}{" "}
              <span className="inline-block animate-wave">👋</span>
            </h2>
            <p className="text-[8px] sm:text-[9px] text-indigo-500 font-black uppercase tracking-[0.2em] truncate">
              Sector: {myField || "General Studies"}
            </p>
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="flex xl:hidden items-center gap-1.5 shrink-0">
          <button
            onClick={() => setQuickCaptureOpen(true)}
            className="p-2 sm:p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
          >
            <NotebookPen size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 sm:p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 active:rotate-45"
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* 2. Live Stats Engine & Scrollable Mobile Area */}
      <div className="flex items-center gap-2 sm:gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
        {/* Deep Focus */}
        <div className="flex-1 xl:flex-none min-w-[76px] sm:min-w-[90px] px-2 py-1.5 sm:px-4 sm:py-2 bg-slate-50 rounded-xl sm:rounded-[1.2rem] border border-slate-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">
            Deep Focus
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
            {formatHours(todayDeepSeconds)}
          </span>
        </div>

        {/* Rank XP */}
        <div className="flex-1 xl:flex-none min-w-[76px] sm:min-w-[90px] px-2 py-1.5 sm:px-4 sm:py-2 bg-indigo-50 rounded-xl sm:rounded-[1.2rem] border border-indigo-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-[7px] sm:text-[8px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 text-center">
            <Trophy size={10} className="hidden sm:block" /> Rank XP
          </span>
          <span className="text-xs sm:text-sm font-bold text-indigo-600 mt-0.5">
            {battlePoints}{" "}
            <span className="text-[8px] sm:text-[10px]">PTS</span>
          </span>
        </div>

        {/* 🔥 STREAK & DAILY CHECK-IN BUTTON (Magic Here) */}
        <div
          onClick={() => !hasCheckedInToday && onCheckIn && onCheckIn()}
          className={`flex-1 xl:flex-none min-w-[76px] sm:min-w-[100px] px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-[1.2rem] border flex flex-col items-center justify-center shrink-0 transition-all duration-300
            ${
              hasCheckedInToday
                ? "bg-orange-50 border-orange-100 cursor-default" // Normal State (Checked-in)
                : "bg-gradient-to-br from-orange-100 to-amber-50 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)] cursor-pointer hover:scale-105 active:scale-95 animate-pulse" // Action State (Pending)
            }
          `}
        >
          <span
            className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest flex items-center gap-1 text-center transition-colors
            ${hasCheckedInToday ? "text-orange-400" : "text-orange-600"}
          `}
          >
            {hasCheckedInToday ? (
              <Flame
                size={10}
                fill="currentColor"
                className="hidden sm:block text-orange-400"
              />
            ) : (
              <Zap
                size={10}
                fill="currentColor"
                className="hidden sm:block text-orange-500 animate-bounce"
              />
            )}
            {hasCheckedInToday ? "Mastery" : "Claim Streak!"}
          </span>
          <span
            className={`text-xs sm:text-sm font-bold mt-0.5 flex items-center gap-1
            ${hasCheckedInToday ? "text-orange-600" : "text-orange-700"}
          `}
          >
            {streakCount} D
            {hasCheckedInToday && (
              <CheckCircle2 size={12} className="text-emerald-500" />
            )}
          </span>
        </div>

        {/* Mobile Resource Toggle */}
        <button
          onClick={toggleResourceDeck}
          className={`xl:hidden shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all h-full ${
            resourceDeckEnabled
              ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
              : "bg-slate-50 border-slate-100 text-slate-400"
          }`}
        >
          Mod {resourceDeckEnabled ? "On" : "Off"}
        </button>

        {/* 3. Global Quick Actions (Desktop Only) */}
        <div className="hidden xl:flex items-center gap-2 pl-4 ml-2 border-l border-slate-100 shrink-0">
          <button
            onClick={() => setQuickCaptureOpen(true)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
          >
            <NotebookPen size={18} />
          </button>

          <button
            onClick={toggleResourceDeck}
            className={`px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              resourceDeckEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
                : "bg-slate-50 border-slate-100 text-slate-400"
            }`}
          >
            Module {resourceDeckEnabled ? "Active" : "Off"}
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 active:rotate-45"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
