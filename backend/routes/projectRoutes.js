const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectsByTeam, getProjectById, updateProjectMembers, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/team/:teamId', protect, getProjectsByTeam);
router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProjectMembers)
  .delete(protect, deleteProject);

module.exports = router;
