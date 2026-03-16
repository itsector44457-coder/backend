import React from "react";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2,
  BarChart3,
  Swords,
  Zap,
  Eye,
} from "lucide-react";

const TopicList = ({
  topics,
  selectedTopicId,
  onTopicSelect,
  onToggle,
  onQuizSubmit,
  onStartTest,
  onViewHistory,
  quizInputs,
  setQuizInputs,
  savingTopicId,
}) => {
  return (
    // Clean white container, normal rounded corners
    <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 h-full max-h-full flex flex-col shadow-sm overflow-hidden">
      {/* 🟢 MATRIX HEADER */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <BarChart3 size={18} className="text-indigo-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Knowledge Nodes
          </p>
        </div>
        <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
          {topics.length} Total
        </span>
      </div>

      {/* 📜 SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 pb-6 scroll-smooth">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <Zap size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">
              No Nodes Synced
            </p>
          </div>
        ) : (
          topics.map((topic) => {
            const isSelected = topic._id === selectedTopicId;
            const isWeak = topic.isWeak;
            const isSaving = savingTopicId === topic._id;

            return (
              <div
                key={topic._id}
                // Cards ko sleek banaya gaya hai with subtle hover effects
                className={`group rounded-xl border p-4 transition-all duration-200 relative shrink-0 flex flex-col gap-3 ${
                  isWeak
                    ? "border-rose-200 bg-rose-50/50"
                    : isSelected
                      ? "border-indigo-200 bg-indigo-50/50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                {/* TOP SECTION: Topic Name & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(topic);
                      }}
                      className="pt-0.5 transition-transform active:scale-95 disabled:opacity-50 shrink-0"
                      disabled={isSaving}
                    >
                      {topic.isCompleted ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle
                          size={20}
                          className="text-slate-300 hover:text-indigo-400 transition-colors"
                        />
                      )}
                    </button>

                    <button
                      onClick={() => onTopicSelect(topic)}
                      className="flex-1 text-left min-w-0"
                    >
                      <h3
                        className={`font-semibold text-sm sm:text-base tracking-tight leading-snug break-words ${
                          isSelected ? "text-indigo-900" : "text-slate-800"
                        }`}
                      >
                        {topic.title}
                      </h3>
                      {isWeak && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <AlertTriangle size={12} className="text-rose-500" />
                          <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">
                            Needs Revision
                          </span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Right: Action Buttons (Eye & Sword) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewHistory) onViewHistory(topic);
                      }}
                      title="View Combat History"
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartTest(topic);
                      }}
                      title="Start Combat"
                      className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition-colors flex items-center justify-center"
                    >
                      <Swords size={16} />
                    </button>
                  </div>
                </div>

                {/* BOTTOM SECTION: Score Input & Average */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  {/* Left: Input & Sync Button */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={quizInputs[topic._id] || ""}
                        onChange={(e) =>
                          setQuizInputs((prev) => ({
                            ...prev,
                            [topic._id]: e.target.value,
                          }))
                        }
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-center transition-all"
                        placeholder="0"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
                        %
                      </span>
                    </div>
                    <button
                      onClick={() => onQuizSubmit(topic._id)}
                      disabled={isSaving}
                      className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      {isSaving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>

                  {/* Right: Average Score */}
                  <div className="text-right flex items-center gap-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Avg
                    </p>
                    <div
                      className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                        topic.averageQuizScore < 40
                          ? "bg-rose-50 border-rose-100 text-rose-600"
                          : "bg-emerald-50 border-emerald-100 text-emerald-600"
                      }`}
                    >
                      {topic.averageQuizScore ?? "--"}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TopicList;
