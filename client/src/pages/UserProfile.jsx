import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Loader2,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  History,
  Grid,
  BarChart2,
  Bookmark as BookmarkIcon,
  Award,
  Maximize2,
  Trash2,
  Globe,
  Swords,
  Target,
} from "lucide-react";

const UserProfile = () => {
  // 1. Identity Logic
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = storedUser.id || storedUser._id;

  const [user, setUser] = useState(storedUser);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [sessions, setSessions] = useState({});
  const [battleHistory, setBattleHistory] = useState([]); // 🔥 Battle Results ke liye
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  // 2. Data Fetching Engine
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!myId) return;
      setLoading(true);

      try {
        // charo cheezein ek saath mangwa rahe hain
        const results = await Promise.allSettled([
          axios.get(`${import.meta.env.VITE_API_URL}/api/posts/user/${myId}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/sessions/${myId}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/${myId}/saved`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/battles/user/${myId}`), // 🔥 Battle logs API
        ]);

        if (results[0].status === "fulfilled")
          setMyPosts(results[0].value.data || []);
        if (results[1].status === "fulfilled")
          setSessions(results[1].value.data || {});

        // Saved Posts handling (404 safe)
        if (results[2].status === "fulfilled") {
          setSavedPosts(results[2].value.data || []);
        } else {
          setSavedPosts([]);
        }

        // Battle History handling
        if (results[3].status === "fulfilled") {
          setBattleHistory(results[3].value.data || []);
        }

        // Fresh User Data for stats
        const userRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${myId}`,
        );
        setUser(userRes.data);
      } catch (err) {
        console.error("Global Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [myId]);

  // --- 3. Analytics & Formatting ---
  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const stats = (() => {
    const today = new Date().toISOString().split("T")[0];
    const tSecs = sessions[today]?.reduce((acc, s) => acc + s.duration, 0) || 0;
    return { tSecs };
  })();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40 h-full">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase text-slate-400 italic">
          Synchronizing Universe Hub...
        </p>
      </div>
    );

  return (
    <div className="bg-white h-full overflow-y-auto no-scrollbar rounded-[2.5rem] shadow-2xl border border-slate-100 selection:bg-indigo-100">
      {/* 📸 HERO BANNER */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900" />
        <div className="px-8 flex justify-between items-end -mt-16">
          <div className="relative">
            <div className="w-36 h-36 rounded-[3rem] bg-white p-1 shadow-2xl">
              <div className="w-full h-full rounded-[2.8rem] bg-indigo-50 flex items-center justify-center text-6xl font-black text-indigo-600 italic border-4 border-white uppercase">
                {user?.name?.[0] || "U"}
              </div>
            </div>
            <div className="absolute bottom-4 right-4 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full shadow-lg" />
          </div>
          <div className="pb-6 flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-all">
              Edit Sector
            </button>
            <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-100">
              <Award size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* 👤 IDENTITY */}
      <div className="px-8 mt-6">
        <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          {user?.name}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            {user?.field || "Sector Commander"}
          </span>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            • Aarambh Institute
          </span>
        </div>

        {/* 🔥 UPDATED STATS BAR: Victories & Defeats */}
        <div className="grid grid-cols-3 gap-6 py-8 border-y border-slate-50 mt-8">
          <div className="text-center">
            <span className="text-2xl font-black text-emerald-500">
              {user?.wins || 0}
            </span>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
              Victories
            </p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-rose-500">
              {user?.losses || 0}
            </span>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
              Defeats
            </p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-indigo-600">
              {user?.battlePoints || 0}
            </span>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
              Total XP
            </p>
          </div>
        </div>
      </div>

      {/* 📑 TABS */}
      <div className="flex mt-2 border-b border-slate-50 px-8 sticky top-0 bg-white/90 backdrop-blur-md z-20">
        {[
          { id: "posts", icon: <Grid size={18} />, label: "Feed" },
          { id: "stats", icon: <BarChart2 size={18} />, label: "Analysis" },
          { id: "saved", icon: <BookmarkIcon size={18} />, label: "Saved" },
          { id: "history", icon: <History size={18} />, label: "Logs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-5 flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-300"}`}
          >
            {tab.icon}{" "}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* 🧩 CONTENT AREA */}
      <div className="p-8">
        {/* 1. FEED TAB */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {myPosts.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 italic text-sm">
                No neural broadcasts found.
              </div>
            ) : (
              myPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col"
                >
                  {post.imageUrl && (
                    <div className="px-4 pt-4">
                      <div className="relative group rounded-[2.2rem] overflow-hidden border-4 border-white shadow-lg">
                        <img
                          src={post.imageUrl}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                          alt="Sector Media"
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={`p-6 ${post.imageUrl ? "pt-6" : "pt-8"} flex-1`}
                  >
                    <p className="text-[14px] text-slate-600 font-medium italic mb-6 leading-relaxed">
                      "{post.content}"
                    </p>
                    <div className="flex justify-between items-center border-t border-slate-50 pt-5">
                      <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                          <Heart
                            size={16}
                            fill="currentColor"
                            className="text-rose-500"
                          />{" "}
                          {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-2">
                          <MessageCircle size={16} />{" "}
                          {post.comments?.length || 0}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. STATS TAB */}
        {activeTab === "stats" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6">
            <div className="p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group border border-slate-800 shadow-2xl">
              <Zap
                className="absolute right-[-30px] top-[-30px] text-indigo-500 opacity-20"
                size={200}
              />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">
                  Neural Mastery Cycle
                </p>
                <h4 className="text-6xl font-black italic tracking-tighter mb-4">
                  {formatDuration(stats.tSecs)}
                </h4>
                <p className="text-xs font-bold text-slate-400 uppercase italic">
                  Active Study Time Today
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. 🔥 SAVED TAB: Bookmarks list */}
        {activeTab === "saved" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in duration-300">
            {savedPosts.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 italic text-sm">
                Bookmarks are currently empty.
              </div>
            ) : (
              savedPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-7 group hover:bg-white hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs italic">
                      {post.author?.[0]}
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase italic tracking-widest">
                      {post.author}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium italic mb-4 line-clamp-3">
                    "{post.content}"
                  </p>
                  <button className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline">
                    Remove Bookmark
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. 🔥 HISTORY TAB: Study + Battle Logs */}
        {activeTab === "history" && (
          <div className="space-y-8 animate-in fade-in">
            {/* Battle Logs Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                <Swords size={14} /> Battle Archive
              </h3>
              {battleHistory.length === 0 ? (
                <p className="text-xs text-slate-300 italic px-2">
                  No battles logged yet.
                </p>
              ) : (
                battleHistory.map((b) => (
                  <div
                    key={b._id}
                    className="p-5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center hover:border-indigo-200 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl ${b.winner === myId ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}
                      >
                        <Target size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase italic">
                          {b.winner === myId ? "Victory" : "Defeat"} — {b.field}{" "}
                          Battle
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase">
                          {new Date(b.timestamp).toDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black ${b.winner === myId ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {b.winner === myId ? `+${b.pointsStaked}` : `0`} XP
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Study Logs Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                <History size={14} /> Mission History
              </h3>
              {Object.entries(sessions)
                .reverse()
                .slice(0, 5)
                .map(([date, dayLogs]) => (
                  <div
                    key={date}
                    className="p-5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center group hover:border-indigo-200 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <History size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-2">
                          {new Date(date).toDateString()}
                        </p>
                        <p className="text-sm font-black text-slate-800 italic uppercase">
                          {formatDuration(
                            dayLogs.reduce((a, b) => a + b.duration, 0),
                          )}{" "}
                          Focused
                        </p>
                      </div>
                    </div>
                    <Globe
                      size={16}
                      className="text-slate-100 group-hover:text-indigo-400"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
