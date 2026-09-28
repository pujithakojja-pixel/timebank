import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Award, ArrowLeft, MessageCircle, ArrowLeftRight, Calendar, Check } from 'lucide-react';
import { usersAPI, vouchesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const QUALITY_ICONS = { reliable: '🎯', skilled: '💡', friendly: '😊', communicative: '💬', punctual: '⏰', creative: '🎨', professional: '👔', patient: '🧘' };

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [vouches, setVouches] = useState([]);
  const [qualityCounts, setQualityCounts] = useState({});
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');

  const isMe = id === currentUser?._id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, vouchRes] = await Promise.all([
          usersAPI.getProfile(id),
          vouchesAPI.getUserVouches(id)
        ]);
        setProfile(profileRes.data.user);
        setVouches(vouchRes.data.vouches || []);
        setQualityCounts(vouchRes.data.qualityCounts || {});
        setAvgRating(vouchRes.data.avgRating || 0);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="skeleton" style={{ height: 280, borderRadius: 20, marginBottom: 20 }} />
    </div>
  );
  if (!profile) return (
    <div className="page-container" style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
      <h2>User not found</h2>
      <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: 16 }}>Go Back</button>
    </div>
  );

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const SKILL_CATEGORY_COLORS = {
    Technology: '#6C63FF', Languages: '#FF8A65', Music: '#9C27B0', 'Arts & Crafts': '#FF6B9D',
    'Sports & Fitness': '#00D4FF', Cooking: '#FFC107', Education: '#673AB7', Design: '#E91E63', Other: '#607D8B'
  };

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16, gap: 6 }}>
        <ArrowLeft size={15} /> Back
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: 24, overflow: 'hidden', marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,212,255,0.08) 100%)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Cover */}
        <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(108,99,255,0.3) 0%, rgba(0,212,255,0.2) 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(108,99,255,0.4) 0%, transparent 60%)' }} />
        </div>

        <div style={{ padding: '0 28px 28px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -36 }}>
            <div style={{ position: 'relative' }}>
              {profile.avatar ? (
                <img src={profile.avatar} style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--bg-primary)' }} alt={profile.name} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: '3px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem' }}>
                  {getInitials(profile.name)}
                </div>
              )}
              {profile.isOnline && <div className="online-dot" style={{ position: 'absolute', bottom: 4, right: 4 }} />}
            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 36 }}>
              {isMe ? (
                <Link to="/settings" className="btn btn-secondary btn-sm">Edit Profile</Link>
              ) : (
                <>
                  <button onClick={() => navigate('/messages')} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                    <MessageCircle size={14} /> Message
                  </button>
                  <button onClick={() => navigate('/trades', { state: { initiateWith: profile } })} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
                    <ArrowLeftRight size={14} /> Trade
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.6rem' }}>{profile.name}</h1>
              {profile.isVerified && <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>✓ Verified</span>}
            </div>

            {profile.location?.displayName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
                <MapPin size={13} /> {profile.location.displayName}
              </div>
            )}

            {profile.bio && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginTop: 12, maxWidth: 540 }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { icon: '🤝', value: profile.completedTrades || 0, label: 'Trades' },
              { icon: '⏰', value: `${profile.hoursExchanged || 0}h`, label: 'Hours' },
              { icon: '⭐', value: `${profile.trustScore || 0}%`, label: 'Trust' },
              { icon: '💰', value: `${profile.timeCredits || 0}`, label: 'TC' },
              { icon: '🌟', value: vouches.length, label: 'Vouches' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 14, padding: 4, marginBottom: 24, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { id: 'about', label: 'About' },
          { id: 'skills', label: `Skills (${(profile.skillsOffered?.length || 0) + (profile.skillsWanted?.length || 0)})` },
          { id: 'vouches', label: `Vouches (${vouches.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            background: tab === t.id ? 'rgba(108,99,255,0.25)' : 'transparent',
            border: `1px solid ${tab === t.id ? 'rgba(108,99,255,0.4)' : 'transparent'}`,
            color: tab === t.id ? 'var(--violet-light)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'about' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Availability */}
          {profile.availability?.length > 0 && (
            <div className="glass" style={{ padding: 22 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Availability</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.availability.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20 }}>
                    <Calendar size={13} color="var(--violet-light)" />
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{a.day}</span>
                    {a.startTime && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.startTime}-{a.endTime}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="glass" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Trust & Reputation</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {profile.completedTrades >= 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20 }}>
                  <span>🏅</span><span style={{ fontSize: '0.85rem' }}>Active Trader</span>
                </div>
              )}
              {profile.completedTrades >= 5 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(0,255,179,0.1)', border: '1px solid rgba(0,255,179,0.2)', borderRadius: 20 }}>
                  <span>🏆</span><span style={{ fontSize: '0.85rem' }}>Experienced Trader</span>
                </div>
              )}
              {profile.trustScore >= 70 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 20 }}>
                  <span>⭐</span><span style={{ fontSize: '0.85rem' }}>Trusted Member</span>
                </div>
              )}
              {profile.isVerified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20 }}>
                  <Check size={14} color="#00D4FF" /><span style={{ fontSize: '0.85rem' }}>Verified</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'skills' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {profile.skillsOffered?.length > 0 && (
            <div className="glass" style={{ padding: 22 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14 }}>🎯 Skills Offered</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {profile.skillsOffered.map(s => (
                  <motion.div key={s._id} whileHover={{ scale: 1.05 }} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 24,
                    background: `${SKILL_CATEGORY_COLORS[s.category] || '#6C63FF'}15`,
                    border: `1px solid ${SKILL_CATEGORY_COLORS[s.category] || '#6C63FF'}40`
                  }}>
                    <span>{s.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: SKILL_CATEGORY_COLORS[s.category] || 'var(--violet-light)' }}>{s.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {profile.skillsWanted?.length > 0 && (
            <div className="glass" style={{ padding: 22 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14 }}>📚 Wants to Learn</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {profile.skillsWanted.map(s => (
                  <motion.div key={s._id} whileHover={{ scale: 1.05 }} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 24,
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.2)'
                  }}>
                    <span>{s.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#00D4FF' }}>{s.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {tab === 'vouches' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quality breakdown */}
          {Object.keys(qualityCounts).length > 0 && (
            <div className="glass" style={{ padding: 22 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Top Qualities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Object.entries(qualityCounts).sort((a, b) => b[1] - a[1]).map(([quality, count]) => (
                  <div key={quality} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20 }}>
                    <span>{QUALITY_ICONS[quality] || '✨'}</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.88rem' }}>{quality}</span>
                    <span style={{ background: 'rgba(108,99,255,0.3)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vouch list */}
          {vouches.length === 0 ? (
            <div className="glass" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No vouches yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Complete trades to receive vouches</p>
            </div>
          ) : (
            vouches.map((vouch, i) => (
              <motion.div key={vouch._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass" style={{ padding: 22 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  {vouch.from?.avatar ? (
                    <img src={vouch.from.avatar} style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} alt="" />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      {getInitials(vouch.from?.name)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{vouch.from?.name}</div>
                        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                          {[...Array(vouch.rating || 5)].map((_, j) => <span key={j} style={{ fontSize: '0.85rem' }}>⭐</span>)}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {vouch.createdAt ? formatDistanceToNow(new Date(vouch.createdAt), { addSuffix: true }) : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {vouch.qualities?.map(q => (
                        <span key={q} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20, fontSize: '0.78rem', color: 'var(--violet-light)', textTransform: 'capitalize' }}>
                          {QUALITY_ICONS[q]} {q}
                        </span>
                      ))}
                    </div>
                    {vouch.comment && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginTop: 10, fontStyle: 'italic' }}>
                        "{vouch.comment}"
                      </p>
                    )}
                    {vouch.skillName && (
                      <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Skill: {vouch.skillName}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
