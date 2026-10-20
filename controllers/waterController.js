const WaterLog = require("../models/WaterLog");

// Helper: get today's date range (local timezone)
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// @desc    Get today's water intake
// @route   GET /api/water/today
// @access  Private
const getTodayWater = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    let log = await WaterLog.findOne({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    // If no log for today, return a default empty state
    if (!log) {
      return res.json({
        glasses: 0,
        targetGlasses: 8,
        percentage: 0,
      });
    }

    res.json({
      glasses: log.glasses,
      targetGlasses: log.targetGlasses,
      percentage: Math.round((log.glasses / log.targetGlasses) * 100),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add glasses of water
// @route   POST /api/water/add
// @access  Private
const addWater = async (req, res) => {
  try {
    const { amount } = req.body; // +1 or -1
    const delta = Number(amount) || 1;
    const { start, end } = getTodayRange();

    let log = await WaterLog.findOne({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (!log) {
      log = await WaterLog.create({
        user: req.user._id,
        date: new Date(),
        glasses: Math.max(0, delta),
        targetGlasses: 8,
      });
    } else {
      log.glasses = Math.max(0, log.glasses + delta);
      await log.save();
    }

    res.json({
      glasses: log.glasses,
      targetGlasses: log.targetGlasses,
      percentage: Math.round((log.glasses / log.targetGlasses) * 100),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update daily target
// @route   PUT /api/water/target
// @access  Private
const updateTarget = async (req, res) => {
  try {
    const { targetGlasses } = req.body;
    const target = Number(targetGlasses);

    if (!target || target < 1 || target > 30) {
      return res
        .status(400)
        .json({ message: "Target must be between 1 and 30" });
    }

    const { start, end } = getTodayRange();

    let log = await WaterLog.findOne({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (!log) {
      log = await WaterLog.create({
        user: req.user._id,
        date: new Date(),
        glasses: 0,
        targetGlasses: target,
      });
    } else {
      log.targetGlasses = target;
      await log.save();
    }

    res.json({
      glasses: log.glasses,
      targetGlasses: log.targetGlasses,
      percentage: Math.round((log.glasses / log.targetGlasses) * 100),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTodayWater, addWater, updateTarget };
