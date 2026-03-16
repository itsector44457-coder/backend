import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, Target, BrainCircuit, CheckCircle2 } from "lucide-react";

import SubjectSidebar from "../Syllabus/SubjectSidebar";
import TopicList from "../Syllabus/TopicList";
import MockTest from "./MockTest";
import TestHistoryModal from "./TestHistoryModal";

const API_ROADMAP = `https://backend-6hhv.onrender.com/api/roadmap`;
const API_MOCK = `https://backend-6hhv.onrender.com/api/mock`;

const Syllabus = ({ myField = "" }) => {
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const myId = currentUser?.id || currentUser?._id;

  const effectiveFieldRaw =
    myField ||
    currentUser?.field ||
    localStorage.getItem("userField") ||
    "General";

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const [savingTopicId, setSavingTopicId] = useState("");
  const [quizInputs, setQuizInputs] = useState({});
  const [currentDifficulty, setCurrentDifficulty] = useState("AI Calibrated");
  const [testLoading, setTestLoading] = useState(false);

  const [isTestOpen, setIsTestOpen] = useState(false);
  const [activeTestTopic, setActiveTestTopic] = useState(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeHistoryTopic, setActiveHistoryTopic] = useState(null);

  const selectedExam = useMemo(
    () => exams.find((e) => e._id === selectedExamId) || null,
    [exams, selectedExamId],
  );

  const selectedSubject = useMemo(
    () =>
      selectedExam?.subjects?.find((s) => s._id === selectedSubjectId) || null,
    [selectedExam, selectedSubjectId],
  );

  const activeTopic = useMemo(
    () =>
      selectedSubject?.topics?.find((t) => t._id === selectedTopicId) || null,
    [selectedSubject, selectedTopicId],
  );

  /* ===============================
        LOAD ROADMAP AS SYLLABUS
  =============================== */
  const loadRoadmapSyllabus = async () => {
    if (!myId) return;

    try {
      const res = await axios.get(`${API_ROADMAP}/${effectiveFieldRaw}`, {
        params: { userId: myId },
      });

      const roadmapNodes = res.data || [];

      const completedNodes = roadmapNodes.filter(
        (n) => n.status === "completed",
      ).length;

      const progressPercent =
        roadmapNodes.length > 0
          ? Math.round((completedNodes / roadmapNodes.length) * 100)
          : 0;

      const dynamicSyllabus = {
        _id: "a1a1a1a1a1a1a1a1a1a1a1a1",
        name: effectiveFieldRaw,
        progressPercent,

        subjects: roadmapNodes.map((node) => ({
          _id: node._id,
          name: node.title,
          subtitle: node.subject,
          status: node.status,

          topics: (node.fullStructure || []).map((mod, index) => ({
            _id: node._id.substring(0, 20) + String(index).padStart(4, "0"),
            title: mod.moduleName,
            description: mod.content,
            isCompleted: node.status === "completed",
          })),
        })),
      };

      setExams([dynamicSyllabus]);

      if (dynamicSyllabus.subjects.length > 0 && !selectedExamId) {
        setSelectedExamId(dynamicSyllabus._id);

        const activeSubject =
          dynamicSyllabus.subjects.find((s) => s.status === "active") ||
          dynamicSyllabus.subjects[0];

        setSelectedSubjectId(activeSubject._id);
        setSelectedTopicId(activeSubject.topics[0]?._id || "");
      }
    } catch (err) {
      console.error("Matrix Sync Failed", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadRoadmapSyllabus();
      setLoading(false);
    };

    init();
  }, [myId, effectiveFieldRaw]);

  /* ===============================
        UI HANDLERS
  =============================== */
  const handleTopicToggle = () => {};
  const handleQuizSubmit = () => {};

  const handleStartTest = (topic) => {
    setActiveTestTopic(topic);
    setIsTestOpen(true);
  };

  const handleViewHistory = (topic) => {
    setActiveHistoryTopic(topic);
    setIsHistoryOpen(true);
  };

  const handleTestComplete = (score, isPassed) => {
    if (isPassed) {
      const newXP = (currentUser.battlePoints || 0) + 50;
      const updatedUser = { ...currentUser, battlePoints: newXP };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      window.dispatchEvent(new Event("user_updated"));

      setNotice(`Mission Accomplished! +50 XP Awarded.`);
    } else {
      setNotice(`Mission Failed. Return to the vault and train harder!`);
    }

    setTimeout(() => setNotice(""), 4000);
  };

  /* ===============================
        LOADING SCREEN
  =============================== */
  if (loading || testLoading)
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50">
        <div className="relative mb-3">
          <Loader2 className="animate-spin text-indigo-500" size={36} />
          <BrainCircuit
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300"
            size={16}
          />
        </div>
        <p className="text-sm font-medium text-slate-500 tracking-wide">
          Syncing AI Matrix...
        </p>
      </div>
    );

  /* ===============================
        UI
  =============================== */
  return (
    <div className="h-full flex flex-col gap-4 sm:gap-5 font-sans text-slate-800 overflow-hidden p-2 sm:p-0 relative">
      {/* 🟢 HEADER - Clean, Flat, Minimal */}
      <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <Target size={22} className="sm:w-6 sm:h-6" />
          </div>

          <div>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">
              Sector Domain
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-none truncate max-w-[200px] sm:max-w-md">
              {effectiveFieldRaw}
            </h3>
          </div>
        </div>

        {/* Stats Boxes - Subtle look without harsh backgrounds */}
        <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-slate-50 border border-slate-100 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg flex flex-col justify-center sm:items-end">
            <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Mastery
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-800 mt-0.5 leading-none">
              {selectedExam?.progressPercent || 0}%
            </p>
          </div>

          <div className="flex-1 sm:flex-none bg-indigo-50 border border-indigo-100 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg flex flex-col justify-center sm:items-end">
            <p className="text-[9px] sm:text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Difficulty
            </p>
            <p className="text-sm font-bold text-indigo-700 mt-1 leading-none truncate">
              {currentDifficulty}
            </p>
          </div>
        </div>
      </div>

      {/* 🍞 TOAST NOTICE - Sleek floating notification */}
      {notice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2
            size={14}
            className={
              notice.includes("Failed") ? "text-rose-400" : "text-emerald-400"
            }
          />
          {notice}
        </div>
      )}

      {/* 🚀 WORKSPACE - Grid layout maintained */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 flex-1 min-h-0 overflow-hidden">
        {/* SUBJECT SIDEBAR */}
        <div className="md:col-span-4 h-full overflow-hidden">
          <SubjectSidebar
            subjects={selectedExam?.subjects || []}
            selectedSubjectId={selectedSubjectId}
            onSelect={(s) => {
              setSelectedSubjectId(s._id);
              setSelectedTopicId(s.topics[0]?._id || "");
            }}
          />
        </div>

        {/* TOPIC LIST */}
        <div className="md:col-span-8 h-full overflow-hidden">
          <TopicList
            topics={selectedSubject?.topics || []}
            selectedTopicId={selectedTopicId}
            onTopicSelect={(t) => setSelectedTopicId(t._id)}
            onToggle={handleTopicToggle}
            onQuizSubmit={handleQuizSubmit}
            onStartTest={handleStartTest}
            onViewHistory={handleViewHistory}
            quizInputs={quizInputs}
            setQuizInputs={setQuizInputs}
            savingTopicId={savingTopicId}
          />
        </div>
      </div>

      {/* MODALS */}
      <MockTest
        isOpen={isTestOpen}
        onClose={() => setIsTestOpen(false)}
        field={effectiveFieldRaw}
        subject={
          selectedSubject?.subtitle ||
          selectedSubject?.name ||
          "General Subject"
        }
        topic={activeTestTopic}
        difficulty={currentDifficulty.split(" ")[0]}
        onTestComplete={handleTestComplete}
      />

      <TestHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        topic={activeHistoryTopic}
        userId={myId}
      />
    </div>
  );
};

export default Syllabus;
