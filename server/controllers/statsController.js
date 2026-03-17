const mongoose = require("mongoose");
const Flashcard = require("../models/Flashcard");
const StudySession = require("../models/StudySession"); // Yeh Flashcard wali padhai hai
const Deck = require("../models/Deck");

// 🚨 IMPORTANT: Yahan apne Timer/Focus wale model ko zaroor import karna
// (Agar file ka naam alag hai toh string change kar lena)
const FocusSession = require("../models/Session"); // <-- YAHAN DHYAN DENA

// 🛠️ FIX: India (Local) Timezone ke hisaab se YYYY-MM-DD nikalna
const getLocalYYYYMMDD = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

// ── Full Stats for Dashboard ──────────────────────────────────
const getStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // =========================================================
    // 1. HEATMAP MERGE LOGIC (Timer + Flashcards)
    // =========================================================

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
      console.log(
        "Timer data fetch karne me error ya model nahi mila:",
        e.message,
      );
    }

    // C) Dono ko Merge (Jod) karo
    const heatmapMap = {};

    // Pehle flashcards ka data map me daalo
    cardSessions.forEach((session) => {
      heatmapMap[session.date] = {
        date: session.date,
        reviewed: session.reviewed || 0,
        correct: session.correct || 0,
        totalStudySeconds: 0, // Default zero
      };
    });

    // Ab Timer ka data usme add/merge karo
    timerSessions.forEach((session) => {
      const dateStr = session._id;
      if (!heatmapMap[dateStr]) {
        // Agar us din card nahi padha, sirf timer chalaya, toh naya entry banao
        heatmapMap[dateStr] = {
          date: dateStr,
          reviewed: 0,
          correct: 0,
          totalStudySeconds: 0,
        };
      }
      // Seconds add kar do
      heatmapMap[dateStr].totalStudySeconds = session.totalStudySeconds || 0;
    });

    // Object ko wapas Array banakar Date ke hisaab se sort kar lo
    const finalHeatmap = Object.values(heatmapMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    // =========================================================
    // 2. Retention per deck & Weakest Cards (TUMHARA PURANA LOGIC)
    // =========================================================
    const decks = await Deck.find({ userId });

    const deckStats = await Promise.all(
      decks.map(async (deck) => {
        const cards = await Flashcard.find({ deckId: deck._id, userId });
        const total = cards.length;
        if (total === 0) return null;

        // easeFactor > 2.5 = Mastered, < 1.8 = Weak
        const mastered = cards.filter((c) => c.easeFactor >= 2.5).length;
        const weak = cards.filter((c) => c.easeFactor < 1.8).length;
        const retention = Math.round((mastered / total) * 100);

        // Weakest 3 cards
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

    // =========================================================
    // 3. Overall numbers
    // =========================================================
    const totalReviewed = cardSessions.reduce(
      (s, x) => s + (x.reviewed || 0),
      0,
    );
    const totalCorrect = cardSessions.reduce((s, x) => s + (x.correct || 0), 0);
    const overallRetention = totalReviewed
      ? Math.round((totalCorrect / totalReviewed) * 100)
      : 0;

    // =========================================================
    // 4. Current Streak (MERGED DATA KE HISAAB SE)
    // =========================================================
    // Yahan finalHeatmap use kiya hai taaki sirf Timer use karne par bhi streak na toote
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

    // Check karo aaj start karein ya kal se
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
          break; // Streak toot gayi
        }
      }
    }

    // =========================================================
    // 5. SEND DATA TO FRONTEND
    // =========================================================
    res.json({
      heatmap: finalHeatmap, // <-- Ab isme cards + timer dono ka data ja raha hai!
      deckStats: deckStats.filter(Boolean),
      totalReviewed,
      overallRetention,
      streak,
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats };
