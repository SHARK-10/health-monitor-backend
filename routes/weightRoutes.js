const express = require("express");
const router = express.Router();
const {
  logWeight,
  getWeightHistory,
  getLatestWeight,
} = require("../controllers/weightController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, logWeight);
router.get("/", protect, getWeightHistory);
router.get("/latest", protect, getLatestWeight);

module.exports = router;
