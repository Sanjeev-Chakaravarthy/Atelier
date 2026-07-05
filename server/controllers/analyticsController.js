const Task = require('../models/Task');

// @desc  Dashboard overview stats
// @route GET /api/analytics/overview
exports.getOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [total, done, inProgress, overdue, thisWeekDone, urgent] = await Promise.all([
      Task.countDocuments({ owner: userId }),
      Task.countDocuments({ owner: userId, status: 'done' }),
      Task.countDocuments({ owner: userId, status: 'in-progress' }),
      Task.countDocuments({ owner: userId, dueDate: { $lt: now }, status: { $ne: 'done' } }),
      Task.countDocuments({ owner: userId, status: 'done', completedAt: { $gte: startOfWeek } }),
      Task.countDocuments({ owner: userId, priority: 'urgent', status: { $ne: 'done' } }),
    ]);

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const productivityScore = Math.min(
      100,
      Math.round(completionRate * 0.6 + (thisWeekDone * 5) + (inProgress > 0 ? 10 : 0) - (overdue * 3))
    );

    res.json({
      success: true,
      overview: {
        total, done, inProgress, overdue, thisWeekDone, urgent,
        completionRate, productivityScore,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Task velocity — completions per day over past 30 days
// @route GET /api/analytics/velocity
exports.getVelocity = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const tasks = await Task.find({
      owner: userId,
      status: 'done',
      completedAt: { $gte: since },
    }).select('completedAt createdAt');

    // Build daily buckets
    const buckets = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      buckets[key] = { date: key, completed: 0, created: 0 };
    }

    const allTasks = await Task.find({
      owner: userId,
      createdAt: { $gte: since },
    }).select('createdAt');

    tasks.forEach((t) => {
      const key = t.completedAt.toISOString().split('T')[0];
      if (buckets[key]) buckets[key].completed += 1;
    });
    allTasks.forEach((t) => {
      const key = t.createdAt.toISOString().split('T')[0];
      if (buckets[key]) buckets[key].created += 1;
    });

    res.json({ success: true, velocity: Object.values(buckets) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Activity heatmap — daily task activity over past year
// @route GET /api/analytics/heatmap
exports.getHeatmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);

    const tasks = await Task.find({ owner: userId, completedAt: { $gte: since } }).select('completedAt');

    const heatmap = {};
    tasks.forEach((t) => {
      const key = t.completedAt.toISOString().split('T')[0];
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    res.json({ success: true, heatmap });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Priority distribution
// @route GET /api/analytics/distribution
exports.getDistribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const [byStatus, byPriority] = await Promise.all([
      Task.aggregate([
        { $match: { owner: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { owner: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({ success: true, byStatus, byPriority });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Recent activity feed
// @route GET /api/analytics/activity
exports.getActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ owner: userId, 'activity.0': { $exists: true } })
      .sort('-updatedAt')
      .limit(20)
      .select('title activity status priority');

    const feed = [];
    tasks.forEach((task) => {
      task.activity.slice(-3).reverse().forEach((act) => {
        feed.push({
          taskId: task._id,
          taskTitle: task.title,
          action: act.action,
          detail: act.detail,
          createdAt: act.createdAt,
          status: task.status,
          priority: task.priority,
        });
      });
    });

    feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, activity: feed.slice(0, 20) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
