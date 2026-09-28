const express = require('express');
const router = express.Router();
const { createVouch, getUserVouches } = require('../controllers/vouchController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createVouch);
router.get('/user/:userId', protect, getUserVouches);

module.exports = router;
