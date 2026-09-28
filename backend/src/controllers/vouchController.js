const Vouch = require('../models/Vouch');
const Trade = require('../models/Trade');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

exports.createVouch = async (req, res, next) => {
  try {
    const { tradeId, toUserId, qualities, comment, rating, skillId, skillName } = req.body;

    // Verify trade is completed
    const trade = await Trade.findById(tradeId);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    if (!['completed', 'vouched'].includes(trade.status)) {
      return res.status(400).json({ success: false, message: 'Trade must be completed to leave a vouch' });
    }

    const isParticipant = trade.initiator.toString() === req.user._id.toString() ||
      trade.receiver.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not a trade participant' });
    if (toUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot vouch for yourself' });
    }

    // Check not already vouched
    const existing = await Vouch.findOne({ from: req.user._id, trade: tradeId });
    if (existing) return res.status(409).json({ success: false, message: 'Already vouched for this trade' });

    const vouch = await Vouch.create({
      from: req.user._id,
      to: toUserId,
      trade: tradeId,
      qualities,
      comment,
      rating,
      skillVouched: skillId,
      skillName
    });

    // Add vouch to trade
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { vouches: vouch._id },
      status: 'vouched'
    });

    // Update trust score for receiver
    await updateTrustScore(toUserId);

    // Notify receiver
    await notificationService.notifyVouchReceived(toUserId, req.user, qualities);

    res.status(201).json({ success: true, vouch });
  } catch (error) {
    next(error);
  }
};

exports.getUserVouches = async (req, res, next) => {
  try {
    const vouches = await Vouch.find({ to: req.params.userId })
      .populate('from', 'name avatar')
      .populate('skillVouched', 'name category')
      .sort({ createdAt: -1 });

    // Aggregate quality counts
    const qualityCounts = {};
    vouches.forEach(v => {
      v.qualities.forEach(q => {
        qualityCounts[q] = (qualityCounts[q] || 0) + 1;
      });
    });

    const avgRating = vouches.length > 0
      ? vouches.reduce((sum, v) => sum + v.rating, 0) / vouches.length
      : 0;

    res.json({ success: true, vouches, qualityCounts, avgRating, total: vouches.length });
  } catch (error) {
    next(error);
  }
};

async function updateTrustScore(userId) {
  const vouches = await Vouch.find({ to: userId });
  if (!vouches.length) return;

  const avgRating = vouches.reduce((sum, v) => sum + v.rating, 0) / vouches.length;
  const user = await User.findById(userId);
  const completionBonus = Math.min(user.completedTrades * 2, 30);
  const ratingScore = (avgRating / 5) * 50;
  const vouchCountBonus = Math.min(vouches.length * 2, 20);

  const trustScore = Math.min(Math.round(ratingScore + completionBonus + vouchCountBonus), 100);
  await User.findByIdAndUpdate(userId, { trustScore });
}
