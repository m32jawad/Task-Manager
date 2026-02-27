const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Team = require('../models/Team');
const User = require('../models/User');

const router = express.Router();

// POST /api/teams - Create team (manager only)
router.post('/', auth, roleCheck('manager'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.create({
      name: name.trim(),
      manager: req.user._id,
      members: [req.user._id],
    });

    const populated = await team.populate([
      { path: 'manager', select: 'name email role' },
      { path: 'members', select: 'name email role' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/teams - Get teams for current user
router.get('/', auth, async (req, res) => {
  try {
    let teams;
    if (req.user.role === 'manager') {
      teams = await Team.find({ manager: req.user._id })
        .populate('manager', 'name email role')
        .populate('members', 'name email role');
    } else {
      teams = await Team.find({ members: req.user._id })
        .populate('manager', 'name email role')
        .populate('members', 'name email role');
    }

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/teams/:id - Get team by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    const isManager = team.manager._id.toString() === req.user._id.toString();

    if (!isMember && !isManager) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/teams/:id/members - Add member by email (manager only)
router.put('/:id/members', auth, roleCheck('manager'), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team manager can add members' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const alreadyMember = team.members.some(
      (m) => m.toString() === user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    team.members.push(user._id);
    await team.save();

    const populated = await team.populate([
      { path: 'manager', select: 'name email role' },
      { path: 'members', select: 'name email role' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/teams/:id/members/:memberId - Remove member (manager only)
router.delete('/:id/members/:memberId', auth, roleCheck('manager'), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team manager can remove members' });
    }

    if (req.params.memberId === team.manager.toString()) {
      return res.status(400).json({ message: 'Cannot remove the manager from the team' });
    }

    const memberIndex = team.members.findIndex(
      (m) => m.toString() === req.params.memberId
    );
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in team' });
    }

    team.members.splice(memberIndex, 1);
    await team.save();

    const populated = await team.populate([
      { path: 'manager', select: 'name email role' },
      { path: 'members', select: 'name email role' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
