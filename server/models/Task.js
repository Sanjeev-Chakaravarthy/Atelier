const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    detail: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: { type: Date },
    tags: [{ type: String, trim: true }],
    checklist: [checklistItemSchema],
    comments: [commentSchema],
    activity: [activitySchema],
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 0 },
    actualMinutes: { type: Number, default: 0 },
    completedAt: { type: Date },
    isFocused: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-set completedAt when status becomes 'done'
taskSchema.pre('save', function () {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = undefined;
    }
  }
});

// Text index for search
taskSchema.index({ title: 'text', description: 'text', tags: 'text' });
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ owner: 1, order: 1 });

module.exports = mongoose.model('Task', taskSchema);
