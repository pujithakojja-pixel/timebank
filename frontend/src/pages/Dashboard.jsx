import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { walletAPI, tradesAPI } from '../services/api';
import { CharacterBubble, MascotSpeech, CHARACTERS } from '../components/ui/CartoonFloat';
import { formatDistanceToNow } from 'date-fns';

function AnimCount({ value }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let cur = 0; const step = value / 50;
    const t = setInterval(() => { cur += step; if (cur >= value) { setN(value); clearInterval(t); } else setN(Math.floor(cur)); }, 25);
    return () => clearInterval(t);
  }, [value]);
  return <>{n}</>;
}

const STATUS_COLORS = {
  requested:  { label:'Requested',  color:'#FF9800', bg:'#FFF3E0' },
  negotiating:{ label:'Negotiating',color:'#FF6B2B', bg:'#FBE9E7' },
  accepted:   { label:'Accepted',   color:'#3A7BFF', bg:'#E3F2FD' },
  scheduled:  { label:'Scheduled',  color:'#9B59FF', bg:'#F3E5F5' },
  in_progress:{ label:'In Progress',color:'#00BFFF', bg:'#E1F5FE' },
  completed:  { label:'Completed',  color:'#2ECC71', bg:'#E8F5E9' },
  vouched:    { label:'Vouched',    color:'#FFD700', bg:'#FFFDE7' },
  cancelled:  { label:'Cancelled',  color:'#FF3B5C', bg:'#FCE4EC' },
  rejected:   { label:'Rejected',   color:'#FF3B5C', bg:'#FCE4EC' },
};

const QUICK = [
  { label:'Find Nearby',   emoji:'📍', to:'/explore',  ...({ bg:'#FFF3E0', border:'rgba(255,107,43,0.3)', color:'#E65100' }) },
  { label:'Discover',      emoji:'🧭', to:'/discover', ...({ bg:'#FCE4EC', border:'rgba(255,79,163,0.3)', color:'#880E4F' }) },
  { label:'My Matches',    emoji:'⚡', to:'/matches',  ...({ bg:'#E3F2FD', border:'rgba(58,123,255,0.3)', color:'#1565C0' }) },
  { label:'My Wallet',     emoji:'💰', to:'/wallet',   ...({ bg:'#E8F5E9', border:'rgba(46,204,113,0.3)', color:'#1B5E20' }) },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [trades, setTrades] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const mascotIdx = hour < 12 ? 0 : hour < 18 ? 1 : 4;

  useEffect(() => {
    Promise.all([walletAPI.getWallet(), tradesAPI.getAll({ limit:5 }), walletAPI.getTransactions({ limit:5 })])
      .then(([w, t, tx]) => {
        setWallet(w.data.wallet);
        setTrades(t.data.trades || []);
        setTransactions(tx.data.transactions || []);
      }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase() || '?';

  if (loading) return (
    <div className="page-container">
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height:100, borderRadius:18 }} />)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20 }}>
        <div className="skeleton" style={{ height:320, borderRadius:20 }} />
        <div className="skeleton" style={{ height:320, borderRadius:20 }} />
      </div>
    </div>
  );

  const activeTrades = trades.filter(t => ['accepted','scheduled','in_progress'].includes(t.status));
  const pendingTrades = trades.filter(t => t.status === 'requested');

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
            <MascotSpeech charIndex={mascotIdx}
              message={`${greeting}! Ready to trade today? 🎉`}
              style={{}} />
          </div>
          <Link to="/trades" className="btn btn-primary" style={{ gap:8 }}>
            <Plus size={15} /> New Trade
          </Link>
        </div>
        <h1 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)',
          marginTop:14 }}>
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
        </h1>
        {user?.location?.displayName && (
          <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', marginTop:4, fontWeight:700 }}>
            📍 {user.location.displayName}
          </p>
        )}
      </motion.div>

      {/* Wallet + Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:18, marginBottom:22 }}>
        {/* Wallet card */}
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
          onClick={() => navigate('/wallet')}
          whileHover={{ scale:1.02, boxShadow:'0 12px 36px rgba(255,107,43,0.2)' }}
          style={{ background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)', borderRadius:22,
            padding:'24px 26px', cursor:'pointer', position:'relative', overflow:'hidden',
            minWidth:180, boxShadow:'0 8px 28px rgba(255,107,43,0.25)' }}>
          <div style={{ position:'absolute', top:-24, right:-24, width:100, height:100,
            borderRadius:'50%', background:'rgba(255,255,255,0.12)' }} />
          <div style={{ position:'absolute', bottom:-16, left:-10, width:72, height:72,
            borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
          <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ duration:3, repeat:Infinity }}
            style={{ fontSize:'2rem', marginBottom:10, position:'relative', zIndex:1 }}>⏰</motion.div>
          <div style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.78rem', fontWeight:800,
            marginBottom:4, position:'relative', zIndex:1 }}>Time Credits</div>
          <div style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'3rem', fontWeight:900, color:'#fff',
            lineHeight:1, position:'relative', zIndex:1 }}>
            <AnimCount value={wallet?.balance || user?.timeCredits || 0} />
          </div>
          <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.82rem', marginTop:4,
            position:'relative', zIndex:1 }}>
            +{wallet?.totalEarned||0} earned · -{wallet?.totalSpent||0} spent
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid-4">
          {[
            { emoji:'🤝', label:'Completed', value:user?.completedTrades||0, color:'#FF6B2B', bg:'#FFF3E0' },
            { emoji:'⏰', label:'Hrs Exchanged', value:user?.hoursExchanged||0, color:'#3A7BFF', bg:'#E3F2FD' },
            { emoji:'🔄', label:'Active Trades', value:activeTrades.length, color:'#2ECC71', bg:'#E8F5E9' },
            { emoji:'📬', label:'Pending', value:pendingTrades.length, color:'#FF4FA3', bg:'#FCE4EC' },
          ].map((s,i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.1+i*0.07 }} whileHover={{ y:-3 }}
              style={{ padding:'18px 16px', borderRadius:18, background:s.bg,
                border:`2px solid ${s.color}28`, cursor:'pointer', textAlign:'center',
                boxShadow:`0 4px 16px ${s.color}14` }}
              onClick={() => navigate('/trades')}>
              <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ duration:3.5, repeat:Infinity, delay:i*0.4 }}
                style={{ fontSize:'1.8rem', marginBottom:8 }}>{s.emoji}</motion.div>
              <div style={{ fontSize:'1.7rem', fontWeight:900, color:s.color, fontFamily:'Baloo 2,sans-serif' }}>
                <AnimCount value={s.value} />
              </div>
              <div style={{ color:'var(--text-secondary)', fontSize:'0.76rem', fontWeight:700, marginTop:3 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} style={{ marginBottom:22 }}>
        <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.1rem', marginBottom:14, color:'var(--text-primary)' }}>
          ✨ Quick Actions
        </h2>
        <div className="grid-4">
          {QUICK.map((q,i) => (
            <motion.div key={i} whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.97 }}>
              <Link to={q.to} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                padding:'18px 14px', borderRadius:18, textDecoration:'none',
                background:q.bg, border:`2px solid ${q.border}`, textAlign:'center',
                boxShadow:'0 3px 12px rgba(255,107,43,0.08)', transition:'all 0.2s' }}>
                <motion.span animate={{ y:[0,-6,0] }} transition={{ duration:2.5, repeat:Infinity, delay:i*0.3 }}
                  style={{ fontSize:'2rem' }}>{q.emoji}</motion.span>
                <div style={{ fontWeight:900, fontSize:'0.86rem', color:q.color }}>{q.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Trades + Transactions */}
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20 }}>

        {/* Trades */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.1rem' }}>🤝 My Trades</h2>
            <Link to="/trades" style={{ color:'#FF6B2B', fontSize:'0.82rem', textDecoration:'none', fontWeight:800 }}>
              View all →
            </Link>
          </div>
          {trades.length === 0 ? (
            <div className="glass" style={{ padding:40, textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:10 }}>🤝</div>
              <div style={{ fontWeight:900, marginBottom:6, fontFamily:'Baloo 2,sans-serif', fontSize:'1.1rem' }}>No trades yet!</div>
              <p style={{ color:'var(--text-muted)', fontSize:'0.86rem', marginBottom:16, fontWeight:600 }}>
                Start exchanging skills with your community
              </p>
              <Link to="/discover" className="btn btn-primary btn-sm">🔍 Find Skills</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {trades.map((trade,i) => {
                const isInit = trade.initiator?._id === user?._id;
                const other = isInit ? trade.receiver : trade.initiator;
                const sc = STATUS_COLORS[trade.status] || STATUS_COLORS.requested;
                return (
                  <motion.div key={trade._id} initial={{ opacity:0, x:-18 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay:0.4+i*0.06 }} whileHover={{ x:4 }}
                    onClick={() => navigate(`/trades/${trade._id}`)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px',
                      borderRadius:16, background:'#fff', border:'2px solid rgba(255,140,80,0.15)',
                      cursor:'pointer', boxShadow:'0 3px 12px rgba(255,107,43,0.07)',
                      transition:'all 0.2s' }}>
                    {other?.avatar ? (
                      <img src={other.avatar} style={{ width:42, height:42, borderRadius:'50%', flexShrink:0 }} alt="" />
                    ) : (
                      <div style={{ width:42, height:42, borderRadius:'50%', flexShrink:0,
                        background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontWeight:900, fontSize:'0.9rem', color:'#fff' }}>
                        {getInitials(other?.name)}
                      </div>
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontWeight:800, fontSize:'0.92rem', color:'var(--text-primary)' }}>
                          {other?.name || 'Unknown'}
                        </span>
                        <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:800,
                          background:sc.bg, color:sc.color }}>
                          {sc.label}
                        </span>
                      </div>
                      <div style={{ color:'var(--text-secondary)', fontSize:'0.78rem', marginTop:3, fontWeight:600 }}>
                        {trade.initiatorOffer?.skillName} ↔ {trade.receiverOffer?.skillName || '?'}
                      </div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Transactions */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.1rem' }}>💰 Transactions</h2>
            <Link to="/wallet" style={{ color:'#FF6B2B', fontSize:'0.82rem', textDecoration:'none', fontWeight:800 }}>View all →</Link>
          </div>
          <div style={{ background:'#fff', borderRadius:18, border:'2px solid rgba(255,140,80,0.15)',
            overflow:'hidden', boxShadow:'0 3px 12px rgba(255,107,43,0.07)' }}>
            {transactions.length === 0 ? (
              <div style={{ padding:32, textAlign:'center', color:'var(--text-muted)', fontSize:'0.86rem', fontWeight:700 }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>💳</div>
                No transactions yet
              </div>
            ) : transactions.map((tx,i) => {
              const received = tx.receiver?._id === user?._id || tx.receiver === user?._id;
              return (
                <div key={tx._id||i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                  borderBottom:i<transactions.length-1?'1px solid rgba(255,140,80,0.1)':'none' }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
                    background:received?'#E8F5E9':'#FCE4EC',
                    border:`1.5px solid ${received?'rgba(46,204,113,0.3)':'rgba(255,79,163,0.3)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>
                    {received ? '📥' : '📤'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.83rem', fontWeight:700, overflow:'hidden',
                      textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-primary)' }}>
                      {tx.skillName || tx.description || 'Transaction'}
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600 }}>
                      {tx.createdAt ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix:true }) : ''}
                    </div>
                  </div>
                  <div style={{ fontWeight:900, fontSize:'0.9rem',
                    color:received?'#2ECC71':'#FF4FA3', flexShrink:0 }}>
                    {received?'+':'-'}{tx.amount} TC
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust score */}
          <div style={{ marginTop:16, padding:'16px 18px', borderRadius:18,
            background:'linear-gradient(135deg,#FFFDE7,#FFF9C4)',
            border:'2px solid rgba(255,215,0,0.35)', boxShadow:'0 3px 12px rgba(255,215,0,0.12)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:'1.5rem' }}>⭐</span>
              <div>
                <div style={{ fontWeight:900, fontSize:'0.9rem', color:'var(--text-primary)' }}>Trust Score</div>
                <div style={{ fontSize:'0.74rem', color:'var(--text-muted)', fontWeight:600 }}>Based on your trades & vouches</div>
              </div>
              <div style={{ marginLeft:'auto', fontFamily:'Baloo 2,sans-serif', fontSize:'1.5rem',
                fontWeight:900, color:'#E65100' }}>{user?.trustScore || 0}%</div>
            </div>
            <div style={{ height:8, borderRadius:4, background:'rgba(255,215,0,0.25)' }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${user?.trustScore||0}%` }}
                transition={{ duration:1.5, ease:'easeOut' }}
                style={{ height:'100%', borderRadius:4, background:'linear-gradient(90deg,#FFD700,#FF9800)' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Character row at bottom */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
        style={{ marginTop:28, padding:'20px 24px', borderRadius:20,
          background:'linear-gradient(135deg,#FCE4EC,#F3E5F5,#E3F2FD)',
          border:'2px solid rgba(155,89,255,0.2)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
          <div>
            <h3 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1rem', marginBottom:4 }}>
              🎭 Your Skill Heroes are cheering for you!
            </h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.82rem', fontWeight:600 }}>
              Keep trading to level up your trust badge!
            </p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {CHARACTERS.slice(0,5).map((c,i) => (
              <CharacterBubble key={c.id} {...c} size={44} delay={i*0.08} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
