require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet"); // 🔥 Security Header Protect
const rateLimit = require("express-rate-limit"); // 🔥 Anti-Spam Limiter
const http = require("http");
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Routes Import
const taskRoutes = require("./routes/taskRoutes");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const presenceRoutes = require("./routes/presenceRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const battleRoutes = require("./routes/battleRoutes");
const examRoutes = require("./routes/examRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const fieldRoutes = require("./routes/fieldRoutes");
const mockRoutes = require("./routes/mockRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const CustomExam = require("./models/CustomExam");
const FieldTemplate = require("./models/FieldTemplate");
const flashcardRoutes = require("./routes/flashcardRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();
const server = http.createServer(app); // 🛠️ Express app ko HTTP server mein wrap kiya

// 🔴 HARDCODED FRONTEND URL (Ye ab hamesha chalega)
// Dhyan de: end me slash '/' nahi hona chahiye
const FRONTEND_URL = "https://client-gamma-nine-44.vercel.app";

// --- 1. INDUSTRY STANDARD MIDDLEWARES ---
app.use(
  helmet({
    contentSecurityPolicy: false, // AI aur Socket ke liye ise false rakhna theek hai
  }),
);
app.use(express.json());

// CORS Setup for Express API
app.use(
  cors({
    origin: FRONTEND_URL, // Sirf tumhare Vercel app ko allow karega
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { message: "Too many requests, slow down Commander!" },
});
app.use("/api/", apiLimiter);

// 🔥 DEBUG LOGGER
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- 2. MONGOOSE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Universe Hub Database Connected! 🔥"))
  .catch((err) => console.log("DB Error: ", err));

// --- 3. SOCKET.IO SETUP (Secured) ---
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, // Socket CORS (Isse polling error hat jayegi)
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Render compatibility fix
});

// WEB-SOCKET LOGIC
io.on("connection", (socket) => {
  console.log(`📡 New Signal: User Connected (${socket.id})`);

  socket.on("join_private_sector", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} is now live in their sector.`);
  });

  socket.on("send_battle_challenge", (data) => {
    const { fromUser, toUserId, battleType, xpStake } = data;
    console.log(`⚔️ Battle Challenge: ${fromUser.name} vs Target ${toUserId}`);

    io.to(toUserId).emit("receive_battle_request", {
      senderName: fromUser.name,
      senderId: fromUser.id,
      battleType: battleType || "Coding Duel",
      xpStake: xpStake || 50,
      timestamp: new Date(),
    });
  });

  socket.on("respond_to_challenge", (data) => {
    const { fromUserId, status, targetName } = data;
    io.to(fromUserId).emit("battle_response_received", {
      status,
      targetName,
    });
  });

  socket.on("disconnect", () => {
    console.log("🔻 Signal Lost: User Disconnected");
  });
});

// --- 4. API ROUTES ---
app.use("/api/tasks", taskRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/presence", presenceRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/mock", mockRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/categories", fieldRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/stats", statsRoutes);

// --- 5. BASE ROUTE ---
app.get("/", (req, res) => {
  res.send("Universe Hub API is Running Securely with Real-time Sockets...");
});

// Battle Arena Exam Fetcher
app.get("/api/user/exams", async (req, res) => {
  try {
    const { field } = req.query;
    if (!field)
      return res.status(400).json({ message: "Field nahi bheji frontend ne!" });

    console.log(`🔥 Arena Request Received for field: ${field}`);

    const fieldDoc = await FieldTemplate.findOne({
      field: { $regex: new RegExp("^" + field.trim() + "$", "i") },
    });

    if (!fieldDoc) {
      console.log("🚨 Field database me nahi mili!");
      return res.json([]);
    }

    const exams = await CustomExam.find({
      fieldId: fieldDoc._id,
      isActive: true,
    });

    console.log(`✅ ${exams.length} Exams found for ${field}`);
    res.json(exams);
  } catch (err) {
    console.error("Battle Arena API Error:", err);
    res.status(500).json({ error: "Matrix connection lost." });
  }
});

// AI Question Extractor
app.post("/api/admin/extract-ai", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: "Text is required" });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert Exam Data Extractor for an EdTech platform.
    Extract all multiple-choice questions from the provided raw text.
    Return ONLY a valid JSON array of objects. Do not write any markdown blocks like \`\`\`json.
    Format:
    { "questionText": "", "options": ["", "", "", ""], "correctOptionIndex": 0, "explanation": "" }
    Text: ${rawText}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response
      .text()
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .trim();

    const questions = JSON.parse(responseText);
    res.json(questions);
  } catch (error) {
    console.error("AI Extraction Failed:", error);
    res.status(500).json({ error: "AI fail ho gaya kachra saaf karne mein!" });
  }
});

// --- 6. SERVER START ---
const PORT = process.env.PORT || 5000;

// Render pe chalane ke liye "0.0.0.0" lagana zaroori hai
server.listen(PORT, "0.0.0.0", () => {
  console.log(`
  🚀 Universe Command Center Online
  📡 Port: ${PORT}
  🛡️ Security: Helmet & Rate-Limiting Active
  🌍 WebSocket: Active
  `);
});

module.exports = app;
