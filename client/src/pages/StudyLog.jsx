import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  Clock3,
  Loader2,
  History,
  XCircle,
  Moon,
  Sun,
  Flame,
} from "lucide-react";

const StudyLog = ({ refreshKey = 0, fullPage = false }) => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("ALL");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    const fetchLogs = async () => {
      if (!myId) {
        setLogs({});
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(
          `https://backend-6hhv.onrender.com/api/sessions/${myId}`,
        );
        setLogs(res.data || {});
      } catch (err) {
        console.error("Study log fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [myId, refreshKey]);

  // ── Dates — latest pehle ──────────────────────────────────
  const dates = useMemo(
    () => Object.keys(logs).sort((a, b) => new Date(b) - new Date(a)),
    [logs],
  );

  // ── Helpers ───────────────────────────────────────────────
  const formatDuration = (duration = 0) => {
    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    const s = duration % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  };

  // ✅ MIDNIGHT FIX: session.date use karo (start date) — createdAt nahi
  // Backend grouped object mein key = session.date hai
  // Agar session.startTime hai toh usse time dikhao
  const formatTime = (isoStr) => {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Raat ko start hua? (9 PM - 5 AM)
  const isNightSession = (isoStr) => {
    if (!isoStr) return false;
    const h = new Date(isoStr).getHours();
    return h >= 21 || h < 5;
  };

  // Midnight cross hua? startTime aur endTime alag din pe hain
  const crossedMidnight = (startIso, endIso) => {
    if (!startIso || !endIso) return false;
    return (
      new Date(startIso).toDateString() !== new Date(endIso).toDateString()
    );
  };

  // Date label — Today / Yesterday / actual date
  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date().toDateString();
    const yest = new Date(Date.now() - 86400000).toDateString();
    if (d.toDateString() === today) return "Today";
    if (d.toDateString() === yest) return "Yesterday";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── Filter ────────────────────────────────────────────────
  const visibleDates =
    fullPage && selectedDate !== "ALL"
      ? dates.filter((d) => d === selectedDate)
      : dates;

  const totalSecondsForVisibleDates = visibleDates.reduce((sum, date) => {
    return (
      sum +
      (logs[date] || []).reduce(
        (inner, session) => inner + (session.duration || 0),
        0,
      )
    );
  }, 0);

  // ─────────────────────────────────────────────────────────
  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 ${
        fullPage ? "h-[calc(100vh-220px)] flex flex-col" : ""
      }`}
    >
      {/* Header */}
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-base">
        <History className="text-indigo-500" size={18} />
        Session History
      </h3>

      {/* Filter Bar */}
      {fullPage && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-indigo-500" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Time</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {formatDateLabel(date)}
                </option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-indigo-600">
              {formatDuration(totalSecondsForVisibleDates)}{" "}
              <span className="text-xs font-normal text-slate-500">total</span>
            </p>
          </div>
        </div>
      )}

      {/* Logs List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center opacity-70">
          <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
          <p className="text-xs font-medium text-slate-500">
            Loading history...
          </p>
        </div>
      ) : visibleDates.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center opacity-50">
          <XCircle size={32} className="text-slate-300 mb-2" />
          <p className="text-sm text-slate-500 font-medium">No sessions yet</p>
        </div>
      ) : (
        <div
          className={`space-y-4 pr-1 no-scrollbar scroll-smooth ${
            fullPage
              ? "flex-1 overflow-y-auto"
              : "max-h-[360px] overflow-y-auto"
          }`}
        >
          {visibleDates.map((date) => {
            const daySessions = logs[date] || [];
            const dayTotal = daySessions.reduce(
              (s, x) => s + (x.duration || 0),
              0,
            );
            const hasNight = daySessions.some((s) =>
              isNightSession(s.startTime),
            );

            return (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-1.5 z-10 mb-2 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {formatDateLabel(date)}
                    </span>
                    {/* Raat wali date badge */}
                    {hasNight && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                        <Moon size={9} />
                        Night
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {formatDuration(dayTotal)}
                  </span>
                </div>

                {/* Session Cards */}
                <div className="space-y-2">
                  {daySessions.map((session) => {
                    const night = isNightSession(session.startTime);
                    const midnight = crossedMidnight(
                      session.startTime,
                      session.endTime,
                    );

                    return (
                      <div
                        key={session._id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors gap-2 ${
                          night
                            ? "border-indigo-100 bg-indigo-50/40 hover:border-indigo-200"
                            : "border-slate-100 bg-white hover:border-indigo-100"
                        }`}
                      >
                        {/* Left: Icon + Info */}
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Night / Day icon */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              night ? "bg-indigo-100" : "bg-amber-50"
                            }`}
                          >
                            {night ? (
                              <Moon size={13} className="text-indigo-500" />
                            ) : (
                              <Sun size={13} className="text-amber-500" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {session.workDone || "Deep Work Session"}
                            </p>

                            {/* Time range */}
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock3 size={11} />
                                {/* ✅ startTime se time dikhao — createdAt se nahi */}
                                {formatTime(session.startTime)}
                                {session.endTime &&
                                  ` → ${formatTime(session.endTime)}`}
                              </span>

                              {/* ✅ Midnight cross badge */}
                              {midnight && (
                                <span className="text-[10px] font-semibold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full">
                                  Crossed Midnight
                                </span>
                              )}
                            </div>

                            {/* Break reason */}
                            {session.breakReason &&
                              session.breakReason !== "System Pause" &&
                              session.breakReason !== "Commander Exit" && (
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {session.breakReason}
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Right: Duration + Deep badge */}
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
                          <span
                            className={`text-sm font-semibold px-2 py-0.5 rounded text-center min-w-[60px] ${
                              night
                                ? "text-indigo-600 bg-indigo-100"
                                : "text-indigo-600 bg-indigo-50"
                            }`}
                          >
                            {formatDuration(session.duration)}
                          </span>

                          {/* Deep Work badge */}
                          {session.isStrictValid && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">
                              <Flame size={9} />
                              Deep
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudyLog;
