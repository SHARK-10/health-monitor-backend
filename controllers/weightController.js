const WeightLog = require("../models/WeightLog");
const User = require("../models/User");

// Helper: get day range (start + end of today)
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// @desc    Log today's weight
// @route   POST /api/weight
// @access  Private
const logWeight = async (req, res) => {
  try {
    const { weight } = req.body;
    const w = Number(weight);

    if (!w || w < 20 || w > 500) {
      return res
        .status(400)
        .json({ message: "Weight must be between 20 and 500 kg" });
    }

    const { start, end } = getTodayRange();

    // Upsert: update today's entry if exists, else create
    let log = await WeightLog.findOne({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (log) {
      log.weight = w;
      await log.save();
    } else {
      log = await WeightLog.create({
        user: req.user._id,
        date: new Date(),
        weight: w,
      });
    }

    // Also update user's currentWeight → BMI recalculates
    await User.findByIdAndUpdate(req.user._id, { currentWeight: w });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weight history (last 30 entries)
// @route   GET /api/weight
// @access  Private
const getWeightHistory = async (req, res) => {
  try {
    const logs = await WeightLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    res.json({ count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get latest weight + 7-day change
// @route   GET /api/weight/latest
// @access  Private
const getLatestWeight = async (req, res) => {
  try {
    const logs = await WeightLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(2);

    if (logs.length === 0) {
      const user = await User.findById(req.user._id);
      return res.json({
        currentWeight: user.currentWeight,
        change7d: 0,
        lastLogDate: null,
        hasLogs: false,
      });
    }

    const latest = logs[0];
    const previous = logs[1];

    // 7-day comparison
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekAgoLog = await WeightLog.findOne({
      user: req.user._id,
      date: { $lte: sevenDaysAgo },
    }).sort({ date: -1 });

    const change7d = weekAgoLog
      ? Number((latest.weight - weekAgoLog.weight).toFixed(1))
      : 0;

    res.json({
      currentWeight: latest.weight,
      change7d,
      lastLogDate: latest.date,
      hasLogs: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { logWeight, getWeightHistory, getLatestWeight };
