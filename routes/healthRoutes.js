const express = require("express");
const router = express.Router();
const { getBMI } = require("../controllers/healthController");
const { protect } = require("../middleware/authMiddleware");

router.get("/bmi", protect, getBMI);

module.exports = router;
