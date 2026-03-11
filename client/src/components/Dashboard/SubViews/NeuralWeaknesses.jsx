import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  ChevronLeft,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import axios from "axios";

const NeuralWeaknesses = ({ onBack, currentUserId }) => {
  const [weaknesses, setWeaknesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeaknesses = async () => {
      // 1. Check karo ki ID valid hai ya nahi
      if (!currentUserId || currentUserId === "undefined") {
        setLoading(false);
        setError("User ID not synced yet. Please re-login.");
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${currentUserId}/weaknesses`,
        );
        setWeaknesses(res.data || []);
        setError(null);
      } catch (err) {
        console.error("Neural fetch error:", err);
        setError("Failed to sync neural data. Check server connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeaknesses();
  }, [currentUserId]);

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-sm h-full flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3">
          <BrainCircuit className="text-amber-600 w-5 h-5 md:w-6 md:h-6" />
          <h3 className="display font-black text-lg md:text-xl italic uppercase text-amber-600">
            Neural Gaps
          </h3>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[10px] md:text-xs font-black uppercase text-slate-400 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft size={14} className="md:w-4 md:h-4" /> Hub
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          // --- LOADING STATE ---
          <div className="flex flex-col items-center justify-center h-40 md:h-48">
            <Loader2 className="animate-spin text-amber-500 mb-2" size={28} />
            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Syncing Neural Map...
            </p>
          </div>
        ) : error ? (
          // --- ERROR STATE ---
          <div className="bg-rose-50 border border-rose-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-center">
            <p className="text-rose-600 font-bold text-[11px] md:text-xs">
              {error}
            </p>
          </div>
        ) : weaknesses.length === 0 ? (
          // --- EMPTY STATE (Ideal for Weaknesses) ---
          <div className="text-center py-16 md:py-20 bg-emerald-50/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-emerald-100 px-4">
            <p className="text-emerald-700 font-black italic text-base md:text-lg uppercase">
              System Clear! 🏆
            </p>
            <p className="text-slate-500 text-[11px] md:text-xs mt-2 font-medium">
              No critical neural gaps detected in your domain.
            </p>
          </div>
        ) : (
          // --- DATA GRID ---
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pb-6">
            {weaknesses.map((item, i) => (
              <div
                key={i}
                className="p-5 md:p-8 bg-[#fffcf0] border border-amber-100 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
              >
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="text-amber-500 w-20 h-20 md:w-[100px] md:h-[100px]" />
                </div>

                <p className="font-black text-[8px] md:text-[9px] text-amber-700 uppercase mb-1 tracking-widest relative z-10">
                  {item.subject}
                </p>
                <h4 className="font-bold text-slate-800 text-base md:text-lg mb-4 md:mb-5 italic uppercase relative z-10 leading-tight">
                  {item.topic}
                </h4>

                <div className="space-y-2 relative z-10 mt-auto">
                  <div className="w-full h-1.5 md:h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-wide">
                      Accuracy: {item.accuracy}%
                    </span>
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Critical Sync
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralWeaknesses;
