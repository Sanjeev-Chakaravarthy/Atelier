const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// @desc  Get all tasks for user (with search, filter, sort, pagination)
// @route GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const {
      search, status, priority, tags, dueDate,
      sort = '-createdAt', page = 1, limit = 50,
    } = req.query;

    const query = { owner: req.user.id };

    if (search) query.$text = { $search: search };
    if (status) query.status = { $in: status.split(',') };
    if (priority) query.priority = { $in: priority.split(',') };
    if (tags) query.tags = { $in: tags.split(',') };
    if (dueDate === 'overdue') query.dueDate = { $lt: new Date() };
    else if (dueDate === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: start, $lte: end };
    } else if (dueDate === 'week') {
      const start = new Date();
      const end = new Date(); end.setDate(end.getDate() + 7);
      query.dueDate = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let tasks = await Task.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignee', 'name avatar email');

    // Sort logically in memory to match client-side expectations (e.g. priority scales)
    if (sort === '-priority') {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      tasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    } else if (sort === 'dueDate') {
      tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sort === 'createdAt') {
      tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === '-createdAt') {
      tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      tasks,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GetTasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Create task
// @route POST /api/tasks
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, description, status, priority, dueDate, tags, checklist, estimatedMinutes } = req.body;

    // Get max order for positioning
    const lastTask = await Task.findOne({ owner: req.user.id }).sort('-order');
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title, description, status, priority, dueDate, tags, checklist,
      estimatedMinutes, owner: req.user.id, order,
      activity: [{ action: 'created', detail: 'Task created', user: req.user.id }],
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error('CreateTask error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id })
      .populate('assignee', 'name avatar email')
      .populate('comments.user', 'name avatar')
      .populate('activity.user', 'name avatar');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Update task
// @route PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const prevStatus = task.status;
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'checklist', 'estimatedMinutes', 'actualMinutes', 'isFocused', 'assignee'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    // Track status change in activity
    if (req.body.status && req.body.status !== prevStatus) {
      task.activity.push({
        action: 'status_changed',
        detail: `Status changed from ${prevStatus} to ${req.body.status}`,
        user: req.user.id,
      });
    }

    await task.save();
    res.json({ success: true, task });
  } catch (err) {
    console.error('UpdateTask error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Delete task
// @route DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Add comment
// @route POST /api/tasks/:id/comments
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({ user: req.user.id, text: req.body.text });
    task.activity.push({ action: 'comment_added', detail: req.body.text, user: req.user.id });
    await task.save();

    const updated = await Task.findById(task._id)
      .populate('comments.user', 'name avatar')
      .populate('activity.user', 'name avatar');

    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Reorder tasks (drag & drop)
// @route PUT /api/tasks/reorder
exports.reorderTasks = async (req, res) => {
  try {
    const { orderedIds } = req.body; // array of task IDs in new order
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: id, owner: req.user.id }, update: { order: index } },
    }));
    await Task.bulkWrite(bulkOps);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
