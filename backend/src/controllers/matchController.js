const Match = require('../models/Match');
const matchingService = require('../services/matchingService');
const notificationService = require('../services/notificationService');

exports.getMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, radiusKm = 15 } = req.query;

    // Compute fresh matches
    const [directMatches, circularMatches] = await Promise.all([
      matchingService.findDirectMatches(userId, parseFloat(radiusKm)),
      matchingService.findCircularMatches(userId, parseFloat(radiusKm))
    ]);

    // Save new matches
    await matchingService.saveMatches(userId, directMatches, circularMatches);

    // Also get saved matches from DB
    const savedMatches = await Match.find({
      users: userId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    })
      .populate('users', 'name avatar trustScore location skillsOffered skillsWanted')
      .populate('skillsInvolved', 'name category icon')
      .populate({
        path: 'circularChain.user',
        select: 'name avatar trustScore'
      })
      .populate({
        path: 'circularChain.offersSkill',
        select: 'name category'
      })
      .sort({ score: -1 })
      .limit(30);

    const direct = savedMatches.filter(m => m.type === 'direct');
    const circular = savedMatches.filter(m => m.type === 'circular');
    const nearby = savedMatches.filter(m => m.type === 'nearby');

    // Return both computed and saved
    res.json({
      success: true,
      matches: {
        direct: directMatches.slice(0, 10),
        circular: circularMatches.slice(0, 5),
        nearby: [],
        saved: { direct, circular, nearby }
      },
      total: directMatches.length + circularMatches.length
    });
  } catch (error) {
    next(error);
  }
};

exports.dismissMatch = async (req, res, next) => {
  try {
    await Match.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ success: true, message: 'Match dismissed' });
  } catch (error) {
    next(error);
  }
};

exports.acceptMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    match.status = 'accepted';
    await match.save();
    res.json({ success: true, match });
  } catch (error) {
    next(error);
  }
};
