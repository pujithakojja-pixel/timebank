import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { CharacterBubble, CharacterStrip, MascotSpeech, CHARACTERS } from '../components/ui/CartoonFloat';

const FloatingCharacters = lazy(() => import('../components/3d/FloatingCharacters'));

function Counter({ target }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once:true });
  const num = parseInt(String(target).replace(/,/g,''));
  useEffect(() => {
    if (!inView) return;
    let cur = 0; const step = num/60;
    const t = setInterval(() => { cur += step; if(cur >= num){setN(num);clearInterval(t);}else setN(Math.floor(cur)); }, 22);
    return () => clearInterval(t);
  }, [inView, num]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
}

const STATS = [
  { label:'Active Members',   val:'12847', icon:'👥', color:'#FF6B2B', bg:'#FFF3E0' },
  { label:'Skills Exchanged', val:'48291', icon:'🎯', color:'#FF4FA3', bg:'#FCE4EC' },
  { label:'Hours Traded',     val:'89104', icon:'⏰', color:'#3A7BFF', bg:'#E3F2FD' },
  { label:'Cities Active',    val:'234',   icon:'🌍', color:'#2ECC71', bg:'#E8F5E9' },
];
const HOW = [
  { step:'01', icon:'🎯', title:'List Your Skills',  desc:'Share what you know. Add skills, availability, and what you want to learn.', color:'#FF6B2B', charIdx:0 },
  { step:'02', icon:'🤝', title:'Get Matched',        desc:'Smart AI finds perfect skill-swap partners near you instantly!',             color:'#3A7BFF', charIdx:2 },
  { step:'03', icon:'⏰', title:'Trade & Earn',       desc:'1 hour = 1 Time Credit. Exchange, grow, and have fun! 🎉',                  color:'#2ECC71', charIdx:4 },
];
const SKILLS = [
  { name:'Web Dev',      icon:'💻', color:'#3A7BFF', bg:'#E3F2FD', offers:847 },
  { name:'Spanish',      icon:'🇪🇸', color:'#FF6B2B', bg:'#FFF3E0', offers:634 },
  { name:'Guitar',       icon:'🎸', color:'#9B59FF', bg:'#F3E5F5', offers:412 },
  { name:'Yoga',         icon:'🧘', color:'#00BFFF', bg:'#E1F5FE', offers:523 },
  { name:'Photography',  icon:'📷', color:'#FF4FA3', bg:'#FCE4EC', offers:387 },
  { name:'Cooking',      icon:'👨‍🍳', color:'#FF9800', bg:'#FFF3E0', offers:671 },
  { name:'Data Science', icon:'📊', color:'#2ECC71', bg:'#E8F5E9', offers:298 },
  { name:'Coaching',     icon:'🎯', color:'#FF6F61', bg:'#FBE9E7', offers:445 },
];

export default function Landing() {
  const [webGL, setWebGL] = useState(true);
  useEffect(() => {
    try { const c = document.createElement('canvas'); setWebGL(!!(c.getContext('webgl')||c.getContext('experimental-webgl'))); } catch { setWebGL(false); }
  }, []);

  return (
    <div style={{ background:'var(--bg-primary)', overflowX:'hidden' }}>

      {/* HERO */}
      <section style={{ minHeight:'100vh', position:'relative', overflow:'hidden',
        background:'linear-gradient(160deg,#FFF8F0 0%,#FFF0FA 45%,#EFF8FF 100%)',
        display:'flex', alignItems:'center' }}>
        {/* blobs */}
        {[{w:300,h:300,top:'-70px',left:'-70px',bg:'rgba(255,107,43,0.10)'},
          {w:200,h:200,top:'50px',right:'-50px',bg:'rgba(255,79,163,0.08)'},
          {w:250,h:250,bottom:'-50px',left:'35%',bg:'rgba(58,123,255,0.07)'},
          {w:140,h:140,top:'42%',left:'13%',bg:'rgba(0,229,160,0.09)'}
        ].map((b,i) => (
          <motion.div key={i} animate={{ scale:[1,1.07,1], rotate:[0,4,-4,0] }}
            transition={{ duration:7+i*2, repeat:Infinity, ease:'easeInOut', delay:i*1.5 }}
            style={{ position:'absolute', width:b.w, height:b.h, borderRadius:'50%', background:b.bg,
              filter:'blur(40px)', pointerEvents:'none',
              top:b.top||'auto', left:b.left||'auto', right:b.right||'auto', bottom:b.bottom||'auto' }} />
        ))}

        <div style={{ maxWidth:1300, margin:'0 auto', padding:'0 24px', paddingTop:88, width:'100%',
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:44, alignItems:'center' }}>

          {/* Left */}
          <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7 }}>
            <MascotSpeech charIndex={0} message="Let's trade skills together! 🎉" style={{ marginBottom:24 }} />
            <div className="badge badge-orange" style={{ marginBottom:18, display:'inline-flex' }}>
              ⚡ #1 Skill Bartering Platform!
            </div>
            <h1 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900,
              fontSize:'clamp(2.3rem,5vw,4rem)', lineHeight:1.1, marginBottom:20 }}>
              <span className="gradient-text">Trade Skills.</span><br />
              <span style={{ color:'#3A7BFF' }}>Share Time.</span><br />
              <span style={{ color:'#2ECC71' }}>Build Community.</span>
            </h1>
            <p style={{ fontSize:'1.02rem', color:'var(--text-secondary)', lineHeight:1.7,
              marginBottom:32, maxWidth:480, fontWeight:600 }}>
              TimeBank connects neighbours who want to share what they know.
              No money — just time, skills and the joy of learning! 🌈
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:28 }}>
              <Link to="/register" className="btn btn-primary btn-lg">🚀 Get Started Free <ArrowRight size={17} /></Link>
              <Link to="/register" className="btn btn-blue btn-lg">🔍 Find a Skill</Link>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ display:'flex' }}>
                {CHARACTERS.slice(0,5).map((c,i) => (
                  <div key={c.id} style={{ width:34, height:34, borderRadius:'50%', background:c.bg,
                    border:`2px solid ${c.color}`, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:17, marginLeft:i>0?-9:0, boxShadow:`0 2px 8px ${c.color}38` }}>{c.emoji}</div>
                ))}
              </div>
              <div>
                <div style={{ display:'flex', gap:2 }}>{[...Array(5)].map((_,j)=><span key={j} style={{fontSize:12}}>⭐</span>)}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:700 }}>12,000+ happy members</div>
              </div>
            </div>
          </motion.div>

          {/* Right — 3D */}
          <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.35, duration:0.8 }} style={{ height:500 }}>
            {webGL ? (
              <Suspense fallback={
                <div style={{ height:'100%', display:'flex', flexWrap:'wrap', alignItems:'center',
                  justifyContent:'center', gap:18, padding:20 }}>
                  {CHARACTERS.map((c,i) => (
                    <CharacterBubble key={c.id} {...c} size={65} delay={i*0.1} showLabel />
                  ))}
                </div>
              }>
                <FloatingCharacters height="100%" />
              </Suspense>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, padding:16 }}>
                {CHARACTERS.map((c,i) => <CharacterBubble key={c.id} {...c} size={68} delay={i*0.1} showLabel />)}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div animate={{ y:[0,10,0] }} transition={{ repeat:Infinity, duration:1.8 }}
          style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)',
            color:'var(--text-muted)', cursor:'pointer' }}>
          <ChevronDown size={26} />
        </motion.div>
      </section>

      {/* STATS */}
      <section style={{ padding:'56px 24px', background:'linear-gradient(135deg,#FFF3E0,#FCE4EC)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }}>
          {STATS.map((s,i) => (
            <motion.div key={i} initial={{ opacity:0, y:26 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.1 }} viewport={{ once:true }} whileHover={{ y:-3 }}
              style={{ padding:'22px 18px', textAlign:'center', background:s.bg,
                border:`2px solid ${s.color}30`, borderRadius:20, boxShadow:`0 5px 18px ${s.color}18` }}>
              <motion.div animate={{ rotate:[0,11,-11,0] }} transition={{ duration:3.5, repeat:Infinity, delay:i*0.5 }}
                style={{ fontSize:'2.6rem', marginBottom:9 }}>{s.icon}</motion.div>
              <div style={{ fontSize:'clamp(1.7rem,3vw,2.3rem)', fontWeight:900, color:s.color, fontFamily:'Baloo 2,sans-serif' }}>
                <Counter target={s.val} />
              </div>
              <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem', fontWeight:700, marginTop:4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:'76px 24px', background:'linear-gradient(160deg,#FFF8F0,#F0F8FF)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:'center', marginBottom:50 }}>
            <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900 }}>
              <span className="gradient-text">3 fun steps</span> to start trading! 🎊
            </h2>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
            {HOW.map((item,i) => (
              <motion.div key={i} initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay:i*0.13 }} viewport={{ once:true }} whileHover={{ y:-5 }}
                style={{ padding:28, borderRadius:24, background:'#fff',
                  border:`2px solid ${item.color}28`, boxShadow:`0 7px 26px ${item.color}16`,
                  position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-18, right:-10, fontFamily:'Baloo 2,sans-serif',
                  fontSize:'7rem', fontWeight:900, color:`${item.color}0e`, lineHeight:1, pointerEvents:'none' }}>{item.step}</div>
                <CharacterBubble {...CHARACTERS[item.charIdx]} size={64} delay={i*0.18} style={{ marginBottom:14 }} />
                <div style={{ fontSize:'1.9rem', marginBottom:7 }}>{item.icon}</div>
                <div style={{ fontSize:'0.68rem', fontWeight:900, color:item.color, textTransform:'uppercase',
                  letterSpacing:'0.12em', marginBottom:7 }}>Step {item.step}</div>
                <h3 style={{ fontSize:'1.2rem', fontWeight:900, marginBottom:9, fontFamily:'Baloo 2,sans-serif' }}>{item.title}</h3>
                <p style={{ color:'var(--text-secondary)', lineHeight:1.62, fontWeight:600, fontSize:'0.92rem' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARACTER PARADE */}
      <section style={{ padding:'44px 24px', background:'linear-gradient(135deg,#FCE4EC,#F3E5F5,#E3F2FD)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
          <motion.h2 initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'1.8rem', fontWeight:900, marginBottom:6 }}>
            Meet your <span className="gradient-text">Skill Heroes</span>! 🦸
          </motion.h2>
          <p style={{ color:'var(--text-secondary)', fontWeight:600, marginBottom:24, fontSize:'0.96rem' }}>
            Everyone has something amazing to teach — join us!
          </p>
          <CharacterStrip />
        </div>
      </section>

      {/* SKILLS */}
      <section style={{ padding:'76px 24px', background:'#EFF8FF' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <motion.div initial={{ opacity:0, y:26 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:42, flexWrap:'wrap', gap:12 }}>
            <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:900 }}>
              Skills being <span className="gradient-text-blue">traded near you</span> 📍
            </h2>
            <Link to="/register" className="btn btn-secondary">See all →</Link>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {SKILLS.map((sk,i) => (
              <motion.div key={i} initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }}
                transition={{ delay:i*0.07 }} viewport={{ once:true }} whileHover={{ y:-4 }}
                style={{ padding:'20px 18px', background:sk.bg, borderRadius:18,
                  border:`2px solid ${sk.color}30`, boxShadow:`0 5px 18px ${sk.color}16`, cursor:'pointer' }}>
                <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ duration:4, repeat:Infinity, delay:i*0.32 }}
                  style={{ fontSize:'2.2rem', marginBottom:9 }}>{sk.icon}</motion.div>
                <div style={{ fontWeight:900, fontSize:'0.97rem', color:sk.color, fontFamily:'Baloo 2,sans-serif', marginBottom:3 }}>{sk.name}</div>
                <div style={{ color:'var(--text-secondary)', fontSize:'0.78rem', fontWeight:700 }}>{sk.offers} active offers</div>
                <div style={{ marginTop:9, height:5, borderRadius:3, background:'rgba(0,0,0,0.07)' }}>
                  <motion.div initial={{ width:0 }} whileInView={{ width:`${(sk.offers/900)*100}%` }}
                    transition={{ duration:1.2, delay:i*0.09 }}
                    style={{ height:'100%', borderRadius:3, background:sk.color }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'90px 24px', textAlign:'center',
        background:'linear-gradient(135deg,rgba(255,107,43,0.08),rgba(255,79,163,0.07),rgba(58,123,255,0.06))',
        position:'relative', overflow:'hidden' }}>
        {CHARACTERS.slice(0,4).map((c,i) => (
          <motion.div key={c.id}
            animate={{ y:[0,-15,0], x:[0,8,-8,0], rotate:[0,5,-5,0] }}
            transition={{ duration:4+i, repeat:Infinity, ease:'easeInOut', delay:i*0.8 }}
            style={{ position:'absolute', fontSize:'3rem', opacity:0.2,
              top:[`12%`,`62%`,`18%`,`72%`][i], left:[`4%`,`90%`,`93%`,`2%`][i] }}>
            {c.emoji}
          </motion.div>
        ))}
        <motion.div initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'3.5rem', marginBottom:14 }}>🎉</div>
          <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'clamp(1.9rem,4.5vw,3.2rem)',
            fontWeight:900, lineHeight:1.2, marginBottom:20 }}>
            People are the network.<br />
            <span className="gradient-text">Skills are the assets.</span><br />
            <span style={{ color:'#3A7BFF' }}>Time is the currency.</span>
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'1rem', lineHeight:1.7, marginBottom:36, fontWeight:600 }}>
            Join thousands of people building a skills-based community!
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">🚀 Start Trading <ArrowRight size={17} /></Link>
            <Link to="/register" className="btn btn-blue btn-lg">📍 Find People Nearby</Link>
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginTop:18, fontWeight:700 }}>
            Free to join · No credit card · 5 Time Credits on signup 🎁
          </p>
        </motion.div>
      </section>

      <footer style={{ padding:'32px 24px', borderTop:'2px solid rgba(255,107,43,0.12)',
        background:'#FFF8F0', textAlign:'center' }}>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:9, marginBottom:10 }}>
          <span style={{ fontSize:'1.7rem' }}>⏱</span>
          <span style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.15rem' }}
            className="gradient-text">TimeBank</span>
        </div>
        <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', fontWeight:700 }}>
          Trade Skills · Share Time · Build Community · © 2024 TimeBank 🌈
        </p>
      </footer>

      <style>{`
        @media(max-width:860px){
          section > div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}
        }
        @media(max-width:600px){
          section > div[style*="grid-template-columns: repeat(4"]{grid-template-columns:repeat(2,1fr)!important}
          section > div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}
