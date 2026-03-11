import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import NetworkHeader from "./NetworkHeader";
import UserCard from "./UserCard";
import NetworkProfile from "../Network/NetworkProfile/NetworkProfile";

const Network = ({
  onChallengeUser,
  challengeLoadingIds = {},
  activeBattle = null,
}) => {
  // --- 1. CORE STATES ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Identity Logic
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = storedUser?.id || storedUser?._id;
  const myField = (storedUser?.field || "").toLowerCase();

  // 🔥 FIX: fresh following list from state/localstorage
  const followingList = storedUser.following || [];

  // --- 2. FETCH USERS ENGINE ---
  useEffect(() => {
    if (myId) fetchUsers();
  }, [myId, myField]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);

      const others = res.data.filter(
        (u) => String(u._id || u.id) !== String(myId),
      );

      const sorted = [...others].sort((a, b) => {
        const af = (a.field || "").toLowerCase();
        const bf = (b.field || "").toLowerCase();
        if (af === myField && bf !== myField) return -1;
        return 0;
      });
      setUsers(sorted);
    } catch (err) {
      console.error("Universe Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SOCIAL HANDLERS ---
  const handleFollow = async (targetId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${targetId}/follow`,
        { currentUserId: myId },
      );

      const freshUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (res.data.isFollowing) {
        freshUser.following = [...(freshUser.following || []), targetId];
      } else {
        freshUser.following = (freshUser.following || []).filter(
          (id) => String(id) !== String(targetId),
        );
      }
      localStorage.setItem("user", JSON.stringify(freshUser));

      // UI update to trigger re-render
      setUsers([...users]);
    } catch (err) {
      console.error("Social Link Failed", err);
    }
  };

  // ---  search & battle logic ---
  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.field || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeBattleOpponentId =
    activeBattle?.status === "active"
      ? String(
          activeBattle?.challengerId?._id || activeBattle?.challengerId,
        ) === String(myId)
        ? String(activeBattle?.opponentId?._id || activeBattle?.opponentId)
        : String(activeBattle?.challengerId?._id || activeBattle?.challengerId)
      : "";

  // Profile View Logic
  if (selectedUserId)
    return (
      <NetworkProfile
        userId={selectedUserId}
        currentUserId={myId}
        onBack={() => setSelectedUserId(null)}
        onChallengeUser={onChallengeUser}
      />
    );

  return (
    <div className="h-full w-full bg-[#f8fafc] flex flex-col">
      <NetworkHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        userCount={filteredUsers.length}
        currentField={myField}
      />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
          <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest italic text-center">
            Scanning Global Sectors...
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 no-scrollbar pb-24 md:pb-8">
          {/* 🔥 THE FIX: Responsive Grid with dynamic gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-7xl mx-auto">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full py-16 sm:py-24 px-4 text-center border-2 border-dashed border-slate-200 rounded-[1.5rem] sm:rounded-[3rem] bg-white/50 italic text-slate-400 font-medium text-xs sm:text-sm">
                No commanders found in this sector.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const uid = String(user._id || user.id);
                return (
                  <UserCard
                    key={uid}
                    user={user}
                    onChallenge={onChallengeUser}
                    onFollow={handleFollow}
                    isFollowing={followingList.some((id) => String(id) === uid)}
                    challengeBusy={challengeLoadingIds[uid]}
                    inActiveBattle={activeBattleOpponentId === uid}
                    onClick={(id) => setSelectedUserId(id)}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Network;
