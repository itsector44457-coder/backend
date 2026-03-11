import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  History,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const BattleHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/combat-history/${userId}`,
        );
        setHistory(res.data);
      } catch (err) {
        console.error("History fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchHistory();
  }, [userId]);

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-10 px-4 md:px-8">
      <div className="mb-6 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter flex items-center gap-2 md:gap-3 mb-2">
          <History className="text-indigo-500 w-8 h-8 md:w-10 md:h-10" /> Combat
          Records
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
          Your past performance and battle logs.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs animate-pulse">
          Accessing Matrix Vault...
        </p>
      ) : history.length === 0 ? (
        <div className="text-center py-16 md:py-20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[1.5rem] md:rounded-[2rem]">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs px-4">
            No combat records found. Go fight in the Arena!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {history.map((record) => (
            <div
              key={record._id}
              className={`bg-white dark:bg-slate-900 border p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                record.isCheated
                  ? "border-rose-500/50 shadow-rose-500/10"
                  : "dark:border-white/5 border-slate-200"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  {record.isCheated ? (
                    <span className="bg-rose-500/10 text-rose-500 px-2.5 py-1 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-rose-500/20 flex items-center gap-1">
                      <AlertTriangle size={10} /> Disqualified
                    </span>
                  ) : record.percentage >= 50 ? (
                    <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Victory
                    </span>
                  ) : (
                    <span className="bg-orange-500/10 text-orange-500 px-2.5 py-1 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-orange-500/20 flex items-center gap-1">
                      <ShieldAlert size={10} /> Defeat
                    </span>
                  )}

                  <span className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 text-right">
                    <Calendar size={10} className="shrink-0" />{" "}
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-5 md:mb-6 leading-tight line-clamp-2">
                  {record.examTitle}
                </h3>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Score
                  </p>
                  <p
                    className={`text-xl md:text-2xl font-black ${
                      record.isCheated ? "text-rose-500" : "text-indigo-500"
                    }`}
                  >
                    {record.score}/{record.totalQuestions}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Accuracy
                  </p>
                  <p className="text-lg md:text-xl font-black text-slate-800 dark:text-white">
                    {record.percentage}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BattleHistory;
