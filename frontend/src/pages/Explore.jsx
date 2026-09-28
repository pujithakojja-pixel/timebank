import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Filter, MapPin, Star, RefreshCw, X, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CharacterBubble, CHARACTERS } from '../components/ui/CartoonFloat';

const SKILL_CATEGORIES = ['all','Technology','Languages','Music','Arts & Crafts','Sports & Fitness','Cooking','Education','Design'];
const CHAR_COLORS = ['#FF6B2B','#FF4FA3','#3A7BFF','#2ECC71','#9B59FF','#FF9800','#00BFFF','#FFD700'];

function getInitials(name) { return name?.split(' ').map(n=>n[0]).join('').toUpperCase()||'?'; }

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, map.getZoom(), { duration: 1 }); }, [center]);
  return null;
}

function UserMarker({ u, index, onClick }) {
  const color = CHAR_COLORS[index % CHAR_COLORS.length];
  const emoji = CHARACTERS[index % CHARACTERS.length].emoji;
  if (!u.location?.coordinates) return null;
  const [lng, lat] = u.location.coordinates;
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:40px;height:40px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 4px 14px ${color}70;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${emoji}</div>`,
    iconSize: [40,40], iconAnchor: [20,20]
  });
  return (
    <Marker position={[lat, lng]} icon={icon} eventHandlers={{ click: () => onClick(u) }}>
      <Popup>
        <div style={{ fontFamily:'Nunito,sans-serif', padding:'4px 2px', minWidth:130 }}>
          <strong style={{ color }}>{u.name}</strong>
          <div style={{ fontSize:'0.8rem', color:'#888', marginTop:2 }}>
            {u.skillsOffered?.slice(0,2).map(s=>s.name).join(', ') || 'No skills listed'}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function ProfileCard({ user: u, onClose, onTrade }) {
  const navigate = useNavigate();
  const color = CHAR_COLORS[0];
  return (
    <motion.div key="card" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
      style={{ background:'#fff', borderRadius:20, padding:22, border:'2px solid rgba(255,107,43,0.2)',
        boxShadow:'0 8px 32px rgba(255,107,43,0.12)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <h3 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1rem' }}>👤 Profile</h3>
        <button onClick={onClose} style={{ background:'rgba(255,107,43,0.08)', border:'none', borderRadius:50,
          width:28, height:28, cursor:'pointer', fontSize:'0.9rem' }}>✕</button>
      </div>
      <div style={{ textAlign:'center', marginBottom:18 }}>
        {u.avatar ? (
          <img src={u.avatar} style={{ width:68, height:68, borderRadius:'50%', margin:'0 auto 10px',
            border:'3px solid rgba(255,107,43,0.3)', display:'block' }} alt={u.name} />
        ) : (
          <div style={{ width:68, height:68, borderRadius:'50%', background:'linear-gradient(135deg,#FF6B2B,#FF4FA3)',
            margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:900, fontSize:'1.5rem', color:'#fff' }}>{getInitials(u.name)}</div>
        )}
        <div style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.15rem' }}>{u.name}</div>
        <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', display:'flex', alignItems:'center',
          gap:4, justifyContent:'center', marginTop:4 }}>
          <MapPin size={11}/> {u.location?.city||'Nearby'}
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:14, marginTop:10 }}>
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem', color:'#E65100',
            background:'#FFF3E0', borderRadius:20, padding:'3px 10px', fontWeight:800 }}>
            ⭐ {u.trustScore||0}%
          </span>
          {u.isOnline && (
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem', color:'#2ECC71',
              background:'#E8F5E9', borderRadius:20, padding:'3px 10px', fontWeight:800 }}>
              🟢 Online
            </span>
          )}
        </div>
      </div>
      {u.bio && <p style={{ color:'var(--text-secondary)', fontSize:'0.83rem', lineHeight:1.55,
        marginBottom:14, fontStyle:'italic', fontWeight:600 }}>"{u.bio}"</p>}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase',
          letterSpacing:'0.1em', marginBottom:7 }}>🎯 Offers</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
          {u.skillsOffered?.map(s=>(
            <span key={s._id} className="badge badge-orange" style={{ fontSize:'0.73rem' }}>{s.name}</span>
          ))}
          {!u.skillsOffered?.length && <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>None listed</span>}
        </div>
      </div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase',
          letterSpacing:'0.1em', marginBottom:7 }}>📚 Wants</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
          {u.skillsWanted?.map(s=>(
            <span key={s._id} className="badge badge-blue" style={{ fontSize:'0.73rem' }}>{s.name}</span>
          ))}
          {!u.skillsWanted?.length && <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>Open to anything</span>}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
        {[{l:'Trades',v:u.completedTrades||0},{l:'Hours',v:`${u.hoursExchanged||0}h`}].map(s=>(
          <div key={s.l} style={{ background:'#FFF3E0', borderRadius:12, padding:'10px 12px', textAlign:'center',
            border:'1.5px solid rgba(255,107,43,0.2)' }}>
            <div style={{ fontWeight:900, fontFamily:'Baloo 2,sans-serif', color:'#E65100' }}>{s.v}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:700 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={()=>onTrade(u)} className="btn btn-primary btn-sm" style={{ flex:2 }}>
          🤝 Propose Trade
        </button>
        <button onClick={()=>navigate(`/profile/${u._id}`)} className="btn btn-secondary btn-icon">
          <User size={15}/>
        </button>
      </div>
    </motion.div>
  );
}

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ radius:10, category:'all', minTrust:0 });
  const center = [
    user?.location?.coordinates?.[1]||40.758,
    user?.location?.coordinates?.[0]||-73.9855
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getNearby({
        lat: center[0], lng: center[1],
        radius: filters.radius,
        category: filters.category !== 'all' ? filters.category : undefined,
        minTrust: filters.minTrust
      });
      setUsers(data.users||[]);
    } catch { toast.error('Could not load nearby users'); }
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-container" style={{ height:'calc(100vh - var(--nav-height))',
      display:'flex', flexDirection:'column', padding:'14px 20px 14px' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div>
          <h1 style={{ fontFamily:'Baloo 2,sans-serif', fontWeight:900, fontSize:'1.6rem' }}>
            🗺️ <span className="gradient-text">Explore Nearby</span>
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', fontWeight:700, marginTop:2 }}>
            {users.length} people within {filters.radius}km
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setShowFilters(v=>!v)} className="btn btn-secondary btn-sm" style={{ gap:6 }}>
            <Filter size={14}/> Filters
            {(filters.category!=='all'||filters.minTrust>0||filters.radius!==10) && (
              <span style={{ width:7, height:7, background:'#FF6B2B', borderRadius:'50%' }}/>
            )}
          </button>
          <button onClick={load} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading?'spin':''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }} style={{ overflow:'hidden', marginBottom:12 }}>
            <div style={{ background:'#fff', border:'2px solid rgba(255,107,43,0.2)', borderRadius:16,
              padding:'14px 18px', display:'flex', gap:20, flexWrap:'wrap', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                  📍 Radius: {filters.radius}km
                </label>
                <input type="range" min="1" max="50" value={filters.radius}
                  onChange={e=>setFilters(p=>({...p,radius:parseInt(e.target.value)}))}
                  style={{ width:90, accentColor:'#FF6B2B' }} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Category:</label>
                <select className="input" value={filters.category}
                  onChange={e=>setFilters(p=>({...p,category:e.target.value}))}
                  style={{ padding:'5px 10px', width:150, fontSize:'0.82rem' }}>
                  {SKILL_CATEGORIES.map(c=><option key={c} value={c}>{c==='all'?'All Categories':c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                  ⭐ Min Trust: {filters.minTrust}%
                </label>
                <input type="range" min="0" max="80" step="10" value={filters.minTrust}
                  onChange={e=>setFilters(p=>({...p,minTrust:parseInt(e.target.value)}))}
                  style={{ width:80, accentColor:'#FF6B2B' }} />
              </div>
              <button onClick={()=>setFilters({radius:10,category:'all',minTrust:0})}
                className="btn btn-ghost btn-sm">Reset</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map + List */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 340px', gap:14, minHeight:0 }}>
        {/* Map */}
        <div style={{ borderRadius:20, overflow:'hidden', border:'2.5px solid rgba(255,107,43,0.18)',
          boxShadow:'0 4px 20px rgba(255,107,43,0.1)', position:'relative' }}>
          <MapContainer center={center} zoom={13} style={{ width:'100%', height:'100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap' />
            <MapRecenter center={center} />

            {/* You */}
            {user?.location?.coordinates && (
              <>
                <Marker position={center} icon={L.divIcon({
                  className:'',
                  html:`<div style="width:44px;height:44px;background:linear-gradient(135deg,#FF6B2B,#FF4FA3);border-radius:50%;border:3px solid white;box-shadow:0 0 18px rgba(255,107,43,0.5);display:flex;align-items:center;justify-content:center;font-size:18px">⏱</div>`,
                  iconSize:[44,44], iconAnchor:[22,22]
                })}>
                  <Popup><strong>📍 You are here</strong></Popup>
                </Marker>
                <Circle center={center} radius={filters.radius*1000}
                  pathOptions={{ color:'#FF6B2B', fillColor:'#FF6B2B', fillOpacity:0.04, weight:1.5, dashArray:'6,4' }} />
              </>
            )}

            {users.map((u,i) => (
              <UserMarker key={u._id} u={u} index={i} onClick={setSelected} />
            ))}
          </MapContainer>

          {loading && (
            <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)',
              background:'rgba(255,248,240,0.95)', padding:'7px 16px', borderRadius:20,
              fontSize:'0.83rem', color:'var(--text-secondary)', fontWeight:800,
              border:'2px solid rgba(255,107,43,0.2)', backdropFilter:'blur(10px)' }}>
              🔍 Finding people nearby...
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
          <AnimatePresence mode="wait">
            {selected ? (
              <ProfileCard key="profile" user={selected}
                onClose={()=>setSelected(null)}
                onTrade={(u)=>navigate('/trades',{state:{initiateWith:u}})} />
            ) : (
              <motion.div key="list" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', fontWeight:700, marginBottom:10 }}>
                  {users.length} people found · Click a marker or card to view
                </div>
                {users.length === 0 && !loading && (
                  <div style={{ textAlign:'center', padding:'36px 20px', background:'#fff',
                    borderRadius:18, border:'2px solid rgba(255,107,43,0.15)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:10 }}>🗺️</div>
                    <div style={{ fontWeight:900, fontFamily:'Baloo 2,sans-serif', marginBottom:6 }}>No one nearby</div>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', fontWeight:600 }}>
                      Try increasing the search radius
                    </p>
                  </div>
                )}
                {users.map((u,i) => (
                  <motion.div key={u._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.04 }} whileHover={{ x:3 }}
                    onClick={()=>setSelected(u)}
                    style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 15px',
                      background:'#fff', borderRadius:16, cursor:'pointer',
                      border:`2px solid ${CHAR_COLORS[i%CHAR_COLORS.length]}25`,
                      boxShadow:'0 2px 10px rgba(255,107,43,0.07)', transition:'all 0.18s',
                      marginBottom:2 }}>
                    {u.avatar ? (
                      <img src={u.avatar} style={{ width:40, height:40, borderRadius:'50%', flexShrink:0,
                        border:`2px solid ${CHAR_COLORS[i%CHAR_COLORS.length]}` }} alt={u.name} />
                    ) : (
                      <div style={{ width:40, height:40, borderRadius:'50%', flexShrink:0,
                        background:`linear-gradient(135deg,${CHAR_COLORS[i%CHAR_COLORS.length]},${CHAR_COLORS[(i+1)%CHAR_COLORS.length]})`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontWeight:900, fontSize:'0.88rem', color:'#fff' }}>
                        {getInitials(u.name)}
                      </div>
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ fontWeight:800, fontSize:'0.9rem' }}>{u.name}</span>
                        {u.isOnline && <div className="online-dot" style={{ flexShrink:0 }}/>}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', fontWeight:600,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:2 }}>
                        {u.skillsOffered?.slice(0,2).map(s=>s.name).join(' · ')||'No skills listed'}
                      </div>
                      <div style={{ display:'flex', gap:8, marginTop:3 }}>
                        <span style={{ fontSize:'0.7rem', color:'#E65100', fontWeight:800 }}>⭐ {u.trustScore||0}%</span>
                        <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700 }}>{u.completedTrades||0} trades</span>
                      </div>
                    </div>
                    <span style={{ color:'var(--text-muted)', fontSize:'1rem' }}>›</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
