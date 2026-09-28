import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CharacterBubble, CHARACTERS, MascotSpeech } from '../components/ui/CartoonFloat';
import toast from 'react-hot-toast';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:'100%', padding:'13px 16px',
    background:'rgba(255,255,255,0.92)',
    border:'2px solid rgba(255,140,80,0.25)',
    borderRadius:14, color:'var(--text-primary)',
    fontFamily:'Nunito,sans-serif', fontSize:'0.94rem', fontWeight:600,
    outline:'none', transition:'all 0.2s'
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'linear-gradient(160deg,#FFF8F0,#FFF0FA,#EFF8FF)',
      position:'relative', overflow:'hidden' }}>

      {/* Left decorative panel (hidden on mobile) */}
      <div className="auth-left-panel" style={{ flex:1, display:'flex', flexDirection:'column',
        justifyContent:'center', padding:'60px 56px', position:'relative', overflow:'hidden',
        background:'linear-gradient(160deg,rgba(255,107,43,0.06),rgba(255,79,163,0.05),rgba(58,123,255,0.04))' }}>

        {/* Blobs */}
        <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', top:'-60px', left:'-60px',
          background:'rgba(255,107,43,0.1)', filter:'blur(50px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', bottom:'-40px', right:'-40px',
          background:'rgba(58,123,255,0.08)', filter:'blur(40px)', pointerEvents:'none' }}/>

        <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', marginBottom:56 }}>
          <span style={{ fontSize:'2rem' }}>⏱</span>
          <span style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'1.5rem', fontWeight:900 }}
            className="gradient-text">TimeBank</span>
        </Link>

        <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'2.2rem', fontWeight:900, lineHeight:1.2, marginBottom:18 }}>
          Your skills are<br />
          <span className="gradient-text">your currency! 🌟</span>
        </h2>
        <p style={{ color:'var(--text-secondary)', lineHeight:1.7, maxWidth:360, fontWeight:600, fontSize:'0.96rem' }}>
          Sign in to connect with people in your community, exchange skills, and build meaningful relationships through shared knowledge.
        </p>

        <div style={{ marginTop:44, display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { icon:'🎯', text:'Find perfect skill matches near you' },
            { icon:'⏰', text:'Earn Time Credits for every skill shared' },
            { icon:'🤝', text:'Build lasting community connections' },
          ].map((item,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:'1.4rem' }}>{item.icon}</span>
              <span style={{ color:'var(--text-secondary)', fontWeight:700, fontSize:'0.94rem' }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Characters */}
        <div style={{ display:'flex', gap:14, marginTop:44 }}>
          {CHARACTERS.slice(0,4).map((c,i) => (
            <CharacterBubble key={c.id} {...c} size={52} delay={i*0.12} />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width:'45%', minWidth:360, display:'flex', alignItems:'center',
        justifyContent:'center', padding:'40px 32px' }} className="auth-right-panel">
        <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}
          style={{ width:'100%', maxWidth:420 }}>

          <MascotSpeech charIndex={1} message="Welcome back! Let's trade skills! 🎉"
            style={{ marginBottom:28 }} />

          <div style={{ background:'rgba(255,255,255,0.94)', borderRadius:26,
            border:'2px solid rgba(255,107,43,0.18)', padding:'32px 30px',
            boxShadow:'0 12px 40px rgba(255,107,43,0.1)' }}>

            <h1 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.7rem', marginBottom:6 }}>
              Sign In 👋
            </h1>
            <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:600, marginBottom:26 }}>
              Enter your email and password to continue
            </p>

            {/* Error banner */}
            {error && (
              <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                style={{ padding:'11px 14px', borderRadius:12, background:'#FCE4EC',
                  border:'1.5px solid rgba(255,59,92,0.35)', marginBottom:18,
                  display:'flex', alignItems:'center', gap:8 }}>
                <AlertCircle size={16} color="#FF3B5C" style={{ flexShrink:0 }}/>
                <span style={{ color:'#C62828', fontSize:'0.85rem', fontWeight:700 }}>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {/* Email */}
              <div>
                <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:7,
                  color:'var(--text-secondary)' }}>Email Address</label>
                <input style={inputStyle} type="email" placeholder="you@example.com"
                  value={email} onChange={e=>{setEmail(e.target.value);setError('');}}
                  onFocus={e=>e.target.style.borderColor='#FF6B2B'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,140,80,0.25)'}
                  autoComplete="email" required/>
              </div>

              {/* Password */}
              <div>
                <label style={{ display:'block', fontSize:'0.84rem', fontWeight:800, marginBottom:7,
                  color:'var(--text-secondary)' }}>Password</label>
                <div style={{ position:'relative' }}>
                  <input style={{ ...inputStyle, paddingRight:44 }}
                    type={showPass?'text':'password'} placeholder="Your password"
                    value={password} onChange={e=>{setPassword(e.target.value);setError('');}}
                    onFocus={e=>e.target.style.borderColor='#FF6B2B'}
                    onBlur={e=>e.target.style.borderColor='rgba(255,140,80,0.25)'}
                    autoComplete="current-password" required/>
                  <button type="button" onClick={()=>setShowPass(v=>!v)}
                    style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                className="btn btn-primary" style={{ width:'100%', padding:'14px', fontSize:'1rem', marginTop:4 }}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                    <motion.span animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }}
                      style={{ display:'block', width:18, height:18, borderRadius:'50%',
                        border:'2.5px solid rgba(255,255,255,0.35)', borderTopColor:'white' }}/>
                    Signing in...
                  </span>
                ) : (
                  <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                    Sign In <ArrowRight size={17}/>
                  </span>
                )}
              </motion.button>
            </form>

            <div style={{ textAlign:'center', marginTop:22, color:'var(--text-muted)', fontSize:'0.88rem', fontWeight:700 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color:'#FF6B2B', fontWeight:900, textDecoration:'none' }}>
                Create one free →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media(max-width:768px){ .auth-left-panel{display:none!important} .auth-right-panel{width:100%!important;min-width:unset!important} }
      `}</style>
    </div>
  );
}
