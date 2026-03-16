const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },

    // "YYYY-MM-DD" format mein date save hogi jisse Heatmap banana bohot easy ho jayega!
    date: { type: String, required: true },

    reviewed: { type: Number, default: 0 }, // Total kitne cards review kiye
    correct: { type: Number, default: 0 }, // Kitne cards 'Good' ya 'Easy' bole
    again: { type: Number, default: 0 }, // Kitne cards 'Again' ya 'Hard' bole
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudySession", studySessionSchema);
