const express = require("express");
const router = express.Router();
const {
  searchFood,
  logMeal,
  getTodayMeals,
  deleteMeal,
} = require("../controllers/mealController");
const { protect } = require("../middleware/authMiddleware");

router.get("/search", protect, searchFood);
router.post("/", protect, logMeal);
router.get("/today", protect, getTodayMeals);
router.delete("/:id", protect, deleteMeal);

module.exports = router;
