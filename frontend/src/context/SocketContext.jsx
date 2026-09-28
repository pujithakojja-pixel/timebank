import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const SOCKET_URL = 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('user_online', ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('user_offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      setUnreadCount(prev => prev + 1);

      // Show toast for important notifications
      const icons = { new_match: '🎯', trade_request: '🤝', credits_received: '💰', vouch_received: '⭐', new_message: '💬', trade_accepted: '✅' };
      toast.custom((t) => (
        <div className={`toast-custom glass`} style={{ padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 280 }}>
          <span style={{ fontSize: '1.4rem' }}>{icons[notification.type] || '🔔'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{notification.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{notification.body}</div>
          </div>
        </div>
      ), { duration: 4000 });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token]);

  const joinRoom = (room) => socketRef.current?.emit('join_room', { room });
  const leaveRoom = (room) => socketRef.current?.emit('leave_room', { room });
  const sendMessage = (data) => socketRef.current?.emit('send_message', data);
  const startTyping = (room) => socketRef.current?.emit('typing_start', { room });
  const stopTyping = (room) => socketRef.current?.emit('typing_stop', { room });
  const isOnline = (userId) => onlineUsers.has(userId);

  const clearUnread = () => setUnreadCount(0);
  const addNotification = (n) => {
    setNotifications(prev => [n, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      joinRoom,
      leaveRoom,
      sendMessage,
      startTyping,
      stopTyping,
      isOnline,
      onlineUsers,
      notifications,
      unreadCount,
      clearUnread,
      addNotification,
      setUnreadCount
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
