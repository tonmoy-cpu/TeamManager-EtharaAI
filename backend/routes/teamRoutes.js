const express = require('express');
const router = express.Router();
const { createTeam, getTeams, getTeamById, joinTeam, addMemberByUid, removeMember, deleteTeam, leaveTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTeam)
  .get(protect, getTeams);

router.post('/join', protect, joinTeam);

router.route('/:id')
  .get(protect, getTeamById)
  .delete(protect, deleteTeam);

router.post('/:id/members/add', protect, addMemberByUid);
router.delete('/:id/members/:uid', protect, removeMember);
router.post('/:id/leave', protect, leaveTeam);

module.exports = router;
