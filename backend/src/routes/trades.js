const express = require('express');
const router = express.Router();
const { createTrade, getTrades, getTradeById, updateTradeStatus, getTradeStats } = require('../controllers/tradeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTrade);
router.get('/', protect, getTrades);
router.get('/stats', protect, getTradeStats);
router.get('/:id', protect, getTradeById);
router.put('/:id/status', protect, updateTradeStatus);

module.exports = router;
