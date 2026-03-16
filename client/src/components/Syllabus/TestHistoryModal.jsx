import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  X,
  History,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CalendarDays,
  Loader2,
} from "lucide-react";

const API_MOCK_HISTORY = `https://backend-6hhv.onrender.com/api/mock/history`;

const TestHistoryModal = ({ isOpen, onClose, topic, userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && topic && userId) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `${API_MOCK_HISTORY}/${userId}/${topic._id}`,
          );
          setHistory(res.data);
        } catch (err) {
          console.error("Failed to fetch history");
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, topic, userId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 font-sans">
          {/* Soft Light Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Clean White Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* 🟢 HEADER */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 bg-indigo-50 rounded-lg sm:rounded-xl text-indigo-600 shrink-0">
                  <History size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="truncate">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-none">
                    Combat History
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 truncate">
                    Node:{" "}
                    <span className="text-indigo-600">{topic?.title}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* 🟢 BODY */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50 no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    className="animate-spin text-indigo-500 mb-3"
                    size={32}
                  />
                  <p className="text-xs font-medium text-slate-500 tracking-wide">
                    Fetching records...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-70">
                  <Target size={40} className="mb-3 text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">
                    No Records Found
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    You haven't attempted this combat node yet. Step into the
                    arena to begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {history.map((record, idx) => {
                    const passMark = record.totalQuestions * 10 * 0.8;
                    const isPassed = record.score >= passMark;

                    return (
                      <div
                        key={record._id}
                        className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-sm hover:border-indigo-200 transition-all gap-4 sm:gap-0"
                      >
                        {/* Score & Icon Info */}
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${
                              isPassed
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                          >
                            <TrendingUp
                              size={18}
                              className="sm:w-[20px] sm:h-[20px]"
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-slate-800 font-bold text-base sm:text-lg leading-none">
                                {record.score}{" "}
                                <span className="text-xs text-slate-400 font-medium">
                                  / {record.totalQuestions * 10} XP
                                </span>
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider ${
                                  isPassed
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {isPassed ? "Passed" : "Failed"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 size={14} />{" "}
                                {record.correctAnswers} Correct
                              </span>
                              <span className="text-rose-600 flex items-center gap-1">
                                <XCircle size={14} /> {record.wrongAnswers}{" "}
                                Wrong
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 gap-1">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />
                            {new Date(record.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            {new Date(record.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TestHistoryModal;
