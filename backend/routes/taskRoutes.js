const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTasksByProject, getDashboardTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/dashboard')
  .get(protect, getDashboardTasks);

router.route('/project/:projectId')
  .get(protect, getTasksByProject);

router.route('/:id')
  .put(protect, updateTaskStatus)
  .delete(protect, require('../controllers/taskController').deleteTask);

module.exports = router;
