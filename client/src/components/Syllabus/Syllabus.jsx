import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, Target, BrainCircuit } from "lucide-react";

import SubjectSidebar from "../Syllabus/SubjectSidebar";
import TopicList from "../Syllabus/TopicList";
import ResourceVault from "../Syllabus/ResourceVault";
import MockTest from "./MockTest";
import TestHistoryModal from "./TestHistoryModal";

const API_ROADMAP = `${import.meta.env.VITE_API_URL}/api/roadmap`;
const API_RESOURCES = `${import.meta.env.VITE_API_URL}/api/resources`;
const API_MOCK = `${import.meta.env.VITE_API_URL}/api/mock`;

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

  const [resources, setResources] = useState([]);
  const [resourceType, setResourceType] = useState("All");

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

  /* ===============================
        LOAD RESOURCES
  =============================== */

  const loadResources = async (tId, eId) => {
    if (!tId || !eId) {
      setResources([]);
      return;
    }

    try {
      const params = { topicId: tId, examId: eId, userId: myId };

      if (resourceType !== "All" && resourceType !== "Saved")
        params.type = resourceType;

      const res = await axios.get(API_RESOURCES, { params });

      setResources(res.data || []);
    } catch {
      console.error("Vault Access Failed");
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

  useEffect(() => {
    if (selectedTopicId) loadResources(selectedTopicId, selectedExamId);
  }, [selectedTopicId, selectedExamId, resourceType]);

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
      <div className="h-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="relative">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={50} />
          <BrainCircuit
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300"
            size={20}
          />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse mt-4">
          Syncing AI Matrix to Workspace...
        </p>
      </div>
    );

  /* ===============================
        UI
  =============================== */

  return (
    <div className="h-full flex flex-col gap-5 font-sans text-slate-900 bg-[#f8fafc] overflow-hidden max-h-screen p-4 relative">
      {/* HEADER */}

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-indigo-500 shadow-2xl shadow-indigo-200">
            <Target size={28} />
          </div>

          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 italic">
              AI Generated Domain
            </p>

            <h3 className="text-2xl font-black text-slate-900 italic uppercase leading-none">
              {effectiveFieldRaw}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-3xl text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Global Mastery
            </p>

            <p className="text-xl font-black text-indigo-600 mt-1">
              {selectedExam?.progressPercent || 0}%
            </p>
          </div>

          <div className="bg-indigo-600 text-white px-5 py-3 rounded-3xl shadow-lg shadow-indigo-100">
            <p className="text-[9px] font-black uppercase opacity-70">
              Sector Difficulty
            </p>

            <p className="text-sm font-black uppercase tracking-widest mt-1">
              {currentDifficulty}
            </p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[600] px-8 py-4 bg-indigo-600 text-white text-[12px] font-black rounded-full uppercase tracking-widest shadow-lg">
          {notice}
        </div>
      )}

      {/* WORKSPACE */}

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* SUBJECT SIDEBAR */}

        <div className="col-span-4 h-full overflow-hidden">
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

        <div className="col-span-4 h-full overflow-hidden border-r border-slate-200 pr-6">
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

        {/* RESOURCE VAULT */}

        <div className="col-span-4 h-full overflow-hidden">
          <ResourceVault
            resources={resources}
            resourceType={resourceType}
            setResourceType={setResourceType}
          />
        </div>
      </div>

      {/* MOCK TEST MODAL */}

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

      {/* HISTORY MODAL */}

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
