import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, theme, setTheme, mode, setMode, showToast } = useApp();
  const navigate = useNavigate();

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
      navigate('/');
    }, 1000);
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
    <div className="page active" id="page-settings" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Hey,<br/><em>{user.name.split(' ')[0]}</em> ⚙</div>
          <div className="greeting-sub">Manage your profile, preferences, and city settings.</div>
        </div>
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Quick Stats</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">🗺</div><div className="stat-num">47</div><div className="stat-lbl">Days Active</div></div>
          <div className="stat-tile"><div className="stat-emoji">📍</div><div className="stat-num">82</div><div className="stat-lbl">Places</div></div>
          <div className="stat-tile"><div className="stat-emoji">🃏</div><div className="stat-num">5</div><div className="stat-lbl">Cards</div></div>
        </div>
      </aside>
      
      <div className="right-panel settings-right">
        <div className="profile-big">
          <div className="pb-avatar">{user.initial}</div>
          <div className="pb-info">
            <div className="pb-name"><em>{user.name}</em></div>
            <div className="pb-rank">Lv {user.level} · {user.rank} · Bengaluru, India</div>
            <div className="pb-xp-row">
              <div className="pb-xp-track"><div className="pb-xp-fill" style={{width: '68%'}}></div></div>
              <span className="pb-xp-pct">68%</span>
              <span className="pb-xp-lbl">→ Lv {user.level + 1}</span>
            </div>
            <div style={{fontSize: '11px', fontFamily: 'Courier Prime,monospace', color: 'var(--text3)'}}>{user.xp.toLocaleString()} / {user.xpNext.toLocaleString()} XP</div>
            <div className="pb-stats-row">
              <div className="pb-stat"><div className="pb-stat-val">47</div><div className="pb-stat-lbl">Days</div></div>
              <div className="pb-stat"><div className="pb-stat-val">82</div><div className="pb-stat-lbl">Places</div></div>
              <div className="pb-stat"><div className="pb-stat-val">5</div><div className="pb-stat-lbl">Cards</div></div>
              <div className="pb-stat"><div className="pb-stat-val">7</div><div className="pb-stat-lbl">Challenges</div></div>
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
            <div className="sg-header"><div className="sg-title">Data & Backend</div></div>
            <div className="setting-row" onClick={() => showToast('🔗','API endpoint: /api/v1/user')}>
              <div className="sr-icon">🔗</div><div className="sr-info"><div className="sr-title">API Connection</div><div className="sr-sub">Backend endpoint for live data</div></div>
              <div className="sr-value" style={{color: 'var(--teal)'}}>Connected</div>
            </div>
            <div className="setting-row" onClick={() => showToast('♻️','Sync triggered!')}>
              <div className="sr-icon">♻️</div><div className="sr-info"><div className="sr-title">Sync Data</div><div className="sr-sub">Manually sync with backend</div></div>
              <div className="sr-value">Sync now →</div>
            </div>
            <div className="setting-row" onClick={() => showToast('📦','Data exported!')}>
              <div className="sr-icon">📦</div><div className="sr-info"><div className="sr-title">Export My Data</div><div className="sr-sub">Download your journey as JSON</div></div>
              <div className="sr-value">Export →</div>
            </div>
          </div>

          <div className="settings-group">
            <div className="sg-header"><div className="sg-title">Account</div></div>
            <div className="setting-row" onClick={() => showToast('✏️','Edit profile!')}>
              <div className="sr-icon">✏️</div><div className="sr-info"><div className="sr-title">Edit Profile</div><div className="sr-sub">Change name, photo, city</div></div>
            </div>
            <div className="setting-row" onClick={() => showToast('🔒','Password reset sent!')}>
              <div className="sr-icon">🔒</div><div className="sr-info"><div className="sr-title">Change Password</div><div className="sr-sub">Update your login credentials</div></div>
            </div>
            <div className="setting-row" onClick={handleLogout}>
              <div className="sr-icon" style={{color: 'var(--coral)'}}>🚪</div><div className="sr-info"><div className="sr-title" style={{color: 'var(--coral)'}}>Log Out</div><div className="sr-sub">Sign out of CitySense</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
