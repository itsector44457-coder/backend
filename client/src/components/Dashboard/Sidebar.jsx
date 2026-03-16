import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MoonStar,
  LogOut,
  CheckCircle,
  BookOpen,
  Users,
  UserPlus,
  Waypoints,
  Swords,
  AlertTriangle,
  History,
  Sparkles,
  Brain, // ✅ NEW: Flashcards icon
  BarChart2,
} from "lucide-react";
import LogoImg from "../../assets/skill-vault-logo.png";

const Sidebar = ({ setZenMode, onLogout }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name ? user.name[0].toUpperCase() : "U";

  const navItems = [
    { path: "/dashboard", icon: CheckCircle, label: "Tasks" },
    { path: "/dashboard/syllabus", icon: BookOpen, label: "Syllabus" },
    { path: "/dashboard/battle-arena", icon: Swords, label: "Battle Arena" },
    { path: "/dashboard/battles", icon: History, label: "Combat Records" },
    { path: "/dashboard/flashcard-stats", icon: BarChart2, label: "Analytics" },
    { path: "/dashboard/community", icon: Users, label: "Community" },
    { path: "/dashboard/network", icon: UserPlus, label: "Network" },
    { path: "/dashboard/universe", icon: Sparkles, label: "Universe" },
    { path: "/roadmap", icon: Waypoints, label: "Roadmap" },
    { path: "/dashboard/flashcards", icon: Brain, label: "Flashcards" }, // ✅ NEW
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] bg-white border-t border-slate-200 md:relative md:w-64 md:h-screen md:flex md:flex-col md:border-t-0 md:border-r md:bg-slate-50/30 transition-all duration-300">
      {/* 🟢 TOP LOGO SECTION */}
      <div className="hidden md:flex px-6 py-6 shrink-0 items-center gap-3">
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
          <img
            src={LogoImg}
            alt="Skill Vault Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-slate-800 text-lg tracking-tight leading-none block truncate">
            Skill Vault
          </span>
        </div>
      </div>

      {/* SCROLLABLE NAV */}
      <div className="flex flex-row md:flex-col flex-1 overflow-x-auto md:overflow-y-auto px-2 py-2 md:px-4 md:py-2 space-x-1 md:space-x-0 md:space-y-1 no-scrollbar items-center md:items-stretch">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-3 md:py-2.5 rounded-lg transition-colors flex-shrink-0 min-w-[68px] md:min-w-0 ${
                isActive
                  ? "text-indigo-600 md:bg-indigo-50 md:text-indigo-700 font-semibold"
                  : "text-slate-400 hover:text-slate-700 md:text-slate-500 md:hover:bg-slate-100 font-medium"
              }`
            }
          >
            <Icon className="w-5 h-5 md:w-[18px] md:h-[18px]" strokeWidth={2} />
            <span className="text-[10px] md:text-sm text-center md:text-left tracking-wide md:tracking-normal mt-0.5 md:mt-0">
              {label}
            </span>
          </NavLink>
        ))}

        {/* Zen Mode Button */}
        <button
          onClick={() => setZenMode(true)}
          className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-3 md:py-2.5 rounded-lg transition-colors flex-shrink-0 min-w-[68px] md:min-w-0 md:w-full md:mt-6 text-emerald-500 hover:text-emerald-600 md:text-emerald-600 md:bg-emerald-50 md:hover:bg-emerald-100 font-medium md:font-semibold group"
        >
          <MoonStar className="w-5 h-5 md:w-[18px] md:h-[18px] md:group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] md:text-sm text-center md:text-left tracking-wide md:tracking-normal mt-0.5 md:mt-0">
            Zen Mode
          </span>
        </button>
      </div>

      {/* BOTTOM PROFILE & LOGOUT */}
      <div className="hidden md:block p-4 border-t border-slate-200 shrink-0 bg-white">
        <div
          onClick={() => navigate("/dashboard/profile")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent"
        >
          <div className="relative w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            {initials}
            {user.cheaterTag && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
                <AlertTriangle size={8} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user.name || "Commander"}
            </p>
            <p className="text-xs text-slate-500 font-medium truncate">
              View Profile
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 py-2.5 px-3 w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg mt-2 text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
