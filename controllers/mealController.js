const MealLog = require("../models/MealLog");
const { searchFoods } = require("../utils/usdaApi");

// @desc    Search foods via USDA
// @route   GET /api/meals/search?q=apple
// @access  Private
const searchFood = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    const foods = await searchFoods(query, 10);
    res.json({ query, results: foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log a meal
// @route   POST /api/meals
// @access  Private
const logMeal = async (req, res) => {
  try {
    const {
      mealType,
      foodName,
      fdcId,
      servingSize,
      servingUnit,
      calories,
      protein,
      carbs,
      fat,
    } = req.body;

    if (!mealType || !foodName || !servingSize || !calories) {
      return res.status(400).json({
        message: "Please provide mealType, foodName, servingSize, calories",
      });
    }

    const meal = await MealLog.create({
      user: req.user._id,
      date: new Date(),
      mealType,
      foodName,
      fdcId,
      servingSize: Number(servingSize),
      servingUnit: servingUnit || "g",
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });

    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's meals + totals
// @route   GET /api/meals/today
// @access  Private
const getTodayMeals = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const meals = await MealLog.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    res.json({ count: meals.length, meals, totals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const meal = await MealLog.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    // Ensure user owns this meal
    if (meal.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this meal" });
    }

    await meal.deleteOne();
    res.json({ message: "Meal deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchFood, logMeal, getTodayMeals, deleteMeal };
