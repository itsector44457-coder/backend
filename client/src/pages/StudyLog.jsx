import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, Clock3, Loader2 } from "lucide-react";

const StudyLog = ({ refreshKey = 0, fullPage = false }) => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

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
          `${import.meta.env.VITE_API_URL}/api/sessions/${myId}`,
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
    () => Object.keys(logs).sort((a, b) => b.localeCompare(a)),
    [logs],
  );

  useEffect(() => {
    if (!fullPage) {
      setSelectedDate("");
      return;
    }

    if (dates.length === 0) {
      setSelectedDate("");
      return;
    }

    if (!selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dates, fullPage, selectedDate]);

  const formatDuration = (duration = 0) => {
    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const visibleDates =
    fullPage && selectedDate ? dates.filter((d) => d === selectedDate) : dates;

  const totalSecondsForVisibleDates = visibleDates.reduce((sum, date) => {
    return (
      sum +
      (logs[date] || []).reduce(
        (inner, session) => inner + (session.duration || 0),
        0,
      )
    );
  }, 0);

  const totalMinutesForVisibleDates = Math.floor(
    totalSecondsForVisibleDates / 60,
  );

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 p-5 shadow-sm ${
        fullPage ? "h-[calc(100vh-220px)] flex flex-col" : ""
      }`}
    >
      <h3
        className={`font-black text-slate-500 mb-4 ${
          fullPage
            ? "text-base uppercase tracking-[0.14em]"
            : "text-sm uppercase tracking-[0.18em]"
        }`}
      >
        Session History
      </h3>

      {fullPage && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1">
              <CalendarDays size={13} /> Calendar Filter
            </p>
            <p className="text-sm text-slate-700 font-semibold">
              {selectedDate || "No date selected"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 bg-white"
            />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Total
              </p>
              <p className="text-sm font-black text-indigo-700">
                {totalMinutesForVisibleDates} mins
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="animate-spin text-indigo-600" />
        </div>
      ) : visibleDates.length === 0 ? (
        <p className="text-sm text-slate-400 font-medium">No sessions yet.</p>
      ) : (
        <div
          className={`space-y-5 pr-1 ${
            fullPage
              ? "flex-1 overflow-y-auto"
              : "max-h-[360px] overflow-y-auto"
          }`}
        >
          {visibleDates.map((date) => (
            <div key={date}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                {date}
              </p>
              <div className="space-y-2">
                {logs[date].map((session) => (
                  <div
                    key={session._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black text-indigo-600">
                        {formatDuration(session.duration)}
                      </span>
                      <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                        <Clock3 size={12} />
                        {new Date(session.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <span className="font-semibold">Break:</span>{" "}
                      {session.breakReason}
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      <span className="font-semibold">Work:</span>{" "}
                      {session.workDone}
                    </p>
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
