const express = require("express");
const router = express.Router();
const { getBMI, getCalories } = require("../controllers/healthController");
const { protect } = require("../middleware/authMiddleware");

router.get("/bmi", protect, getBMI);
router.get("/calories", protect, getCalories);

module.exports = router;
