const express = require("express");
const router = express.Router();
const {
  generatePlan,
  getActivePlan,
} = require("../controllers/dietPlanController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generatePlan);
router.get("/", protect, getActivePlan);

module.exports = router;
