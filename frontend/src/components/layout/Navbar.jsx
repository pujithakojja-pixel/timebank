import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationsAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const NAV = [
  { to:'/explore',  label:'Explore',  emoji:'🗺️', color:'#FF6B2B' },
  { to:'/discover', label:'Discover', emoji:'🧭', color:'#FF4FA3' },
  { to:'/matches',  label:'Matches',  emoji:'⚡', color:'#3A7BFF' },
  { to:'/trades',   label:'Trades',   emoji:'🤝', color:'#2ECC71' },
  { to:'/messages', label:'Chat',     emoji:'💬', color:'#9B59FF' },
  { to:'/wallet',   label:'Wallet',   emoji:'💰', color:'#FF9800' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    notificationsAPI.getAll({ limit:5 })
      .then(({ data }) => { setNotifs(data.notifications||[]); setUnreadCount(data.unreadCount||0); })
      .catch(() => {});
  }, []);

  const openNotifs = async () => {
    setShowNotif(v => !v); setShowProfile(false);
    if (!showNotif) {
      try { const { data } = await notificationsAPI.getAll({ limit:10 }); setNotifs(data.notifications||[]); } catch {}
    }
  };

  const markAll = async () => {
    await notificationsAPI.markAllRead().catch(() => {});
    setUnreadCount(0); setNotifs(p => p.map(n => ({ ...n, isRead:true })));
  };

  const getInitials = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase() || 'U';

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, height:'var(--nav-height)', zIndex:1000,
      background: scrolled ? 'rgba(255,248,240,0.97)' : 'rgba(255,248,240,0.9)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      borderBottom:`2px solid rgba(255,107,43,${scrolled?0.2:0.12})`,
      boxShadow: scrolled ? '0 4px 24px rgba(255,107,43,0.1)' : 'none',
      transition:'all 0.3s',
    }}>
      <div style={{ maxWidth:1300, margin:'0 auto', height:'100%', padding:'0 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
          <motion.div whileHover={{ rotate:[0,-12,12,0], scale:1.1 }} transition={{ duration:0.4 }}
            style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem',
              boxShadow:'0 3px 14px rgba(255,107,43,0.38)' }}>⏱</motion.div>
          <span style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'1.28rem', fontWeight:900,
            background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TimeBank</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display:'flex', alignItems:'center', gap:2 }} className="desktop-nav">
          {NAV.map(({ to, label, emoji, color }) => {
            const active = location.pathname === to || location.pathname.startsWith(to+'/');
            return (
              <Link key={to} to={to} style={{
                display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:50,
                textDecoration:'none', fontSize:'0.87rem', fontWeight:800,
                color: active ? '#fff' : 'var(--text-secondary)',
                background: active ? `linear-gradient(135deg,${color},${color}bb)` : 'transparent',
                border: active ? 'none' : '1.5px solid transparent',
                boxShadow: active ? `0 3px 12px ${color}40` : 'none',
                transition:'all 0.2s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background=`${color}12`; e.currentTarget.style.color=color; e.currentTarget.style.borderColor=`${color}30`; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='transparent'; } }}>
                <span style={{ fontSize:'0.92rem' }}>{emoji}</span>{label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          {/* TC */}
          <motion.div whileHover={{ scale:1.05 }} onClick={() => navigate('/wallet')}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 13px', borderRadius:50,
              background:'linear-gradient(135deg,#FFF3E0,#FFE0B2)', border:'2px solid rgba(255,152,0,0.35)',
              fontSize:'0.84rem', fontWeight:900, color:'#E65100', cursor:'pointer',
              boxShadow:'0 2px 10px rgba(255,152,0,0.18)' }}>
            <span>⏰</span><span>{user?.timeCredits ?? 0} TC</span>
          </motion.div>

          {/* Bell */}
          <div ref={notifRef} style={{ position:'relative' }}>
            <motion.button onClick={openNotifs} whileHover={{ scale:1.08 }} whileTap={{ scale:0.94 }}
              style={{ width:38, height:38, borderRadius:'50%', border:'2px solid rgba(255,107,43,0.22)',
                background:'#FFF3E0', display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', fontSize:'1.1rem', position:'relative' }}>
              🔔
              {unreadCount > 0 && (
                <motion.span initial={{ scale:0 }} animate={{ scale:1 }}
                  style={{ position:'absolute', top:0, right:0, width:17, height:17, borderRadius:'50%',
                    background:'linear-gradient(135deg,#FF3B5C,#FF6B2B)', fontSize:'0.6rem', fontWeight:900,
                    display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
                    border:'2px solid #FFF8F0' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:8, scale:0.95 }}
                  style={{ position:'absolute', right:0, top:'calc(100% + 8px)', width:330,
                    background:'#fff', border:'2px solid rgba(255,107,43,0.18)', borderRadius:18,
                    boxShadow:'0 16px 50px rgba(255,107,43,0.13)', zIndex:1001, overflow:'hidden' }}>
                  <div style={{ padding:'12px 18px', borderBottom:'1.5px solid rgba(255,107,43,0.1)',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    background:'linear-gradient(135deg,#FFF3E0,#FCE4EC)' }}>
                    <span style={{ fontWeight:900, fontFamily:'Baloo 2,sans-serif', fontSize:'0.95rem' }}>🔔 Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAll} style={{ background:'none', border:'none', color:'#FF6B2B',
                        fontSize:'0.78rem', cursor:'pointer', fontFamily:'Nunito,sans-serif', fontWeight:800 }}>
                        Mark all read ✓
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight:320, overflowY:'auto' }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding:36, textAlign:'center' }}>
                        <div style={{ fontSize:'2rem', marginBottom:6 }}>🔕</div>
                        <div style={{ fontWeight:800, color:'var(--text-muted)', fontSize:'0.88rem' }}>All quiet here!</div>
                      </div>
                    ) : notifs.map((n,i) => (
                      <div key={n._id||i} onClick={() => { setShowNotif(false); if (n.link) navigate(n.link); }}
                        style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,107,43,0.06)',
                          background:n.isRead ? 'transparent' : 'rgba(255,107,43,0.04)',
                          cursor:'pointer', display:'flex', gap:10, alignItems:'flex-start' }}>
                        <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{n.icon || '🔔'}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'0.84rem', fontWeight:n.isRead?600:800 }}>{n.title}</div>
                          <div style={{ fontSize:'0.76rem', color:'var(--text-secondary)', marginTop:2, lineHeight:1.35 }}>{n.body}</div>
                          <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:2 }}>
                            {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix:true }) : ''}
                          </div>
                        </div>
                        {!n.isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:'#FF6B2B', flexShrink:0, marginTop:3 }} />}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:'9px 16px', borderTop:'1.5px solid rgba(255,107,43,0.1)', background:'#FFFAF6' }}>
                    <Link to="/notifications" onClick={() => setShowNotif(false)}
                      style={{ display:'block', textAlign:'center', color:'#FF6B2B', fontSize:'0.83rem',
                        textDecoration:'none', fontWeight:900 }}>View all →</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={profileRef} style={{ position:'relative' }}>
            <motion.button onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
              whileHover={{ scale:1.03 }}
              style={{ display:'flex', alignItems:'center', gap:7, background:'#fff',
                border:'2px solid rgba(255,107,43,0.22)', borderRadius:50, padding:'4px 11px 4px 4px',
                cursor:'pointer', boxShadow:'0 2px 10px rgba(255,107,43,0.09)' }}>
              {user?.avatar ? (
                <img src={user.avatar} style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }} alt="" />
              ) : (
                <div style={{ width:28, height:28, borderRadius:'50%',
                  background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.77rem', fontWeight:900, color:'#fff' }}>
                  {getInitials(user?.name)}
                </div>
              )}
              <span style={{ fontSize:'0.84rem', fontWeight:800, color:'var(--text-primary)', maxWidth:65,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={12} color="var(--text-muted)" />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:8, scale:0.95 }}
                  style={{ position:'absolute', right:0, top:'calc(100% + 8px)', width:210,
                    background:'#fff', border:'2px solid rgba(255,107,43,0.18)', borderRadius:16,
                    boxShadow:'0 16px 50px rgba(255,107,43,0.13)', zIndex:1001, overflow:'hidden' }}>
                  <div style={{ padding:'14px 14px 10px', background:'linear-gradient(135deg,#FFF3E0,#FCE4EC)' }}>
                    <div style={{ fontWeight:900, fontSize:'0.95rem' }}>{user?.name}</div>
                    <div style={{ color:'var(--text-muted)', fontSize:'0.76rem', marginTop:1 }}>{user?.email}</div>
                  </div>
                  {[
                    { to:`/profile/${user?._id}`, emoji:'👤', label:'My Profile' },
                    { to:'/settings', emoji:'⚙️', label:'Settings' },
                  ].map(({ to, emoji, label }) => (
                    <Link key={to} to={to} onClick={() => setShowProfile(false)}
                      style={{ display:'flex', alignItems:'center', gap:9, padding:'11px 14px',
                        color:'var(--text-secondary)', textDecoration:'none', fontSize:'0.88rem',
                        fontWeight:700, transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#FFF3E0'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <span>{emoji}</span>{label}
                    </Link>
                  ))}
                  <button onClick={() => { setShowProfile(false); logout(); navigate('/'); }}
                    style={{ display:'flex', alignItems:'center', gap:9, padding:'11px 14px',
                      color:'#FF3B5C', background:'none', border:'none',
                      borderTop:'1.5px solid rgba(255,107,43,0.12)',
                      width:'100%', fontSize:'0.88rem', cursor:'pointer',
                      fontFamily:'Nunito,sans-serif', fontWeight:800 }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:1024px){.desktop-nav{display:none!important}}
      `}</style>
    </nav>
  );
}
