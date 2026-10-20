const express = require("express");
const router = express.Router();
const {
  getTodayWater,
  addWater,
  updateTarget,
} = require("../controllers/waterController");
const { protect } = require("../middleware/authMiddleware");

router.get("/today", protect, getTodayWater);
router.post("/add", protect, addWater);
router.put("/target", protect, updateTarget);

module.exports = router;
