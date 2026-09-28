const express = require('express');
const router = express.Router();
const { getMatches, dismissMatch, acceptMatch } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMatches);
router.put('/:id/dismiss', protect, dismissMatch);
router.put('/:id/accept', protect, acceptMatch);

module.exports = router;
