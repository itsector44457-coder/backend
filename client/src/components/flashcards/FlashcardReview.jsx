import { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  CheckCircle,
  Trophy,
  ArrowLeft,
  Brain,
  Zap,
  Loader2,
} from "lucide-react";
import axios from "axios";
import Scratchpad from "./Scratchpad"; // ✅ Import

const RATINGS = [
  {
    key: "again",
    label: "Again",
    sub: "< 1m",
    emoji: "🔴",
    cls: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
  },
  {
    key: "hard",
    label: "Hard",
    sub: "1d",
    emoji: "🟠",
    cls: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
  },
  {
    key: "good",
    label: "Good",
    sub: "3d",
    emoji: "🟢",
    cls: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
  },
  {
    key: "easy",
    label: "Easy",
    sub: "7d",
    emoji: "🔵",
    cls: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100",
  },
];

export default function FlashcardReview({ deck, onBack }) {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  // ✅ Scratchpad reset on every new card
  const [scratchKey, setScratchKey] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (!myId || !deck?._id) return;
    axios
      .get(
        `https://backend-6hhv.onrender.com/api/flashcards/cards/due/${myId}/${deck._id}`,
      )
      .then((r) => setCards(r.data))
      .catch((err) => console.error("Cards Load Error:", err))
      .finally(() => setLoading(false));
  }, [deck?._id, myId]);

  const handleRate = useCallback(
    async (rating) => {
      const card = cards[index];
      if (!card || !card._id) {
        console.error("Card or ID missing at index:", index);
        return;
      }
      try {
        await axios.patch(
          `https://backend-6hhv.onrender.com/api/flashcards/cards/${card._id}/review`,
          { rating },
        );

        // Log to stats
        await axios
          .post("https://backend-6hhv.onrender.com/api/stats/log", {
            userId: myId,
            deckId: deck._id,
            rating,
          })
          .catch(() => {}); // silent fail — stats non-critical

        setResults((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
        setFlipped(false);

        setTimeout(() => {
          if (index + 1 >= cards.length) setDone(true);
          else {
            setIndex((i) => i + 1);
            setScratchKey((k) => k + 1); // ✅ Reset scratchpad for next card
          }
        }, 300);
      } catch (err) {
        console.error("Review Update Failed", err);
      }
    },
    [cards, index, myId, deck._id],
  );

  const current = cards[index];
  const progress = cards.length ? (index / cards.length) * 100 : 0;

  if (loading)
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Loading Neural Cards...
        </p>
      </div>
    );

  if (!loading && cards.length === 0)
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <CheckCircle className="text-emerald-500 mb-4" size={48} />
        <h2 className="text-xl font-black text-slate-800 uppercase italic">
          All Caught Up!
        </h2>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
          No cards due for review today.
        </p>
        <button
          onClick={onBack}
          className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px]"
        >
          Back to Vault
        </button>
      </div>
    );

  if (done)
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
        <Trophy className="w-16 h-16 text-emerald-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-800 uppercase italic">
          Sync Complete!
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg my-8">
          {RATINGS.map((r) => (
            <div
              key={r.key}
              className={`rounded-3xl p-4 text-center border-2 ${r.cls}`}
            >
              <div className="text-xl font-black">{results[r.key]}</div>
              <div className="text-[8px] font-black uppercase tracking-widest opacity-60">
                {r.label}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-3 text-xs font-black uppercase text-white bg-indigo-600 px-8 py-4 rounded-2xl shadow-xl"
        >
          <ArrowLeft size={16} /> Back to Vault
        </button>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full flex flex-col h-full overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
        >
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-black text-slate-800 uppercase italic truncate">
            {deck.title}
          </h3>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase shrink-0">
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* ── Flashcard ── */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className="shrink-0 cursor-pointer"
        style={{ perspective: "2000px" }}
      >
        <div
          className="relative w-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "200px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white border-2 border-slate-50 rounded-[2rem] shadow-sm flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Brain className="text-indigo-300 mb-3" size={22} />
            <p className="text-lg font-black text-slate-800 uppercase italic leading-tight">
              {current?.frontText}
            </p>
            <div className="absolute bottom-5 text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse italic">
              Click to reveal answer
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-indigo-600 border-2 border-indigo-400 rounded-[2rem] shadow-sm flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <Zap className="text-indigo-200 mb-3" size={22} />
            <p className="text-base font-bold text-white leading-relaxed">
              {current?.backText}
            </p>
          </div>
        </div>
      </div>

      {/* ── Rating Buttons ── */}
      <div className="shrink-0 mt-3" style={{ minHeight: "72px" }}>
        {flipped ? (
          <div className="grid grid-cols-4 gap-2 animate-in slide-in-from-bottom-4 duration-200">
            {RATINGS.map((r) => (
              <button
                key={r.key}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate(r.key);
                }}
                className={`flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border-2 text-[10px] font-black uppercase italic transition-all active:scale-95 ${r.cls}`}
              >
                <span className="text-lg">{r.emoji}</span>
                <span>{r.label}</span>
                <span className="opacity-50 text-[8px]">{r.sub}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-slate-400 font-black uppercase italic text-[10px] animate-pulse h-full py-4">
            <RotateCcw size={14} className="text-indigo-400" />
            Click card to flip
          </div>
        )}
      </div>

      {/* ✅ SCRATCHPAD — resets with each new card via key prop */}
      <Scratchpad key={scratchKey} defaultOpen={false} />

      {/* Bottom padding */}
      <div className="h-4 shrink-0" />
    </div>
  );
}
