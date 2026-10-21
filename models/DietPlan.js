const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    dailyCalories: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    goalType: {
      type: String,
      required: true, // 'loss', 'gain', 'maintain'
    },
    plan: {
      type: Object, // Stores the daily meal breakdown
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DietPlan", dietPlanSchema);
