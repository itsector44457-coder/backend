import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// --- Global Pages ---
import Dashboard from "./components/Dashboard/Dashboard";
import AuthScreen from "./components/Ulogin/AuthScreen";
import AdminPage from "./AdminPage/AdminCategories";
import RoadmapPage from "./components/Roadmap/RoadmapPage";
import ResourcesPage from "./components/VaultNote/ResourcesPage";

// --- Dashboard Sub-Pages (SPA Components) ---
import Tasks from "./pages/Tasks";
import Syllabus from "./components/Syllabus/Syllabus";
import Community from "./components/Community/Community";
import Network from "./components/Network/Network";
import UniversePage from "./pages/UniversePage";
import UserProfile from "./pages/UserProfile";
import BattleArena from "./components/Battle/BattleArena";

// --- Settings Sub-Views ---
import SessionHistory from "./components/Dashboard/SubViews/SessionHistory";
import BattleHistory from "./components/Dashboard/SubViews/BattleHistory";
import NeuralWeaknesses from "./components/Dashboard/SubViews/NeuralWeaknesses";

// ✅ NEW: Flashcards Feature
import FlashcardsPage from "./pages/FlashcardsPage";
import StudyStats from "../components/flashcards/StudyStats";

// --- Admin Pages ---
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminUsers from "./components/Admin/AdminUsers";
import UserAnalyticsPage from "./components/Admin/UserAnalyticsPage";
import AdminFields from "./components/Admin/AdminFields";
import AdminExamBuilder from "./components/Admin/AdminExamBuilder";

// Theme Configuration
const THEME_OPTIONS = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "midnight", label: "Midnight" },
  { id: "ocean", label: "Ocean" },
  { id: "forest", label: "Forest" },
  { id: "sunset", label: "Sunset" },
  { id: "rose", label: "Rose" },
];

// 🛡️ PROTECTED ROUTE WRAPPER (For both User & Admin)
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("uiTheme") || "light",
  );

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser?.id || storedUser?._id || null;
  const myField = storedUser?.field || localStorage.getItem("userField") || "";

  useEffect(() => {
    const safeTheme = THEME_OPTIONS.some((item) => item.id === theme)
      ? theme
      : "light";
    document.documentElement.setAttribute("data-theme", safeTheme);
    document.documentElement.classList.toggle("dark", safeTheme !== "light");
    localStorage.setItem("uiTheme", safeTheme);
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <Router>
      <div className="App min-h-screen app-theme font-sans bg-[#f8fafc]">
        <Routes>
          {/* 1. 🟢 ROOT / LOGIN */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
              )
            }
          />

          {/* 2. 🚀 SPA DASHBOARD SYSTEM */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard
                  theme={theme}
                  onSetTheme={setTheme}
                  themeOptions={THEME_OPTIONS}
                  onLogout={handleLogout}
                  currentUserId={currentUserId}
                  myField={myField}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Tasks />} />
            <Route path="battle-arena" element={<BattleArena />} />
            <Route path="syllabus" element={<Syllabus myField={myField} />} />
            <Route path="community" element={<Community myField={myField} />} />
            <Route path="network" element={<Network />} />
            <Route path="universe" element={<UniversePage />} />
            <Route path="flashcard-stats" element={<StudyStats />} />
            <Route
              path="profile"
              element={
                <UserProfile currentUserId={currentUserId} myField={myField} />
              }
            />
            <Route path="history" element={<SessionHistory />} />
            <Route path="battles" element={<BattleHistory />} />
            <Route path="weakness" element={<NeuralWeaknesses />} />

            {/* ✅ NEW: Flashcards & SRS Route */}
            <Route path="flashcards" element={<FlashcardsPage />} />
          </Route>

          {/* 3. 🌐 GLOBAL PROTECTED PAGES */}
          <Route
            path="/vault"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <RoadmapPage theme={theme} />
              </ProtectedRoute>
            }
          />

          {/* 4. 🛡️ ADMIN PANEL SYSTEM */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:userId" element={<UserAnalyticsPage />} />
            <Route path="fields" element={<AdminFields />} />
            <Route path="exams/build" element={<AdminExamBuilder />} />
          </Route>

          {/* 5. 🛑 CATCH-ALL SAFETY NET */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
