import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Zap, Grid, BarChart2, History } from "lucide-react";

import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "./ProfileInfo";
import ProfileGrid from "./ProfileGrid";
import PostModal from "./PostModal";

const socket = io(`${import.meta.env.VITE_API_URL}`);

const NetworkProfile = ({ userId, onBack, currentUserId }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const [uRes, pRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/posts/user/${userId}`),
        ]);
        setUser(uRes.data);
        setPosts(pRes.data || []);
        setIsFollowing(
          (uRes.data.followers || []).some(
            (id) => String(id) === String(currentUserId),
          ),
        );
      } catch (err) {
        console.error("Sync Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userId, currentUserId]);

  const handleFollowToggle = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/follow`,
        { currentUserId },
      );
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error("Follow Failed");
    }
  };

  const handleChallenge = () => {
    socket.emit("send_battle_challenge", {
      fromUser: { id: currentUserId },
      toUserId: userId,
      battleType: "General Duel",
      xpStake: 50,
    });
    alert("⚔️ Challenge Sent!");
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/posts/like/${postId}`,
        { userId: currentUserId },
      );
      const updated = posts.map((p) =>
        p._id === postId ? { ...p, likes: res.data.likes } : p,
      );
      setPosts(updated);
      if (selectedPost?._id === postId)
        setSelectedPost({ ...selectedPost, likes: res.data.likes });
    } catch (err) {
      console.error("Like Failed");
    }
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center">
        <Zap className="animate-pulse text-indigo-500 w-8 h-8 sm:w-10 sm:h-10" />
      </div>
    );

  return (
    <div className="bg-white h-full w-full overflow-y-auto no-scrollbar rounded-none sm:rounded-[2.5rem] flex flex-col relative border-x-0 sm:border border-slate-100 shadow-none sm:shadow-sm">
      <ProfileHeader name={user?.name} onBack={onBack} />

      <ProfileInfo
        user={user}
        postCount={posts.length}
        isFollowing={isFollowing}
        onFollow={handleFollowToggle}
        onChallenge={handleChallenge}
      />

      {/* Tabs */}
      <div className="flex mt-2 sm:mt-6 border-b border-slate-50 sticky top-[52px] sm:top-[60px] z-30 bg-white/95 backdrop-blur-md">
        {[
          { id: "grid", icon: <Grid className="w-5 h-5 sm:w-6 sm:h-6" /> },
          {
            id: "stats",
            icon: <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />,
          },
          {
            id: "history",
            icon: <History className="w-5 h-5 sm:w-6 sm:h-6" />,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-3 sm:py-4 flex justify-center transition-all ${
              activeTab === t.id
                ? "text-slate-900 border-b-2 border-black"
                : "text-slate-300 hover:text-slate-500"
            }`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white min-h-[50vh]">
        {activeTab === "grid" && (
          <ProfileGrid posts={posts} onPostClick={setSelectedPost} />
        )}
        {/* Placeholder for other tabs if you add them later */}
        {activeTab !== "grid" && (
          <div className="flex items-center justify-center h-full py-20 text-slate-400 text-sm font-medium italic">
            Module Syncing...
          </div>
        )}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          myId={currentUserId}
          onLike={handleLike}
          showComments={showComments}
          onCommentToggle={(id) =>
            setShowComments((p) => ({ ...p, [id]: !p[id] }))
          }
          commentInput={commentInputs[selectedPost._id] || ""}
          setCommentInput={(id, val) =>
            setCommentInputs((p) => ({ ...p, [id]: val }))
          }
          onCommentSubmit={() => {}} // Add comment handler logic if needed
        />
      )}
    </div>
  );
};

export default NetworkProfile;
