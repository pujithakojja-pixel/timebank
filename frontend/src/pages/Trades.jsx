import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Filter, ChevronRight, Clock, ArrowLeftRight, X, Check, Calendar, User } from 'lucide-react';
import { tradesAPI, skillsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  requested: { label: 'Requested', color: '#FF8A65', bg: 'rgba(255,138,101,0.15)' },
  negotiating: { label: 'Negotiating', color: '#FFC107', bg: 'rgba(255,193,7,0.15)' },
  accepted: { label: 'Accepted', color: '#00D4FF', bg: 'rgba(0,212,255,0.15)' },
  scheduled: { label: 'Scheduled', color: '#6C63FF', bg: 'rgba(108,99,255,0.15)' },
  in_progress: { label: 'In Progress', color: '#00FFB3', bg: 'rgba(0,255,179,0.15)' },
  completed: { label: 'Completed', color: '#4CAF50', bg: 'rgba(76,175,80,0.15)' },
  vouched: { label: 'Vouched', color: '#FFD700', bg: 'rgba(255,215,0,0.15)' },
  cancelled: { label: 'Cancelled', color: '#FF4B4B', bg: 'rgba(255,75,75,0.15)' },
  rejected: { label: 'Rejected', color: '#FF4B4B', bg: 'rgba(255,75,75,0.15)' },
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active', statuses: ['accepted', 'scheduled', 'in_progress'] },
  { id: 'pending', label: 'Pending', statuses: ['requested', 'negotiating'] },
  { id: 'completed', label: 'Completed', statuses: ['completed', 'vouched'] },
];

function NewTradeModal({ onClose, prefillUser }) {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    receiverId: prefillUser?._id || '',
    receiverName: prefillUser?.name || '',
    initiatorSkillName: '',
    initiatorHours: 2,
    receiverSkillName: '',
    receiverHours: 2,
    notes: '',
    scheduledAt: '',
    isRemote: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    skillsAPI.getAll().then(({ data }) => setSkills(data.skills || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.receiverId || !form.initiatorSkillName) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const { data } = await tradesAPI.create({
        receiverId: form.receiverId,
        initiatorOffer: {
          skillName: form.initiatorSkillName,
          hours: form.initiatorHours,
          description: `${form.initiatorHours} hours of ${form.initiatorSkillName}`
        },
        receiverOffer: form.receiverSkillName ? {
          skillName: form.receiverSkillName,
          hours: form.receiverHours,
          description: `${form.receiverHours} hours of ${form.receiverSkillName}`
        } : undefined,
        notes: form.notes,
        scheduledAt: form.scheduledAt || undefined,
        isRemote: form.isRemote
      });
      toast.success('Trade request sent!');
      onClose(data.trade);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trade');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ background: 'rgba(10,10,26,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 500, backdropFilter: 'blur(20px)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>Propose a Trade</h2>
          <button onClick={() => onClose()} className="btn btn-icon btn-ghost"><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* With whom */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Trading with *</label>
            {prefillUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 12 }}>
                {prefillUser.avatar ? (
                  <img src={prefillUser.avatar} style={{ width: 36, height: 36, borderRadius: '50%' }} alt={prefillUser.name} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {prefillUser.name?.[0]}
                  </div>
                )}
                <span style={{ fontWeight: 600 }}>{prefillUser.name}</span>
              </div>
            ) : (
              <input className="input" placeholder="User ID or name" value={form.receiverId} onChange={e => setForm(p => ({ ...p, receiverId: e.target.value }))} />
            )}
          </div>

          {/* What I offer */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>My skill offer *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <select className="input" value={form.initiatorSkillName} onChange={e => setForm(p => ({ ...p, initiatorSkillName: e.target.value }))}>
                <option value="">Select skill</option>
                {user?.skillsOffered?.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                {skills.filter(s => !user?.skillsOffered?.find(o => o.name === s.name)).slice(0, 10).map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" className="input" min="0.5" max="10" step="0.5" value={form.initiatorHours} onChange={e => setForm(p => ({ ...p, initiatorHours: parseFloat(e.target.value) }))} />
                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>hrs</span>
              </div>
            </div>
          </div>

          {/* What they offer (optional) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Their skill offer (optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <select className="input" value={form.receiverSkillName} onChange={e => setForm(p => ({ ...p, receiverSkillName: e.target.value }))}>
                <option value="">Select skill</option>
                {skills.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" className="input" min="0.5" max="10" step="0.5" value={form.receiverHours} onChange={e => setForm(p => ({ ...p, receiverHours: parseFloat(e.target.value) }))} />
                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>hrs</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Suggested time (optional)</label>
            <input className="input" type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Notes</label>
            <textarea className="input" rows={3} placeholder="Any additional details..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'none' }} />
          </div>

          {/* Remote toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ width: 40, height: 22, borderRadius: 11, background: form.isRemote ? '#6C63FF' : 'var(--bg-card)', border: '1px solid var(--border)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => setForm(p => ({ ...p, isRemote: !p.isRemote }))}>
              <div style={{ position: 'absolute', top: 2, left: form.isRemote ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>This is a remote exchange</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button onClick={() => onClose()} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
            {loading ? 'Sending...' : '🤝 Send Trade Request'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Trades() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showNewTrade, setShowNewTrade] = useState(false);
  const [prefillUser, setPrefillUser] = useState(null);

  useEffect(() => {
    if (location.state?.initiateWith) {
      setPrefillUser(location.state.initiateWith);
      setShowNewTrade(true);
    }
  }, [location.state]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await tradesAPI.getAll({ limit: 50 });
      setTrades(data.trades || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getFilteredTrades = () => {
    const tabConfig = TABS.find(t => t.id === tab);
    if (!tabConfig?.statuses) return trades;
    return trades.filter(t => tabConfig.statuses.includes(t.status));
  };

  const filtered = getFilteredTrades();
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.8rem' }}>
            <span className="gradient-text">My Trades</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>{trades.length} total trades</p>
        </div>
        <motion.button
          onClick={() => setShowNewTrade(true)}
          className="btn btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={16} /> New Trade
        </motion.button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {TABS.map(t => {
          const count = t.id === 'all' ? trades.length : trades.filter(tr => t.statuses?.includes(tr.status)).length;
          return (
            <motion.button key={t.id} onClick={() => setTab(t.id)} whileHover={{ scale: 1.02 }} style={{
              padding: '14px 16px', borderRadius: 14,
              background: tab === t.id ? 'rgba(108,99,255,0.2)' : 'var(--bg-card)',
              border: `1px solid ${tab === t.id ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: tab === t.id ? 'var(--violet-light)' : 'var(--text-primary)' }}>{count}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{t.label}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Trades list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🤝</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>No {tab === 'all' ? '' : tab} trades yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Start trading skills with your community</p>
          <button onClick={() => setShowNewTrade(true)} className="btn btn-primary"><Plus size={16} /> Propose a Trade</button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((trade, i) => {
              const isInit = trade.initiator?._id === user?._id || trade.initiator === user?._id;
              const other = isInit ? trade.receiver : trade.initiator;
              const status = STATUS_CONFIG[trade.status] || STATUS_CONFIG.requested;

              return (
                <motion.div
                  key={trade._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass glass-hover"
                  style={{ padding: '18px 22px', cursor: 'pointer' }}
                  onClick={() => navigate(`/trades/${trade._id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {other?.avatar ? (
                      <img src={other.avatar} style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0 }} alt={other.name} />
                    ) : (
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                        {getInitials(other?.name)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>{other?.name || 'Unknown'}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 8 }}>{isInit ? 'Proposed by you' : 'Proposed to you'}</span>
                        </div>
                        <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: status.bg, color: status.color, flexShrink: 0 }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                        <span style={{ padding: '2px 10px', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 20, fontSize: '0.78rem', color: 'var(--violet-light)' }}>
                          {trade.initiatorOffer?.skillName || '?'}
                        </span>
                        <ArrowLeftRight size={13} color="var(--text-muted)" />
                        <span style={{ padding: '2px 10px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, fontSize: '0.78rem', color: '#00D4FF' }}>
                          {trade.receiverOffer?.skillName || 'TBD'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 4 }}>
                          · {trade.initiatorOffer?.hours || 1}h
                        </span>
                      </div>
                      {trade.scheduledAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          <Calendar size={11} /> {format(new Date(trade.scheduledAt), 'MMM d, h:mm a')}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {showNewTrade && (
          <NewTradeModal
            onClose={(newTrade) => {
              setShowNewTrade(false);
              setPrefillUser(null);
              if (newTrade) { load(); navigate(`/trades/${newTrade._id}`); }
            }}
            prefillUser={prefillUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


