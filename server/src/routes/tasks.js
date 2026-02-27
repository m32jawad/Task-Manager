const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Task = require('../models/Task');
const Team = require('../models/Team');

const router = express.Router();

// POST /api/tasks - Create task (manager only, must manage the team)
router.post('/', auth, roleCheck('manager'), async (req, res) => {
  try {
    const { title, content, images, status, priority, assignedTo, team: teamId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (!teamId) {
      return res.status(400).json({ message: 'Team is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team manager can create tasks' });
    }

    // If assigning to someone, verify they are a team member
    if (assignedTo) {
      const isMember = team.members.some(
        (m) => m.toString() === assignedTo
      );
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user is not a member of this team' });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      content,
      images: images || [],
      status,
      priority,
      assignedTo,
      createdBy: req.user._id,
      team: teamId,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
      { path: 'team', select: 'name' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks - Get tasks (query param: teamId)
router.get('/', auth, async (req, res) => {
  try {
    const { teamId } = req.query;
    if (!teamId) {
      return res.status(400).json({ message: 'teamId query parameter is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    let query = { team: teamId };

    // Members only see their assigned tasks
    if (req.user.role === 'member') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'manager') {
      // Manager must be the team's manager
      if (team.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('team', 'name')
      .populate('bugReportedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('team', 'name manager members')
      .populate('bugReportedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'manager') {
      // Manager can update all fields
      const { title, content, images, status, priority, assignedTo } = req.body;
      if (title !== undefined) task.title = title;
      if (content !== undefined) task.content = content;
      if (images !== undefined) task.images = images;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
    } else if (req.user.role === 'member') {
      // Member can only update status and must be assigned to the task
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      const { status } = req.body;
      if (status !== undefined) task.status = status;
    }

    await task.save();

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
      { path: 'team', select: 'name' },
      { path: 'bugReportedBy', select: 'name email role' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/tasks/:id/bug - Mark task as bugged (manager only)
router.put('/:id/bug', auth, roleCheck('manager'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { isBugged, bugReason } = req.body;

    task.isBugged = isBugged;
    if (isBugged) {
      task.bugReason = bugReason || '';
      task.bugReportedBy = req.user._id;
      task.bugReportedAt = new Date();
    } else {
      task.bugReason = undefined;
      task.bugReportedBy = undefined;
      task.bugReportedAt = undefined;
    }

    await task.save();

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
      { path: 'team', select: 'name' },
      { path: 'bugReportedBy', select: 'name email role' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task (manager only, must be creator)
router.delete('/:id', auth, roleCheck('manager'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the task creator can delete this task' });
    }

    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
