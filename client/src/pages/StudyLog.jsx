import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, Clock3, Loader2, History, XCircle } from "lucide-react";

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
    // Wrapper ki padding aur corner radius kam ki hai
    <div
      className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 ${
        fullPage ? "h-[calc(100vh-220px)] flex flex-col" : ""
      }`}
    >
      {/* Header ko simple aur clean rakha hai */}
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-base">
        <History className="text-indigo-500" size={18} />
        Session History
      </h3>

      {/* 🟢 PREMIUM FILTER BAR - Compact layout */}
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
                  {date}
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

      {/* 📜 LOGS LIST */}
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
          {visibleDates.map((date) => (
            <div key={date} className="relative">
              {/* Sticky Date Header - sleek minimal style */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-1.5 z-10 mb-2 border-b border-slate-50">
                <span className="text-xs font-semibold text-slate-400">
                  {date}
                </span>
              </div>

              {/* Compact List Items instead of heavy grids */}
              <div className="space-y-2">
                {logs[date].map((session) => (
                  <div
                    key={session._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-indigo-100 transition-colors gap-2"
                  >
                    {/* Left Side: Topic & Reason */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {session.workDone || "Deep Work Session"}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {session.breakReason || "Completed"}
                      </p>
                    </div>

                    {/* Right Side: Time & Duration */}
                    <div className="flex items-center gap-3 sm:gap-4 sm:justify-end shrink-0">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock3 size={12} />
                        {new Date(session.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-center min-w-[60px]">
                        {formatDuration(session.duration)}
                      </span>
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
