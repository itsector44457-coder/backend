import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, Clock3, Loader2, History, XCircle } from "lucide-react";

const StudyLog = ({ refreshKey = 0, fullPage = false }) => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("ALL"); // Default to ALL

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

  // Sort dates descending (newest first)
  const dates = useMemo(
    () => Object.keys(logs).sort((a, b) => new Date(b) - new Date(a)),
    [logs],
  );

  const formatDuration = (duration = 0) => {
    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // 🚀 FIX 2: Better Filtering Logic (Support for 'ALL')
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

  return (
    <div
      className={`bg-white rounded-[2rem] border border-slate-100 p-5 sm:p-6 shadow-sm ${
        fullPage ? "h-[calc(100vh-220px)] flex flex-col" : ""
      }`}
    >
      <h3
        className={`font-black text-slate-800 mb-5 flex items-center gap-2 ${
          fullPage
            ? "text-lg uppercase tracking-[0.1em]"
            : "text-sm uppercase tracking-[0.15em]"
        }`}
      >
        <History className="text-indigo-500" size={fullPage ? 24 : 18} />
        Session History
      </h3>

      {/* 🟢 PREMIUM FILTER BAR (Visible only in Full Page mode) */}
      {fullPage && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <CalendarDays size={18} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Filter by Date
              </p>
              {/* 🚀 FIX 3: Safe Dropdown instead of input type="date" */}
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer mt-0.5"
              >
                <option value="ALL">All Time History</option>
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-right bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black">
              Total Time {selectedDate !== "ALL" && "on this day"}
            </p>
            {/* 🚀 FIX 1: Proper Hours and Minutes Format */}
            <p className="text-base font-black text-indigo-600">
              {formatDuration(totalSecondsForVisibleDates)}
            </p>
          </div>
        </div>
      )}

      {/* 📜 LOGS LIST */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500 mb-3" size={30} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Loading Vault Data...
          </p>
        </div>
      ) : visibleDates.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center opacity-50">
          <XCircle size={40} className="text-slate-300 mb-3" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            No sessions recorded yet.
          </p>
        </div>
      ) : (
        <div
          className={`space-y-6 pr-2 no-scrollbar scroll-smooth ${
            fullPage
              ? "flex-1 overflow-y-auto"
              : "max-h-[360px] overflow-y-auto"
          }`}
        >
          {visibleDates.map((date) => (
            <div key={date} className="relative">
              {/* Sticky Date Header for smooth scrolling feel */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-10 mb-2">
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border border-slate-200">
                  {date}
                </span>
              </div>

              <div className="space-y-3">
                {logs[date].map((session) => (
                  <div
                    key={session._id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50 hover:border-indigo-100 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/60">
                      <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100/50">
                        {formatDuration(session.duration)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                        <Clock3 size={12} className="text-indigo-400" />
                        {new Date(session.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          Focus Target
                        </p>
                        <p className="text-xs font-semibold text-slate-700 bg-white p-2 rounded-xl border border-slate-100 truncate">
                          {session.workDone || "Deep Work Session"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          Break Reason
                        </p>
                        <p className="text-xs font-semibold text-slate-700 bg-white p-2 rounded-xl border border-slate-100 truncate">
                          {session.breakReason || "Completed"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyLog;
