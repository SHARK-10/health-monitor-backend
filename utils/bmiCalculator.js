/**
 * Calculate BMI and classify according to WHO standards.
 * @param {Number} weight - in kg
 * @param {Number} height - in cm
 * @returns {Object} { bmi, category, color, message, range }
 */
function calculateBMI(weight, height) {
  if (!weight || !height || weight <= 0 || height <= 0) {
    throw new Error("Invalid weight or height");
  }

  // BMI = weight (kg) / (height in meters)^2
  const heightM = height / 100;
  const bmi = Number((weight / (heightM * heightM)).toFixed(1));

  let category = "";
  let color = "";
  let message = "";
  let range = "";

  if (bmi < 18.5) {
    category = "Underweight";
    color = "#3b82f6"; // blue
    message = "You are underweight. Consider a nutritious, calorie-rich diet.";
    range = "< 18.5";
  } else if (bmi < 25) {
    category = "Normal weight";
    color = "#10b981"; // green
    message = "Great! You are in the healthy weight range.";
    range = "18.5 – 24.9";
  } else if (bmi < 30) {
    category = "Overweight";
    color = "#f59e0b"; // amber
    message = "You are overweight. Moderate diet and exercise can help.";
    range = "25 – 29.9";
  } else {
    category = "Obese";
    color = "#ef4444"; // red
    message = "You are in the obese range. Consult a healthcare provider.";
    range = "≥ 30";
  }

  return { bmi, category, color, message, range };
}

module.exports = { calculateBMI };
