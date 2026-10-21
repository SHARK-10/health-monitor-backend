const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 20,
      max: 500,
    },
  },
  { timestamps: true },
);

// One entry per user per day (updates same-day entries)
weightLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WeightLog", weightLogSchema);
