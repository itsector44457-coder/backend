import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Swords,
  Clock,
  Play,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

const BattleArena = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeExam, setActiveExam] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [warnings, setWarnings] = useState(0);

  const arenaRef = useRef(null);
  const activeExamRef = useRef(null);
  const selectedAnswersRef = useRef({});
  const isSubmittingRef = useRef(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userField = localStorage.getItem("userField");

  useEffect(() => {
    activeExamRef.current = activeExam;
  }, [activeExam]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  /* =============================
        FETCH EXAMS
  ============================= */
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/exams?field=${userField}`,
        );
        setExams(res.data);
      } catch (err) {
        console.error("Exams fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [userField]);

  /* =============================
        ANTI CHEAT SYSTEM
  ============================= */
  useEffect(() => {
    const handleCheatWarning = () => {
      if (!activeExamRef.current || isSubmittingRef.current) return;

      setWarnings((prev) => {
        const newCount = prev + 1;

        if (newCount >= 3) {
          submitExam(true);
        } else {
          alert(
            `🚨 CHEATING WARNING (${newCount}/3)\nTab switching or exiting fullscreen is prohibited!`,
          );

          try {
            if (!document.fullscreenElement && arenaRef.current) {
              const elem = arenaRef.current;
              if (elem.requestFullscreen)
                elem.requestFullscreen().catch(() => {});
              else if (elem.webkitRequestFullscreen)
                elem.webkitRequestFullscreen();
            }
          } catch (e) {
            console.log("Fullscreen request failed", e);
          }
        }
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden && activeExamRef.current) handleCheatWarning();
    };

    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        activeExamRef.current
      )
        handleCheatWarning();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  /* =============================
        START EXAM
  ============================= */
  const startExam = async (exam) => {
    try {
      if (arenaRef.current) {
        const elem = arenaRef.current;
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen)
          await elem.webkitRequestFullscreen();
      }
    } catch {
      alert("Please allow Fullscreen to start the test!");
      return;
    }

    isSubmittingRef.current = false;
    setWarnings(0);
    setActiveExam(exam);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setTestResult(null);
  };

  /* =============================
        SELECT OPTION
  ============================= */
  const handleSelectOption = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQIndex]: option,
    });
  };

  /* =============================
        SUBMIT EXAM
  ============================= */
  const submitExam = async (isCheatSubmit = false) => {
    if (
      !isCheatSubmit &&
      !window.confirm("Are you sure you want to finish the combat?")
    )
      return;

    isSubmittingRef.current = true;

    // 🔥 CRASH PROOF FULLSCREEN EXIT
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen)
          await document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    } catch (fsError) {
      console.log("Fullscreen exit ignored", fsError);
    }

    const currentExam = activeExamRef.current;
    const currentAnswers = selectedAnswersRef.current;

    if (!currentExam) return;

    let score = 0;
    currentExam.questions.forEach((q, index) => {
      if (currentAnswers[index] === q.correctAnswer) score++;
    });

    const percentage = Math.round((score / currentExam.questions.length) * 100);

    const finalScore = isCheatSubmit ? 0 : score;
    const finalPercentage = isCheatSubmit ? 0 : percentage;

    setTestResult({
      score: finalScore,
      total: currentExam.questions.length,
      percentage: finalPercentage,
      cheated: isCheatSubmit,
    });

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/combat-result`,
        {
          userId: user.id || user._id,
          examId: currentExam._id,
          examTitle: currentExam.title,
          score: finalScore,
          totalQuestions: currentExam.questions.length,
          percentage: finalPercentage,
          isCheated: isCheatSubmit,
        },
      );
    } catch (err) {
      console.error("Failed to save combat history", err);
    }

    if (isCheatSubmit) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/mark-cheater`,
          {
            email: user.email,
          },
        );
        const updatedUser = { ...user, cheaterTag: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch {
        console.error("Failed to mark cheater");
      }
    }

    setActiveExam(null);
  };

  /* =============================
        UI
  ============================= */
  return (
    <div
      ref={arenaRef}
      className={`w-full min-h-screen transition-all ${
        activeExam || testResult
          ? "bg-[#0f172a] p-4 md:p-8 flex items-center justify-center overflow-y-auto"
          : "p-4 md:p-0"
      }`}
    >
      {/* =============================
            RESULT SCREEN
      ============================= */}
      {testResult && (
        <div className="max-w-lg w-full bg-slate-900 border border-white/10 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] text-center shadow-2xl mx-auto">
          {testResult.cheated ? (
            <>
              <AlertTriangle
                size={60}
                className="mx-auto mb-4 md:mb-6 text-rose-500 animate-pulse md:w-[70px] md:h-[70px]"
              />
              <h2 className="text-3xl md:text-4xl font-black text-rose-500 uppercase mb-2 md:mb-3 leading-tight">
                Test Cancelled
              </h2>
              <p className="text-white text-sm md:text-base mb-6 md:mb-8 px-2">
                Suspicious activity detected. Cheater tag applied.
              </p>
            </>
          ) : (
            <>
              <ShieldAlert
                size={50}
                className={`mx-auto mb-4 md:mb-6 md:w-[60px] md:h-[60px] ${
                  testResult.percentage >= 50
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 md:mb-4">
                Combat Finished
              </h2>
              <div className="text-5xl md:text-7xl font-black text-indigo-400 mb-2">
                {testResult.score}/{testResult.total}
              </div>
              <p className="text-white text-sm md:text-base mb-6 md:mb-8">
                Accuracy: {testResult.percentage}%
              </p>
            </>
          )}

          <button
            onClick={() => setTestResult(null)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-sm md:text-base transition-colors"
          >
            Return to Arena
          </button>
        </div>
      )}

      {/* =============================
            LIVE EXAM
      ============================= */}
      {activeExam && !testResult && (
        <div className="max-w-4xl w-full mx-auto py-6 md:py-0">
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black text-center mb-4 md:mb-6">
            Do not exit Fullscreen or switch tabs. Warnings: {warnings}/3
          </div>

          <div className="bg-slate-900 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 mb-6 shadow-lg">
            <h3 className="text-lg md:text-xl text-white mb-6 md:mb-8 leading-relaxed">
              {currentQIndex + 1}.{" "}
              {activeExam.questions[currentQIndex].questionText}
            </h3>

            <div className="space-y-3 md:space-y-4">
              {activeExam.questions[currentQIndex].options.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-3 md:p-4 rounded-xl md:rounded-2xl border cursor-pointer transition-all ${
                    selectedAnswers[currentQIndex] === opt
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                      : "border-white/10 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <span className="text-sm md:text-base">{opt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(currentQIndex - 1)}
              className="px-4 py-3 md:px-6 md:py-3 bg-slate-800 text-white rounded-xl disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {currentQIndex === activeExam.questions.length - 1 ? (
              <button
                onClick={() => submitExam(false)}
                className="flex-1 md:flex-none px-6 py-3 md:px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wide transition-all"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
                className="flex-1 md:flex-none px-6 py-3 md:px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* =============================
            EXAM LIST
      ============================= */}
      {!activeExam && !testResult && (
        <div className="max-w-6xl mx-auto pb-10">
          <div className="mb-8 md:mb-10 px-2 md:px-0">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white uppercase flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Swords className="text-indigo-500 w-8 h-8 md:w-10 md:h-10" />
              Battle Arena
            </h1>
            <div className="bg-indigo-50 border border-indigo-100 dark:bg-slate-900/50 dark:border-white/5 p-4 md:p-5 rounded-2xl">
              <h2 className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Sign up for more Mock Tests and Previous Year Combats to sharpen
                your skills! Click the given link{" "}
                <a
                  href="https://accounts.examgoal.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-all"
                >
                  here
                </a>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="px-2 md:px-0">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
                Scanning matrix...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 md:px-0">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  className="bg-white dark:bg-slate-900 border dark:border-white/5 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                        {exam.type === "mock_test" ? "Mock Test" : "Past Paper"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <Clock size={10} /> {exam.timeLimit}m
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-4 line-clamp-2 leading-tight">
                      {exam.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => startExam(exam)}
                    className="w-full mt-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-white/5 dark:text-white dark:hover:bg-indigo-600 py-3 md:py-3.5 rounded-xl font-black flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-colors"
                  >
                    <Play size={14} />
                    Start Combat
                  </button>
                </div>
              ))}

              {exams.length === 0 && (
                <div className="col-span-full text-center py-16 md:py-20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem]">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No active combats found.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BattleArena;
