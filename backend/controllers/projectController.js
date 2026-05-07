const Project = require('../models/Project');
const Team = require('../models/Team');

exports.createProject = async (req, res) => {
  const { name, description, team, members } = req.body;
  try {
    // Verify team exists and user has access
    const teamDoc = await Team.findById(team);
    if (!teamDoc) return res.status(404).json({ message: 'Team not found' });
    
    if (teamDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only team admins can create projects' });
    }

    const project = await Project.create({
      name,
      description,
      team,
      members: members || []
    });
    
    const io = req.app.get('io');
    if (io) {
      io.to(team.toString()).emit('project_created', project);
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    });
    const teamIds = teams.map(t => t._id);
    const projects = await Project.find({ team: { $in: teamIds } }).populate('team', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectsByTeam = async (req, res) => {
  try {
    const projects = await Project.find({ team: req.params.teamId }).populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('team', 'name owner')
      .populate('members', 'name email uid');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProjectMembers = async (req, res) => {
  const { members } = req.body;
  try {
    const project = await Project.findById(req.params.id).populate('team');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.team.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.members = members;
    await project.save();
    
    const updatedProject = await Project.findById(project._id).populate('members', 'name email uid');
    
    const io = req.app.get('io');
    if (io) {
      io.to(project._id.toString()).emit('project_updated', updatedProject);
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can delete projects' });
    }

    const teamId = project.team._id;
    await Project.findByIdAndDelete(req.params.id);
    
    const io = req.app.get('io');
    if (io) {
      io.to(teamId.toString()).emit('project_deleted', req.params.id);
    }

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
