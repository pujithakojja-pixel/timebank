const express = require('express');
const router = express.Router();
const { getUserProfile, getNearbyUsers, searchUsers, getDashboardData } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/nearby', protect, getNearbyUsers);
router.get('/search', protect, searchUsers);
router.get('/dashboard', protect, getDashboardData);
router.get('/:id', protect, getUserProfile);

module.exports = router;
