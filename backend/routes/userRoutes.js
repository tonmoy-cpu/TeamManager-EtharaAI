const express = require('express');
const router = express.Router();
const { getUsers, updateProfile, findUserByUid } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getUsers);

router.route('/find/:uid')
  .get(protect, findUserByUid);

router.route('/profile')
  .put(protect, updateProfile);

module.exports = router;
