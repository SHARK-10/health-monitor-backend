/**
 * Calculate BMR using Mifflin-St Jeor equation.
 * @param {Number} weight - kg
 * @param {Number} height - cm
 * @param {Number} age - years
 * @param {String} gender - 'male' | 'female'
 * @returns {Number} BMR in kcal/day
 */
function calculateBMR(weight, height, age, gender) {
  if (!weight || !height || !age || !gender) {
    throw new Error("Missing required fields for BMR");
  }

  // Mifflin-St Jeor:
  // Male:   (10 × weight) + (6.25 × height) − (5 × age) + 5
  // Female: (10 × weight) + (6.25 × height) − (5 × age) − 161
  const base = 10 * weight + 6.25 * height - 5 * age;
  const bmr = gender === "male" ? base + 5 : base - 161;

  return Math.round(bmr);
}

/**
 * Activity multipliers (standard Harris-Benedict style).
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const ACTIVITY_LABELS = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Light exercise (1–3 days/week)",
  moderate: "Moderate exercise (3–5 days/week)",
  active: "Active (6–7 days/week)",
  veryActive: "Very active (athlete level)",
};

/**
 * Calculate daily calorie needs (TDEE).
 * @returns {Object} { bmr, multiplier, dailyCalories, activityLabel, macroSplit }
 */
function calculateDailyCalories(
  weight,
  height,
  age,
  gender,
  activityLevel = "moderate",
) {
  const bmr = calculateBMR(weight, height, age, gender);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  const dailyCalories = Math.round(bmr * multiplier);

  // Recommended macro split: 40% carbs, 30% protein, 30% fat
  const macroSplit = {
    protein: Math.round((dailyCalories * 0.3) / 4), // 4 kcal per g
    carbs: Math.round((dailyCalories * 0.4) / 4), // 4 kcal per g
    fat: Math.round((dailyCalories * 0.3) / 9), // 9 kcal per g
  };

  return {
    bmr,
    multiplier,
    dailyCalories,
    activityLevel,
    activityLabel: ACTIVITY_LABELS[activityLevel],
    macroSplit,
  };
}

module.exports = { calculateBMR, calculateDailyCalories, ACTIVITY_MULTIPLIERS };
