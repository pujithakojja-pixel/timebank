import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, MapPin, Calendar, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, skillsAPI } from '../services/api';
import toast from 'react-hot-toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    skillsOffered: user?.skillsOffered?.map(s => s._id || s) || [],
    skillsWanted: user?.skillsWanted?.map(s => s._id || s) || [],
    availability: user?.availability || [],
    location: {
      lat: user?.location?.coordinates?.[1] || 40.758,
      lng: user?.location?.coordinates?.[0] || -73.9855,
      city: user?.location?.city || '',
      country: user?.location?.country || '',
      displayName: user?.location?.displayName || ''
    }
  });

  useEffect(() => {
    skillsAPI.getAll().then(({ data }) => setSkills(data.skills || [])).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const toggleSkill = (skillId, type) => {
    setForm(p => {
      const arr = p[type];
      const exists = arr.includes(skillId);
      return { ...p, [type]: exists ? arr.filter(id => id !== skillId) : [...arr, skillId] };
    });
  };

  const toggleDay = (day) => {
    setForm(p => {
      const avail = p.availability;
      const exists = avail.find(a => a.day === day);
      return {
        ...p,
        availability: exists ? avail.filter(a => a.day !== day) : [...avail, { day, startTime: '09:00', endTime: '18:00' }]
      };
    });
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'skills', label: 'Skills', icon: Shield },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'location', label: 'Location', icon: MapPin },
  ];

  return (
    <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.8rem' }}>
          <span className="gradient-text">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>Manage your profile and preferences</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Sidebar tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              background: tab === t.id ? 'rgba(108,99,255,0.2)' : 'transparent',
              border: `1px solid ${tab === t.id ? 'rgba(108,99,255,0.4)' : 'transparent'}`,
              color: tab === t.id ? 'var(--violet-light)' : 'var(--text-secondary)',
              fontWeight: tab === t.id ? 600 : 400, fontSize: '0.9rem', textAlign: 'left',
              transition: 'all 0.2s'
            }}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass" style={{ padding: 28 }}>
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Profile Information</h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Avatar URL</label>
                <input className="input" type="url" placeholder="https://..." value={form.avatar} onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))} />
                {form.avatar && (
                  <img src={form.avatar} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', marginTop: 10, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Bio</label>
                <textarea className="input" rows={4} placeholder="Tell your community about yourself..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} style={{ resize: 'none' }} />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{form.bio.length}/500</div>
              </div>
            </div>
          )}

          {tab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 style={{ fontWeight: 700 }}>Your Skills</h3>
              {['offered', 'wanted'].map(type => (
                <div key={type}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    {type === 'offered' ? '🎯 Skills I offer' : '📚 Skills I want to learn'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {skills.map(skill => {
                      const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
                      const skillId = skill._id;
                      const active = form[key].includes(skillId);
                      return (
                        <button key={skillId} onClick={() => toggleSkill(skillId, key)} style={{
                          padding: '7px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 500,
                          background: active ? 'rgba(108,99,255,0.2)' : 'var(--bg-card)',
                          border: `1px solid ${active ? 'rgba(108,99,255,0.5)' : 'var(--border)'}`,
                          color: active ? 'var(--violet-light)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          {skill.icon} {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'availability' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Availability</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Let people know when you're available to exchange skills</p>
              {DAYS.map(day => {
                const avail = form.availability.find(a => a.day === day);
                const active = !!avail;
                return (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => toggleDay(day)} style={{
                      width: 100, padding: '8px 0', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600,
                      background: active ? 'rgba(108,99,255,0.2)' : 'var(--bg-card)',
                      border: `1px solid ${active ? 'rgba(108,99,255,0.5)' : 'var(--border)'}`,
                      color: active ? 'var(--violet-light)' : 'var(--text-muted)',
                      cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.15s'
                    }}>{day.slice(0, 3).toUpperCase()}</button>
                    {active && (
                      <>
                        <input type="time" value={avail.startTime || '09:00'} onChange={e => setForm(p => ({
                          ...p, availability: p.availability.map(a => a.day === day ? { ...a, startTime: e.target.value } : a)
                        }))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.85rem' }} />
                        <span style={{ color: 'var(--text-muted)' }}>to</span>
                        <input type="time" value={avail.endTime || '18:00'} onChange={e => setForm(p => ({
                          ...p, availability: p.availability.map(a => a.day === day ? { ...a, endTime: e.target.value } : a)
                        }))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.85rem' }} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'location' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontWeight: 700 }}>Location Settings</h3>
              <div style={{ padding: 16, background: 'rgba(0,255,179,0.05)', border: '1px solid rgba(0,255,179,0.15)', borderRadius: 12, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                🔒 Your exact location is never shared. Other users only see approximate distance.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>City</label>
                  <input className="input" value={form.location.city} onChange={e => setForm(p => ({ ...p, location: { ...p.location, city: e.target.value, displayName: `${e.target.value}, ${p.location.country}` } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Country</label>
                  <input className="input" value={form.location.country} onChange={e => setForm(p => ({ ...p, location: { ...p.location, country: e.target.value } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Latitude</label>
                  <input className="input" type="number" step="0.0001" value={form.location.lat} onChange={e => setForm(p => ({ ...p, location: { ...p.location, lat: parseFloat(e.target.value) } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Longitude</label>
                  <input className="input" type="number" step="0.0001" value={form.location.lng} onChange={e => setForm(p => ({ ...p, location: { ...p.location, lng: parseFloat(e.target.value) } }))} />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ gap: 8 }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style>{`@media (max-width: 640px) { .settings-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
