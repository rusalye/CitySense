import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DISCOVERIES, POPULAR } from '../data/mockData';

export default function ExplorePage() {
  const { showToast } = useApp();
  const [filterMode, setFilterMode] = useState('all');

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

  const displayedDiscoveries = filterMode === 'all' 
    ? DISCOVERIES 
    : DISCOVERIES.filter(d => d.mode === filterMode);

  return (
    <div className="page active" id="page-explore" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
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
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">🌿</div><div className="stat-num">82<sup>%</sup></div><div className="stat-lbl">Calm</div></div>
          <div className="stat-tile"><div className="stat-emoji">🌬</div><div className="stat-num">A<sup>+</sup></div><div className="stat-lbl">Air</div></div>
          <div className="stat-tile"><div className="stat-emoji">🌡</div><div className="stat-num">24<sup>°</sup></div><div className="stat-lbl">Temp</div></div>
        </div>
      </aside>

      <div className="right-panel explore-right">
        <div className="explore-hero">
          <h2>What's <em>waiting</em> for you today?</h2>
          <p>Curated urban discoveries based on your Calm mode, time of day, and walking distance from you.</p>
          <div className="explore-hero-meta">
            <span className="badge badge-teal">🌿 Calm Day</span>
            <span className="badge badge-gold">🌤 24° Bengaluru</span>
            <span className="badge badge-sky">📍 7 places nearby</span>
          </div>
        </div>

        <div className="section-h">Featured <em>Discoveries</em></div>
        <div className="discovery-grid anim-in">
          {displayedDiscoveries.map((d, i) => (
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
          ))}
        </div>

        <div className="section-h" style={{marginTop: '32px'}}>Popular <em>Right Now</em></div>
        <div className="discovery-grid anim-in">
          {POPULAR.map((p, i) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
