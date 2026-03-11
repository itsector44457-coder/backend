import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Loader2,
  Map,
  Lock,
  CheckCircle2,
  Zap,
  BrainCircuit,
  Target,
  ChevronRight,
  X,
  BookOpen,
  Trophy,
} from "lucide-react";

const API_ROADMAP = `${import.meta.env.VITE_API_URL}/api/roadmap`;

const RoadmapPage = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myField = storedUser?.field || "General";
  const myId = storedUser?.id || storedUser?._id;

  const [roadmapNodes, setRoadmapNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  const [completing, setCompleting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [notice, setNotice] = useState("");

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ROADMAP}/${myField}`, {
        params: { userId: myId },
      });
      setRoadmapNodes(res.data || []);
    } catch (err) {
      console.error("Tree Matrix Offline", err);
    } finally {
      setLoading(false);
    }
  }, [myField, myId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleGenerateAITree = async () => {
    setGeneratingAI(true);
    setNotice("Initiating AI... Generating Matrix.");
    try {
      await axios.post(`${API_ROADMAP}/generate-roadmap`, {
        field: myField,
        duration: "3 Months",
        currentLevel: "Beginner",
      });
      setNotice(`✅ AI Matrix for ${myField} generated!`);
      setTimeout(() => setNotice(""), 4000);
      await fetchTree();
    } catch (err) {
      alert("AI Engine Overloaded!");
      setNotice("");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCompleteNode = async (nodeId) => {
    setCompleting(true);
    try {
      const res = await axios.post(`${API_ROADMAP}/complete/${nodeId}`, {
        userId: myId,
      });
      const updatedUser = {
        ...storedUser,
        battlePoints: res.data.battlePoints,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setNotice(res.data.message || "Node Conquered! +20 XP");
      setTimeout(() => setNotice(""), 4000);
      setSelectedNode(null);
      await fetchTree();
    } catch (err) {
      alert("System Error: Failed to sync progress.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading && roadmapNodes.length === 0 && !generatingAI)
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
        <div className="relative mb-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <BrainCircuit
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300"
            size={16}
          />
        </div>
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
          Accessing Neural Tree for {myField}...
        </p>
      </div>
    );

  return (
    <div className="h-full flex flex-col font-sans bg-[#f8fafc] overflow-hidden p-3 sm:p-6 md:p-8 relative">
      {/* 🟢 NOTIFICATION TOAST - Responsive size */}
      {notice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[600] bg-indigo-600 text-white px-5 py-3 sm:px-8 sm:py-4 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 animate-in slide-in-from-top-10 fade-in duration-500 border-2 border-indigo-400 w-[90%] sm:w-auto justify-center">
          {notice.includes("XP") ? (
            <Trophy size={16} className="text-amber-400" />
          ) : (
            <BrainCircuit size={16} />
          )}
          <span className="font-black italic uppercase tracking-widest text-[10px] sm:text-sm truncate">
            {notice}
          </span>
        </div>
      )}

      {/* 🟢 DYNAMIC HEADER - Adaptive Padding */}
      <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shrink-0 shadow-2xl relative overflow-hidden mb-8 sm:mb-12 border border-slate-800">
        <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center text-indigo-400 backdrop-blur-md border border-white/10">
            <Map size={24} className="sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-0.5 sm:mb-1 italic">
              AI Generated Tree
            </p>
            <h2 className="text-xl sm:text-3xl font-black text-white italic uppercase leading-tight tracking-tighter truncate">
              {myField} <span className="text-indigo-500">Mastery</span>
            </h2>
          </div>
        </div>
      </div>

      {/* 🌳 MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative px-2 sm:px-4 pb-32">
        {!loading && roadmapNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 sm:mt-20 max-w-lg mx-auto text-center px-4">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border border-indigo-100 shadow-inner">
              <BrainCircuit
                size={32}
                className="text-indigo-400 sm:w-10 sm:h-10"
              />
            </div>
            <h3 className="text-xl sm:text-3xl font-black uppercase italic tracking-widest text-slate-800 mb-2">
              Matrix Not Initialized
            </h3>
            <p className="text-[11px] sm:text-sm font-bold text-slate-500 mb-8 sm:mb-10 leading-relaxed">
              The pathway for <span className="text-indigo-600">{myField}</span>{" "}
              is empty. Initialize Gemini Engine.
            </p>
            <button
              onClick={handleGenerateAITree}
              disabled={generatingAI}
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-2xl sm:rounded-3xl font-black uppercase italic tracking-[0.1em] sm:tracking-[0.2em] hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {generatingAI ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Generate AI Tree <Zap size={18} fill="white" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="relative max-w-5xl mx-auto">
            {/* Timeline Line - Fixed position for mobile */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-indigo-100 rounded-full md:-translate-x-1/2"></div>

            {roadmapNodes.map((node, index) => {
              const isCompleted = node.status === "completed";
              const isActive = node.status === "active";
              const isLocked = node.status === "locked";
              const isEven = index % 2 === 0;

              return (
                <div
                  key={node._id}
                  className={`relative flex items-center justify-between mb-8 sm:mb-16 w-full ${isEven ? "md:flex-row-reverse" : "md:flex-row"} flex-row`}
                >
                  <div className="hidden md:block w-[45%]"></div>

                  {/* Node Circle - Fixed for mobile */}
                  <div
                    className={`absolute left-6 md:left-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border-4 sm:border-[6px] border-[#f8fafc] shadow-lg z-10 transform -translate-x-1/2 transition-all duration-500
                    ${isCompleted ? "bg-emerald-500 shadow-emerald-100" : isActive ? "bg-indigo-600 shadow-indigo-100 animate-pulse" : "bg-slate-200"}`}
                  >
                    {isCompleted && (
                      <CheckCircle2
                        size={16}
                        className="text-white sm:w-5 sm:h-5"
                      />
                    )}
                    {isActive && (
                      <Zap
                        size={16}
                        className="text-white fill-white sm:w-5 sm:h-5"
                      />
                    )}
                    {isLocked && (
                      <Lock
                        size={14}
                        className="text-slate-400 sm:w-4 sm:h-4"
                      />
                    )}
                  </div>

                  {/* Node Card - Responsive width & spacing */}
                  <div
                    onClick={() => !isLocked && setSelectedNode(node)}
                    className={`w-[calc(100%-3rem)] md:w-[45%] ml-auto md:ml-0 bg-white border-2 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 transition-all duration-300 relative group
                      ${isLocked ? "border-slate-100 opacity-60 grayscale cursor-not-allowed" : "border-slate-100 hover:border-indigo-300 cursor-pointer shadow-md hover:-translate-y-1"}
                      ${isActive ? "ring-4 ring-indigo-50 border-indigo-200" : ""}`}
                  >
                    {isActive && (
                      <div className="absolute -top-2.5 -right-2 bg-indigo-600 text-white text-[7px] sm:text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg animate-bounce">
                        Target
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest w-max px-2 py-0.5 rounded-lg 
                        ${isCompleted ? "bg-emerald-50 text-emerald-600" : isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        Phase {index + 1} • {node.estimatedTime || "Time"}
                      </span>
                      <h4 className="text-base sm:text-xl font-black uppercase italic text-slate-900 tracking-tight leading-tight">
                        {node.title}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {node.subject || "Concepts"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔮 NODE INSPECTOR MODAL - Full Screen on mobile */}
      {selectedNode && (
        <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 sm:p-8 bg-slate-900 text-white flex justify-between items-start shrink-0">
              <div>
                <p className="text-[8px] sm:text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                  <Target size={12} /> Mission Protocol
                </p>
                <h3 className="text-xl sm:text-3xl font-black uppercase italic tracking-tighter leading-none truncate max-w-[250px] sm:max-w-none">
                  {selectedNode.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-50 no-scrollbar">
              <div className="mb-6">
                <h4 className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Core Modules
                </h4>
                <div className="grid gap-2">
                  {selectedNode.fullStructure?.map((mod, i) => (
                    <div
                      key={i}
                      className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px] shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                          {mod.moduleName}
                        </h5>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {mod.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNode.tasks?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    Objectives
                  </h4>
                  <div className="grid gap-2">
                    {selectedNode.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 text-[11px] sm:text-sm font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-50 shadow-sm"
                      >
                        <CheckCircle2
                          size={14}
                          className="text-emerald-500 shrink-0"
                        />{" "}
                        <span className="truncate">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedNode.status === "active" && (
              <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0">
                <button
                  onClick={() => handleCompleteNode(selectedNode._id)}
                  disabled={completing}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black uppercase italic tracking-widest text-[10px] sm:text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {completing ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <>
                      Conquer Phase <Zap size={14} fill="white" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
