const MealLog = require("../models/MealLog");
const WaterLog = require("../models/WaterLog");
const WeightLog = require("../models/WeightLog");

// Helper: last N days array of date strings (YYYY-MM-DD)
function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatShortDate = (d) => {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// @desc    Get 7-day calorie, water trends + 30-day weight trend
// @route   GET /api/dashboard/trends
// @access  Private
const getTrends = async (req, res) => {
  try {
    const userId = req.user._id;

    // ----- CALORIES: last 7 days -----
    const last7Days = getLastNDays(7);
    const caloriesTrend = [];

    for (const day of last7Days) {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

      const meals = await MealLog.find({
        user: userId,
        date: { $gte: start, $lte: end },
      });

      const total = meals.reduce((sum, m) => sum + m.calories, 0);
      caloriesTrend.push({
        date: formatShortDate(day),
        calories: Math.round(total),
      });
    }

    // ----- WATER: last 7 days -----
    const waterTrend = [];
    for (const day of last7Days) {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

      const log = await WaterLog.findOne({
        user: userId,
        date: { $gte: start, $lte: end },
      });

      waterTrend.push({
        date: formatShortDate(day),
        glasses: log ? log.glasses : 0,
        target: log ? log.targetGlasses : 8,
      });
    }

    // ----- WEIGHT: last 30 days -----
    const last30DaysAgo = new Date();
    last30DaysAgo.setDate(last30DaysAgo.getDate() - 30);

    const weightLogs = await WeightLog.find({
      user: userId,
      date: { $gte: last30DaysAgo },
    }).sort({ date: 1 });

    const weightTrend = weightLogs.map((log) => ({
      date: formatShortDate(log.date),
      weight: log.weight,
    }));

    res.json({
      calories: caloriesTrend,
      water: waterTrend,
      weight: weightTrend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTrends };
