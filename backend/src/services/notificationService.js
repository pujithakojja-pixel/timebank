const Notification = require('../models/Notification');
const User = require('../models/User');

let io; // Will be set after socket initialization

const notificationService = {
  setIO(socketIO) {
    io = socketIO;
  },

  async create({ userId, type, title, body, icon, link, data, relatedUser, relatedTrade, relatedMatch }) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        body,
        icon,
        link,
        data,
        relatedUser,
        relatedTrade,
        relatedMatch
      });

      // Push to user's notifications array
      await User.findByIdAndUpdate(userId, {
        $push: { notifications: { $each: [notification._id], $slice: -100 } }
      });

      // Send real-time notification via socket
      if (io) {
        const populated = await Notification.findById(notification._id)
          .populate('relatedUser', 'name avatar')
          .populate('relatedTrade', 'status');

        io.to(`user:${userId}`).emit('new_notification', populated);
      }

      return notification;
    } catch (error) {
      console.error('Notification creation error:', error);
    }
  },

  async notifyTradeRequest(trade, initiator, receiver) {
    await this.create({
      userId: receiver._id,
      type: 'trade_request',
      title: 'New Trade Request',
      body: `${initiator.name} wants to trade ${trade.initiatorOffer.skillName} with you`,
      icon: '🤝',
      link: `/trades/${trade._id}`,
      relatedUser: initiator._id,
      relatedTrade: trade._id
    });
  },

  async notifyTradeAccepted(trade, initiator, receiver) {
    await this.create({
      userId: initiator._id,
      type: 'trade_accepted',
      title: 'Trade Accepted!',
      body: `${receiver.name} accepted your trade request`,
      icon: '✅',
      link: `/trades/${trade._id}`,
      relatedUser: receiver._id,
      relatedTrade: trade._id
    });
  },

  async notifyTradeCompleted(trade, userId, otherUser) {
    await this.create({
      userId,
      type: 'trade_completed',
      title: 'Trade Completed',
      body: `Your trade with ${otherUser.name} has been completed`,
      icon: '🎉',
      link: `/trades/${trade._id}`,
      relatedUser: otherUser._id,
      relatedTrade: trade._id
    });
  },

  async notifyCreditsReceived(userId, amount, fromUser, tradeId) {
    await this.create({
      userId,
      type: 'credits_received',
      title: 'Time Credits Received',
      body: `You received ${amount} Time Credits from ${fromUser.name}`,
      icon: '💰',
      link: `/wallet`,
      relatedUser: fromUser._id,
      relatedTrade: tradeId
    });
  },

  async notifyVouchReceived(userId, fromUser, qualities) {
    await this.create({
      userId,
      type: 'vouch_received',
      title: 'New Vouch Received!',
      body: `${fromUser.name} vouched for you as: ${qualities.join(', ')}`,
      icon: '⭐',
      link: `/profile/${userId}`,
      relatedUser: fromUser._id
    });
  },

  async notifyNewMatch(userId, matchedUser, reason) {
    await this.create({
      userId,
      type: 'new_match',
      title: 'New Match Found!',
      body: `${matchedUser.name} is a great match for you - ${reason}`,
      icon: '🎯',
      link: '/matches',
      relatedUser: matchedUser._id
    });
  },

  async notifyNewMessage(userId, fromUser, preview) {
    await this.create({
      userId,
      type: 'new_message',
      title: `Message from ${fromUser.name}`,
      body: preview.length > 60 ? preview.substring(0, 60) + '...' : preview,
      icon: '💬',
      link: '/messages',
      relatedUser: fromUser._id
    });
  },

  async getUserNotifications(userId, page = 1, limit = 20) {
    const notifications = await Notification.find({ user: userId })
      .populate('relatedUser', 'name avatar')
      .populate('relatedTrade', 'status initiatorOffer receiverOffer')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    return { notifications, unreadCount };
  },

  async markAsRead(userId, notificationId) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true }
    );
  },

  async markAllAsRead(userId) {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  }
};

module.exports = notificationService;
