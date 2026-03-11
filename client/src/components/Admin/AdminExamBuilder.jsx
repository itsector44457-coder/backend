import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Clock,
  Target,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  FileBox,
  KeyRound,
} from "lucide-react";

const AdminExamBuilder = () => {
  const { adminId } = useOutletContext();
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 AI MAGIC STATES
  const [rawAIText, setRawAIText] = useState("");
  const [isAIExtracting, setIsAIExtracting] = useState(false);

  const [answerKeyString, setAnswerKeyString] = useState("");
  const [examDetails, setExamDetails] = useState({
    fieldId: "",
    title: "",
    type: "mock_test",
    timeLimit: 60,
    totalMarks: 100,
  });

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
    },
  ]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/fields`,
        );
        setFields(res.data);
      } catch (err) {
        console.error("Failed to fetch fields");
      }
    };
    fetchFields();
  }, []);

  const handleDetailChange = (e) =>
    setExamDetails({ ...examDetails, [e.target.name]: e.target.value });
  const addQuestion = () =>
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        explanation: "",
      },
    ]);
  const removeQuestion = (index) => {
    if (questions.length === 1)
      return alert("Kam se kam 1 question hona chahiye!");
    setQuestions(questions.filter((_, i) => i !== index));
  };
  const handleQuestionTextChange = (text, qIndex) => {
    const updated = [...questions];
    updated[qIndex].questionText = text;
    setQuestions(updated);
  };
  const handleOptionChange = (text, qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };
  const handleCorrectAnswerSelect = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = optIndex;
    setQuestions(updated);
  };

  // ==========================================
  // 🤖 THE AI MAGIC FUNCTION
  // ==========================================
  const handleAIExtract = async () => {
    if (!rawAIText.trim())
      return alert("Pehle PDF ka kachra text box mein paste karo bhai!");

    setIsAIExtracting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/extract-ai`,
        {
          rawText: rawAIText,
        },
      );

      if (res.data && res.data.length > 0) {
        setQuestions(res.data); // AI ka data seedha state mein fit!
        setRawAIText(""); // Box khali kar do
        alert(
          `🔥 AI Magic Success! ${res.data.length} questions perfectly extract ho gaye.`,
        );
      } else {
        alert("AI ko questions nahi mile. Text check karo.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert("AI Server busy hai ya API key galat hai. Check console.");
    } finally {
      setIsAIExtracting(false);
    }
  };

  // ==========================================
  // 🔑 SMART ANSWER KEY MAPPER
  // ==========================================
  const applyAnswerKey = () => {
    const cleanKey = answerKeyString.replace(/[^A-Da-d]/g, "").toUpperCase();
    if (cleanKey.length === 0)
      return alert("Valid answer nahi mila. Sirf A, B, C, D type karo.");

    const updated = [...questions];
    let mappedCount = 0;

    for (let i = 0; i < updated.length && i < cleanKey.length; i++) {
      const char = cleanKey[i];
      if (char === "A") updated[i].correctOptionIndex = 0;
      else if (char === "B") updated[i].correctOptionIndex = 1;
      else if (char === "C") updated[i].correctOptionIndex = 2;
      else if (char === "D") updated[i].correctOptionIndex = 3;
      mappedCount++;
    }

    setQuestions(updated);
    setAnswerKeyString("");
    alert(`🔥 Magic! ${mappedCount} questions ki Answer Key map ho gayi!`);
  };

  const handleSaveExam = async () => {
    if (!examDetails.fieldId) return alert("Pehle Domain (Field) select karo!");
    if (!examDetails.title) return alert("Exam ka Title likho!");
    setLoading(true);
    try {
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.options[q.correctOptionIndex],
        explanation: q.explanation,
      }));
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/fields/${examDetails.fieldId}/exams`,
        { ...examDetails, questions: formattedQuestions },
        { headers: { adminid: adminId } },
      );
      alert("🔥 Exam Successfully Vaulted!");
      navigate("/admin/fields");
    } catch (err) {
      alert("Failed to save exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Back to Domain Architect
      </button>

      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-white flex items-center gap-3">
        <FileText className="text-indigo-400" size={32} /> Exam Architect
      </h2>

      {/* 🟢 STEP 1: EXAM METADATA */}
      <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-[2rem] shadow-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Target Domain
            </label>
            <select
              name="fieldId"
              value={examDetails.fieldId}
              onChange={handleDetailChange}
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Domain --</option>
              {fields.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.field}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Exam Type
            </label>
            <select
              name="type"
              value={examDetails.type}
              onChange={handleDetailChange}
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="mock_test">Custom Mock Test</option>
              <option value="past_paper">Previous Year Paper</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Time Limit (Mins)
            </label>
            <div className="relative">
              <Clock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="number"
                name="timeLimit"
                value={examDetails.timeLimit}
                onChange={handleDetailChange}
                className="w-full bg-slate-950 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Exam Title
            </label>
            <input
              type="text"
              name="title"
              value={examDetails.title}
              onChange={handleDetailChange}
              placeholder="e.g. MPPSC 2023 Prelims"
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 🤖 NEW STEP: AI MAGIC EXTRACTOR */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/50 p-6 rounded-[2rem] shadow-xl mb-8">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" /> AI Magic Extractor
          (PW Level 🚀)
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
          PDF ka garbled/kachra text yahan paste karo. AI usko 5 second me saaf
          karke questions bana dega!
        </p>
        <textarea
          rows="4"
          placeholder="Paste raw PDF text here..."
          value={rawAIText}
          onChange={(e) => setRawAIText(e.target.value)}
          className="w-full bg-slate-950/50 border border-indigo-500/30 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:border-indigo-500 font-mono text-xs"
        />
        <button
          onClick={handleAIExtract}
          disabled={isAIExtracting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isAIExtracting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {isAIExtracting
            ? "AI is processing your text..."
            : "Extract via Gemini AI"}
        </button>
      </div>

      {/* 🟢 STEP 2: QUESTIONS BUILDER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
          <CheckCircle2 size={16} /> Question Matrix ({questions.length})
        </h3>

        <div className="flex bg-slate-900 border border-indigo-500/30 rounded-xl overflow-hidden shadow-lg">
          <input
            type="text"
            placeholder="Paste Key (A B C D A...)"
            value={answerKeyString}
            onChange={(e) => setAnswerKeyString(e.target.value)}
            className="bg-transparent text-white px-4 py-2 text-xs outline-none w-48 font-medium"
          />
          <button
            onClick={applyAnswerKey}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <KeyRound size={14} /> Map
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] relative group hover:border-indigo-500/30 transition-all"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-500/30">
                Question {qIndex + 1}
              </span>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-slate-500 hover:text-rose-400 p-2 bg-white/5 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <textarea
              rows="2"
              placeholder="Question Text..."
              value={q.questionText}
              onChange={(e) => handleQuestionTextChange(e.target.value, qIndex)}
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 mb-6 outline-none focus:border-indigo-500 resize-none font-medium"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {q.options.map((opt, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${q.correctOptionIndex === optIndex ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-950 border-white/10"}`}
                >
                  <div
                    onClick={() => handleCorrectAnswerSelect(qIndex, optIndex)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer shrink-0 ${q.correctOptionIndex === optIndex ? "border-emerald-500" : "border-slate-600"}`}
                  >
                    {q.correctOptionIndex === optIndex && (
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(e.target.value, qIndex, optIndex)
                    }
                    className="w-full bg-transparent text-white text-sm outline-none font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full mt-6 py-6 border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-400 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={18} /> Add New Question
      </button>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-md border-t border-white/10 z-50 flex justify-end md:pr-10">
        <button
          onClick={handleSaveExam}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}{" "}
          Publish Exam Matrix
        </button>
      </div>
    </div>
  );
};

export default AdminExamBuilder;
