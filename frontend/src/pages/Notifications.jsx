import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, ArrowRight } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  new_match: '🎯', trade_request: '🤝', trade_accepted: '✅', trade_rejected: '❌',
  trade_scheduled: '📅', trade_completed: '🎉', trade_cancelled: '🚫',
  new_message: '💬', credits_received: '💰', vouch_received: '⭐',
  upcoming_trade: '⏰', system: '🔔'
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { setUnreadCount: setSocketUnread } = useSocket();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await notificationsAPI.getAll({ limit: 50 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setSocketUnread(0);
    toast.success('All notifications marked as read');
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await notificationsAPI.markRead(n._id);
      setNotifications(prev => prev.map(notif => notif._id === n._id ? { ...notif, isRead: true } : notif));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setSocketUnread(prev => Math.max(0, prev - 1));
    }
    if (n.link) navigate(n.link);
  };

  const grouped = notifications.reduce((acc, n) => {
    const date = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let group;
    if (date.toDateString() === today.toDateString()) group = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) group = 'Yesterday';
    else group = 'Earlier';

    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  return (
    <div className="page-container" style={{ maxWidth: 680, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.8rem' }}>
            <span className="gradient-text">Notifications</span>
          </h1>
          {unreadCount > 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ gap: 8 }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 14 }} />)}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔔</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>All quiet here</h3>
          <p style={{ color: 'var(--text-muted)' }}>You'll receive notifications when someone matches with you, sends a trade request, or messages you.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                {group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                  {items.map((n, i) => (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleClick(n)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        padding: '16px 20px', borderRadius: 14, cursor: 'pointer',
                        background: n.isRead ? 'var(--bg-card)' : 'rgba(108,99,255,0.08)',
                        border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(108,99,255,0.2)'}`,
                        transition: 'all 0.2s'
                      }}
                      whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(108,99,255,0.25)' }}
                    >
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                        background: n.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(108,99,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}>
                        {n.icon || TYPE_ICONS[n.type] || '🔔'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.92rem' }}>{n.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                            </span>
                            {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--violet)', flexShrink: 0 }} />}
                          </div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginTop: 3, lineHeight: 1.5 }}>
                          {n.body}
                        </div>
                        {n.link && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: 'var(--violet-light)', fontSize: '0.78rem', fontWeight: 600 }}>
                            View <ArrowRight size={12} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
