import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { walletAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CharacterBubble, CHARACTERS } from '../components/ui/CartoonFloat';
import { format, formatDistanceToNow } from 'date-fns';

const TYPE_LABELS = { trade_payment:'Trade Payment', bonus:'Bonus', refund:'Refund', initial_grant:'Welcome Gift 🎁', penalty:'Penalty' };

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    Promise.all([walletAPI.getWallet(), walletAPI.getTransactions({ page:1, limit:20 })])
      .then(([w,t]) => { setWallet(w.data.wallet); setTxs(t.data.transactions||[]); setTotal(t.data.total||0); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data } = await walletAPI.getTransactions({ page:page+1, limit:20 });
      setTxs(p=>[...p,...(data.transactions||[])]);
      setPage(p=>p+1);
    } catch {}
    setLoadingMore(false);
  };

  const isReceiver = (tx) => tx.receiver?._id===user?._id || tx.receiver===user?._id;
  const filtered = filter==='all' ? txs : txs.filter(tx => filter==='earned' ? isReceiver(tx) : !isReceiver(tx));

  if (loading) return (
    <div className="page-container" style={{ maxWidth:780, margin:'0 auto' }}>
      <div className="skeleton" style={{ height:200, borderRadius:22, marginBottom:18 }}/>
      <div className="skeleton" style={{ height:380, borderRadius:22 }}/>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth:780, margin:'0 auto' }}>
      <motion.div initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.65rem' }}>
          💰 <span className="gradient-text">Time Wallet</span>
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:700, marginTop:3 }}>
          Your Time Credits balance and transaction history
        </p>
      </motion.div>

      {/* Main wallet card */}
      <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
        style={{ background:'linear-gradient(135deg,#FF6B2B,#FF4FA3,#9B59FF)', borderRadius:26,
          padding:'32px 36px', marginBottom:20, position:'relative', overflow:'hidden',
          boxShadow:'0 12px 40px rgba(255,107,43,0.25)' }}>
        {/* decorative circles */}
        <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160,
          borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
        <div style={{ position:'absolute', bottom:-30, left:-20, width:110, height:110,
          borderRadius:'50%', background:'rgba(255,255,255,0.07)' }}/>
        {/* Character mascot */}
        <div style={{ position:'absolute', top:20, right:28, opacity:0.9 }}>
          <CharacterBubble {...CHARACTERS[6]} size={64} />
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.84rem', fontWeight:700, marginBottom:4 }}>
            ⏰ Time Credits Balance
          </div>
          <div style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'clamp(3rem,7vw,4.5rem)',
            fontWeight:900, color:'#fff', lineHeight:1, marginBottom:4 }}>
            {wallet?.balance ?? user?.timeCredits ?? 0}
            <span style={{ fontSize:'1.3rem', marginLeft:6 }}>TC</span>
          </div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.84rem', fontWeight:700, marginBottom:24 }}>
            {user?.name}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              { l:'Total Earned', v:wallet?.totalEarned||0, icon:'📈', bg:'rgba(46,204,113,0.25)' },
              { l:'Total Spent',  v:wallet?.totalSpent||0,  icon:'📉', bg:'rgba(255,59,92,0.25)' },
              { l:'Pending',      v:wallet?.pendingCredits||0, icon:'⏳', bg:'rgba(255,215,0,0.25)' },
            ].map(s=>(
              <div key={s.l} style={{ background:s.bg, borderRadius:14, padding:'12px 16px',
                backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.75)', fontWeight:700 }}>{s.l}</span>
                  <span style={{ fontSize:'1rem' }}>{s.icon}</span>
                </div>
                <div style={{ fontFamily:'Baloo 2,sans-serif', fontSize:'1.5rem', fontWeight:900, color:'#fff' }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* How TC works */}
      <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ background:'#fff', border:'2px solid rgba(255,107,43,0.18)', borderRadius:18,
          padding:'14px 18px', marginBottom:20, display:'flex', gap:20, flexWrap:'wrap' }}>
        {[
          { i:'🎓', t:'Share skill → Earn 1 TC/hour' },
          { i:'📚', t:'Learn skill → Spend 1 TC/hour' },
          { i:'🎁', t:'New members get 5 free TC' },
          { i:'🔄', t:"Circular trades don't cost TC" },
        ].map((x,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.8rem',
            color:'var(--text-secondary)', fontWeight:700 }}>
            <span>{x.i}</span>{x.t}
          </div>
        ))}
      </motion.div>

      {/* Transactions */}
      <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.1rem' }}>💳 Transaction History</h2>
          <div style={{ display:'flex', gap:3, background:'rgba(255,107,43,0.06)', borderRadius:50,
            padding:3, border:'1.5px solid rgba(255,107,43,0.15)' }}>
            {['all','earned','spent'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:'5px 14px', borderRadius:50, cursor:'pointer', fontFamily:'Nunito,sans-serif',
                background:filter===f?'linear-gradient(135deg,#FF6B2B,#FF4FA3)':'transparent',
                border:'none', color:filter===f?'#fff':'var(--text-muted)',
                fontSize:'0.78rem', fontWeight:800, textTransform:'capitalize'
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:20, border:'2px solid rgba(255,107,43,0.15)',
          overflow:'hidden', boxShadow:'0 4px 18px rgba(255,107,43,0.07)' }}>
          {filtered.length===0 ? (
            <div style={{ padding:52, textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>💳</div>
              <div style={{ fontWeight:900, fontFamily:'Baloo 2,sans-serif', marginBottom:6 }}>No transactions yet</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.86rem', fontWeight:600 }}>Complete a trade to earn Time Credits</div>
            </div>
          ) : filtered.map((tx,i)=>{
            const recv = isReceiver(tx);
            const other = recv ? tx.sender : tx.receiver;
            return (
              <motion.div key={tx._id||i} initial={{ opacity:0, x:recv?-16:16 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:i*0.03 }}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 20px',
                  borderBottom:i<filtered.length-1?'1.5px solid rgba(255,140,80,0.1)':'none',
                  transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ width:42, height:42, borderRadius:'50%', flexShrink:0,
                  background:recv?'#E8F5E9':'#FCE4EC',
                  border:`1.5px solid ${recv?'rgba(46,204,113,0.35)':'rgba(255,79,163,0.35)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {recv ? <ArrowDownLeft size={18} color="#2ECC71"/> : <ArrowUpRight size={18} color="#FF4FA3"/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:'0.9rem', color:'var(--text-primary)' }}>
                    {TYPE_LABELS[tx.type]||tx.type}
                    {tx.skillName && <span style={{ color:'var(--text-muted)', fontWeight:600 }}> · {tx.skillName}</span>}
                  </div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', fontWeight:600, marginTop:2 }}>
                    {recv?`From ${other?.name||'TimeBank'}`:`To ${other?.name||'Unknown'}`}
                    {' · '}{tx.createdAt?formatDistanceToNow(new Date(tx.createdAt),{addSuffix:true}):''}
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontWeight:900, fontSize:'1rem', color:recv?'#2ECC71':'#FF4FA3' }}>
                    {recv?'+':'-'}{tx.amount} TC
                  </div>
                  <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'capitalize' }}>
                    {tx.status}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {txs.length < total && (
          <div style={{ textAlign:'center', marginTop:14 }}>
            <button onClick={loadMore} className="btn btn-secondary" disabled={loadingMore}>
              {loadingMore?'Loading...':`Load more (${total-txs.length} remaining)`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
