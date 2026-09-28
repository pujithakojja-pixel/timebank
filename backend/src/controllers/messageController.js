const Message = require('../models/Message');
const Trade = require('../models/Trade');

exports.getRoomMessages = async (req, res, next) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this room
    if (room.startsWith('trade:')) {
      const tradeId = room.split('trade:')[1];
      const trade = await Trade.findOne({
        chatRoom: room,
        $or: [{ initiator: req.user._id }, { receiver: req.user._id }]
      });
      // Allow if no trade found (could be new room) or if user is participant
    }

    const messages = await Message.find({ room, isDeleted: false })
      .populate('sender', 'name avatar isOnline')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ room, isDeleted: false });

    // Mark as read
    await Message.updateMany(
      { room, 'readBy.user': { $ne: req.user._id } },
      { $push: { readBy: { user: req.user._id, readAt: new Date() } } }
    );

    res.json({
      success: true,
      messages: messages.reverse(),
      total,
      page: parseInt(page)
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserConversations = async (req, res, next) => {
  try {
    // Get all trades where user is a participant
    const trades = await Trade.find({
      $or: [{ initiator: req.user._id }, { receiver: req.user._id }],
      status: { $nin: ['cancelled', 'rejected'] }
    })
      .populate('initiator receiver', 'name avatar isOnline lastSeen')
      .sort({ updatedAt: -1 });

    const conversations = [];

    for (const trade of trades) {
      if (!trade.chatRoom) continue;

      const lastMessage = await Message.findOne({ room: trade.chatRoom })
        .populate('sender', 'name')
        .sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        room: trade.chatRoom,
        'readBy.user': { $ne: req.user._id }
      });

      const otherUser = trade.initiator._id.toString() === req.user._id.toString()
        ? trade.receiver
        : trade.initiator;

      conversations.push({
        room: trade.chatRoom,
        trade: {
          _id: trade._id,
          status: trade.status,
          initiatorOffer: trade.initiatorOffer,
          receiverOffer: trade.receiverOffer
        },
        otherUser,
        lastMessage,
        unreadCount
      });
    }

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { room, content, type = 'text', tradeAction } = req.body;

    const message = await Message.create({
      room,
      sender: req.user._id,
      content,
      type,
      tradeAction,
      readBy: [{ user: req.user._id, readAt: new Date() }]
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');
    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
};
