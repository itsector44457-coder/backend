import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Heart,
  MessageCircle,
  Loader2,
  Zap,
  History,
  Grid,
  BarChart2,
  Bookmark as BookmarkIcon,
  Award,
  Globe,
  Swords,
  Target,
} from "lucide-react";

const UserProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = storedUser.id || storedUser._id;

  const [user, setUser] = useState(storedUser);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [sessions, setSessions] = useState({});
  const [battleHistory, setBattleHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!myId) return;
      setLoading(true);

      try {
        const results = await Promise.allSettled([
          axios.get(`https://backend-6hhv.onrender.com/api/posts/user/${myId}`),
          axios.get(`https://backend-6hhv.onrender.com/api/sessions/${myId}`),
          axios.get(
            `https://backend-6hhv.onrender.com/api/users/${myId}/saved`,
          ),
          axios.get(
            `https://backend-6hhv.onrender.com/api/battles/user/${myId}`,
          ),
        ]);

        if (results[0].status === "fulfilled")
          setMyPosts(results[0].value.data || []);
        if (results[1].status === "fulfilled")
          setSessions(results[1].value.data || {});
        if (results[2].status === "fulfilled")
          setSavedPosts(results[2].value.data || []);
        else setSavedPosts([]);
        if (results[3].status === "fulfilled")
          setBattleHistory(results[3].value.data || []);

        const userRes = await axios.get(
          `https://backend-6hhv.onrender.com/api/users/${myId}`,
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

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const stats = (() => {
    const today = new Date().toISOString().split("T")[0];
    const tSecs = sessions[today]?.reduce((acc, s) => acc + s.duration, 0) || 0;
    return { tSecs };
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 h-full">
        <Loader2 className="animate-spin text-indigo-500 mb-3" size={28} />
        <p className="text-xs font-medium text-slate-500">Syncing Profile...</p>
      </div>
    );
  }

  return (
    // Outer wrapper: Reduced extreme border-radius and shadows
    <div className="bg-white h-full overflow-y-auto no-scrollbar rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      {/* 📸 HERO BANNER - Compact Height */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-slate-800 to-indigo-900 rounded-t-xl sm:rounded-t-2xl" />
        <div className="px-6 flex justify-between items-end -mt-10">
          <div className="relative">
            {/* Avatar: Circular and smaller */}
            <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md">
              <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center text-3xl font-bold text-indigo-600 border border-indigo-100 uppercase">
                {user?.name?.[0] || "U"}
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="pb-2 flex gap-2">
            <button className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-slate-50 transition-colors">
              Edit Profile
            </button>
            <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg border border-indigo-100 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* 👤 IDENTITY - Clean Typography */}
      <div className="px-6 mt-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {user?.name}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-medium">
            {user?.field || "Sector Commander"}
          </span>
          <span className="text-slate-400 text-xs">• Aarambh Institute</span>
        </div>

        {/* 🔥 STATS BAR - Clean Grid without huge text */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 mt-5">
          <div className="text-center">
            <span className="text-lg font-bold text-slate-800">
              {user?.wins || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Victories</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <span className="text-lg font-bold text-slate-800">
              {user?.losses || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Defeats</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <span className="text-lg font-bold text-indigo-600">
              {user?.battlePoints || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Total XP</p>
          </div>
        </div>
      </div>

      {/* 📑 TABS - Shorter height, simple text */}
      <div className="flex border-b border-slate-100 px-4 sticky top-0 bg-white/95 backdrop-blur-sm z-20 mt-2">
        {[
          { id: "posts", icon: <Grid size={16} />, label: "Feed" },
          { id: "stats", icon: <BarChart2 size={16} />, label: "Stats" },
          { id: "saved", icon: <BookmarkIcon size={16} />, label: "Saved" },
          { id: "history", icon: <History size={16} />, label: "Logs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 🧩 CONTENT AREA */}
      <div className="p-4 sm:p-6 bg-slate-50/50 flex-1">
        {/* 1. FEED TAB */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {myPosts.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-slate-200 bg-white rounded-xl text-slate-400 text-sm">
                No posts available.
              </div>
            ) : (
              myPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      className="w-full h-40 object-cover border-b border-slate-50"
                      alt="Post"
                    />
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-sm text-slate-700 mb-4 line-clamp-3 flex-1">
                      {post.content}
                    </p>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                        <span className="flex items-center gap-1">
                          <Heart size={14} className="text-rose-500" />{" "}
                          {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} />{" "}
                          {post.comments?.length || 0}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
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
          <div className="animate-in fade-in">
            <div className="p-6 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Active Study Today
                </p>
                <h4 className="text-2xl font-bold text-slate-800">
                  {formatDuration(stats.tSecs)}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <Zap size={24} />
              </div>
            </div>
          </div>
        )}

        {/* 3. SAVED TAB */}
        {activeTab === "saved" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {savedPosts.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-slate-200 bg-white rounded-xl text-slate-400 text-sm">
                No saved items.
              </div>
            ) : (
              savedPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {post.author?.[0]}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {post.author}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {post.content}
                  </p>
                  <button className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors">
                    Remove Bookmark
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. HISTORY TAB */}
        {activeTab === "history" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            {/* Battle Logs Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2 mb-4">
                <Swords size={14} /> Battle Logs
              </h3>
              {battleHistory.length === 0 ? (
                <p className="text-sm text-slate-400">No battles logged.</p>
              ) : (
                battleHistory.map((b) => (
                  <div
                    key={b._id}
                    className="p-3 bg-white border border-slate-100 rounded-lg flex justify-between items-center hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Target
                        size={16}
                        className={
                          b.winner === myId
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {b.winner === myId ? "Victory" : "Defeat"}{" "}
                          <span className="text-slate-400 font-normal">
                            — {b.field}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(b.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${b.winner === myId ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {b.winner === myId ? `+${b.pointsStaked}` : `0`} XP
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Study Logs Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2 mb-4">
                <History size={14} /> Study History
              </h3>
              {Object.entries(sessions)
                .reverse()
                .slice(0, 5)
                .map(([date, dayLogs]) => (
                  <div
                    key={date}
                    className="p-3 bg-white border border-slate-100 rounded-lg flex justify-between items-center hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-indigo-400" />
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">
                          {new Date(date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {formatDuration(
                            dayLogs.reduce((a, b) => a + b.duration, 0),
                          )}{" "}
                          Focused
                        </p>
                      </div>
                    </div>
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
