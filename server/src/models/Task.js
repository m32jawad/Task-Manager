const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    content: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'in-review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    isBugged: {
      type: Boolean,
      default: false,
    },
    bugReason: {
      type: String,
    },
    bugReportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bugReportedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
taskSchema.index({ team: 1, createdAt: -1 });
taskSchema.index({ assignedTo: 1, createdAt: -1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ isBugged: 1 });

module.exports = mongoose.model('Task', taskSchema);
