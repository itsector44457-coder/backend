import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Loader2,
  X,
  Timer,
  Swords,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_MOCK = `${import.meta.env.VITE_API_URL}/api/mock/generate`;
const API_MOCK_SAVE = `${import.meta.env.VITE_API_URL}/api/mock/save-result`;

const MockTest = ({
  isOpen,
  onClose,
  field,
  subject,
  topic,
  difficulty,
  onTestComplete,
}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);

  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setQuestions([]);
      setLoading(false);
      setError(null);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsFinished(false);
      setScore(0);
      setTimeLeft(600);
      hasSubmitted.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      topic?.title &&
      questions.length === 0 &&
      !error &&
      !loading
    ) {
      const fetchQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
          const url = `${API_MOCK}/${encodeURIComponent(field)}/${encodeURIComponent(subject)}/${encodeURIComponent(topic.title)}/${encodeURIComponent(difficulty)}`;
          const res = await axios.get(url);
          if (Array.isArray(res.data) && res.data.length > 0) {
            setQuestions(res.data);
          } else {
            throw new Error("AI Engine synchronization failed.");
          }
        } catch (err) {
          setError("Matrix Core Overloaded. Please try re-initializing.");
        } finally {
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [isOpen, topic?.title]);

  useEffect(() => {
    if (!isOpen || loading || isFinished || error || questions.length === 0)
      return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasSubmitted.current) handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, loading, isFinished, error, questions.length]);

  const handleOptionSelect = (optionIndex) => {
    if (isFinished) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optionIndex });
  };

  const handleSubmitTest = async () => {
    if (hasSubmitted.current || questions.length === 0) return;
    hasSubmitted.current = true;

    let finalScore = 0;
    let correct = 0;
    let wrong = 0;

    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        finalScore += 10;
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    setScore(finalScore);
    setIsFinished(true);
    const isPassed = finalScore >= questions.length * 10 * 0.8;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await axios.post(API_MOCK_SAVE, {
        userId: user.id || user._id,
        topicId: topic._id,
        topicName: topic.title,
        score: finalScore,
        totalQuestions: questions.length,
        correctAnswers: correct,
        wrongAnswers: wrong,
        difficulty: difficulty,
      });
    } catch (err) {
      console.error("Vault save failed");
    }
    onTestComplete(finalScore, isPassed);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-lg"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 50 }}
            // 🔥 THE FIX: Full screen on mobile h-[100dvh], floating on laptop
            className="relative w-full max-w-5xl h-[100dvh] sm:h-[90vh] bg-[#0f1221] border-x-0 sm:border border-indigo-500/30 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* 🟢 HEADER */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 border-b border-white/10 bg-slate-900/80 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/20 flex items-center justify-center rounded-xl sm:rounded-2xl border border-indigo-500/30 shrink-0">
                  <Swords size={20} className="text-indigo-400 sm:w-6 sm:h-6" />
                </div>
                <div className="truncate">
                  <h2 className="text-base sm:text-xl font-black text-white uppercase italic tracking-widest leading-none">
                    Combat Arena
                  </h2>
                  <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 truncate">
                    Node:{" "}
                    <span className="text-indigo-400">{topic?.title}</span>
                  </p>
                </div>
              </div>

              {!loading && !isFinished && !error && questions.length > 0 && (
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-950 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl border border-white/5 shadow-inner shrink-0">
                  <Timer
                    size={14}
                    className={
                      timeLeft < 60
                        ? "text-rose-500 animate-pulse"
                        : "text-indigo-400"
                    }
                  />
                  <span
                    className={`font-black text-base sm:text-xl tracking-widest ${timeLeft < 60 ? "text-rose-500" : "text-white"}`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              {(isFinished || error) && (
                <button
                  onClick={onClose}
                  className="p-2 bg-white/5 hover:bg-rose-500/20 text-slate-400 rounded-full transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* 🟢 MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-10 relative no-scrollbar">
              {error ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <AlertTriangle size={48} className="text-rose-500 mb-4" />
                  <h3 className="text-xl font-black text-white uppercase">
                    Sync Failure
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs">
                    {error}
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px]"
                  >
                    Abort
                  </button>
                </div>
              ) : loading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2
                    size={40}
                    className="animate-spin text-indigo-500 mb-4"
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse text-center">
                    Synthesizing Battle Logic...
                  </p>
                </div>
              ) : isFinished ? (
                // 🏆 RESULTS VIEW
                <div className="max-w-2xl mx-auto flex flex-col items-center text-center py-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-900 rounded-full flex items-center justify-center border-4 border-indigo-500/30 shadow-2xl mb-6 relative">
                    <Trophy
                      size={40}
                      className={
                        score >= questions.length * 8
                          ? "text-amber-400"
                          : "text-slate-500"
                      }
                    />
                    <div className="absolute -bottom-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase border-2 border-[#0f1221]">
                      Score: {score}
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-white uppercase italic mb-8">
                    {score >= questions.length * 8
                      ? "Mission Accomplished"
                      : "Mission Failed"}
                  </h3>

                  <div className="w-full space-y-4 text-left">
                    {questions.map((q, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5"
                      >
                        <p className="text-sm font-bold text-white mb-3">
                          Q{i + 1}: {q.questionText}
                        </p>
                        <div
                          className={`text-xs font-bold p-3 rounded-xl flex items-center gap-2 ${selectedAnswers[i] === q.correctAnswer ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                        >
                          {selectedAnswers[i] === q.correctAnswer ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          Your Logic:{" "}
                          {q.options?.[selectedAnswers[i]] || "Skipped"}
                        </div>
                        {selectedAnswers[i] !== q.correctAnswer && (
                          <p className="text-xs text-emerald-400 mt-2 ml-1">
                            ✓ Correct Data: {q.options?.[q.correctAnswer]}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500 mt-3 bg-slate-950/50 p-3 rounded-xl italic leading-relaxed">
                          <span className="text-indigo-400 font-black uppercase mr-1">
                            Insight:
                          </span>{" "}
                          {q.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // ❓ QUESTION VIEW
                questions.length > 0 && (
                  <div className="max-w-3xl mx-auto h-full flex flex-col pb-10">
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mb-6 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-500"
                        style={{
                          width: `${((currentIndex + 1) / questions.length) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase rounded">
                        Signal {currentIndex + 1} / {questions.length}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-2xl font-bold text-white leading-snug mb-8">
                      {questions[currentIndex]?.questionText}
                    </h3>

                    <div className="space-y-3 flex-1">
                      {questions[currentIndex]?.options?.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(idx)}
                          className={`w-full text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex items-center gap-3 sm:gap-4 active:scale-[0.98] ${
                            selectedAnswers[currentIndex] === idx
                              ? "bg-indigo-600/20 border-indigo-500 shadow-lg"
                              : "bg-slate-900/50 border-white/5"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                              selectedAnswers[currentIndex] === idx
                                ? "bg-indigo-500 text-white"
                                : "bg-white/5 text-slate-500"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span
                            className={`text-xs sm:text-sm font-medium ${selectedAnswers[currentIndex] === idx ? "text-white" : "text-slate-300"}`}
                          >
                            {option}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* 🟢 FOOTER */}
            {!loading && !isFinished && !error && questions.length > 0 && (
              <div className="px-5 py-4 sm:px-8 sm:py-5 border-t border-white/10 bg-slate-900/80 shrink-0 flex items-center justify-between">
                <button
                  onClick={() =>
                    currentIndex > 0 && setCurrentIndex(currentIndex - 1)
                  }
                  disabled={currentIndex === 0}
                  className="p-3 text-slate-400 disabled:opacity-20 active:bg-white/5 rounded-xl transition-all"
                >
                  <ChevronLeft size={24} />
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitTest}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Submit Combat
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="p-3 bg-white/10 text-indigo-400 rounded-xl active:scale-95 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MockTest;
