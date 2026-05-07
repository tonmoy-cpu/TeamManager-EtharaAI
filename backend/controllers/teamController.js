const Team = require('../models/Team');
const User = require('../models/User');

exports.createTeam = async (req, res) => {
  const { name, description, members } = req.body;
  try {
    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: members || []
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    // Return teams where user is owner OR member
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).populate('owner', 'name email').populate('members', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email uid')
      .populate('members', 'name email uid');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can delete teams' });
    }
    
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinTeam = async (req, res) => {
  const { tid } = req.body;
  try {
    const team = await Team.findOne({ tid: tid.toUpperCase() });
    if (!team) {
      return res.status(404).json({ message: 'Invalid Team ID (TID)' });
    }

    if (team.owner.toString() === req.user._id.toString() || team.members.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You are already in this team' });
    }

    team.members.push(req.user._id);
    await team.save();

    const io = req.app.get('io');
    if (io) {
      io.to(team._id.toString()).emit('team_updated', team);
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMemberByUid = async (req, res) => {
  const { uid } = req.body;
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only team admins can add members' });
    }

    const userToAdd = await User.findOne({ uid: uid.toUpperCase() });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with this UID' });

    if (team.owner.toString() === userToAdd._id.toString() || team.members.some(id => id.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: 'User is already in the team' });
    }

    team.members.push(userToAdd._id);
    await team.save();

    const updatedTeam = await Team.findById(team._id).populate('owner', 'name email uid').populate('members', 'name email uid');
    
    const io = req.app.get('io');
    if (io) {
      io.to(team._id.toString()).emit('team_updated', updatedTeam);
      io.to(userToAdd._id.toString()).emit('new_notification');
    }

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  const { uid } = req.params;
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only team admins can remove members' });
    }

    const userToRemove = await User.findOne({ uid: uid.toUpperCase() });
    if (!userToRemove) return res.status(404).json({ message: 'User not found' });

    team.members = team.members.filter(m => m.toString() !== userToRemove._id.toString());
    await team.save();

    const updatedTeam = await Team.findById(team._id).populate('owner', 'name email uid').populate('members', 'name email uid');
    
    const io = req.app.get('io');
    if (io) {
      io.to(team._id.toString()).emit('team_updated', updatedTeam);
    }

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Team owner cannot leave the team. Transfer ownership or delete team.' });
    }

    if (!team.members.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    team.members = team.members.filter(m => m.toString() !== req.user._id.toString());
    await team.save();
    
    const updatedTeam = await Team.findById(team._id).populate('owner', 'name email uid').populate('members', 'name email uid');

    const io = req.app.get('io');
    if (io) {
      io.to(team._id.toString()).emit('team_updated', updatedTeam);
    }

    res.json({ message: 'Successfully left the team' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

