const mongoose = require("mongoose");
const Flashcard = require("../models/Flashcard");
const StudySession = require("../models/StudySession"); // Flashcards ka daily review data
const Deck = require("../models/Deck");
const FocusSession = require("../models/Session"); // Timer wala session data

// 🛠️ FIX: India (Local) Timezone ke hisaab se aaj ki date nikalna
const getLocalYYYYMMDD = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

// ==========================================
// 1. DASHBOARD STATS (GET /api/stats/:id)
// ==========================================
const getStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // A) Flashcards ka data nikalo
    const cardSessions = await StudySession.find({ userId }).select(
      "date reviewed correct -_id",
    );

    // B) Timer ka data nikalo (Aggregating total seconds per day)
    let timerSessions = [];
    try {
      timerSessions = await FocusSession.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$date", totalStudySeconds: { $sum: "$duration" } } },
      ]);
    } catch (e) {
      console.log("Timer data nahi mila:", e.message);
    }

    // C) Dono ko Merge (Jod) karo Matrix ke liye
    const heatmapMap = {};

    cardSessions.forEach((session) => {
      heatmapMap[session.date] = {
        date: session.date,
        reviewed: session.reviewed || 0,
        correct: session.correct || 0,
        totalStudySeconds: 0,
      };
    });

    timerSessions.forEach((session) => {
      const dateStr = session._id;
      if (!heatmapMap[dateStr]) {
        heatmapMap[dateStr] = {
          date: dateStr,
          reviewed: 0,
          correct: 0,
          totalStudySeconds: 0,
        };
      }
      heatmapMap[dateStr].totalStudySeconds = session.totalStudySeconds || 0;
    });

    // Object ko wapas Array banakar sort kar lo
    const finalHeatmap = Object.values(heatmapMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    // D) Retention per deck & Weakest Cards
    const decks = await Deck.find({ userId });
    const deckStats = await Promise.all(
      decks.map(async (deck) => {
        const cards = await Flashcard.find({ deckId: deck._id, userId });
        const total = cards.length;
        if (total === 0) return null;

        const mastered = cards.filter((c) => c.easeFactor >= 2.5).length;
        const weak = cards.filter((c) => c.easeFactor < 1.8).length;
        const retention = Math.round((mastered / total) * 100);

        const weakCards = cards
          .sort((a, b) => a.easeFactor - b.easeFactor)
          .slice(0, 3)
          .map((c) => ({
            _id: c._id,
            frontText: c.frontText,
            easeFactor: c.easeFactor.toFixed(2),
            interval: c.interval,
          }));

        return {
          deckId: deck._id,
          deckTitle: deck.title,
          category: deck.category,
          total,
          mastered,
          weak,
          retention,
          weakCards,
        };
      }),
    );

    // E) Overall numbers (Yeh tumhara Total XP banega)
    const totalReviewed = cardSessions.reduce(
      (s, x) => s + (x.reviewed || 0),
      0,
    );
    const totalCorrect = cardSessions.reduce((s, x) => s + (x.correct || 0), 0);
    const overallRetention = totalReviewed
      ? Math.round((totalCorrect / totalReviewed) * 100)
      : 0;

    // F) Current Streak (MERGED DATA KE HISAAB SE)
    const dates = [...new Set(finalHeatmap.map((s) => s.date))]
      .sort()
      .reverse();
    let streak = 0;

    const todayStr = getLocalYYYYMMDD();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setMinutes(
      yesterday.getMinutes() - yesterday.getTimezoneOffset(),
    );
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let check = dates.includes(todayStr)
      ? todayStr
      : dates.includes(yesterdayStr)
        ? yesterdayStr
        : null;

    if (check) {
      for (const date of dates) {
        if (date === check) {
          streak++;
          const d = new Date(check);
          d.setDate(d.getDate() - 1);
          check = d.toISOString().split("T")[0];
        } else {
          break;
        }
      }
    }

    res.status(200).json({
      heatmap: finalHeatmap,
      deckStats: deckStats.filter(Boolean),
      totalReviewed,
      overallRetention,
      streak,
    });
  } catch (err) {
    console.error("Stats Fetch Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// 2. LOG STUDY STATS (POST /api/stats/log)
// ==========================================
const logStat = async (req, res) => {
  try {
    const { userId, deckId, rating } = req.body;
    const todayStr = getLocalYYYYMMDD();

    // Check if user answered correctly (Good or Easy)
    const isCorrect = rating === "good" || rating === "easy" ? 1 : 0;

    // Turant Database update karo (Taaki XP live badhe)
    const updatedSession = await StudySession.findOneAndUpdate(
      { userId, date: todayStr },
      {
        $inc: {
          reviewed: 1, // XP + 1
          correct: isCorrect, // Correct + 1 (Retention ke liye)
        },
      },
      { upsert: true, new: true }, // Agar aaj pehla card hai, toh DB me nayi row bana do
    );

    res.status(200).json({ success: true, session: updatedSession });
  } catch (error) {
    console.error("Log Stat Error:", error);
    res.status(500).json({ message: "Database update failed" });
  }
};

module.exports = { getStats, logStat };
