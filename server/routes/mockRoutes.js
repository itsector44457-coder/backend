const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const TestResult = require("../models/TestResult");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🧠 AI MOCK TEST GENERATOR ROUTE
// 🔥 FIX 1: Sirf relative path rakha hai (backend ka url yahan nahi aayega)
router.get("/generate/:field/:subject/:topic/:difficulty", async (req, res) => {
  try {
    // Decode parameters (Taaki %20 aur & wale symbol sahi se padh sake)
    const field = decodeURIComponent(req.params.field);
    const subject = decodeURIComponent(req.params.subject);
    const topic = decodeURIComponent(req.params.topic);
    const difficulty = decodeURIComponent(req.params.difficulty);

    console.log(`Generating test for: ${topic} (${difficulty})`);

    // 🔥 FIX 2: Sahi model ka naam use kiya hai
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

    const prompt = `You are an expert examiner for ${field}. 
    Generate a mock test for the topic "${topic}" under the subject "${subject}".
    
    Difficulty Level: ${difficulty.toUpperCase()}
    
    Instructions:
    1. If Easy: Focus on basic definitions and direct formulas.
    2. If Medium: Focus on application-based questions and conceptual logic.
    3. If Hard: Focus on complex numericals, multi-statement questions, and deep critical thinking.
    
    Return exactly 10 questions.
    
    OUTPUT FORMAT:
    Return ONLY a valid JSON ARRAY. No conversational text, no markdown formatting like \`\`\`json.
    [
      {
        "questionText": "Clear and concise question text?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 0, 
        "difficulty": "${difficulty}",
        "explanation": "Detailed explanation of why this option is correct."
      }
    ]
    
    CRITICAL RULE: "correctAnswer" MUST be an integer between 0 and 3, corresponding to the correct index in the "options" array. Do NOT use strings like "A" or "B".`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // 🔥 BULLETPROOF JSON CLEANER
    text = text
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .trim();

    const startIndex = text.indexOf("[");
    const endIndex = text.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("AI did not return a valid JSON array.");
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    const questions = JSON.parse(jsonString);

    res.status(200).json(questions);
  } catch (err) {
    console.error("🔥 Gemini Mock Test Error:", err.message);
    res.status(500).json({
      message:
        "AI Engine fail ho gaya! Ya toh API limit hit ho gayi hai ya prompt parse nahi hua.",
      error: err.message,
    });
  }
});

// ==========================================
// 💾 2. SAVE TEST RESULT
// ==========================================
router.post("/save-result", async (req, res) => {
  try {
    const {
      userId,
      topicId,
      topicName,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      difficulty,
    } = req.body;

    const newResult = new TestResult({
      userId,
      topicId,
      topicName,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      difficulty,
    });

    await newResult.save();
    res
      .status(201)
      .json({ message: "Test history saved to Vault!", result: newResult });
  } catch (err) {
    console.error("Failed to save test result:", err);
    res.status(500).json({ error: "Data Sync Failed" });
  }
});

// ==========================================
// 📊 3. GET TEST HISTORY FOR A TOPIC
// ==========================================
router.get("/history/:userId/:topicId", async (req, res) => {
  try {
    const { userId, topicId } = req.params;
    const history = await TestResult.find({ userId, topicId }).sort({
      createdAt: -1,
    });
    res.status(200).json(history);
  } catch (err) {
    console.error("Failed to fetch history:", err);
    res.status(500).json({ error: "History retrieval failed" });
  }
});

module.exports = router;
