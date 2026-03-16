import React from "react";
import { Folder, ChevronRight, BookOpen } from "lucide-react";

const SubjectSidebar = ({ subjects, selectedSubjectId, onSelect }) => {
  return (
    // Outer Container: Clean white background without heavy borders/blur
    <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 h-full flex flex-col shadow-sm">
      {/* 🏷️ Header Section */}
      <div className="flex items-center justify-between mb-4 px-1 pb-3 border-b border-slate-50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider inline-flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-500" /> Sectors
        </p>
        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
          {subjects.length} Units
        </span>
      </div>

      {/* 📜 Scrollable List */}
      <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-1">
        {subjects.map((subject) => {
          const active = subject._id === selectedSubjectId;
          const progress = subject.progressPercent || 0;
          const isCompleted = progress === 100;

          return (
            <button
              key={subject._id}
              onClick={() => onSelect(subject)}
              // Button styling ko compact aur sleek banaya
              className={`group w-full text-left rounded-lg p-3 transition-colors relative flex flex-col gap-2 ${
                active
                  ? "bg-indigo-50 border border-indigo-100"
                  : "bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Folder Icon minimal styling */}
                  <div
                    className={`shrink-0 transition-colors ${
                      active
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-indigo-500"
                    }`}
                  >
                    <Folder
                      size={18}
                      fill={active ? "currentColor" : "none"}
                      className={active ? "opacity-20" : ""}
                    />
                    {/* Note: Agar icon filled chahiye toh Lucide mein direct fill property ya custom icon logic use karein. Yahan simple approach use ki hai. */}
                  </div>

                  {/* Subject Name - Clean Typography */}
                  <div className="min-w-0">
                    <p
                      className={`font-semibold text-sm truncate ${
                        active ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {subject.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {isCompleted ? "Verified Mastery" : "Ongoing Mission"}
                    </p>
                  </div>
                </div>

                {/* Right side indicator or percentage */}
                <div className="shrink-0 ml-2">
                  {active ? (
                    <ChevronRight size={16} className="text-indigo-500" />
                  ) : (
                    <span
                      className={`text-[10px] font-semibold ${isCompleted ? "text-emerald-500" : "text-slate-300 group-hover:text-indigo-400"}`}
                    >
                      {progress}%
                    </span>
                  )}
                </div>
              </div>

              {/* 📊 Progress Bar - Sleek and modern */}
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-700 ease-out rounded-full ${
                    isCompleted ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectSidebar;
