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
  Loader2,
} from "lucide-react";

const UserAnalyticsPage = () => {
  const { userId } = useParams();
  const { adminId } = useOutletContext();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");

  // 📅 Date Selection State
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (userId && adminId) {
      const fetchAnalytics = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `https://backend-6hhv.onrender.com/api/admin/users/${userId}/analytics`,
            {
              headers: { adminid: adminId },
            },
          );
          setData(res.data);

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

  // 🎭 IMPERSONATION LOGIC
  const handleImpersonate = async () => {
    const confirmText = `Are you sure you want to login as ${data?.user?.name || "this user"}? You will be logged out of your Admin session.`;
    if (window.confirm(confirmText)) {
      try {
        const res = await axios.post(
          `https://backend-6hhv.onrender.com/api/admin/users/${userId}/impersonate`,
          {},
          { headers: { adminid: adminId } },
        );

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (res.data.user.field)
          localStorage.setItem("userField", res.data.user.field);

        window.location.href = "/dashboard";
      } catch (err) {
        alert(err.response?.data?.message || "Impersonation failed.");
      }
    }
  };

  // 🔍 FILTER LOGIC
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
    if (!minutes) return "0h 0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
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
      <div className="flex flex-col items-center justify-center mt-32 font-sans">
        <Loader2 size={36} className="animate-spin text-indigo-600 mb-4" />
        <h3 className="text-sm font-medium text-slate-500">
          Loading analytics matrix...
        </h3>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-12 font-sans"
    >
      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 text-sm font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Users
      </button>

      {/* 🟢 MAIN HEADER (Profile Card) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm mb-8 gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
            <Activity size={28} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight mb-1">
              User Analytics
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Viewing profile for:{" "}
              <span className="text-indigo-600 font-semibold">
                {data.user.name}
              </span>
            </p>
          </div>
        </div>

        {/* Impersonate Button - Professional Styling */}
        <button
          onClick={handleImpersonate}
          className="flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <LogIn size={16} /> Login as User
        </button>
      </div>

      {/* 🟢 TABS */}
      <div className="flex border-b border-slate-200 mb-8 gap-6">
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Daily Log Table
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Total Overview
        </button>
      </div>

      {/* 🟢 CONTENT */}
      {activeTab === "history" ? (
        <div className="space-y-6">
          {/* DATE & SUMMARY CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Date Selector */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <CalendarDays size={20} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-indigo-300 focus:bg-white transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* Daily Focus Score */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Daily Focus Score
                </p>
                <p className="text-2xl font-bold text-slate-800 tracking-tight">
                  {formatTime(dailyData.totalMinutes)}
                </p>
              </div>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Operation
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Subject / Goal
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Timeline
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Admin Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyData.events.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-500 font-medium text-sm"
                      >
                        No logs recorded for this date.
                      </td>
                    </tr>
                  ) : (
                    dailyData.events.map((act, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Operation Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md w-max border ${
                              act.type === "session"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : act.type === "combat"
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
                            }`}
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

                        {/* Topic */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-800 text-sm capitalize">
                            {act.topic}
                          </p>
                        </td>

                        {/* Timeline */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-xs font-medium text-slate-500 gap-1">
                            <span className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-semibold w-10">
                                Start:
                              </span>
                              {extractTime(act.startTime)}
                            </span>
                            {act.type === "session" && (
                              <span className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-semibold w-10">
                                  End:
                                </span>
                                {extractTime(act.endTime)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="font-bold text-slate-800 text-sm">
                            {act.duration > 0 ? `${act.duration}m` : "--"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                              ["Finished", "Passed", "Completed"].includes(
                                act.status,
                              )
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}
                          >
                            {act.status}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-500 font-medium">
                            {act.reason || "--"}
                          </span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in slide-in-from-left-4 duration-500">
          {/* XP Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm hover:border-emerald-300 transition-all">
            <div className="absolute -right-4 -top-4 opacity-[0.03] text-emerald-900">
              <BrainCircuit size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Life-Time XP
              </p>
              <p className="text-4xl font-bold text-emerald-600 tracking-tight">
                {data.user.battlePoints || 0}
              </p>
            </div>
          </div>

          {/* Combats Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm hover:border-slate-300 transition-all">
            <div className="absolute -right-4 -top-4 opacity-[0.03] text-slate-900">
              <Swords size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Combats Engaged
              </p>
              <p className="text-4xl font-bold text-slate-800 tracking-tight">
                {data.totalTests}
              </p>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="absolute -right-4 -top-4 opacity-5 text-indigo-900">
              <Target size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                Combat Accuracy
              </p>
              <p className="text-4xl font-bold text-indigo-700 tracking-tight">
                {data.averageAccuracy}%
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserAnalyticsPage;
