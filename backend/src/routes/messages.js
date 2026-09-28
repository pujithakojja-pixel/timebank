const express = require('express');
const router = express.Router();
const { getRoomMessages, getUserConversations, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getUserConversations);
router.get('/room/:room', protect, getRoomMessages);
router.post('/', protect, sendMessage);

module.exports = router;
