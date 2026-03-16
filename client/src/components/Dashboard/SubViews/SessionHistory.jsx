import React from "react";
import { Clock, ChevronLeft } from "lucide-react";
import StudyLog from "../../../pages/StudyLog";

const SessionHistory = ({ onBack }) => {
  return (
    // Padding aur border-radius ko kam kiya gaya hai taaki extra space waste na ho
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 h-full flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-slate-50">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Icon container ko chota aur subtle banaya hai */}
          <div className="p-1.5 sm:p-2 bg-slate-50 rounded-lg text-slate-600">
            <Clock className="w-4 h-4" />
          </div>
          {/* Title ko clean rakha hai, uppercase aur black font hata diya */}
          <h3 className="font-semibold text-slate-800 text-base sm:text-lg tracking-tight">
            Session History
          </h3>
        </div>

        {/* Back button ko aur compact aur neat kiya hai */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 -mr-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-50"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back</span>
          <span className="sm:hidden">Hub</span>
        </button>
      </div>

      {/* Main Content (List) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        <StudyLog fullPage={true} />
      </div>
    </div>
  );
};

export default SessionHistory;
