const { calculateBMI } = require("../utils/bmiCalculator");
const { calculateDailyCalories } = require("../utils/calorieCalculator");
const User = require("../models/User");

// @desc    Get BMI for current user
// @route   GET /api/health/bmi
// @access  Private
const getBMI = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.currentWeight || !user.height) {
      return res.status(400).json({
        message: "Please update your height and weight in your profile",
      });
    }

    const result = calculateBMI(user.currentWeight, user.height);

    res.json({
      weight: user.currentWeight,
      height: user.height,
      ...result,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get daily calorie needs for current user
// @route   GET /api/health/calories
// @access  Private
const getCalories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.currentWeight || !user.height || !user.age || !user.gender) {
      return res.status(400).json({
        message: "Please complete your profile (age, gender, height, weight)",
      });
    }

    const result = calculateDailyCalories(
      user.currentWeight,
      user.height,
      user.age,
      user.gender,
      user.activityLevel,
    );

    res.json({
      weight: user.currentWeight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      ...result,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getBMI, getCalories };
