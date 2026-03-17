// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const { getStats, logStat } = require("../controllers/statsController"); // Pichle message wala controller

// Sirf ek route chahiye dashboard ke liye
router.get("/:id", getStats);
router.post("/log", logStat);

module.exports = router;
