import React from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS } from './CartoonFloat';

export default function LoadingScreen() {
  return (
    <div style={{
      position:'fixed', inset:0,
      background:'linear-gradient(135deg,#FFF8F0,#FFF0FA,#EFF8FF)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      zIndex:9999, gap:24
    }}>
      {/* Characters bouncing */}
      <div style={{ display:'flex', gap:16, marginBottom:8 }}>
        {CHARACTERS.slice(0,4).map((c,i) => (
          <motion.div key={c.id}
            animate={{ y:[0,-18,0], rotate:[0,8,-8,0] }}
            transition={{ duration:1.2, repeat:Infinity, ease:'easeInOut', delay:i*0.2 }}
            style={{ width:52, height:52, borderRadius:'50%', background:c.bg,
              border:`3px solid ${c.color}`, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:26,
              boxShadow:`0 4px 14px ${c.color}40` }}>
            {c.emoji}
          </motion.div>
        ))}
      </div>

      {/* Logo */}
      <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
        transition={{ duration:0.5 }}
        style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Baloo 2, sans-serif', fontSize:'2rem', fontWeight:900,
          background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:6 }}>
          ⏱ TimeBank
        </div>
        <div style={{ color:'var(--text-muted)', fontSize:'0.9rem', fontWeight:700 }}>
          Loading your community...
        </div>
      </motion.div>

      {/* Dots */}
      <div style={{ display:'flex', gap:8 }}>
        {[0,1,2].map(i => (
          <motion.div key={i}
            animate={{ scale:[0.8,1.3,0.8], opacity:[0.4,1,0.4] }}
            transition={{ duration:1, repeat:Infinity, delay:i*0.2 }}
            style={{ width:10, height:10, borderRadius:'50%',
              background:['#FF6B2B','#FF4FA3','#3A7BFF'][i] }} />
        ))}
      </div>
    </div>
  );
}
