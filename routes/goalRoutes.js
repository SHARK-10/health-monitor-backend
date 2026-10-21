const express = require("express");
const router = express.Router();
const {
  createGoal,
  getActiveGoal,
  deleteGoal,
} = require("../controllers/goalController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createGoal);
router.get("/active", protect, getActiveGoal);
router.delete("/:id", protect, deleteGoal);

module.exports = router;
