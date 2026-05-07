const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Team = require('../models/Team');

exports.createTask = async (req, res) => {
  const { title, description, project, assignedTo, dueDate, priority, status } = req.body;
  try {
    const task = await Task.create({
      title,
      description,
      project,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      dueDate,
      priority: priority || 'Medium',
      status: status || 'To Do'
    });
    
    const projDetails = await Project.findById(project).populate('team');

    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        message: `You were assigned a new task: "${title}" in ${projDetails.name}`,
        type: 'TaskAssigned',
        link: `/projects/${project}`
      });
    }

    const otherMembers = projDetails.members.filter(m => m.toString() !== req.user._id.toString() && m.toString() !== assignedTo);
    for (const memberId of otherMembers) {
      await Notification.create({
        user: memberId,
        message: `A new task "${title}" was added to ${projDetails.name}`,
        type: 'NewTask',
        link: `/projects/${project}`
      });
    }

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');
    
    const io = req.app.get('io');
    if (io) {
      io.to(project.toString()).emit('task_created', populatedTask);
      if (assignedTo) io.to(assignedTo.toString()).emit('new_notification');
      otherMembers.forEach(m => io.to(m.toString()).emit('new_notification'));
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    // Return all tasks assigned to this user
    const tasks = await Task.find({ assignedTo: req.user._id }).populate({
      path: 'project',
      select: 'name team',
      populate: { path: 'team', select: 'name' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardTasks = async (req, res) => {
  try {
    // Find teams where user is owner or member
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    });
    const teamIds = teams.map(t => t._id);

    // Find projects in those teams
    const projects = await Project.find({ team: { $in: teamIds } });
    const projectIds = projects.map(p => p._id);

    // Find tasks belonging to these projects that are EITHER unassigned or assigned to this user
    const tasks = await Task.find({ 
      project: { $in: projectIds },
      $or: [{ assignedTo: req.user._id }, { assignedTo: null }]
    }).populate('project', 'name').sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { status, priority, dueDate, assignedTo } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only task creator or Admins can update this task' });
    }
    
    const originalAssignee = task.assignedTo?.toString();

    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    
    await task.save();
    
    if (assignedTo && originalAssignee !== assignedTo) {
      await Notification.create({
        user: assignedTo,
        message: `You were assigned to the task: "${task.title}"`,
        type: 'TaskAssigned',
        link: `/projects/${task.project}`
      });
    }

    const updatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');
    
    const io = req.app.get('io');
    if (io) {
      io.to(task.project.toString()).emit('task_updated', updatedTask);
      if (assignedTo && originalAssignee !== assignedTo) {
        io.to(assignedTo.toString()).emit('new_notification');
      }
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: 'project',
      populate: { path: 'team' }
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only task creator or Admins can delete this task' });
    }

    const projectId = task.project._id;
    await Task.findByIdAndDelete(req.params.id);
    
    const io = req.app.get('io');
    if (io) {
      io.to(projectId.toString()).emit('task_deleted', req.params.id);
    }

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
