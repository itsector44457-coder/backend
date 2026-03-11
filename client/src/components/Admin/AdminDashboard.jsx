import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { Loader2, Users, Swords, Zap, Trophy, Target } from "lucide-react";

const AdminDashboard = () => {
  const { adminId } = useOutletContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTestsTaken: 0,
    totalXP: 0,
    domainStats: [],
    topUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/stats`,
          {
            headers: { adminid: adminId },
          },
        );
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [adminId]);

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-white">
        Central Command
      </h2>

      {/* 🟢 TOP 3 MAIN STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Total Commanders
          </p>
          <p className="text-5xl font-black text-white">{stats.totalUsers}</p>
        </div>

        <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Swords size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Total Battles Fought
          </p>
          <p className="text-5xl font-black text-white">
            {stats.totalTestsTaken}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-500/50 p-6 rounded-[2rem] relative overflow-hidden shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <Zap size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">
            Global XP Mined
          </p>
          <p className="text-5xl font-black text-white">{stats.totalXP}</p>
        </div>
      </div>

      {/* 🟢 ANALYTICS GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📊 LEFT: Domain Distribution Matrix */}
        <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest italic text-white">
              Domain Matrix
            </h3>
          </div>

          <div className="space-y-5">
            {stats.domainStats.map((domain, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                  <span className="uppercase tracking-wider">
                    {domain.name}
                  </span>
                  <span className="text-indigo-400">
                    {domain.count} Users ({domain.percentage}%)
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full relative"
                    style={{ width: `${domain.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
            {stats.domainStats.length === 0 && (
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center py-4">
                No Data Available
              </p>
            )}
          </div>
        </div>

        {/* 🏆 RIGHT: Elite Vanguard (Top 3) */}
        <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <Trophy size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest italic text-white">
              Elite Vanguard
            </h3>
          </div>

          <div className="space-y-4">
            {stats.topUsers.map((user, index) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 ${
                      index === 0
                        ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : index === 1
                          ? "bg-slate-300/10 border-slate-300 text-slate-300"
                          : "bg-amber-700/10 border-amber-700 text-amber-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white capitalize text-sm">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      {user.field || "No Domain"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-400 leading-none">
                    {user.battlePoints || 0}
                  </p>
                  <p className="text-[8px] font-bold text-emerald-500/50 uppercase tracking-widest mt-1">
                    XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
