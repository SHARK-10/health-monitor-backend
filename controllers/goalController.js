const Goal = require("../models/Goal");
const User = require("../models/User");
const WeightLog = require("../models/WeightLog");

// Calculate end date from duration
function getEndDate(startDate, duration) {
  const d = new Date(startDate);
  if (duration === "3weeks") d.setDate(d.getDate() + 21);
  else if (duration === "6weeks") d.setDate(d.getDate() + 42);
  else if (duration === "1year") d.setDate(d.getDate() + 365);
  return d;
}

// Determine goal type
function getGoalType(startWeight, targetWeight) {
  if (targetWeight < startWeight) return "loss";
  if (targetWeight > startWeight) return "gain";
  return "maintain";
}

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { targetWeight, duration } = req.body;

    const target = Number(targetWeight);
    if (!target || target < 20 || target > 500) {
      return res
        .status(400)
        .json({ message: "Target weight must be between 20 and 500 kg" });
    }

    if (!["3weeks", "6weeks", "1year"].includes(duration)) {
      return res
        .status(400)
        .json({ message: "Duration must be 3weeks, 6weeks, or 1year" });
    }

    const user = await User.findById(req.user._id);
    const startWeight = user.currentWeight;
    const startDate = new Date();
    const endDate = getEndDate(startDate, duration);
    const goalType = getGoalType(startWeight, target);

    // Deactivate previous goals
    await Goal.updateMany(
      { user: req.user._id, isActive: true },
      { isActive: false },
    );

    // Create new goal
    const goal = await Goal.create({
      user: req.user._id,
      startWeight,
      targetWeight: target,
      goalType,
      duration,
      startDate,
      endDate,
      isActive: true,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active goal + progress
// @route   GET /api/goals/active
// @access  Private
const getActiveGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user._id, isActive: true });

    if (!goal) {
      return res.json({ hasGoal: false });
    }

    // Get current weight (latest weight log OR user's currentWeight)
    const latestLog = await WeightLog.findOne({ user: req.user._id }).sort({
      date: -1,
    });

    const currentWeight = latestLog ? latestLog.weight : goal.startWeight;

    // Calculate progress %
    const totalChange = goal.targetWeight - goal.startWeight;
    const currentChange = currentWeight - goal.startWeight;

    let progress = 0;
    if (totalChange !== 0) {
      progress = (currentChange / totalChange) * 100;
    }
    progress = Math.max(0, Math.min(100, Math.round(progress)));

    // Days remaining
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((goal.endDate - now) / (1000 * 60 * 60 * 24)),
    );

    res.json({
      hasGoal: true,
      goal: {
        _id: goal._id,
        startWeight: goal.startWeight,
        targetWeight: goal.targetWeight,
        goalType: goal.goalType,
        duration: goal.duration,
        startDate: goal.startDate,
        endDate: goal.endDate,
      },
      currentWeight,
      progress,
      daysRemaining,
      isAchieved: progress >= 100,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete active goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await goal.deleteOne();
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGoal, getActiveGoal, deleteGoal };
