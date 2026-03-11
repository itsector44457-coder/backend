import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import Sidebar from "../Dashboard/Sidebar";
import Topbar from "../Dashboard/Topbar";
import SettingsDrawer from "../Dashboard/SettingsDrawer";
import ZenMode from "../Dashboard/ZenMode";
import QuickCaptureModal from "../Dashboard/QuickCaptureModal";
import StudyTimer from "./StudyTimer";
import BattleRequestModal from "../Battle/BattleRequestModal";

const socket = io(`${import.meta.env.VITE_API_URL}`);

const Dashboard = ({ theme, onSetTheme, themeOptions, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const myId = userData?.id || userData?._id;
  const myField = localStorage.getItem("userField") || userData?.field || "";

  /* ============================
        TIMER STATES
  ============================ */

  const [seconds, setSeconds] = useState(
    () => Number(localStorage.getItem("timer_seconds")) || 0,
  );

  const [isActive, setIsActive] = useState(
    () => localStorage.getItem("timer_isActive") === "true",
  );

  const [todayDeepSeconds, setTodayDeepSeconds] = useState(
    userData?.todayDeepSeconds || 0,
  );

  /* ============================
        BATTLE STATES
  ============================ */

  const [activeBattle, setActiveBattle] = useState(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);

  /* ============================
        UI STATES
  ============================ */

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [resourceDeckEnabled, setResourceDeckEnabled] = useState(true);

  /* ============================
        LIVE USER DATA SYNC
  ============================ */

  useEffect(() => {
    const handleStorageChange = () => {
      setUserData(JSON.parse(localStorage.getItem("user") || "{}"));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user_updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user_updated", handleStorageChange);
    };
  }, []);

  /* ============================
        SOCKET CONNECTION
  ============================ */

  useEffect(() => {
    if (!myId) return;

    socket.emit("join_private_sector", myId);

    socket.on("receive_battle_request", (data) => {
      setIncomingChallenge(data);
    });

    socket.on("battle_response_received", (data) => {
      alert(`Commander ${data.targetName} has ${data.status} your challenge!`);

      if (data.status === "accepted") {
        fetchActiveBattle();
      }
    });

    return () => {
      socket.off("receive_battle_request");
      socket.off("battle_response_received");
    };
  }, [myId]);

  /* ============================
        FETCH ACTIVE BATTLE
  ============================ */

  const fetchActiveBattle = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/battles/active/${myId}`,
      );

      setActiveBattle(res.data);
    } catch (err) {
      console.log("No active battle");
    }
  };

  useEffect(() => {
    fetchActiveBattle();
  }, [myId]);

  /* ============================
        TIMER LOGIC
  ============================ */

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
        localStorage.setItem("timer_lastTimestamp", Date.now().toString());
      }, 1000);
    }

    localStorage.setItem("timer_seconds", seconds);
    localStorage.setItem("timer_isActive", isActive);

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  /* ============================
        HANDLERS
  ============================ */

  const handleSessionSaved = (duration) => {
    setTodayDeepSeconds((prev) => prev + duration);

    setSeconds(0);
    setIsActive(false);

    localStorage.removeItem("timer_seconds");
    localStorage.removeItem("timer_isActive");
    localStorage.removeItem("timer_lastTimestamp");
  };

  const handleAcceptBattle = () => {
    socket.emit("respond_to_challenge", {
      fromUserId: incomingChallenge.senderId,
      status: "accepted",
      targetName: userData.name,
    });

    setIncomingChallenge(null);
    fetchActiveBattle();

    navigate("/dashboard/battle-arena", {
      state: {
        opponent: incomingChallenge.senderName,
        field: incomingChallenge.battleType,
      },
    });
  };

  const handleRejectBattle = () => {
    socket.emit("respond_to_challenge", {
      fromUserId: incomingChallenge.senderId,
      status: "rejected",
      targetName: userData.name,
    });

    setIncomingChallenge(null);
  };

  const formatHours = (sec) => `${(sec / 3600).toFixed(1)}h`;

  /* ============================
        UI
  ============================ */

  return (
    // 🔥 THE FIX: Changed h-screen to h-[100dvh] and added w-full to prevent layout breaks on mobile browsers
    <div className="flex h-[100dvh] w-full bg-slate-100 overflow-hidden relative">
      {/* SIDEBAR */}
      <Sidebar setZenMode={setZenMode} onLogout={onLogout} />

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden relative">
        {/* TOPBAR */}
        <Topbar
          currentUserName={userData.name || "Commander"}
          myField={myField}
          todayDeepSeconds={todayDeepSeconds + (isActive ? seconds : 0)}
          streakCount={userData.streakCount}
          battlePoints={userData.battlePoints}
          setSettingsOpen={setSettingsOpen}
          setQuickCaptureOpen={setQuickCaptureOpen}
          resourceDeckEnabled={resourceDeckEnabled}
          toggleResourceDeck={() =>
            setResourceDeckEnabled(!resourceDeckEnabled)
          }
          formatHours={formatHours}
        />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-20 md:pb-6 scroll-smooth">
          {location.pathname === "/dashboard" && (
            <div className="mb-4 sm:mb-6">
              <StudyTimer
                isActive={isActive}
                setIsActive={setIsActive}
                seconds={seconds}
                setSeconds={setSeconds}
                onSessionSaved={handleSessionSaved}
                battle={activeBattle}
                onBattleLose={(data) =>
                  axios.put(
                    `${import.meta.env.VITE_API_URL}/api/battles/${data.battleId}/lose`,
                    data,
                  )
                }
              />
            </div>
          )}

          <Outlet
            context={{
              currentUserId: myId,
              myField,
              resourceDeckEnabled,
            }}
          />
        </main>
      </div>

      {/* MODALS */}
      <BattleRequestModal
        request={incomingChallenge}
        onAccept={handleAcceptBattle}
        onReject={handleRejectBattle}
      />

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onViewHistory={() => {
          setSettingsOpen(false);
          navigate("/dashboard/history");
        }}
        onViewBattles={() => {
          setSettingsOpen(false);
          navigate("/dashboard/battles");
        }}
        onViewWeakness={() => {
          setSettingsOpen(false);
          navigate("/dashboard/weakness");
        }}
        theme={theme}
        onSetTheme={onSetTheme}
        themeOptions={themeOptions}
        onLogout={onLogout}
      />

      {zenMode && (
        <ZenMode
          setZenMode={setZenMode}
          isActive={isActive}
          setIsActive={setIsActive} // Ye pass karna zaroori tha timer start karne ke liye
          seconds={seconds}
          todayDeepSeconds={todayDeepSeconds}
          setQuickCaptureOpen={setQuickCaptureOpen}
        />
      )}

      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
