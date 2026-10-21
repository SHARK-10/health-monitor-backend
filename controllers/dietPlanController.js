const DietPlan = require('../models/DietPlan');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { calculateDailyCalories } = require('../utils/calorieCalculator');

// Helper: Generate meals based on target calories
function generateMealPlan(targetCalories, goalType) {
  // Macro split targets (we aim for high protein for both loss and gain)
  const macros = {
    loss: { p: 0.35, c: 0.35, f: 0.30 },
    gain: { p: 0.30, c: 0.45, f: 0.25 },
    maintain: { p: 0.30, c: 0.40, f: 0.30 },
  };
  const split = macros[goalType] || macros.maintain;

  const meals = [
    { name: 'Breakfast', percentage: 0.25 },
    { name: 'Lunch', percentage: 0.35 },
    { name: 'Dinner', percentage: 0.30 },
    { name: 'Snack', percentage: 0.10 },
  ];

  const generatedPlan = meals.map((meal) => {
    const mealCals = Math.round(targetCalories * meal.percentage);
    return {
      mealType: meal.name,
      targetCalories: mealCals,
      targetProtein: Math.round((mealCals * split.p) / 4),
      targetCarbs: Math.round((mealCals * split.c) / 4),
      targetFat: Math.round((mealCals * split.f) / 9),
      suggestions:
        meal.name === 'Breakfast'
          ? ['Oatmeal with berries', 'Greek yogurt with honey', 'Egg white omelet']
          : meal.name === 'Lunch'
          ? ['Grilled chicken salad', 'Quinoa bowl with veggies', 'Turkey wrap']
          : meal.name === 'Dinner'
          ? ['Baked salmon with broccoli', 'Lean beef stir-fry', 'Lentil curry with brown rice']
          : ['Apple with peanut butter', 'Protein shake', 'Handful of almonds'],
    };
  });

  return generatedPlan;
}

// @desc    Generate a new diet plan
// @route   POST /api/diet-plan/generate
// @access  Private
const generatePlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const goal = await Goal.findOne({ user: req.user._id, isActive: true });

    if (!goal) {
      return res.status(400).json({ message: 'Please set an active goal first' });
    }

    // 1. Calculate BMR / TDEE
    const calorieData = calculateDailyCalories(
      user.currentWeight,
      user.height,
      user.age,
      user.gender,
      user.activityLevel
    );

    // 2. Calculate daily adjustment based on goal
    const durationDays = goal.duration === '3weeks' ? 21 : goal.duration === '6weeks' ? 42 : 365;
    const weightDiff = goal.targetWeight - goal.startWeight; // negative for loss, positive for gain
    const totalCalorieDiff = weightDiff * 7700; // 7700 kcal per kg
    const dailyAdjustment = totalCalorieDiff / durationDays;

    // 3. Final target
    let finalTarget = Math.round(calorieData.dailyCalories + dailyAdjustment);

    // Safety limits (don't go below 1200 for women / 1500 for men, don't go absurdly high)
    const minCalories = user.gender === 'male' ? 1500 : 1200;
    if (finalTarget < minCalories) finalTarget = minCalories;
    if (finalTarget > 4000) finalTarget = 4000;

    // 4. Generate meal plan
    const plan = generateMealPlan(finalTarget, goal.goalType);

    // 5. Deactivate old plans
    await DietPlan.updateMany({ user: req.user._id, isActive: true }, { isActive: false });

    // 6. Save new plan
    const newPlan = await DietPlan.create({
      user: req.user._id,
      goalId: goal._id,
      dailyCalories: finalTarget,
      duration: goal.duration,
      goalType: goal.goalType,
      plan: plan,
      isActive: true,
    });

    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active diet plan
// @route   GET /api/diet-plan
// @access  Private
const getActivePlan = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ user: req.user._id, isActive: true });
    
    if (!plan) {
      return res.json({ hasPlan: false });
    }

    res.json({ hasPlan: true, plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generatePlan, getActivePlan };