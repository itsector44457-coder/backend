const Flashcard = require("../models/Flashcard");
const StudySession = require("../models/StudySession");
const Deck = require("../models/Deck");

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

    // 1. Heatmap — last 365 days ki activity
    const sessions = await StudySession.find({ userId })
      .sort("date")
      .select("date reviewed correct -_id");

    // 2. Retention per deck & Weakest Cards
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

        // Weakest 3 cards (Jinko padhne mein dikkat aa rahi hai)
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

    // 3. Overall numbers
    const totalReviewed = sessions.reduce((s, x) => s + x.reviewed, 0);
    const totalCorrect = sessions.reduce((s, x) => s + x.correct, 0);
    const overallRetention = totalReviewed
      ? Math.round((totalCorrect / totalReviewed) * 100)
      : 0;

    // 4. Current Streak (Fixed: Agar aaj nahi padha par kal padha tha, toh streak 0 nahi honi chahiye)
    const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
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

    res.json({
      heatmap: sessions,
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
