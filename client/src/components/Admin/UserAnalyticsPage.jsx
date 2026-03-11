import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft,
  Activity,
  BrainCircuit,
  Target,
  Swords,
  Clock,
  CalendarDays,
  Timer,
  LogIn,
  History,
} from "lucide-react";

const UserAnalyticsPage = () => {
  const { userId } = useParams();
  const { adminId } = useOutletContext();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");

  // 📅 Date Selection State (Default: Aaj ki date)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (userId && adminId) {
      const fetchAnalytics = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/analytics`,
            {
              headers: { adminid: adminId },
            },
          );
          setData(res.data);

          // Agar activity hai toh aakhiri activity wali date set kar do
          if (res.data.activities && res.data.activities.length > 0) {
            setSelectedDate(
              new Date(res.data.activities[0].date).toISOString().split("T")[0],
            );
          }
        } catch (err) {
          console.error("Failed to load user analytics", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [userId, adminId]);

  // 🎭 IMPERSONATION LOGIC (Login as User)
  const handleImpersonate = async () => {
    const confirmText = `⚠️ WARNING: You are entering ${data?.user?.name || "User"}'s matrix. This will log you out as Admin. Proceed?`;
    if (window.confirm(confirmText)) {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/impersonate`,
          {},
          { headers: { adminid: adminId } },
        );

        // Naya token aur user data set karo
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (res.data.user.field)
          localStorage.setItem("userField", res.data.user.field);

        // Matrix Jump
        window.location.href = "/dashboard";
      } catch (err) {
        alert(err.response?.data?.message || "Impersonation failed.");
      }
    }
  };

  // 🔍 FILTER LOGIC: Selected date ka data aur total time nikalna
  const dailyData = useMemo(() => {
    if (!data?.activities) return { events: [], totalMinutes: 0 };

    const filteredEvents = data.activities.filter((activity) => {
      const actDate = new Date(activity.date).toISOString().split("T")[0];
      return actDate === selectedDate;
    });

    const totalMins = filteredEvents.reduce(
      (acc, curr) => acc + (curr.duration || 0),
      0,
    );
    return { events: filteredEvents, totalMinutes: totalMins };
  }, [data, selectedDate]);

  const formatTime = (minutes) => {
    if (!minutes) return "0 Hrs 0 Mins";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} Hrs ${m} Mins`;
  };

  const extractTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-indigo-400">
        <BrainCircuit size={60} className="animate-pulse mb-6" />
        <h3 className="text-xl font-black uppercase tracking-widest animate-pulse">
          Decrypting User Matrix...
        </h3>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-10"
    >
      {/* 🟢 NAVIGATION */}
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 text-[10px] font-black uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={14} /> Back to Command Center
      </button>

      {/* 🟢 MAIN HEADER (With Impersonate Button) */}
      <div className="flex items-center justify-between bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Activity size={100} />
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center border-2 border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <Activity size={32} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter mb-1 text-glow">
              X-Ray Analytics
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
              Commander:{" "}
              <span className="text-indigo-400 ml-1">{data.user.name}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleImpersonate}
          className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-rose-600 to-orange-600 hover:scale-105 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-rose-600/20 active:scale-95 border border-white/10"
        >
          <LogIn size={16} /> Enter Matrix
        </button>
      </div>

      {/* 🟢 TABS */}
      <div className="flex border-b border-white/5 mb-8">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === "history" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-500 hover:text-white"}`}
        >
          Daily Log Table
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === "overview" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-500 hover:text-white"}`}
        >
          Total Overview
        </button>
      </div>

      {/* 🟢 CONTENT */}
      {activeTab === "history" ? (
        <div className="space-y-6">
          {/* DATE & SUMMARY CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
              <CalendarDays className="text-indigo-400" size={24} />
              <div className="flex-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#0f1221] text-white border border-white/10 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-3xl flex items-center gap-4 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
              <Clock className="text-emerald-400" size={24} />
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Daily Focus Score
                </p>
                <p className="text-2xl font-black text-emerald-400">
                  {formatTime(dailyData.totalMinutes)}
                </p>
              </div>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/50 border-b border-white/5">
                  <tr>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Operation
                    </th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Subject / Goal
                    </th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Timeline
                    </th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                      Duration
                    </th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Status
                    </th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Admin Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dailyData.events.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-20 text-center text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] italic"
                      >
                        No Logs Found For This Date
                      </td>
                    </tr>
                  ) : (
                    dailyData.events.map((act, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-indigo-500/5 transition-all group"
                      >
                        <td className="p-5">
                          <span
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${act.type === "session" ? "text-blue-400" : act.type === "combat" ? "text-amber-400" : "text-indigo-400"}`}
                          >
                            {act.type === "session" ? (
                              <Timer size={14} />
                            ) : act.type === "combat" ? (
                              <Swords size={14} />
                            ) : (
                              <Target size={14} />
                            )}{" "}
                            {act.type}
                          </span>
                        </td>
                        <td className="p-5 font-bold text-white text-sm capitalize">
                          {act.topic}
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-emerald-500/50 uppercase">
                                Start:
                              </span>{" "}
                              {extractTime(act.startTime)}
                            </span>
                            {act.type === "session" && (
                              <span className="flex items-center gap-1">
                                <span className="text-rose-500/50 uppercase">
                                  End:
                                </span>{" "}
                                {extractTime(act.endTime)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-5 text-center font-black text-indigo-300 text-sm">
                          {act.duration > 0 ? `${act.duration}m` : "--"}
                        </td>
                        <td className="p-5">
                          <span
                            className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${act.status === "Finished" || act.status === "Passed" || act.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
                          >
                            {act.status}
                          </span>
                        </td>
                        <td className="p-5 text-xs text-slate-500 italic font-medium">
                          {act.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* OVERVIEW TAB CONTENT */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-500">
          <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <BrainCircuit size={100} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Life-Time XP
            </p>
            <p className="text-5xl font-black text-emerald-400">
              {data.user.battlePoints || 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Swords size={100} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Combats Engaged
            </p>
            <p className="text-5xl font-black text-white">{data.totalTests}</p>
          </div>
          <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Target size={100} className="text-indigo-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">
              Combat Accuracy
            </p>
            <p className="text-5xl font-black text-indigo-400">
              {data.averageAccuracy}%
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserAnalyticsPage;
