const mongoose = require("mongoose");

const waterLogSchema = new mongoose.Schema(
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
    glasses: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetGlasses: {
      type: Number,
      default: 8,
      min: 1,
    },
  },
  { timestamps: true },
);

// Ensure one doc per user per day
waterLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WaterLog", waterLogSchema);
