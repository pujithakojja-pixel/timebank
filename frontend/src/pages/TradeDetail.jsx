import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, Check, X, Calendar, Clock, MapPin, Star, Award, ChevronRight } from 'lucide-react';
import { tradesAPI, vouchesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'requested', label: 'Requested', icon: '📤' },
  { key: 'accepted', label: 'Accepted', icon: '✅' },
  { key: 'scheduled', label: 'Scheduled', icon: '📅' },
  { key: 'in_progress', label: 'In Progress', icon: '⚡' },
  { key: 'completed', label: 'Completed', icon: '🎉' },
  { key: 'vouched', label: 'Vouched', icon: '⭐' },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

function VouchModal({ trade, toUser, onClose, onSuccess }) {
  const QUALITIES = ['reliable', 'skilled', 'friendly', 'communicative', 'punctual', 'creative', 'professional', 'patient'];
  const [selected, setSelected] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (q) => setSelected(p => p.includes(q) ? p.filter(x => x !== q) : [...p, q]);

  const submit = async () => {
    if (!selected.length) { toast.error('Select at least one quality'); return; }
    setLoading(true);
    try {
      await vouchesAPI.create({
        tradeId: trade._id,
        toUserId: toUser._id,
        qualities: selected,
        comment,
        rating,
        skillName: trade.receiverOffer?.skillName || trade.initiatorOffer?.skillName
      });
      toast.success('Vouch submitted! Thank you 🌟');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit vouch');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        style={{ background: 'rgba(10,10,26,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, backdropFilter: 'blur(20px)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>Vouch for {toUser.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 6 }}>Your experience helps build community trust</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Rating</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[1,2,3,4,5].map(r => (
              <button key={r} onClick={() => setRating(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem', transition: 'transform 0.1s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                {r <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Qualities (select all that apply)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUALITIES.map(q => (
              <button key={q} onClick={() => toggle(q)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
                background: selected.includes(q) ? 'rgba(108,99,255,0.2)' : 'var(--bg-card)',
                border: `1px solid ${selected.includes(q) ? 'rgba(108,99,255,0.5)' : 'var(--border)'}`,
                color: selected.includes(q) ? 'var(--violet-light)' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.2s'
              }}>{q}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Comment (optional)</div>
          <textarea className="input" rows={3} placeholder="Describe your experience..." value={comment} onChange={e => setComment(e.target.value)} style={{ resize: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button onClick={submit} className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
            {loading ? 'Submitting...' : '⭐ Submit Vouch'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TradeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVouch, setShowVouch] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      const { data } = await tradesAPI.getById(id);
      setTrade(data.trade);
    } catch { toast.error('Trade not found'); navigate('/trades'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status, note) => {
    setUpdating(true);
    try {
      const { data } = await tradesAPI.updateStatus(id, { status, note });
      setTrade(data.trade);
      toast.success(`Trade ${status}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update trade');
    }
    setUpdating(false);
  };

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
    </div>
  );
  if (!trade) return null;

  const isInitiator = trade.initiator?._id === user?._id;
  const isReceiver = trade.receiver?._id === user?._id;
  const other = isInitiator ? trade.receiver : trade.initiator;
  const currentStepIdx = STATUS_ORDER.indexOf(trade.status);

  const canAccept = trade.status === 'requested' && isReceiver;
  const canReject = ['requested', 'negotiating'].includes(trade.status) && isReceiver;
  const canMarkInProgress = trade.status === 'scheduled' && (isInitiator || isReceiver);
  const canComplete = trade.status === 'in_progress' && (isInitiator || isReceiver);
  const canVouch = ['completed', 'vouched'].includes(trade.status) && (isInitiator || isReceiver);
  const canCancel = !['completed', 'vouched', 'cancelled', 'rejected'].includes(trade.status);
  const alreadyVouched = trade.vouches?.length > 0;

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={() => navigate('/trades')} className="btn btn-icon btn-ghost">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem' }}>
            Trade with {other?.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Created {trade.createdAt ? formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true }) : ''}
          </p>
        </div>
      </div>

      {/* Status Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Trade Progress</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {STATUS_STEPS.map((step, i) => {
            const done = STATUS_ORDER.indexOf(trade.status) >= i;
            const current = trade.status === step.key || (step.key === 'completed' && trade.status === 'vouched');
            if (['cancelled', 'rejected'].includes(trade.status) && !done) return null;
            return (
              <React.Fragment key={step.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: done ? 'linear-gradient(135deg, #6C63FF, #00D4FF)' : 'var(--bg-card)',
                      border: `2px solid ${done ? '#6C63FF' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                      boxShadow: current ? '0 0 16px rgba(108,99,255,0.5)' : 'none'
                    }}
                  >{done ? step.icon : '○'}</motion.div>
                  <span style={{ fontSize: '0.7rem', color: done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: done ? 600 : 400, textAlign: 'center', maxWidth: 60 }}>
                    {step.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < currentStepIdx ? 'linear-gradient(90deg, #6C63FF, #00D4FF)' : 'var(--border)', minWidth: 20, marginBottom: 24, flexShrink: 0, transition: 'background 0.5s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* Participants + Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { person: trade.initiator, offer: trade.initiatorOffer, label: 'Initiator' },
          { person: trade.receiver, offer: trade.receiverOffer, label: 'Receiver' }
        ].map(({ person, offer, label }, i) => {
          const isMe = person?._id === user?._id;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="glass" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                {person?.avatar ? (
                  <img src={person.avatar} style={{ width: 44, height: 44, borderRadius: '50%' }} alt={person.name} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {person?.name?.[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>{person?.name} {isMe && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(you)</span>}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 12 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{offer?.skillName || 'TBD'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{offer?.hours || 0}h · {offer?.description}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Details */}
      {(trade.scheduledAt || trade.notes || trade.meetingLocation) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass" style={{ padding: 22, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trade.scheduledAt && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Calendar size={16} color="var(--violet-light)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Scheduled</div>
                  <div style={{ fontWeight: 600 }}>{format(new Date(trade.scheduledAt), 'MMMM d, yyyy · h:mm a')}</div>
                </div>
              </div>
            )}
            {trade.notes && (
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>📝</span>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Notes</div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{trade.notes}</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Chat */}
          <Link to="/messages" state={{ room: trade.chatRoom }} className="btn btn-secondary" style={{ gap: 8 }}>
            <MessageCircle size={16} /> Open Chat
          </Link>

          {canAccept && (
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => updateStatus('accepted')} className="btn btn-primary" disabled={updating}>
              <Check size={16} /> Accept Trade
            </motion.button>
          )}
          {canReject && (
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => updateStatus('rejected')} className="btn btn-danger btn-sm" disabled={updating}>
              <X size={14} /> Reject
            </motion.button>
          )}
          {canMarkInProgress && (
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => updateStatus('in_progress')} className="btn btn-primary" disabled={updating}>
              ⚡ Start Exchange
            </motion.button>
          )}
          {canComplete && (
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => updateStatus('completed')} className="btn btn-primary" disabled={updating}>
              🎉 Mark Complete
            </motion.button>
          )}
          {canVouch && !alreadyVouched && (
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowVouch(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 12, background: 'linear-gradient(135deg, #FFD700, #FF8A65)',
              border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit'
            }} disabled={updating}>
              ⭐ Leave Vouch
            </motion.button>
          )}
          {canCancel && (
            <button onClick={() => { if (window.confirm('Cancel this trade?')) updateStatus('cancelled'); }} className="btn btn-ghost btn-sm" style={{ color: '#FF4B4B' }} disabled={updating}>
              Cancel Trade
            </button>
          )}
        </div>
      </motion.div>

      {/* Vouch Modal */}
      <AnimatePresence>
        {showVouch && (
          <VouchModal
            trade={trade}
            toUser={other}
            onClose={() => setShowVouch(false)}
            onSuccess={() => { setShowVouch(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
