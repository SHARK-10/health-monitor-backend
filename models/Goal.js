const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startWeight: {
      type: Number,
      required: true,
    },
    targetWeight: {
      type: Number,
      required: true,
    },
    goalType: {
      type: String,
      enum: ["loss", "gain", "maintain"],
      required: true,
    },
    duration: {
      type: String,
      enum: ["3weeks", "6weeks", "1year"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Goal", goalSchema);
