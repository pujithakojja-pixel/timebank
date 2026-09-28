import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLocation } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom, isOnline } = useSocket();
  const location = useLocation();
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    messagesAPI.getConversations()
      .then(({ data }) => setConvs(data.conversations||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state?.room && convs.length > 0) {
      const conv = convs.find(c => c.room === location.state.room);
      if (conv) openRoom(conv);
    }
  }, [location.state, convs]);

  useEffect(() => {
    if (!socket || !active) return;
    const onMsg = (msg) => {
      if (msg.room === active.room) { setMsgs(p=>[...p,msg]); scrollToBottom(); }
      setConvs(p=>p.map(c=>c.room===msg.room?{...c,lastMessage:msg}:c));
    };
    const onTyping = ({ userId, userName }) => {
      if (userId !== user?._id) { setTypingUser(userName); setTyping(true); }
    };
    const onStop = ({ userId }) => {
      if (userId !== user?._id) { setTypingUser(null); setTyping(false); }
    };
    socket.on('new_message', onMsg);
    socket.on('user_typing', onTyping);
    socket.on('user_stopped_typing', onStop);
    return () => { socket.off('new_message',onMsg); socket.off('user_typing',onTyping); socket.off('user_stopped_typing',onStop); };
  }, [socket, active]);

  const openRoom = async (conv) => {
    if (active) leaveRoom(active.room);
    setActive(conv); setMsgLoading(true);
    joinRoom(conv.room);
    try { const { data } = await messagesAPI.getRoomMessages(conv.room); setMsgs(data.messages||[]); } catch {}
    setMsgLoading(false);
    setConvs(p=>p.map(c=>c.room===conv.room?{...c,unreadCount:0}:c));
    scrollToBottom();
  };

  const scrollToBottom = () => setTimeout(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),100);
  useEffect(()=>scrollToBottom(),[msgs]);

  const handleSend = async () => {
    if (!input.trim() || !active || sending) return;
    const content = input.trim(); setInput(''); setSending(true);
    const temp = { _id:'tmp'+Date.now(), room:active.room, sender:{_id:user._id,name:user.name,avatar:user.avatar}, content, createdAt:new Date().toISOString() };
    setMsgs(p=>[...p,temp]);
    try {
      if (socket?.connected) {
        socket.emit('send_message', { room:active.room, content });
        setMsgs(p=>p.filter(m=>m._id!==temp._id));
      } else {
        await messagesAPI.send({ room:active.room, content });
      }
    } catch { toast.error('Failed to send'); }
    setSending(false);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (!active || !socket) return;
    socket.emit('typing_start', { room:active.room });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(()=>socket.emit('typing_stop',{room:active.room}), 1500);
  };

  const isMine = (msg) => msg.sender?._id===user?._id || msg.sender===user?._id;
  const getInitials = (n) => n?.split(' ').map(x=>x[0]).join('').toUpperCase()||'?';

  return (
    <div style={{ height:'calc(100vh - var(--nav-height))', display:'grid',
      gridTemplateColumns:'310px 1fr', overflow:'hidden' }}>

      {/* Sidebar */}
      <div style={{ borderRight:'2px solid rgba(255,107,43,0.12)', background:'rgba(255,248,240,0.8)',
        display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
        <div style={{ padding:'18px 18px 12px', borderBottom:'2px solid rgba(255,107,43,0.1)',
          background:'linear-gradient(135deg,#FFF3E0,#FCE4EC)' }}>
          <h2 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.25rem' }}>
            💬 Messages
          </h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', fontWeight:700, marginTop:2 }}>
            {convs.length} conversations
          </p>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            <div style={{ padding:14 }}>
              {[...Array(4)].map((_,i)=><div key={i} className="skeleton" style={{ height:68, borderRadius:12, marginBottom:7 }}/>)}
            </div>
          ) : convs.length===0 ? (
            <div style={{ padding:40, textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:10 }}>💬</div>
              <div style={{ fontWeight:900, fontFamily:'Baloo 2,sans-serif', fontSize:'1rem', marginBottom:5 }}>No conversations</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', fontWeight:600 }}>Accept a trade to start chatting!</div>
            </div>
          ) : convs.map((conv,i) => {
            const isAct = active?.room === conv.room;
            const other = conv.otherUser;
            return (
              <motion.div key={conv.room} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:i*0.04 }} onClick={()=>openRoom(conv)}
                style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 15px',
                  cursor:'pointer', borderLeft:`3px solid ${isAct?'#FF6B2B':'transparent'}`,
                  background:isAct?'rgba(255,107,43,0.07)':'transparent',
                  borderBottom:'1px solid rgba(255,140,80,0.07)', transition:'all 0.15s' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  {other?.avatar?(
                    <img src={other.avatar} style={{ width:42, height:42, borderRadius:'50%',
                      border:'2px solid rgba(255,107,43,0.25)' }} alt=""  />
                  ):(
                    <div style={{ width:42, height:42, borderRadius:'50%', flexShrink:0,
                      background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:900, color:'#fff', fontSize:'0.9rem' }}>{getInitials(other?.name)}</div>
                  )}
                  {other && isOnline(other._id) && <div className="online-dot" style={{ position:'absolute', bottom:0, right:0 }}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:800, fontSize:'0.88rem', color:'var(--text-primary)' }}>{other?.name||'Unknown'}</span>
                    {conv.lastMessage?.createdAt && (
                      <span style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontWeight:600, flexShrink:0 }}>
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix:false })}
                      </span>
                    )}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>
                      {conv.lastMessage?.content||`${conv.trade?.initiatorOffer?.skillName||'Trade'} chat`}
                    </div>
                    {conv.unreadCount>0 && (
                      <span style={{ background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)', borderRadius:'50%',
                        width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'0.62rem', fontWeight:900, color:'#fff', flexShrink:0 }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      {active ? (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ padding:'14px 22px', borderBottom:'2px solid rgba(255,107,43,0.1)',
            display:'flex', alignItems:'center', gap:12,
            background:'linear-gradient(135deg,#FFF3E0,#FCE4EC)' }}>
            {active.otherUser?.avatar?(
              <img src={active.otherUser.avatar} style={{ width:38, height:38, borderRadius:'50%',
                border:'2px solid rgba(255,107,43,0.3)' }} alt="" />
            ):(
              <div style={{ width:38, height:38, borderRadius:'50%',
                background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:900, color:'#fff', fontSize:'0.85rem' }}>
                {getInitials(active.otherUser?.name)}
              </div>
            )}
            <div>
              <div style={{ fontWeight:900, fontSize:'0.95rem' }}>{active.otherUser?.name}</div>
              <div style={{ fontSize:'0.75rem', fontWeight:700,
                color:isOnline(active.otherUser?._id)?'#2ECC71':'var(--text-muted)' }}>
                {isOnline(active.otherUser?._id)?'🟢 Online':'⚫ Offline'}
                {active.trade?.initiatorOffer?.skillName && ` · ${active.trade.initiatorOffer.skillName}`}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'18px 20px',
            display:'flex', flexDirection:'column', gap:10,
            background:'linear-gradient(160deg,#FFF8F0,#FFF0FA)' }}>
            {msgLoading?(
              <div style={{ textAlign:'center', color:'var(--text-muted)', padding:36, fontWeight:700 }}>
                Loading messages... ⏳
              </div>
            ):msgs.length===0?(
              <div style={{ textAlign:'center', padding:52 }}>
                <div style={{ fontSize:'3rem', marginBottom:12 }}>👋</div>
                <div style={{ fontWeight:900, fontFamily:'Baloo 2,sans-serif', marginBottom:6 }}>Start the conversation!</div>
                <div style={{ color:'var(--text-muted)', fontWeight:600, fontSize:'0.88rem' }}>
                  Say hi and discuss your skill exchange 🎉
                </div>
              </div>
            ):msgs.map((msg,i)=>{
              const mine = isMine(msg);
              return (
                <motion.div key={msg._id} initial={{ opacity:0, y:8, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
                  transition={{ duration:0.18 }}
                  style={{ display:'flex', justifyContent:mine?'flex-end':'flex-start',
                    alignItems:'flex-end', gap:7 }}>
                  {!mine && (
                    <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0,
                      background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'0.65rem', fontWeight:900, color:'#fff' }}>
                      {getInitials(msg.sender?.name)}
                    </div>
                  )}
                  <div style={{ maxWidth:'72%' }}>
                    <div style={{
                      padding:'10px 15px',
                      borderRadius:mine?'18px 18px 4px 18px':'18px 18px 18px 4px',
                      background:mine?'linear-gradient(135deg,#FF6B2B,#FF4FA3)':'#fff',
                      border:mine?'none':'2px solid rgba(255,107,43,0.15)',
                      color:mine?'#fff':'var(--text-primary)',
                      fontSize:'0.9rem', lineHeight:1.5, fontWeight:600, wordBreak:'break-word',
                      boxShadow:mine?'0 4px 14px rgba(255,107,43,0.28)':'0 2px 8px rgba(255,107,43,0.08)'
                    }}>{msg.content}</div>
                    <div style={{ fontSize:'0.67rem', color:'var(--text-muted)', marginTop:4,
                      textAlign:mine?'right':'left', fontWeight:600 }}>
                      {msg.createdAt?format(new Date(msg.createdAt),'h:mm a'):''}
                      {mine && ' ✓'}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {typing && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ display:'flex', gap:3, padding:'10px 14px', background:'#fff',
                  borderRadius:'18px 18px 18px 4px', border:'2px solid rgba(255,107,43,0.12)' }}>
                  {[0,1,2].map(i=>(
                    <motion.div key={i} animate={{ y:[0,-4,0] }}
                      transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }}
                      style={{ width:6, height:6, borderRadius:'50%', background:'#FF6B2B' }}/>
                  ))}
                </div>
                <span style={{ fontSize:'0.74rem', color:'var(--text-muted)', fontWeight:700 }}>{typingUser} is typing</span>
              </motion.div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div style={{ padding:'14px 20px', borderTop:'2px solid rgba(255,107,43,0.1)',
            background:'rgba(255,248,240,0.9)' }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <textarea value={input} onChange={handleInput}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();} }}
                placeholder="Type a message... (Enter to send)"
                rows={1}
                style={{ flex:1, padding:'11px 15px', background:'#fff',
                  border:'2px solid rgba(255,107,43,0.22)', borderRadius:50,
                  color:'var(--text-primary)', fontFamily:'Nunito,sans-serif',
                  fontSize:'0.9rem', fontWeight:600, resize:'none', outline:'none',
                  lineHeight:1.5, maxHeight:96, transition:'border-color 0.2s' }}
                onFocus={e=>e.target.style.borderColor='#FF6B2B'}
                onBlur={e=>e.target.style.borderColor='rgba(255,107,43,0.22)'}/>
              <motion.button onClick={handleSend} disabled={!input.trim()||sending}
                whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
                style={{ width:42, height:42, borderRadius:'50%', flexShrink:0,
                  background:input.trim()?'linear-gradient(135deg,#FF6B2B,#FF4FA3)':'rgba(255,107,43,0.1)',
                  border:'none', display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:input.trim()?'pointer':'not-allowed', transition:'all 0.2s',
                  boxShadow:input.trim()?'0 3px 12px rgba(255,107,43,0.35)':'none' }}>
                <Send size={17} color={input.trim()?'#fff':'rgba(255,107,43,0.4)'}/>
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          flexDirection:'column', gap:14, background:'linear-gradient(160deg,#FFF8F0,#FFF0FA)' }}>
          <div style={{ fontSize:'5rem', opacity:0.35 }}>💬</div>
          <div style={{ fontWeight:900, fontSize:'1.2rem', fontFamily:'Baloo 2,sans-serif', color:'var(--text-secondary)' }}>
            Select a conversation
          </div>
          <div style={{ fontSize:'0.88rem', color:'var(--text-muted)', fontWeight:600 }}>
            Choose a trade conversation from the left
          </div>
        </div>
      )}
    </div>
  );
}
