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
} from "lucide-react";

const API_MOCK_HISTORY = `${import.meta.env.VITE_API_URL}/api/mock/history`;

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
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-[#0f1221] border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic leading-none tracking-widest">
                    Combat History
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                    {topic?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loading ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase animate-pulse">
                  Scanning Vault Archives...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <Target size={40} className="mx-auto mb-3 text-slate-500" />
                  <p className="text-sm font-bold text-white uppercase tracking-widest">
                    No Combat Record Found
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">
                    You haven't attempted this node yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record, idx) => {
                    const passMark = record.totalQuestions * 10 * 0.8;
                    const isPassed = record.score >= passMark;

                    return (
                      <div
                        key={record._id}
                        className="bg-slate-900/80 border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isPassed ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-rose-500/50 bg-rose-500/10 text-rose-400"}`}
                          >
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-black text-lg">
                                {record.score}{" "}
                                <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">
                                  / {record.totalQuestions * 10} XP
                                </span>
                              </span>
                              {isPassed ? (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md uppercase font-black">
                                  Passed
                                </span>
                              ) : (
                                <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-md uppercase font-black">
                                  Failed
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={12} />{" "}
                                {record.correctAnswers} Right
                              </span>
                              <span className="text-rose-400 flex items-center gap-1">
                                <XCircle size={12} /> {record.wrongAnswers}{" "}
                                Wrong
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 font-bold uppercase tracking-widest flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} />{" "}
                            {new Date(record.createdAt).toLocaleDateString()}
                          </span>
                          <span className="opacity-60">
                            {new Date(record.createdAt).toLocaleTimeString()}
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
