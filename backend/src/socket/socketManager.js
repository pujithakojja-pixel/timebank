const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const connectedUsers = new Map(); // userId -> socketId

const initializeSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    connectedUsers.set(userId, socket.id);

    // Mark user online
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user_online', { userId });

    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Join personal room for notifications
    socket.join(`user:${userId}`);

    // Handle joining a chat room
    socket.on('join_room', async ({ room }) => {
      socket.join(room);
      socket.emit('room_joined', { room });
      
      // Mark messages as read
      await Message.updateMany(
        { room, 'readBy.user': { $ne: socket.user._id } },
        { $push: { readBy: { user: socket.user._id, readAt: new Date() } } }
      );
    });

    // Handle leaving a room
    socket.on('leave_room', ({ room }) => {
      socket.leave(room);
    });

    // Handle sending messages
    socket.on('send_message', async ({ room, content, type = 'text', tradeAction }) => {
      try {
        const message = await Message.create({
          room,
          sender: socket.user._id,
          content,
          type,
          tradeAction,
          readBy: [{ user: socket.user._id, readAt: new Date() }]
        });

        const populated = await Message.findById(message._id).populate('sender', 'name avatar');

        io.to(room).emit('new_message', populated);

        // Notify other participants
        const roomParts = room.split(':');
        if (roomParts[0] === 'trade') {
          // Will be handled by trade participants
        }
      } catch (err) {
        socket.emit('message_error', { error: err.message });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ room }) => {
      socket.to(room).emit('user_typing', { userId, userName: socket.user.name });
    });

    socket.on('typing_stop', ({ room }) => {
      socket.to(room).emit('user_stopped_typing', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      connectedUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user_offline', { userId });
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
};

const sendNotificationToUser = (io, userId, notification) => {
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    io.to(`user:${userId}`).emit('new_notification', notification);
  }
};

const sendToRoom = (io, room, event, data) => {
  io.to(room).emit(event, data);
};

const isUserOnline = (userId) => connectedUsers.has(userId.toString());

module.exports = { initializeSocket, sendNotificationToUser, sendToRoom, isUserOnline, connectedUsers };
