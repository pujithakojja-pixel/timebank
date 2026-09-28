import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, MapPin, Zap, ArrowRight, X, Check, Info } from 'lucide-react';
import { matchesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { CharacterBubble, CHARACTERS } from '../components/ui/CartoonFloat';
import toast from 'react-hot-toast';

function CircularViz({ chain }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2, r=Math.min(W,H)*0.32;
    const n=chain.length;
    const colors=['#FF6B2B','#3A7BFF','#2ECC71','#FF4FA3'];
    let frame=0, raf;
    const pos=(i)=>({ x:cx+r*Math.cos((2*Math.PI*i/n)-Math.PI/2), y:cy+r*Math.sin((2*Math.PI*i/n)-Math.PI/2) });
    const draw=()=>{
      ctx.clearRect(0,0,W,H); frame++;
      for(let i=0;i<n;i++){
        const from=pos(i), to=pos((i+1)%n);
        ctx.beginPath(); ctx.moveTo(from.x,from.y); ctx.lineTo(to.x,to.y);
        ctx.strokeStyle=colors[i%colors.length]+'50'; ctx.lineWidth=2; ctx.stroke();
        const t=((frame*0.012+i*0.33)%1);
        const px=from.x+(to.x-from.x)*t, py=from.y+(to.y-from.y)*t;
        ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fillStyle=colors[i%colors.length]; ctx.fill();
      }
      chain.forEach((node,i)=>{
        const p=pos(i); const pulse=1+0.07*Math.sin(frame*0.06+i);
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,26*pulse);
        g.addColorStop(0,colors[i%colors.length]+'50'); g.addColorStop(1,'transparent');
        ctx.beginPath(); ctx.arc(p.x,p.y,26*pulse,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,20,0,Math.PI*2);
        ctx.fillStyle='#fff'; ctx.fill();
        ctx.strokeStyle=colors[i%colors.length]; ctx.lineWidth=2.5; ctx.stroke();
        ctx.fillStyle='var(--text-primary)'; ctx.font='bold 10px Nunito,sans-serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle=colors[i%colors.length];
        ctx.fillText((node.user?.name||'?').slice(0,4), p.x, p.y);
        ctx.fillStyle='#333'; ctx.font='bold 9px Nunito,sans-serif';
        ctx.fillText(node.offersSkillName?.slice(0,6)||'?', p.x, p.y+(p.y>cy?34:-34));
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[chain]);
  return <canvas ref={canvasRef} width={260} height={260} style={{ display:'block', margin:'0 auto' }}/>;
}

function DirectCard({ match, onDismiss, onConnect }) {
  const other = match.matchedUser;
  if (!other) return null;
  const navigate = useNavigate();
  const getInitials = n => n?.split(' ').map(x=>x[0]).join('').toUpperCase()||'?';
  const score = match.score || 0;
  const scoreColor = score>=80?'#2ECC71':score>=60?'#FF9800':'#FF6B2B';

  return (
    <motion.div layout initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.85, x:-40 }}
      whileHover={{ y:-3 }}
      style={{ background:'#fff', borderRadius:20, padding:20, border:'2px solid rgba(255,107,43,0.18)',
        cursor:'pointer', boxShadow:'0 5px 20px rgba(255,107,43,0.08)' }}
      onClick={()=>navigate(`/profile/${other._id}`)}>
      <div style={{ display:'flex', gap:12, marginBottom:12 }}>
        {other.avatar?(
          <img src={other.avatar} style={{ width:52, height:52, borderRadius:'50%', flexShrink:0,
            border:'2.5px solid rgba(255,107,43,0.3)' }} alt={other.name}/>
        ):(
          <div style={{ width:52, height:52, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'1.1rem', color:'#fff' }}>
            {getInitials(other.name)}
          </div>
        )}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontWeight:900, fontSize:'0.97rem' }}>{other.name}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.76rem', fontWeight:700,
                display:'flex', alignItems:'center', gap:3, marginTop:2 }}>
                <MapPin size={10}/> {other.location?.city||'Nearby'}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, background:`${scoreColor}15`,
              borderRadius:20, padding:'4px 10px', border:`1.5px solid ${scoreColor}40`, flexShrink:0 }}>
              <Zap size={11} color={scoreColor}/>
              <span style={{ fontSize:'0.8rem', fontWeight:900, color:scoreColor }}>{score}%</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:5, marginTop:7, flexWrap:'wrap' }}>
            {match.offersYou?.map(s=>(
              <span key={s._id} className="badge badge-green" style={{ fontSize:'0.7rem' }}>Offers: {s.name}</span>
            ))}
            {match.needsFromYou?.map(s=>(
              <span key={s._id} className="badge badge-orange" style={{ fontSize:'0.7rem' }}>Needs: {s.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
        {match.reasons?.map((r,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:4,
            color:'var(--text-secondary)', fontSize:'0.76rem', fontWeight:700 }}>
            <Info size={10} color="#FF6B2B"/> {r}
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={e=>{e.stopPropagation();onDismiss();}}
          style={{ flex:1, padding:'8px', borderRadius:50, background:'#FCE4EC',
            border:'1.5px solid rgba(255,59,92,0.3)', color:'#FF3B5C', cursor:'pointer',
            fontFamily:'Nunito,sans-serif', fontSize:'0.83rem', fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          <X size={13}/> Pass
        </button>
        <button onClick={e=>{e.stopPropagation();onConnect();}}
          style={{ flex:2, padding:'8px', borderRadius:50,
            background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)', border:'none',
            color:'#fff', cursor:'pointer', fontFamily:'Nunito,sans-serif',
            fontSize:'0.83rem', fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center', gap:5,
            boxShadow:'0 3px 12px rgba(255,107,43,0.3)' }}>
          <Check size={13}/> Connect
        </button>
      </div>
    </motion.div>
  );
}

export default function Matches() {
  const navigate = useNavigate();
  const [data, setData] = useState({ direct:[], circular:[] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('direct');
  const [dismissed, setDismissed] = useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const { data: d } = await matchesAPI.getMatches({ radiusKm:20 });
      setData({ direct:d.matches?.direct||[], circular:d.matches?.circular||[] });
    } catch { toast.error('Failed to load matches'); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const visible = data.direct.filter(m=>!dismissed.has(m.matchedUser?._id));

  const TABS = [
    { id:'direct',   label:'Direct Matches', icon:'⚡', count:visible.length },
    { id:'circular', label:'Circular Trades', icon:'🔄', count:data.circular.length },
  ];

  return (
    <div className="page-container" style={{ maxWidth:880, margin:'0 auto' }}>
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <div>
            <h1 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.65rem' }}>
              ⚡ <span className="gradient-text">Smart Matches</span>
            </h1>
            <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:700, marginTop:3 }}>
              AI-powered matches based on your skills, location & availability
            </p>
          </div>
          <button onClick={load} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading?'spin':''}/> Refresh
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'rgba(255,107,43,0.06)', borderRadius:50,
        padding:4, marginBottom:24, border:'2px solid rgba(255,107,43,0.15)', width:'fit-content' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:'8px 20px', borderRadius:50, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background:tab===t.id?'linear-gradient(135deg,#FF6B2B,#FF4FA3)':'transparent',
              border:'none', color:tab===t.id?'#fff':'var(--text-muted)',
              fontWeight:800, fontSize:'0.87rem',
              display:'flex', alignItems:'center', gap:7, transition:'all 0.2s',
              boxShadow:tab===t.id?'0 3px 12px rgba(255,107,43,0.3)':'none' }}>
            {t.icon} {t.label}
            <span style={{ background:tab===t.id?'rgba(255,255,255,0.25)':'rgba(255,107,43,0.15)',
              borderRadius:20, padding:'1px 8px', fontSize:'0.74rem', fontWeight:900 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
          {[...Array(4)].map((_,i)=><div key={i} className="skeleton" style={{ height:200, borderRadius:18 }}/>)}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {tab==='direct' && (
            <motion.div key="direct" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              {visible.length===0 ? (
                <div style={{ padding:52, textAlign:'center', background:'#fff',
                  borderRadius:22, border:'2px solid rgba(255,107,43,0.15)', boxShadow:'0 4px 18px rgba(255,107,43,0.07)' }}>
                  <CharacterBubble {...CHARACTERS[0]} size={80} style={{ margin:'0 auto 16px' }}/>
                  <h3 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.25rem', marginBottom:8 }}>
                    No matches yet!
                  </h3>
                  <p style={{ color:'var(--text-muted)', marginBottom:20, fontWeight:600, fontSize:'0.9rem' }}>
                    Add more skills to your profile to get matched!
                  </p>
                  <button onClick={()=>navigate('/settings')} className="btn btn-primary">
                    ⚙️ Update My Skills
                  </button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
                  <AnimatePresence>
                    {visible.map((m,i)=>(
                      <DirectCard key={m.matchedUser?._id||i} match={m}
                        onDismiss={()=>setDismissed(p=>new Set([...p,m.matchedUser?._id]))}
                        onConnect={()=>navigate('/trades',{state:{initiateWith:m.matchedUser}})}/>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {tab==='circular' && (
            <motion.div key="circular" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              {data.circular.length===0 ? (
                <div style={{ padding:52, textAlign:'center', background:'#fff',
                  borderRadius:22, border:'2px solid rgba(58,123,255,0.15)' }}>
                  <CharacterBubble {...CHARACTERS[2]} size={80} style={{ margin:'0 auto 16px' }}/>
                  <h3 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.25rem', marginBottom:8 }}>
                    No circular trades yet!
                  </h3>
                  <p style={{ color:'var(--text-muted)', marginBottom:20, fontWeight:600, fontSize:'0.9rem' }}>
                    Circular trades need 3+ people with complementary skills.
                  </p>
                  <button onClick={load} className="btn btn-blue">🔄 Search Again</button>
                </div>
              ) : data.circular.map((match,i)=>(
                <motion.div key={i} initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.1 }} style={{ background:'#fff', borderRadius:22, padding:26,
                    border:'2px solid rgba(58,123,255,0.22)', boxShadow:'0 6px 24px rgba(58,123,255,0.1)',
                    marginBottom:14 }}>
                  <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'flex-start' }}>
                    <span style={{ fontSize:'1.8rem' }}>🔄</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.05rem' }}>
                        3-Way Circular Trade!
                      </div>
                      <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', fontWeight:600, marginTop:3 }}>
                        Everyone exchanges skills — no Time Credits needed! 🎉
                      </div>
                    </div>
                    <div style={{ background:'linear-gradient(135deg,#E8F5E9,#C8E6C9)',
                      border:'1.5px solid rgba(46,204,113,0.4)', borderRadius:20,
                      padding:'4px 12px', fontSize:'0.8rem', fontWeight:900, color:'#2ECC71', flexShrink:0 }}>
                      {match.score}% match
                    </div>
                  </div>

                  {match.circularChain?.length>0 && <CircularViz chain={match.circularChain}/>}

                  <div style={{ display:'flex', flexDirection:'column', gap:8, margin:'16px 0' }}>
                    {match.circularChain?.map((node,j)=>(
                      <div key={j} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                        background:['#FFF3E0','#E3F2FD','#E8F5E9'][j%3],
                        borderRadius:12, border:`1.5px solid ${['rgba(255,107,43,0.2)','rgba(58,123,255,0.2)','rgba(46,204,113,0.2)'][j%3]}` }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
                          background:['linear-gradient(135deg,#FF6B2B,#FF4FA3)','linear-gradient(135deg,#3A7BFF,#00BFFF)','linear-gradient(135deg,#2ECC71,#00E5A0)'][j%3],
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:900, fontSize:'0.75rem', color:'#fff' }}>
                          {(node.user?.name||'?').slice(0,2)}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:800, fontSize:'0.85rem' }}>{node.user?.name?.split(' ')[0]||'User'}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', fontWeight:600 }}>
                            Gives: <span style={{ color:'#2ECC71', fontWeight:800 }}>{node.offersSkillName}</span>
                            {' → '}
                            Gets: <span style={{ color:'#FF4FA3', fontWeight:800 }}>{node.needsSkillName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <button onClick={()=>navigate('/trades')} className="btn btn-blue btn-sm">
                      🚀 Start This Trade <ArrowRight size={14}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
