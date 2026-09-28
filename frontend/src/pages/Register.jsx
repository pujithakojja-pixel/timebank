import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { skillsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { CharacterBubble, MascotSpeech, CHARACTERS } from '../components/ui/CartoonFloat';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const STEPS = ['Account','Profile','Skills','Done'];

export default function Register() {
  const [step,      setStep]      = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [skills,    setSkills]    = useState([]);
  const [errors,    setErrors]    = useState({});
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name:          '',
    email:         '',
    password:      '',
    bio:           '',
    avatar:        '',
    skillsOffered: [],
    skillsWanted:  [],
    availability:  [],
    location: { lat:40.7580, lng:-73.9855, city:'New York', country:'USA', displayName:'New York, USA' }
  });

  useEffect(() => {
    skillsAPI.getAll().then(({ data }) => setSkills(data.skills || [])).catch(() => {});
  }, []);

  const update = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const toggleSkill = (id, key) => {
    setForm(p => ({
      ...p,
      [key]: p[key].includes(id) ? p[key].filter(x => x !== id) : [...p[key], id]
    }));
  };

  const toggleDay = (day) => {
    setForm(p => ({
      ...p,
      availability: p.availability.find(a => a.day === day)
        ? p.availability.filter(a => a.day !== day)
        : [...p.availability, { day, startTime:'09:00', endTime:'18:00' }]
    }));
  };

  /* Validate step 0 */
  const validateStep0 = () => {
    const e = {};
    if (!form.name.trim())            e.name     = 'Name is required';
    if (!form.email.trim())           e.email    = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)               e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep0()) { setStep(0); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('🎉 Account created! Welcome to TimeBank!', { duration: 4000 });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      // If email duplicate, go back to step 0
      if (msg.toLowerCase().includes('email')) setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width:'100%', padding:'12px 16px',
    background:'rgba(255,255,255,0.92)',
    border:`2px solid ${errors[field] ? '#FF3B5C' : 'rgba(255,140,80,0.25)'}`,
    borderRadius:14, color:'var(--text-primary)',
    fontFamily:'Nunito,sans-serif', fontSize:'0.93rem', fontWeight:600,
    outline:'none', transition:'all 0.2s'
  });

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FFF8F0,#FFF0FA,#EFF8FF)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px',
      position:'relative', overflow:'hidden' }}>

      {/* Decorative blobs */}
      {[
        { w:280, h:280, top:'-60px', left:'-60px', bg:'rgba(255,107,43,0.09)' },
        { w:200, h:200, bottom:'-40px', right:'-40px', bg:'rgba(255,79,163,0.08)' },
      ].map((b,i) => (
        <div key={i} style={{ position:'absolute', width:b.w, height:b.h, borderRadius:'50%',
          background:b.bg, filter:'blur(40px)', pointerEvents:'none',
          top:b.top||'auto', left:b.left||'auto', right:b.right||'auto', bottom:b.bottom||'auto' }}/>
      ))}

      {/* Floating characters */}
      {CHARACTERS.slice(0,3).map((c,i) => (
        <motion.div key={c.id} animate={{ y:[0,-12,0], rotate:[0,5,-5,0] }}
          transition={{ duration:3+i, repeat:Infinity, ease:'easeInOut', delay:i }}
          style={{ position:'absolute', fontSize:'2.5rem', opacity:0.2,
            top:[`15%`,`65%`,`35%`][i], left:[`3%`,`92%`,`90%`][i], pointerEvents:'none' }}>
          {c.emoji}
        </motion.div>
      ))}

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        style={{ width:'100%', maxWidth:520, position:'relative', zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <motion.span whileHover={{ rotate:[0,-12,12,0] }} transition={{ duration:0.4 }}
              style={{ fontSize:'2rem' }}>⏱</motion.span>
            <span style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'1.4rem', fontWeight:900 }}
              className="gradient-text">TimeBank</span>
          </Link>
          <div style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:700, marginTop:6 }}>
            Join thousands of skill traders! 🌈
          </div>
        </div>

        {/* Step progress */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:28 }}>
          {STEPS.map((s,i) => (
            <React.Fragment key={i}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                <motion.div animate={{ scale: i===step ? 1.1 : 1 }}
                  style={{ width:36, height:36, borderRadius:'50%',
                    background: i<step ? 'linear-gradient(135deg,#FF6B2B,#FF4FA3)' :
                                i===step ? 'linear-gradient(135deg,#3A7BFF,#00BFFF)' : 'rgba(255,140,80,0.12)',
                    border:`2px solid ${i<=step?'transparent':'rgba(255,140,80,0.25)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:900, fontSize:'0.85rem', color: i<=step?'#fff':'var(--text-muted)',
                    boxShadow: i===step?'0 0 0 4px rgba(58,123,255,0.2)':'none', transition:'all 0.3s' }}>
                  {i < step ? <Check size={15}/> : i+1}
                </motion.div>
                <span style={{ fontSize:'0.68rem', fontWeight:800,
                  color:i===step?'#3A7BFF':i<step?'#FF6B2B':'var(--text-muted)' }}>{s}</span>
              </div>
              {i < STEPS.length-1 && (
                <div style={{ width:44, height:3, borderRadius:2, marginBottom:22, transition:'background 0.3s',
                  background:i<step?'linear-gradient(90deg,#FF6B2B,#FF4FA3)':'rgba(255,140,80,0.18)' }}/>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.92)', borderRadius:28,
          border:'2px solid rgba(255,107,43,0.18)', padding:'32px 32px 28px',
          boxShadow:'0 12px 40px rgba(255,107,43,0.1)', backdropFilter:'blur(20px)' }}>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-20 }} transition={{ duration:0.22 }}>

              {/* ── STEP 0: Account ── */}
              {step === 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.5rem' }}>
                      Create your account 🚀
                    </h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:600, marginTop:5 }}>
                      Fill in your details — takes 30 seconds!
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:7,
                      color:'var(--text-secondary)' }}>Full Name *</label>
                    <input style={inputStyle('name')} type="text" placeholder="Your full name"
                      value={form.name} onChange={e=>update('name',e.target.value)}
                      onFocus={e=>e.target.style.borderColor='#FF6B2B'}
                      onBlur={e=>e.target.style.borderColor=errors.name?'#FF3B5C':'rgba(255,140,80,0.25)'}/>
                    {errors.name && <div style={{ color:'#FF3B5C', fontSize:'0.76rem', fontWeight:700, marginTop:4,
                      display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={12}/>{errors.name}</div>}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:7,
                      color:'var(--text-secondary)' }}>Email Address *</label>
                    <input style={inputStyle('email')} type="email" placeholder="you@example.com"
                      value={form.email} onChange={e=>update('email',e.target.value)}
                      onFocus={e=>e.target.style.borderColor='#FF6B2B'}
                      onBlur={e=>e.target.style.borderColor=errors.email?'#FF3B5C':'rgba(255,140,80,0.25)'}/>
                    {errors.email && <div style={{ color:'#FF3B5C', fontSize:'0.76rem', fontWeight:700, marginTop:4,
                      display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={12}/>{errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:7,
                      color:'var(--text-secondary)' }}>Password *</label>
                    <div style={{ position:'relative' }}>
                      <input style={{ ...inputStyle('password'), paddingRight:44 }}
                        type={showPass?'text':'password'} placeholder="Minimum 6 characters"
                        value={form.password} onChange={e=>update('password',e.target.value)}
                        onFocus={e=>e.target.style.borderColor='#FF6B2B'}
                        onBlur={e=>e.target.style.borderColor=errors.password?'#FF3B5C':'rgba(255,140,80,0.25)'}/>
                      <button type="button" onClick={()=>setShowPass(v=>!v)}
                        style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                          background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                        {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                    {errors.password && <div style={{ color:'#FF3B5C', fontSize:'0.76rem', fontWeight:700, marginTop:4,
                      display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={12}/>{errors.password}</div>}
                    {/* Password strength bar */}
                    {form.password.length > 0 && (
                      <div style={{ marginTop:7 }}>
                        <div style={{ height:4, borderRadius:2, background:'rgba(255,140,80,0.15)', overflow:'hidden' }}>
                          <div style={{
                            height:'100%', borderRadius:2, transition:'all 0.3s',
                            width: `${Math.min((form.password.length/12)*100,100)}%`,
                            background: form.password.length<6?'#FF3B5C':form.password.length<10?'#FF9800':'#2ECC71'
                          }}/>
                        </div>
                        <div style={{ fontSize:'0.7rem', fontWeight:700, marginTop:3,
                          color:form.password.length<6?'#FF3B5C':form.password.length<10?'#FF9800':'#2ECC71' }}>
                          {form.password.length<6?'Too short':form.password.length<10?'Good':'Strong! 💪'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Welcome bonus */}
                  <div style={{ padding:'12px 16px', borderRadius:14,
                    background:'linear-gradient(135deg,#E8F5E9,#C8E6C9)',
                    border:'1.5px solid rgba(46,204,113,0.35)',
                    display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:'1.4rem' }}>🎁</span>
                    <div>
                      <div style={{ fontWeight:800, fontSize:'0.88rem', color:'#1B5E20' }}>
                        Free Welcome Bonus!
                      </div>
                      <div style={{ fontSize:'0.76rem', color:'#388E3C', fontWeight:600 }}>
                        Get 5 free Time Credits when you sign up
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Profile ── */}
              {step === 1 && (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.5rem' }}>
                      Tell your story 📖
                    </h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:600, marginTop:5 }}>
                      Help the community know who you are. (All optional!)
                    </p>
                  </div>

                  <div>
                    <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:7,
                      color:'var(--text-secondary)' }}>Bio</label>
                    <textarea style={{ ...inputStyle('bio'), resize:'none', lineHeight:1.55 }} rows={3}
                      placeholder="Tell people about yourself, your background, what drives you..."
                      value={form.bio} onChange={e=>update('bio',e.target.value)}
                      onFocus={e=>e.target.style.borderColor='#FF6B2B'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,140,80,0.25)'}/>
                    <div style={{ textAlign:'right', fontSize:'0.7rem', color:'var(--text-muted)', marginTop:3, fontWeight:600 }}>
                      {form.bio.length}/500
                    </div>
                  </div>

                  <div>
                    <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:7,
                      color:'var(--text-secondary)' }}>Avatar URL <span style={{ color:'var(--text-muted)', fontWeight:600 }}>(optional)</span></label>
                    <input style={inputStyle('avatar')} type="url"
                      placeholder="https://example.com/your-photo.jpg"
                      value={form.avatar} onChange={e=>update('avatar',e.target.value)}
                      onFocus={e=>e.target.style.borderColor='#FF6B2B'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,140,80,0.25)'}/>
                    {form.avatar && (
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                        <img src={form.avatar} alt="Preview" onError={e=>e.target.style.display='none'}
                          style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover',
                            border:'2px solid rgba(255,107,43,0.3)' }}/>
                        <span style={{ fontSize:'0.76rem', color:'var(--text-muted)', fontWeight:600 }}>Preview</span>
                      </div>
                    )}
                    <p style={{ fontSize:'0.74rem', color:'var(--text-muted)', fontWeight:600, marginTop:5 }}>
                      Leave blank for a fun auto-generated avatar 🎨
                    </p>
                  </div>

                  <div>
                    <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:10,
                      color:'var(--text-secondary)' }}>Available days <span style={{ color:'var(--text-muted)', fontWeight:600 }}>(optional)</span></label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                      {DAYS.map(day => {
                        const active = form.availability.some(a=>a.day===day);
                        return (
                          <button key={day} type="button" onClick={()=>toggleDay(day)} style={{
                            padding:'6px 13px', borderRadius:50, fontSize:'0.8rem', fontWeight:800,
                            background:active?'linear-gradient(135deg,#FF6B2B,#FF4FA3)':'rgba(255,107,43,0.07)',
                            border:`1.5px solid ${active?'transparent':'rgba(255,107,43,0.22)'}`,
                            color:active?'#fff':'var(--text-secondary)',
                            cursor:'pointer', fontFamily:'Nunito,sans-serif',
                            textTransform:'capitalize', transition:'all 0.18s',
                            boxShadow:active?'0 3px 10px rgba(255,107,43,0.3)':'none'
                          }}>{day.slice(0,3).toUpperCase()}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Skills ── */}
              {step === 2 && (
                <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.5rem' }}>
                      Your skills 🎯
                    </h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:600, marginTop:5 }}>
                      What can you offer? What do you want to learn? (Optional — add later too!)
                    </p>
                  </div>

                  {[
                    { key:'skillsOffered', label:'🎯 Skills I can teach / offer', badge:'badge-orange' },
                    { key:'skillsWanted',  label:'📚 Skills I want to learn',       badge:'badge-blue'   },
                  ].map(({ key, label, badge }) => (
                    <div key={key}>
                      <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:10,
                        color:'var(--text-secondary)' }}>{label}</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7, maxHeight:148, overflowY:'auto',
                        padding:'2px 0' }}>
                        {skills.slice(0,20).map(skill => {
                          const active = form[key].includes(skill._id);
                          return (
                            <button key={skill._id} type="button" onClick={()=>toggleSkill(skill._id,key)}
                              style={{ padding:'6px 13px', borderRadius:50, fontSize:'0.8rem', fontWeight:800,
                                background:active?'linear-gradient(135deg,#FF6B2B,#FF4FA3)':'rgba(255,107,43,0.07)',
                                border:`1.5px solid ${active?'transparent':'rgba(255,107,43,0.22)'}`,
                                color:active?'#fff':'var(--text-secondary)',
                                cursor:'pointer', fontFamily:'Nunito,sans-serif', transition:'all 0.18s',
                                display:'flex', alignItems:'center', gap:5,
                                boxShadow:active?'0 3px 10px rgba(255,107,43,0.3)':'none' }}>
                              {skill.icon && <span>{skill.icon}</span>}
                              {skill.name}
                              {active && <Check size={11}/>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── STEP 3: Done ── */}
              {step === 3 && (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, textAlign:'center', padding:'8px 0' }}>
                  <CharacterBubble {...CHARACTERS[0]} size={88} />
                  <div>
                    <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.6rem', marginBottom:8 }}>
                      You're all set! 🎉
                    </h2>
                    <p style={{ color:'var(--text-secondary)', fontSize:'0.92rem', fontWeight:600, lineHeight:1.6 }}>
                      Hi <strong>{form.name}</strong>! Your account is ready.<br/>
                      You'll get <strong style={{ color:'#FF6B2B' }}>5 free Time Credits</strong> to start trading right away!
                    </p>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%', textAlign:'left' }}>
                    {[
                      { icon:'📧', label:'Email', val: form.email },
                      { icon:'🎯', label:'Skills offering', val: form.skillsOffered.length > 0 ? `${form.skillsOffered.length} skills` : 'Add later in Settings' },
                      { icon:'📚', label:'Skills wanted', val: form.skillsWanted.length > 0 ? `${form.skillsWanted.length} skills` : 'Add later in Settings' },
                      { icon:'🎁', label:'Welcome credits', val: '5 Time Credits FREE' },
                    ].map((item,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                        borderRadius:12, background:i===3?'linear-gradient(135deg,#E8F5E9,#C8E6C9)':'rgba(255,107,43,0.05)',
                        border:`1.5px solid ${i===3?'rgba(46,204,113,0.35)':'rgba(255,107,43,0.15)'}` }}>
                        <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:700 }}>{item.label}</div>
                          <div style={{ fontSize:'0.86rem', fontWeight:800, color:'var(--text-primary)' }}>{item.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div style={{ display:'flex', gap:10, marginTop:26 }}>
            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)} className="btn btn-secondary" style={{ flex:1 }}>
                <ArrowLeft size={15}/> Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button onClick={handleNext} className="btn btn-primary" style={{ flex:2 }}>
                Continue <ArrowRight size={15}/>
              </button>
            ) : (
              <motion.button onClick={handleSubmit} disabled={loading}
                className="btn btn-primary" style={{ flex:2 }}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <motion.span animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }}
                      style={{ display:'block', width:18, height:18, borderRadius:'50%',
                        border:'2.5px solid rgba(255,255,255,0.35)', borderTopColor:'white' }}/>
                    Creating account...
                  </span>
                ) : '🚀 Create My Account'}
              </motion.button>
            )}
          </div>
        </div>

        {/* Login link */}
        <div style={{ textAlign:'center', marginTop:20, color:'var(--text-muted)', fontSize:'0.88rem', fontWeight:700 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#FF6B2B', fontWeight:900, textDecoration:'none' }}>
            Sign in →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
