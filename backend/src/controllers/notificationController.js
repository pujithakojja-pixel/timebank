const notificationService = require('../services/notificationService');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await notificationService.getUserNotifications(req.user._id, parseInt(page), parseInt(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.user._id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
