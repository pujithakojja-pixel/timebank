import React from 'react';
import { motion } from 'framer-motion';

export const CHARACTERS = [
  { id:'doraemon', emoji:'🤖', name:'Doraemon',     color:'#00BFFF', bg:'#E3F2FD', tagline:'Gadget Master!' },
  { id:'shinchan', emoji:'😄', name:'Shin Chan',    color:'#FF6B2B', bg:'#FFF3E0', tagline:'Action Mask!' },
  { id:'ninja',    emoji:'🥷', name:'Ninja Hattori',color:'#2ECC71', bg:'#E8F5E9', tagline:'Stealth Skills!' },
  { id:'dora',     emoji:'🌟', name:'Dora Bujji',   color:'#FF4FA3', bg:'#FCE4EC', tagline:'Explorer!' },
  { id:'jackie',   emoji:'🥋', name:'Jackie Chan',  color:'#9B59FF', bg:'#F3E5F5', tagline:'Kung Fu Pro!' },
  { id:'kitty',    emoji:'🐱', name:'Hello Kitty',  color:'#FF4FA3', bg:'#FCE4EC', tagline:'Kawaii!' },
  { id:'pikachu',  emoji:'⚡', name:'Pikachu',       color:'#FFD700', bg:'#FFFDE7', tagline:'Pika Pika!' },
  { id:'bheem',    emoji:'🦸', name:'Chhota Bheem', color:'#FF6B2B', bg:'#FFF3E0', tagline:'Super Strong!' },
];

export function CharacterBubble({ emoji, name, color, bg, tagline, size=60, style={}, delay=0, showLabel=false, onClick }) {
  return (
    <motion.div onClick={onClick}
      initial={{ scale:0, opacity:0 }}
      animate={{ scale:1, opacity:1 }}
      transition={{ type:'spring', stiffness:280, damping:18, delay }}
      whileHover={{ scale:1.2, rotate:[0,-8,8,0] }}
      whileTap={{ scale:0.9 }}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:onClick?'pointer':'default', ...style }}>
      <motion.div
        animate={{ y:[0,-10,0], rotate:[0,4,-4,0] }}
        transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut', delay }}
        style={{ width:size, height:size, borderRadius:'50%', background:bg,
          border:`3px solid ${color}`, boxShadow:`0 6px 20px ${color}45, 0 0 0 5px ${color}18`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:size*0.46, position:'relative' }}>
        {emoji}
        <motion.span animate={{ opacity:[0,1,0], scale:[0.5,1.3,0.5] }}
          transition={{ duration:2.2, repeat:Infinity, delay:delay+0.6 }}
          style={{ position:'absolute', top:-6, right:-4, fontSize:Math.max(11,size*0.2) }}>✨</motion.span>
      </motion.div>
      {showLabel && (
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'0.7rem', fontWeight:800, color, whiteSpace:'nowrap' }}>{name}</div>
          {tagline && <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:1 }}>{tagline}</div>}
        </div>
      )}
    </motion.div>
  );
}

export function CharacterRow({ count=5, size=48, style={} }) {
  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', ...style }}>
      {CHARACTERS.slice(0,count).map((c,i) => (
        <CharacterBubble key={c.id} {...c} size={size} delay={i*0.1} />
      ))}
    </div>
  );
}

export function CharacterStrip({ style={} }) {
  return (
    <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', padding:'16px 0', ...style }}>
      {CHARACTERS.map((c,i) => (
        <CharacterBubble key={c.id} {...c} size={58} delay={i*0.08} showLabel />
      ))}
    </div>
  );
}

export function MascotSpeech({ charIndex=0, message, style={} }) {
  const c = CHARACTERS[charIndex];
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:12, ...style }}>
      <CharacterBubble {...c} size={52} />
      <motion.div initial={{ opacity:0, scale:0.8, x:-10 }} animate={{ opacity:1, scale:1, x:0 }}
        transition={{ delay:0.4, type:'spring', stiffness:260 }}
        style={{ background:'#fff', border:`2px solid ${c.color}`, borderRadius:'16px 16px 16px 4px',
          padding:'10px 14px', fontSize:'0.86rem', fontWeight:700, color:'var(--text-primary)',
          maxWidth:220, boxShadow:`0 4px 14px ${c.color}28` }}>
        {message}
      </motion.div>
    </div>
  );
}

export function FloatingDecorations({ page='default' }) {
  const configs = {
    landing:   [
      { charIdx:0, style:{ position:'fixed', top:88, right:20, zIndex:50 },  size:68, delay:0.3 },
      { charIdx:1, style:{ position:'fixed', top:190, left:14, zIndex:50 },  size:54, delay:0.6 },
      { charIdx:4, style:{ position:'fixed', bottom:110, right:16, zIndex:50 }, size:60, delay:0.9 },
    ],
    dashboard: [
      { charIdx:2, style:{ position:'fixed', top:96, right:16, zIndex:40 },  size:54, delay:0.2 },
      { charIdx:3, style:{ position:'fixed', bottom:96, left:12, zIndex:40 }, size:50, delay:0.5 },
    ],
    default: [
      { charIdx:0, style:{ position:'fixed', top:88, right:14, zIndex:40 }, size:50, delay:0.3 },
    ],
  };
  const list = configs[page] || configs.default;
  return (
    <>
      {list.map((item,i) => (
        <CharacterBubble key={i} {...CHARACTERS[item.charIdx]}
          style={item.style} size={item.size} delay={item.delay} />
      ))}
    </>
  );
}

export default CharacterBubble;
