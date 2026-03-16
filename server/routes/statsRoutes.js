// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const { getStats } = require("../controllers/statsController"); // Pichle message wala controller

// Sirf ek route chahiye dashboard ke liye
router.get("/:userId", getStats);

module.exports = router;
