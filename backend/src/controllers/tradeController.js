const Trade = require('../models/Trade');
const User = require('../models/User');
const walletService = require('../services/walletService');
const notificationService = require('../services/notificationService');

exports.createTrade = async (req, res, next) => {
  try {
    const { receiverId, initiatorOffer, receiverOffer, notes, scheduledAt, isRemote, meetingLocation } = req.body;

    const receiver = await User.findById(receiverId).populate('skillsOffered');
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found' });

    const trade = await Trade.create({
      initiator: req.user._id,
      receiver: receiverId,
      initiatorOffer,
      receiverOffer,
      notes,
      scheduledAt,
      isRemote,
      meetingLocation,
      statusHistory: [{ status: 'requested', changedBy: req.user._id, note: 'Trade requested' }],
      chatRoom: `trade:${Date.now()}-${req.user._id}`
    });

    // Send notification to receiver
    await notificationService.notifyTradeRequest(trade, req.user, receiver);

    const populated = await Trade.findById(trade._id)
      .populate('initiator receiver', 'name avatar trustScore')
      .populate('initiatorOffer.skill receiverOffer.skill', 'name category icon');

    res.status(201).json({ success: true, trade: populated });
  } catch (error) {
    next(error);
  }
};

exports.getTrades = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const query = { $or: [{ initiator: userId }, { receiver: userId }] };
    if (status) query.status = status;

    const trades = await Trade.find(query)
      .populate('initiator receiver', 'name avatar trustScore isOnline')
      .populate('initiatorOffer.skill receiverOffer.skill', 'name category icon color')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Trade.countDocuments(query);

    res.json({ success: true, trades, total });
  } catch (error) {
    next(error);
  }
};

exports.getTradeById = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('initiator receiver', 'name avatar trustScore bio skillsOffered isOnline')
      .populate('initiatorOffer.skill receiverOffer.skill', 'name category icon color')
      .populate('vouches')
      .populate('transactions');

    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });

    const isParticipant = trade.initiator._id.toString() === req.user._id.toString() ||
      trade.receiver._id.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, trade });
  } catch (error) {
    next(error);
  }
};

exports.updateTradeStatus = async (req, res, next) => {
  try {
    const { status, note, scheduledAt } = req.body;
    const trade = await Trade.findById(req.params.id)
      .populate('initiator receiver', 'name avatar email');

    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });

    const userId = req.user._id.toString();
    const isInitiator = trade.initiator._id.toString() === userId;
    const isReceiver = trade.receiver._id.toString() === userId;

    if (!isInitiator && !isReceiver) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Status transition validation
    const allowedTransitions = {
      requested: ['negotiating', 'accepted', 'rejected', 'cancelled'],
      negotiating: ['accepted', 'rejected', 'cancelled'],
      accepted: ['scheduled', 'cancelled'],
      scheduled: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: ['vouched']
    };

    const allowed = allowedTransitions[trade.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${trade.status} to ${status}`
      });
    }

    // Some transitions require specific roles
    if (status === 'accepted' && !isReceiver) {
      return res.status(403).json({ success: false, message: 'Only receiver can accept a trade' });
    }
    if (status === 'rejected' && !isReceiver) {
      return res.status(403).json({ success: false, message: 'Only receiver can reject a trade' });
    }

    trade.status = status;
    trade.statusHistory.push({ status, changedBy: req.user._id, note: note || '' });

    if (scheduledAt) trade.scheduledAt = scheduledAt;
    if (status === 'completed') {
      trade.completedAt = new Date();
      await handleTradeCompletion(trade);
    }
    if (status === 'cancelled') trade.cancelledAt = new Date();

    await trade.save();

    // Send notifications
    const otherUser = isInitiator ? trade.receiver : trade.initiator;
    if (status === 'accepted') {
      await notificationService.notifyTradeAccepted(trade, trade.initiator, trade.receiver);
    }
    if (status === 'completed') {
      await notificationService.notifyTradeCompleted(trade, trade.initiator._id, trade.receiver);
      await notificationService.notifyTradeCompleted(trade, trade.receiver._id, trade.initiator);
    }

    const populated = await Trade.findById(trade._id)
      .populate('initiator receiver', 'name avatar trustScore')
      .populate('initiatorOffer.skill receiverOffer.skill', 'name category');

    res.json({ success: true, trade: populated });
  } catch (error) {
    next(error);
  }
};

async function handleTradeCompletion(trade) {
  try {
    const hours = trade.initiatorOffer.hours || 1;
    const creditsPerHour = parseFloat(process.env.CREDITS_PER_HOUR) || 1;
    const amount = hours * creditsPerHour;

    // Transfer credits from receiver to initiator (initiator provided service)
    await walletService.transferCredits({
      senderId: trade.receiver._id,
      receiverId: trade.initiator._id,
      amount,
      tradeId: trade._id,
      skillId: trade.initiatorOffer.skill,
      skillName: trade.initiatorOffer.skillName,
      description: `Payment for ${hours}h of ${trade.initiatorOffer.skillName}`
    });

    // If receiver also offered service
    if (trade.receiverOffer && trade.receiverOffer.hours) {
      const receiverHours = trade.receiverOffer.hours;
      const receiverAmount = receiverHours * creditsPerHour;
      await walletService.transferCredits({
        senderId: trade.initiator._id,
        receiverId: trade.receiver._id,
        amount: receiverAmount,
        tradeId: trade._id,
        skillId: trade.receiverOffer.skill,
        skillName: trade.receiverOffer.skillName,
        description: `Payment for ${receiverHours}h of ${trade.receiverOffer.skillName}`
      });
    }

    trade.creditsTransferred = true;

    // Update stats for both users
    await User.findByIdAndUpdate(trade.initiator._id, {
      $inc: { completedTrades: 1, hoursExchanged: hours }
    });
    await User.findByIdAndUpdate(trade.receiver._id, {
      $inc: { completedTrades: 1, hoursExchanged: trade.receiverOffer?.hours || hours }
    });

    // Notify credits received
    const initiator = await User.findById(trade.initiator._id);
    const receiver = await User.findById(trade.receiver._id);
    if (initiator && receiver) {
      await notificationService.notifyCreditsReceived(trade.initiator._id, amount, receiver, trade._id);
    }
  } catch (err) {
    console.error('Trade completion error:', err);
  }
}

exports.getTradeStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [total, completed, active, pending] = await Promise.all([
      Trade.countDocuments({ $or: [{ initiator: userId }, { receiver: userId }] }),
      Trade.countDocuments({ $or: [{ initiator: userId }, { receiver: userId }], status: { $in: ['completed', 'vouched'] } }),
      Trade.countDocuments({ $or: [{ initiator: userId }, { receiver: userId }], status: { $in: ['accepted', 'scheduled', 'in_progress'] } }),
      Trade.countDocuments({ $or: [{ initiator: userId }, { receiver: userId }], status: 'requested' })
    ]);
    res.json({ success: true, stats: { total, completed, active, pending } });
  } catch (error) {
    next(error);
  }
};
