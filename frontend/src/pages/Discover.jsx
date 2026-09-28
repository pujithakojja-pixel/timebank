import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import { X, Heart, Bookmark, Zap, RefreshCw, MapPin, Star, Clock } from 'lucide-react';
import { skillsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CharacterBubble, CHARACTERS } from '../components/ui/CartoonFloat';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','Technology','Languages','Music','Arts & Crafts','Sports & Fitness','Cooking','Education','Design'];
const CAT_COLORS = { Technology:'#3A7BFF', Languages:'#FF6B2B', Music:'#9B59FF', 'Arts & Crafts':'#FF4FA3', 'Sports & Fitness':'#00BFFF', Cooking:'#FF9800', Education:'#2ECC71', Design:'#FF6F61', Other:'#888' };
const CAT_BG = { Technology:'#E3F2FD', Languages:'#FFF3E0', Music:'#F3E5F5', 'Arts & Crafts':'#FCE4EC', 'Sports & Fitness':'#E1F5FE', Cooking:'#FFF3E0', Education:'#E8F5E9', Design:'#FBE9E7', Other:'#F5F5F5' };

function SwipeCard({ card, onPass, onSave, onConnect, isTop, isSecond }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200,200], [-22,22]);
  const likeOp = useTransform(x, [20,100], [0,1]);
  const passOp = useTransform(x, [-100,-20], [1,0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) animate(x, 500, { duration:0.3 }).then(onConnect);
    else if (info.offset.x < -100) animate(x, -500, { duration:0.3 }).then(onPass);
  };

  const u = card.user;
  if (!u) return null;
  const color = CAT_COLORS[card.skill?.category] || '#FF6B2B';
  const bg = CAT_BG[card.skill?.category] || '#FFF3E0';
  const charIdx = Object.keys(CAT_COLORS).indexOf(card.skill?.category) % CHARACTERS.length;

  return (
    <motion.div style={{
      position:'absolute', width:'100%', maxWidth:400,
      x, rotate, zIndex:isTop?10:isSecond?9:8,
      top:isTop?0:isSecond?10:20,
      scale:isTop?1:isSecond?0.96:0.92,
      touchAction:'none', cursor:isTop?'grab':'default'
    }}
      drag={isTop?'x':false}
      dragConstraints={{ left:0, right:0 }}
      dragElastic={0.65}
      onDragEnd={isTop?handleDragEnd:undefined}
      whileDrag={{ cursor:'grabbing' }}>

      {isTop && (
        <>
          <motion.div style={{ position:'absolute', top:20, left:20, zIndex:20, background:'rgba(46,204,113,0.95)',
            borderRadius:12, padding:'8px 14px', fontWeight:900, fontSize:'1rem', color:'#fff',
            border:'2.5px solid rgba(46,204,113,0.5)', transform:'rotate(-10deg)', opacity:likeOp }}>
            CONNECT ✓
          </motion.div>
          <motion.div style={{ position:'absolute', top:20, right:20, zIndex:20, background:'rgba(255,59,92,0.95)',
            borderRadius:12, padding:'8px 14px', fontWeight:900, fontSize:'1rem', color:'#fff',
            border:'2.5px solid rgba(255,59,92,0.5)', transform:'rotate(10deg)', opacity:passOp }}>
            PASS ✗
          </motion.div>
        </>
      )}

      <div style={{ background:'#fff', borderRadius:24, overflow:'hidden',
        boxShadow:isTop?'0 20px 60px rgba(0,0,0,0.15)':'0 10px 30px rgba(0,0,0,0.08)',
        border:`2.5px solid ${color}30`, userSelect:'none' }}>
        {/* Card header */}
        <div style={{ height:190, position:'relative', background:`linear-gradient(135deg,${bg},${color}20)`,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.9) 100%)` }} />
          <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
            <CharacterBubble {...CHARACTERS[charIdx % CHARACTERS.length]} size={70}
              style={{ marginBottom:6, display:'inline-flex' }} />
            <div style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'1.35rem', fontWeight:900, color }}>
              {card.skill?.icon} {card.skill?.name}
            </div>
            <span style={{ background:`${color}20`, border:`1.5px solid ${color}40`,
              borderRadius:20, padding:'3px 12px', fontSize:'0.76rem', color, fontWeight:800 }}>
              {card.skill?.category}
            </span>
          </div>
          {/* Avatar */}
          <div style={{ position:'absolute', top:12, right:12, zIndex:2 }}>
            {u.avatar ? (
              <img src={u.avatar} style={{ width:46, height:46, borderRadius:'50%', border:'3px solid #fff',
                boxShadow:'0 2px 10px rgba(0,0,0,0.1)' }} alt={u.name} />
            ) : (
              <div style={{ width:46, height:46, borderRadius:'50%', background:`linear-gradient(135deg,${color},${color}99)`,
                border:'3px solid #fff', display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:900, color:'#fff' }}>{u.name?.[0]}</div>
            )}
            {u.isOnline && <div className="online-dot" style={{ position:'absolute', bottom:2, right:2 }} />}
          </div>
          {card.isRemote && (
            <div style={{ position:'absolute', top:12, left:12, background:'rgba(58,123,255,0.9)',
              borderRadius:20, padding:'3px 10px', fontSize:'0.7rem', color:'#fff', fontWeight:800 }}>
              🌐 Remote
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding:'18px 22px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
            <div>
              <div style={{ fontWeight:900, fontSize:'1.05rem', color:'var(--text-primary)' }}>{u.name}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.78rem', fontWeight:700, display:'flex', alignItems:'center', gap:3, marginTop:2 }}>
                <MapPin size={11}/> {card.distanceKm ? `${card.distanceKm}km away` : u.location?.city||'Nearby'}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, background:'#FFFDE7',
              borderRadius:20, padding:'4px 10px', border:'1.5px solid rgba(255,215,0,0.4)' }}>
              <Star size={12} fill="#FFD700" color="#FFD700" />
              <span style={{ fontSize:'0.8rem', fontWeight:800, color:'#E65100' }}>{u.trustScore||0}%</span>
            </div>
          </div>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.83rem', lineHeight:1.55, marginBottom:12, fontWeight:600 }}>
            {card.description?.slice(0,100)}{card.description?.length>100?'...':''}
          </p>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase',
              letterSpacing:'0.08em', marginBottom:6 }}>Looking for in return</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {card.lookingFor?.map(s=>(
                <span key={s._id} className="badge badge-blue" style={{ fontSize:'0.72rem' }}>{s.name}</span>
              ))}
              {!card.lookingFor?.length && <span style={{ color:'var(--text-muted)', fontSize:'0.78rem', fontWeight:600 }}>Open to exchange</span>}
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text-muted)', fontSize:'0.76rem', fontWeight:700 }}>
              <Clock size={11}/> {card.minHours||1}-{card.maxHours||3}h sessions
            </div>
            <div style={{ fontSize:'0.76rem', color:'var(--text-secondary)', fontWeight:700 }}>
              {u.completedTrades||0} trades done
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const load = async (reset=false) => {
    setLoading(true);
    try {
      const { data } = await skillsAPI.getDiscover({
        lat: user?.location?.coordinates?.[1],
        lng: user?.location?.coordinates?.[0],
        radius:30,
        category: category!=='all'?category:undefined,
        page: reset?1:page, limit:10
      });
      if (reset) { setCards(data.cards||[]); setPage(2); }
      else { setCards(p=>[...p,...(data.cards||[])]); setPage(p=>p+1); }
    } catch {}
    setLoading(false);
  };

  useEffect(()=>{ load(true); }, [category]);

  const handlePass    = () => { setCards(p=>p.slice(1)); if(cards.length<=2) load(); };
  const handleSave    = () => { toast('💾 Saved!'); setCards(p=>p.slice(1)); if(cards.length<=2) load(); };
  const handleConnect = () => {
    const top = cards[0];
    if (top?.user) { toast.success(`🤝 Connecting with ${top.user.name}!`); navigate('/trades',{state:{initiateWith:top.user}}); }
    setCards(p=>p.slice(1));
  };

  return (
    <div className="page-container" style={{ maxWidth:520, margin:'0 auto' }}>
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <h1 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.65rem' }}>
            🧭 <span className="gradient-text">Discover Skills</span>
          </h1>
          <button onClick={()=>load(true)} className="btn btn-ghost btn-sm" disabled={loading}>
            <RefreshCw size={15} className={loading?'spin':''}/>
          </button>
        </div>
        <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:700 }}>
          Swipe right to connect · Left to pass · 💾 to save
        </p>
      </motion.div>

      {/* Category filter */}
      <div style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:4, marginBottom:24 }}>
        {CATEGORIES.map(cat=>(
          <button key={cat} onClick={()=>setCategory(cat)} style={{
            padding:'6px 15px', borderRadius:50, fontSize:'0.8rem', fontWeight:800, cursor:'pointer',
            fontFamily:'Nunito,sans-serif', whiteSpace:'nowrap', transition:'all 0.18s',
            background:category===cat?`linear-gradient(135deg,#FF6B2B,#FF4FA3)`:'rgba(255,107,43,0.07)',
            border:`2px solid ${category===cat?'transparent':'rgba(255,107,43,0.2)'}`,
            color:category===cat?'#fff':'var(--text-secondary)',
            boxShadow:category===cat?'0 3px 12px rgba(255,107,43,0.35)':'none'
          }}>
            {cat==='all'?'✨ All':cat}
          </button>
        ))}
      </div>

      {/* Card stack */}
      <div style={{ position:'relative', height:510, marginBottom:30 }}>
        {loading && cards.length===0 ? (
          <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center',
            flexDirection:'column', gap:16, background:'rgba(255,255,255,0.8)', borderRadius:24,
            border:'2.5px solid rgba(255,107,43,0.18)' }}>
            <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }}
              style={{ width:40, height:40, borderRadius:'50%',
                border:'4px solid rgba(255,107,43,0.2)', borderTopColor:'#FF6B2B' }}/>
            <span style={{ color:'var(--text-muted)', fontWeight:800 }}>Finding skills near you...</span>
          </div>
        ) : cards.length===0 ? (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center',
              flexDirection:'column', gap:14, background:'rgba(255,255,255,0.8)', borderRadius:24,
              border:'2.5px solid rgba(255,107,43,0.18)', padding:36, textAlign:'center' }}>
            <div style={{ fontSize:'4rem' }}>🎯</div>
            <h3 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.3rem' }}>You've seen them all!</h3>
            <p style={{ color:'var(--text-muted)', fontWeight:600, fontSize:'0.9rem' }}>
              Check back later or try a different category.
            </p>
            <button onClick={()=>load(true)} className="btn btn-primary"><RefreshCw size={15}/> Refresh</button>
          </motion.div>
        ) : (
          <>
            {cards[2] && <SwipeCard card={cards[2]} onPass={()=>{}} onSave={()=>{}} onConnect={()=>{}} isTop={false} isSecond={false}/>}
            {cards[1] && <SwipeCard card={cards[1]} onPass={()=>{}} onSave={()=>{}} onConnect={()=>{}} isTop={false} isSecond={true}/>}
            {cards[0] && <SwipeCard card={cards[0]} onPass={handlePass} onSave={handleSave} onConnect={handleConnect} isTop={true} isSecond={false}/>}
          </>
        )}
      </div>

      {/* Action buttons */}
      {cards.length > 0 && (
        <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
          style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:18 }}>
          <motion.button onClick={handlePass} whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
            style={{ width:58, height:58, borderRadius:'50%', background:'#FCE4EC',
              border:'2.5px solid rgba(255,59,92,0.4)', display:'flex', alignItems:'center',
              justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 16px rgba(255,59,92,0.2)' }}>
            <X size={24} color="#FF3B5C"/>
          </motion.button>
          <motion.button onClick={handleSave} whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
            style={{ width:50, height:50, borderRadius:'50%', background:'#FFFDE7',
              border:'2.5px solid rgba(255,215,0,0.5)', display:'flex', alignItems:'center',
              justifyContent:'center', cursor:'pointer' }}>
            <Bookmark size={20} color="#FFD700"/>
          </motion.button>
          <motion.button onClick={handleConnect} whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
            style={{ width:70, height:70, borderRadius:'50%',
              background:'linear-gradient(135deg,#2ECC71,#00E5A0)', border:'none',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              boxShadow:'0 6px 24px rgba(46,204,113,0.4)', fontSize:'1.5rem' }}>
            🤝
          </motion.button>
        </motion.div>
      )}
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
