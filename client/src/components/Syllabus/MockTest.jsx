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

const API_MOCK = `https://backend-6hhv.onrender.com/api/mock/generate`;
const API_MOCK_SAVE = `https://backend-6hhv.onrender.com/api/mock/save-result`;

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
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 sm:p-4 font-sans">
          {/* Soft Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            // Clean White Background Container
            className="relative w-full max-w-4xl h-[100dvh] sm:h-[90vh] bg-white border border-slate-100 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* 🟢 HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center rounded-xl border border-indigo-100 shrink-0">
                  <Swords size={20} className="text-indigo-600" />
                </div>
                <div className="truncate">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-none">
                    Combat Arena
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1 truncate">
                    Node:{" "}
                    <span className="text-indigo-600">{topic?.title}</span>
                  </p>
                </div>
              </div>

              {!loading && !isFinished && !error && questions.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 shrink-0">
                  <Timer
                    size={16}
                    className={
                      timeLeft < 60
                        ? "text-rose-500 animate-pulse"
                        : "text-slate-500"
                    }
                  />
                  <span
                    className={`font-semibold text-sm font-mono ${
                      timeLeft < 60 ? "text-rose-600" : "text-slate-700"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              {(isFinished || error) && (
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* 🟢 MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-50/50 relative no-scrollbar">
              {error ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <AlertTriangle size={40} className="text-rose-500 mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">
                    Sync Failure
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs">
                    {error}
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors"
                  >
                    Close Arena
                  </button>
                </div>
              ) : loading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2
                    size={36}
                    className="animate-spin text-indigo-500 mb-4"
                  />
                  <p className="text-sm font-medium text-slate-500">
                    Synthesizing Battle Logic...
                  </p>
                </div>
              ) : isFinished ? (
                // 🏆 RESULTS VIEW
                <div className="max-w-2xl mx-auto flex flex-col items-center py-4">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm mb-4">
                    <Trophy
                      size={32}
                      className={
                        score >= questions.length * 8
                          ? "text-amber-500"
                          : "text-slate-400"
                      }
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                    {score >= questions.length * 8
                      ? "Mission Accomplished"
                      : "Mission Failed"}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mb-8 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
                    Final Score:{" "}
                    <span className="font-bold text-indigo-600">{score}</span>
                  </p>

                  <div className="w-full space-y-4 text-left">
                    {questions.map((q, i) => {
                      const isCorrect = selectedAnswers[i] === q.correctAnswer;
                      const isSkipped = selectedAnswers[i] === undefined;

                      return (
                        <div
                          key={i}
                          className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-slate-800 mb-4">
                            {i + 1}. {q.questionText}
                          </p>

                          <div
                            className={`p-3 rounded-lg flex items-start gap-3 border ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-100"
                                : isSkipped
                                  ? "bg-slate-50 border-slate-200"
                                  : "bg-rose-50 border-rose-100"
                            }`}
                          >
                            <div className="mt-0.5">
                              {isCorrect ? (
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-600"
                                />
                              ) : (
                                <XCircle
                                  size={16}
                                  className={
                                    isSkipped
                                      ? "text-slate-400"
                                      : "text-rose-600"
                                  }
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  isCorrect
                                    ? "text-emerald-800"
                                    : isSkipped
                                      ? "text-slate-600"
                                      : "text-rose-800"
                                }`}
                              >
                                Your Logic:{" "}
                                {q.options?.[selectedAnswers[i]] || "Skipped"}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm font-medium text-emerald-600 mt-2 flex items-center gap-1.5">
                                  <CheckCircle2 size={14} /> Correct Data:{" "}
                                  {q.options?.[q.correctAnswer]}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <span className="font-semibold text-indigo-600 mr-1">
                                Insight:
                              </span>
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // ❓ QUESTION VIEW
                questions.length > 0 && (
                  <div className="max-w-3xl mx-auto h-full flex flex-col pb-6">
                    {/* Slim Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                        style={{
                          width: `${((currentIndex + 1) / questions.length) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="mb-4">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        Question {currentIndex + 1} of {questions.length}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 leading-relaxed mb-8">
                      {questions[currentIndex]?.questionText}
                    </h3>

                    <div className="space-y-3 flex-1">
                      {questions[currentIndex]?.options?.map((option, idx) => {
                        const isSelected =
                          selectedAnswers[currentIndex] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-600 shadow-sm"
                                : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                isSelected
                                  ? "text-indigo-900"
                                  : "text-slate-700"
                              }`}
                            >
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* 🟢 FOOTER */}
            {!loading && !isFinished && !error && questions.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                <button
                  onClick={() =>
                    currentIndex > 0 && setCurrentIndex(currentIndex - 1)
                  }
                  disabled={currentIndex === 0}
                  className="px-4 py-2 text-slate-500 disabled:opacity-30 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <ChevronLeft size={18} /> Back
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitTest}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Submit Combat
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    Next <ChevronRight size={18} />
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
