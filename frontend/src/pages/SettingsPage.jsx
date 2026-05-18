import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updatePassword } from '../services/api';

export default function SettingsPage() {
  const { user, setUser, theme, setTheme, mode, setMode, showToast, logout } = useApp();
  // const navigate = useNavigate();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', username: '', phone: '', age: '' });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);

  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date(), h = d.getHours(), m = d.getMinutes();
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const hh = h % 12 || 12, ampm = h >= 12 ? 'PM' : 'AM';
      setTimeStr(`${days[d.getDay()]}, ${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    showToast('👋', 'Logged out!');
    setTimeout(() => {
      logout();
    }, 1000);
  };

  const openProfileEdit = () => {
    setProfileForm({ name: user.name, username: user.username, phone: user.phone || '', age: user.age || '' });
    setIsEditProfileOpen(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await updateProfile(user.id, {
        name: profileForm.name,
        username: profileForm.username,
        phone: profileForm.phone,
        age: profileForm.age ? parseInt(profileForm.age) : null
      });
      setUser(updatedUser);
      showToast('✏️', 'Profile updated successfully!');
      setIsEditProfileOpen(false);
    } catch (err) {
      showToast('⚠️', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPass.length < 6) return showToast('⚠️', 'New password must be at least 6 characters');
    if (passForm.newPass !== passForm.confirm) return showToast('⚠️', 'Passwords do not match');
    
    setIsLoading(true);
    try {
      await updatePassword(user.id, passForm.current, passForm.newPass);
      showToast('🔒', 'Password changed successfully!');
      setIsChangePassOpen(false);
      setPassForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      showToast('⚠️', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    showToast(theme === 'dark' ? '☀️' : '🌙', theme === 'dark' ? 'Light mode on' : 'Dark mode on');
  };

  const [toggles, setToggles] = useState({ notifs: true, noise: true, crowd: false, air: true });

  const toggleSwitch = (key, icon, msg) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    showToast(icon, msg);
  };

  return (
    <div className="page active" id="page-settings">
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Hey,<br/><em>{user.name.split(' ')[0]}</em> ⚙</div>
          <div className="greeting-sub">Manage your profile, preferences, and city settings.</div>
        </div>
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Quick Stats</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">🗺</div><div className="stat-num">{user.daysActive || 1}</div><div className="stat-lbl">Days Active</div></div>
          <div className="stat-tile"><div className="stat-emoji">📍</div><div className="stat-num">{user.placesVisited || 0}</div><div className="stat-lbl">Places</div></div>
          <div className="stat-tile"><div className="stat-emoji">🃏</div><div className="stat-num">{user.cardsCollected || 0}</div><div className="stat-lbl">Cards</div></div>
        </div>
      </aside>
      
      <div className="right-panel settings-right">
        <div className="profile-big">
          <div className="pb-avatar">{user.initial}</div>
          <div className="pb-info">
            <div className="pb-name"><em>{user.name}</em></div>
            <div className="pb-rank">Lv {user.level} · {user.rank} · Bengaluru, India</div>
            <div className="pb-xp-row">
              <div className="pb-xp-track"><div className="pb-xp-fill" style={{width: `${(user.xp / (user.xpNext || 1000)) * 100}%`}}></div></div>
              <span className="pb-xp-pct">{Math.round((user.xp / (user.xpNext || 1000)) * 100)}%</span>
              <span className="pb-xp-lbl">→ Lv {user.level + 1}</span>
            </div>
            <div style={{fontSize: '11px', fontFamily: 'Courier Prime,monospace', color: 'var(--text3)'}}>{user.xp.toLocaleString()} / {(user.xpNext || 1000).toLocaleString()} XP</div>
            <div className="pb-stats-row">
              <div className="pb-stat"><div className="pb-stat-val">{user.daysActive || 1}</div><div className="pb-stat-lbl">Days</div></div>
              <div className="pb-stat"><div className="pb-stat-val">{user.placesVisited || 0}</div><div className="pb-stat-lbl">Places</div></div>
              <div className="pb-stat"><div className="pb-stat-val">{user.cardsCollected || 0}</div><div className="pb-stat-lbl">Cards</div></div>
              <div className="pb-stat"><div className="pb-stat-val">{user.challengesCompleted || 0}</div><div className="pb-stat-lbl">Challenges</div></div>
            </div>
          </div>
        </div>

        <div className="settings-sections anim-in">
          <div className="settings-group">
            <div className="sg-header"><div className="sg-title">Preferences</div></div>
            <div className="setting-row" onClick={() => { setMode(mode === 'calm' ? 'comfort' : mode === 'comfort' ? 'explore' : 'calm'); showToast('🌿','Default mode updated!'); }}>
              <div className="sr-icon">🌿</div><div className="sr-info"><div className="sr-title">Default Experience Mode</div><div className="sr-sub">Mode applied when you open the app</div></div>
              <div className="sr-value" style={{ textTransform: 'capitalize' }}>{mode}</div>
            </div>
            <div className="setting-row" onClick={() => toggleSwitch('notifs', '🔔', 'Notifications toggled!')}>
              <div className="sr-icon">🔔</div><div className="sr-info"><div className="sr-title">Discovery Notifications</div><div className="sr-sub">Alert for new nearby places</div></div>
              <div className={`toggle-sw ${toggles.notifs ? 'on' : ''}`}></div>
            </div>
            <div className="setting-row" onClick={handleToggleTheme}>
              <div className="sr-icon">🌙</div><div className="sr-info"><div className="sr-title">Dark Mode</div><div className="sr-sub">Toggle light / dark appearance</div></div>
              <div className={`toggle-sw ${theme === 'dark' ? 'on' : ''}`} id="dark-mode-toggle"></div>
            </div>
            <div className="setting-row" onClick={() => showToast('📍','Location updated!')}>
              <div className="sr-icon">📍</div><div className="sr-info"><div className="sr-title">Home City</div><div className="sr-sub">Your base city for exploration</div></div>
              <div className="sr-value">Bengaluru</div>
            </div>
          </div>

          <div className="settings-group">
            <div className="sg-header"><div className="sg-title">Sensory Filters</div></div>
            <div className="setting-row" onClick={() => toggleSwitch('noise', '🔊', 'Noise filter updated!')}>
              <div className="sr-icon">🔊</div><div className="sr-info"><div className="sr-title">Avoid Noisy Areas</div><div className="sr-sub">Filter out high-noise zones from routes</div></div>
              <div className={`toggle-sw ${toggles.noise ? 'on' : ''}`}></div>
            </div>
            <div className="setting-row" onClick={() => toggleSwitch('crowd', '👥', 'Crowd filter updated!')}>
              <div className="sr-icon">👥</div><div className="sr-info"><div className="sr-title">Avoid Crowded Spots</div><div className="sr-sub">Only show places with low crowd index</div></div>
              <div className={`toggle-sw ${toggles.crowd ? 'on' : ''}`}></div>
            </div>
            <div className="setting-row" onClick={() => toggleSwitch('air', '🌬', 'Air quality filter updated!')}>
              <div className="sr-icon">🌬</div><div className="sr-info"><div className="sr-title">Air Quality Alerts</div><div className="sr-sub">Warn when AQI exceeds safe levels</div></div>
              <div className={`toggle-sw ${toggles.air ? 'on' : ''}`}></div>
            </div>
          </div>

          <div className="settings-group">
            <div className="sg-header"><div className="sg-title">Account</div></div>
            <div className="setting-row" onClick={openProfileEdit}>
              <div className="sr-icon">✏️</div><div className="sr-info"><div className="sr-title">Edit Profile</div><div className="sr-sub">Change name, photo, city</div></div>
            </div>
            <div className="setting-row" onClick={() => setIsChangePassOpen(true)}>
              <div className="sr-icon">🔒</div><div className="sr-info"><div className="sr-title">Change Password</div><div className="sr-sub">Update your login credentials</div></div>
            </div>
            <div className="setting-row" onClick={handleLogout}>
              <div className="sr-icon" style={{color: 'var(--coral)'}}>🚪</div><div className="sr-info"><div className="sr-title" style={{color: 'var(--coral)'}}>Log Out</div><div className="sr-sub">Sign out of CitySense</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsEditProfileOpen(false)}>
          <div className="modal-content" style={{ background: 'var(--card)', padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', zIndex: 1000, position: 'relative' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text)', marginBottom: '20px' }}>Edit Profile</h3>
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Full Name</label>
                <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Username</label>
                <input type="text" value={profileForm.username} onChange={e => setProfileForm({...profileForm, username: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} required />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Phone</label>
                  <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div style={{ width: '80px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Age</label>
                  <input type="number" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsEditProfileOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isLoading} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--teal)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>{isLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePassOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsChangePassOpen(false)}>
          <div className="modal-content" style={{ background: 'var(--card)', padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', zIndex: 1000, position: 'relative' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text)', marginBottom: '20px' }}>Change Password</h3>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Current Password</label>
                <input type="password" value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>New Password</label>
                <input type="password" value={passForm.newPass} onChange={e => setPassForm({...passForm, newPass: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} required minLength={6} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Confirm New Password</label>
                <input type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} required minLength={6} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsChangePassOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isLoading} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--coral)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>{isLoading ? 'Updating...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
