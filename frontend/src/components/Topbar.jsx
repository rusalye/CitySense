import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Topbar() {
  const { theme, toggleTheme, showToast, user } = useApp();
  const [timeStr, setTimeStr] = useState('');

  // Example placeholder weather
  const weather = { temp: '24°', desc: 'Partly cloudy', icon: '🌤' };

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <div className="logo-emblem"><span>C</span></div>
      </div>
      <div className="topbar-brand">
        <div className="brand-name">City<em>Sense</em></div>
        <div className="brand-sub" id="page-sub">App</div>
      </div>
      <div className="dest-ticker">
        <span>📍</span>
        <div>
          <div className="dest-city">Bengaluru</div>
          <div className="dest-country">India · Karnataka</div>
        </div>
      </div>
      <div className="topbar-search">
        <div className="search-inner">
          <span className="s-icon">⌕</span>
          <input className="search-input" type="text" placeholder="Search places, experiences, streets…" />
          <span className="s-kbd">⌘K</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="weather-chip">
          <span>{weather.icon}</span>
          <span className="w-temp">{weather.temp}</span>
          <span className="w-desc">{weather.desc}</span>
        </div>
        <div 
          className="theme-toggle" 
          data-icon={theme === 'dark' ? '☀️' : '🌙'} 
          onClick={() => {
            toggleTheme();
            showToast(theme === 'dark' ? '☀️' : '🌙', theme === 'dark' ? 'Light mode on' : 'Dark mode on');
          }}
        ></div>
        <div className="icon-btn" onClick={() => showToast('🔔', '1 new challenge unlocked!')}>
          🔔<span className="notif-dot"></span>
        </div>
        <div className="avatar-btn" onClick={() => showToast('👤', 'Profile coming soon!')}>
          {user.initial}
        </div>
      </div>
    </header>
  );
}
