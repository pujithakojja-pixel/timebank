const express = require('express');
const router = express.Router();
const { getAllSkills, getNearbyOffers, createSkillOffer, getDiscoverCards } = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllSkills);
router.get('/offers', protect, getNearbyOffers);
router.get('/discover', protect, getDiscoverCards);
router.post('/offers', protect, createSkillOffer);

module.exports = router;
