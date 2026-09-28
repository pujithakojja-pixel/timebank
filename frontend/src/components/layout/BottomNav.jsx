import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const ITEMS = [
  { to:'/dashboard', emoji:'🏠', label:'Home',    color:'#FF6B2B' },
  { to:'/explore',   emoji:'🗺️', label:'Explore', color:'#3A7BFF' },
  { to:'/discover',  emoji:'🧭', label:'Discover',color:'#FF4FA3' },
  { to:'/matches',   emoji:'⚡', label:'Matches', color:'#9B59FF' },
  { to:'/messages',  emoji:'💬', label:'Chat',    color:'#2ECC71' },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav style={{
      position:'fixed', bottom:0, left:0, right:0, height:66,
      background:'rgba(255,248,240,0.97)', backdropFilter:'blur(20px)',
      borderTop:'2px solid rgba(255,107,43,0.15)',
      zIndex:999, padding:'0 6px', display:'none'
    }} className="bottom-nav">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', height:'100%' }}>
        {ITEMS.map(({ to, emoji, label, color }) => {
          const active = location.pathname === to || location.pathname.startsWith(to+'/');
          return (
            <Link key={to} to={to} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              textDecoration:'none', flex:1, padding:'6px 0',
              color: active ? color : 'var(--text-muted)',
              transition:'color 0.2s', position:'relative'
            }}>
              {active && (
                <motion.div layoutId="bnIndicator" style={{
                  position:'absolute', top:2, left:'50%', transform:'translateX(-50%)',
                  width:28, height:3, borderRadius:2, background:color
                }} />
              )}
              <motion.span
                animate={active ? { scale:[1,1.25,1] } : { scale:1 }}
                transition={{ duration:0.3 }}
                style={{ fontSize:active ? '1.3rem' : '1.15rem' }}>
                {emoji}
              </motion.span>
              <span style={{ fontSize:'0.62rem', fontWeight:active?900:600 }}>{label}</span>
            </Link>
          );
        })}
      </div>
      <style>{`@media(max-width:1024px){.bottom-nav{display:block!important}}`}</style>
    </nav>
  );
}
