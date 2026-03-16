import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Flame,
  Target,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Loader2,
  RotateCcw,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";

const API = "https://backend-6hhv.onrender.com/api/stats";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getHeatColor = (hours) => {
  if (!hours || hours === 0) return { bg: "#f8fafc", border: "#f1f5f9" };
  if (hours <= 2) return { bg: "#bfdbfe", border: "#93c5fd" };
  if (hours <= 4) return { bg: "#60a5fa", border: "#3b82f6" };
  if (hours <= 6) return { bg: "#2563eb", border: "#1d4ed8" };
  return { bg: "#1e3a8a", border: "#1e40af" };
};

function StudyHeatmap({ studyData = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const { weeks, monthLabels } = useMemo(() => {
    const lookup = {};
    studyData.forEach((d) => {
      lookup[d.date] = d.studyHours;
    });

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        studyHours: lookup[dateStr] || 0,
        dayOfWeek: d.getDay(),
        month: d.getMonth(),
        dayOfMonth: d.getDate(),
      });
    }

    const allWeeks = [];
    let currentWeek = new Array(days[0].dayOfWeek).fill(null);
    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        allWeeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      allWeeks.push(currentWeek);
    }

    const monthLabelMap = {};
    allWeeks.forEach((week, wi) => {
      week.forEach((day) => {
        if (day && day.dayOfMonth === 1)
          monthLabelMap[wi] = MONTHS_SHORT[day.month];
      });
    });
    if (allWeeks[0] && !monthLabelMap[0]) {
      const first = allWeeks[0].find((d) => d !== null);
      if (first) monthLabelMap[0] = MONTHS_SHORT[first.month];
    }
    return { weeks: allWeeks, monthLabels: monthLabelMap };
  }, [studyData]);

  const totalHours = studyData.reduce((s, d) => s + (d.studyHours || 0), 0);
  const activeDays = studyData.filter((d) => d.studyHours > 0).length;
  const maxHours = studyData.length
    ? Math.max(...studyData.map((d) => d.studyHours || 0))
    : 0;
  const avgOnActive =
    activeDays > 0 ? (totalHours / activeDays).toFixed(1) : "0";
  const todayStr = new Date().toISOString().split("T")[0];
  const CELL = 13;
  const GAP = 2;

  return (
    <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-5 sm:p-8 mb-6 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-indigo-500" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-800 italic">
            Activity Matrix (365 Days)
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            {
              label: "Total",
              value: `${totalHours}h`,
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Days",
              value: activeDays,
              color: "bg-blue-50 text-blue-600",
            },
            {
              label: "Avg",
              value: `${avgOnActive}h`,
              color: "bg-sky-50 text-sky-600",
            },
            {
              label: "Best",
              value: `${maxHours}h`,
              color: "bg-violet-50 text-violet-600",
            },
          ].map((p) => (
            <div
              key={p.label}
              className={`flex flex-col items-center px-2.5 py-1 rounded-xl ${p.color}`}
            >
              <span className="text-sm font-black leading-tight">
                {p.value}
              </span>
              <span className="text-[8px] font-black uppercase opacity-70">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-2">
        <div style={{ minWidth: weeks.length * (CELL + GAP) + 30 + "px" }}>
          <div
            className="flex mb-1"
            style={{ gap: GAP + "px", paddingLeft: "28px" }}
          >
            {weeks.map((_, wi) => (
              <div
                key={wi}
                style={{ width: CELL + "px", flexShrink: 0, fontSize: "9px" }}
                className="font-black text-slate-400 uppercase overflow-visible whitespace-nowrap"
              >
                {monthLabels[wi] || ""}
              </div>
            ))}
          </div>
          <div className="flex" style={{ gap: GAP + "px" }}>
            <div
              className="flex flex-col shrink-0"
              style={{ gap: GAP + "px", width: "26px" }}
            >
              {DAYS_SHORT.map((day, di) => (
                <div
                  key={di}
                  style={{
                    height: CELL + "px",
                    fontSize: "9px",
                    lineHeight: CELL + "px",
                  }}
                  className="font-black text-slate-300 uppercase text-right pr-1 select-none"
                >
                  {[1, 3, 5].includes(di) ? day[0] : ""}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="flex flex-col"
                style={{ gap: GAP + "px" }}
              >
                {week.map((day, di) => {
                  if (!day)
                    return (
                      <div
                        key={di}
                        style={{ width: CELL + "px", height: CELL + "px" }}
                      />
                    );
                  const col = getHeatColor(day.studyHours);
                  const isToday = day.date === todayStr;
                  return (
                    <div
                      key={di}
                      style={{
                        width: CELL + "px",
                        height: CELL + "px",
                        background: col.bg,
                        border: `1px solid ${isToday ? "#6366f1" : col.border}`,
                        borderRadius: "3px",
                        cursor: "pointer",
                        transition: "transform 0.12s ease",
                        outline: isToday ? "2px solid #6366f1" : "none",
                        outlineOffset: "1px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.5)";
                        e.currentTarget.style.zIndex = "50";
                        setTooltip({ date: day.date, hours: day.studyHours });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.zIndex = "1";
                        setTooltip(null);
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div className="h-5">
          {tooltip && (
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-in fade-in">
              {tooltip.date} —{" "}
              {tooltip.hours === 0 ? (
                <span className="text-slate-400">No activity</span>
              ) : (
                <span>{tooltip.hours}h studied</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
            Less
          </span>
          {[0, 1, 3, 5, 7].map((h) => {
            const col = getHeatColor(h);
            return (
              <div
                key={h}
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "2px",
                  background: col.bg,
                  border: `1px solid ${col.border}`,
                }}
              />
            );
          })}
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
            More
          </span>
        </div>
      </div>
    </div>
  );
}

function RetentionRing({ value, size = 80, stroke = 8, color = "#6366f1" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "center",
          fontSize: size * 0.22,
          fontWeight: 900,
          fill: "#1e293b",
          fontStyle: "italic",
        }}
      >
        {value}%
      </text>
    </svg>
  );
}

export default function StudyStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (!myId) return;
    axios
      .get(`${API}/${myId}`)
      .then((r) => setStats(r.data))
      .catch((err) => console.error("Stats load error:", err))
      .finally(() => setLoading(false));
  }, [myId]);

  if (loading)
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-50 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Analyzing Neural Patterns...
        </p>
      </div>
    );

  if (!stats)
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase italic">
        Failed to load analytics data.
      </div>
    );

  const { heatmap, deckStats, totalReviewed, overallRetention, streak } = stats;

  // Convert reviewed cards → study hours for heatmap
  const heatmapStudyData = heatmap.map((s) => ({
    date: s.date,
    studyHours: Math.min(8, Math.round((s.reviewed || 0) / 8)),
  }));

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full h-full overflow-y-auto no-scrollbar pb-20">
      <div className="flex items-center gap-4 mb-6 bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm">
        <button
          onClick={() => navigate("/dashboard/flashcards")}
          className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center hover:border-indigo-200 transition-all active:scale-90 shrink-0"
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
          <TrendingUp className="text-white" size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 uppercase italic truncate">
            Neural Analytics
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Study Stats Dashboard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center gap-1 text-center shadow-lg shadow-orange-100 text-white">
          <Flame className="text-white opacity-80" size={24} />
          <div className="text-2xl sm:text-3xl font-black italic">{streak}</div>
          <div className="text-[9px] font-black uppercase tracking-widest opacity-80">
            Day Streak
          </div>
        </div>
        <div className="bg-white border-2 border-slate-50 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center gap-1 text-center shadow-sm">
          <Brain className="text-indigo-500" size={24} />
          <div className="text-2xl sm:text-3xl font-black text-slate-800 italic">
            {totalReviewed}
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Cards Reviewed
          </div>
        </div>
        <div className="bg-white border-2 border-slate-50 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center gap-1 text-center shadow-sm">
          <Target className="text-emerald-500" size={24} />
          <div className="text-2xl sm:text-3xl font-black text-slate-800 italic">
            {overallRetention}%
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Retention
          </div>
        </div>
      </div>

      <StudyHeatmap studyData={heatmapStudyData} />

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
        {["overview", "decks", "weak"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-indigo-400"
            }`}
          >
            {tab === "overview"
              ? "Overview"
              : tab === "decks"
                ? "Per Deck"
                : "Weak Cards"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {deckStats.length === 0 ? (
            <div className="col-span-full">
              <EmptyState text="No decks studied yet" />
            </div>
          ) : (
            deckStats.map((d) => (
              <div
                key={d.deckId}
                className="bg-white border-2 border-slate-50 rounded-[2rem] p-5 flex items-center gap-5 hover:border-indigo-100 transition-colors shadow-sm"
              >
                <RetentionRing
                  value={d.retention}
                  color={
                    d.retention >= 70
                      ? "#10b981"
                      : d.retention >= 40
                        ? "#f59e0b"
                        : "#ef4444"
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-800 uppercase italic truncate text-sm">
                    {d.deckTitle}
                  </div>
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">
                    {d.category}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Chip color="emerald" label={`${d.mastered} Mastered`} />
                    <Chip color="orange" label={`${d.weak} Weak`} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "decks" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {deckStats.length === 0 ? (
            <EmptyState text="No decks found" />
          ) : (
            deckStats.map((d) => (
              <div
                key={d.deckId}
                className="bg-white border-2 border-slate-50 rounded-[2rem] p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-black text-slate-800 uppercase italic text-base">
                      {d.deckTitle}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {d.total} cards total
                    </div>
                  </div>
                  <div
                    className="text-3xl font-black italic"
                    style={{
                      color:
                        d.retention >= 70
                          ? "#10b981"
                          : d.retention >= 40
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  >
                    {d.retention}%
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${d.retention}%`,
                      background:
                        d.retention >= 70
                          ? "#10b981"
                          : d.retention >= 40
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <StatPill
                    icon={<Trophy size={14} />}
                    val={d.mastered}
                    label="Mastered"
                    color="emerald"
                  />
                  <StatPill
                    icon={<AlertTriangle size={14} />}
                    val={d.weak}
                    label="Weak"
                    color="orange"
                  />
                  <StatPill
                    icon={<RotateCcw size={14} />}
                    val={d.total - d.mastered - d.weak}
                    label="Learning"
                    color="indigo"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "weak" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {deckStats.length === 0 ? (
            <EmptyState text="No weak cards found — you're crushing it!" />
          ) : (
            deckStats.flatMap((d) =>
              d.weakCards.length === 0
                ? []
                : [
                    <div
                      key={d.deckId + "-header"}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 pt-4 flex items-center gap-2"
                    >
                      <Brain size={14} className="text-indigo-400" />{" "}
                      {d.deckTitle}
                    </div>,
                    ...d.weakCards.map((card) => (
                      <div
                        key={card._id}
                        className="bg-white border-2 border-orange-100 rounded-[2rem] p-5 flex items-start gap-4 shadow-sm hover:shadow-orange-100 transition-shadow"
                      >
                        <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                          <AlertTriangle
                            className="text-orange-500"
                            size={18}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm font-black text-slate-800 leading-snug italic uppercase">
                            {card.frontText}
                          </p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                              Ease: {card.easeFactor}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                              Interval: {card.interval}d
                            </span>
                          </div>
                        </div>
                      </div>
                    )),
                  ],
            )
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ color, label }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border border-orange-100",
    slate: "bg-slate-50 text-slate-500 border border-slate-100",
    indigo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  };
  return (
    <span
      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${map[color]}`}
    >
      {label}
    </span>
  );
}

function StatPill({ icon, val, label, color }) {
  const map = {
    emerald: "text-emerald-600 bg-emerald-50 border border-emerald-100",
    orange: "text-orange-600 bg-orange-50 border border-orange-100",
    indigo: "text-indigo-600 bg-indigo-50 border border-indigo-100",
  };
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${map[color]}`}
    >
      <div className="opacity-80">{icon}</div>
      <span className="text-sm font-black italic">{val}</span>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-80">
        {label}
      </span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-20 flex flex-col items-center gap-4 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
        <Brain className="text-slate-300" size={32} />
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
        {text}
      </p>
    </div>
  );
}
