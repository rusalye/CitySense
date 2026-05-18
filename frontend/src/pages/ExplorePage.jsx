import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getZones, getEnvironment } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';

// Mode configuration for dynamic hero section
const MODE_CONFIG = {
  calm: {
    emoji: '🌿',
    name: 'Calm',
    description: 'serene parks and quiet streets',
    heroSubtitle: 'Curated peaceful discoveries based on your Calm mode, time of day, and walking distance.',
    badgeColor: 'badge-teal',
  },
  comfort: {
    emoji: '☕',
    name: 'Comfort',
    description: 'cosy cafés and restful spaces',
    heroSubtitle: 'Curated comfort spots based on your Comfort mode, time of day, and walking distance.',
    badgeColor: 'badge-gold',
  },
  explore: {
    emoji: '🔭',
    name: 'Explore',
    description: 'hidden gems and cultural sites',
    heroSubtitle: 'Curated discoveries based on your Explore mode, time of day, and walking distance.',
    badgeColor: 'badge-plum',
  },
  all: {
    emoji: '🌆',
    name: 'All Zones',
    description: 'all locations across all modes',
    heroSubtitle: 'Curated urban discoveries across all modes, time of day, and walking distance.',
    badgeColor: 'badge-gray',
  }
};

export default function ExplorePage() {
  const { showToast, user } = useApp();
  const [filterMode, setFilterMode] = useState('all');
  const [zones, setZones] = useState([]);
  const [env, setEnv] = useState({ temperature: 24, aqi_grade: 'A+', weather_code: 0 });
  const { location, startTracking } = useGeolocation();

  useEffect(() => {
    // Fetch zones with optional age_group filtering
    getZones(null, filterMode === 'all' ? null : filterMode, user?.age_group)
      .then(setZones)
      .catch(console.error);
    startTracking();
  }, [filterMode, user?.age_group]);

  useEffect(() => {
    if (location) {
      getEnvironment(location.lat, location.lng).then(setEnv).catch(console.error);
    }
  }, [location?.lat, location?.lng]);

  // Time & Greeting
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

  // Filter zones by type and mode
  const DISCOVERIES = zones.filter(z => z.type === 'discover');
  const POPULAR = zones.filter(z => z.type === 'popular');

  // Apply mode filter to displayed discoveries
  const displayedDiscoveries = filterMode === 'all' 
    ? DISCOVERIES 
    : DISCOVERIES.filter(d => d.mode === filterMode);

  // Apply mode filter to popular zones as well
  const displayedPopular = filterMode === 'all'
    ? POPULAR
    : POPULAR.filter(p => p.mode === filterMode);

  // Get current mode config for hero section
  const modeConfig = MODE_CONFIG[filterMode] || MODE_CONFIG.all;

  return (
    <div className="page active" id="page-explore">
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Discover<br/><em>Bengaluru</em> ✦</div>
          <div className="greeting-sub">New places, hidden streets & local gems. Updated daily.</div>
        </div>
        
        <div className="sec-divider"><span className="sec-icon">◎</span><span className="sec-label">Filter by Mode</span><div className="sec-line"></div></div>
        <div className="modes-wrap">
          <div className={`mode-card calm ${filterMode === 'calm' ? 'active' : ''}`} onClick={() => setFilterMode('calm')}>
            <div className="mode-ico-wrap">🌿</div>
            <div className="mode-body"><div className="mode-title">Calm</div><div className="mode-desc">Parks, quiet streets, nature</div></div>
            <div className="mode-radio"></div>
          </div>
          <div className={`mode-card comfort ${filterMode === 'comfort' ? 'active' : ''}`} onClick={() => setFilterMode('comfort')}>
            <div className="mode-ico-wrap">☕</div>
            <div className="mode-body"><div className="mode-title">Comfort</div><div className="mode-desc">Cafés, cosy spots, rest</div></div>
            <div className="mode-radio"></div>
          </div>
          <div className={`mode-card explore ${filterMode === 'explore' ? 'active' : ''}`} onClick={() => setFilterMode('explore')}>
            <div className="mode-ico-wrap">🔭</div>
            <div className="mode-body"><div className="mode-title">Explore</div><div className="mode-desc">Hidden gems, art, culture</div></div>
            <div className="mode-radio"></div>
          </div>
          {filterMode !== 'all' && (
             <div style={{textAlign: 'center', marginTop: '4px', cursor: 'pointer', fontSize: '12px', color: 'var(--text2)'}} onClick={() => setFilterMode('all')}>
               Clear filter (Show all)
             </div>
          )}
        </div>

        <div className="sec-divider"><span className="sec-icon">★</span><span className="sec-label">City Score Today</span><div className="sec-line"></div></div>
        <div className="stats-grid" style={{ marginBottom: "20px" }}>
          <div className="stat-tile"><div className="stat-emoji">🌿</div><div className="stat-num">82<sup>%</sup></div><div className="stat-lbl">Calm</div></div>
          <div className="stat-tile"><div className="stat-emoji">🌬</div><div className="stat-num">{env.aqi_grade}</div><div className="stat-lbl">Air</div></div>
          <div className="stat-tile"><div className="stat-emoji">🌡</div><div className="stat-num">{env.temperature}<sup>°</sup></div><div className="stat-lbl">Temp</div></div>
        </div>
      </aside>

      <div className="right-panel explore-right">
        <div className="explore-hero">
          <h2>What's <em>waiting</em> for you today?</h2>
          <p>{modeConfig.heroSubtitle}</p>
          <div className="explore-hero-meta">
            <span className={`badge ${modeConfig.badgeColor}`}>{modeConfig.emoji} {modeConfig.name} Day</span>
            <span className="badge badge-gold">🌤 {env.temperature}° Bengaluru</span>
            <span className="badge badge-sky">📍 {zones.length} places nearby</span>
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <div className="section-h" style={{margin: 0}}>Featured <em>Discoveries</em></div>
          {user && <span style={{fontSize: '11px', color: 'var(--text2)', fontStyle: 'italic'}}>Recommended for you</span>}
        </div>
        <div className="discovery-grid anim-in">
          {displayedDiscoveries.length > 0 ? displayedDiscoveries.map((d, i) => (
            <div key={i} className="discovery-card" onClick={() => showToast(d.emoji, `${d.title} — navigating!`)}>
              <div className={`dc-thumb ${d.bg}`}><span style={{fontSize: '48px'}}>{d.emoji}</span></div>
              <div className="dc-body">
                <div className="dc-title">{d.title}</div>
                <div className="dc-sub">{d.sub}</div>
                <div className="dc-meta">
                  <span className="dc-dist">{d.dist}</span>
                  <span className={`badge badge-${d.badge}`}>{d.badgeTxt}</span>
                  <span className="dc-rating">★ {d.rating}</span>
                </div>
              </div>
            </div>
          )) : <p style={{fontSize: '12px', color: 'var(--text2)', fontStyle: 'italic'}}>No featured discoveries in this mode yet.</p>}
        </div>

        <div className="section-h" style={{marginTop: '32px'}}>Popular <em>Right Now</em></div>
        <div className="discovery-grid anim-in">
          {displayedPopular.length > 0 ? displayedPopular.map((p, i) => (
            <div key={'p'+i} className="discovery-card" onClick={() => showToast(p.emoji, `${p.title} — viewing!`)}>
              <div className={`dc-thumb ${p.bg}`}><span style={{fontSize: '48px'}}>{p.emoji}</span></div>
              <div className="dc-body">
                <div className="dc-title">{p.title}</div>
                <div className="dc-sub">{p.sub}</div>
                <div className="dc-meta">
                  <span className="dc-dist">{p.dist}</span>
                  <span className={`badge badge-${p.badge}`}>{p.badgeTxt}</span>
                  <span className="dc-rating">★ {p.rating}</span>
                </div>
              </div>
            </div>
          )) : <p style={{fontSize: '12px', color: 'var(--text2)', fontStyle: 'italic'}}>No popular places in this mode yet. Explore featured discoveries!</p>}
        </div>
      </div>
    </div>
  );
}
