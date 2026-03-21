import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MAP_PLACES, MAP_STYLES } from '../data/mockData';
import { NavLink } from 'react-router-dom';

export default function MapPage() {
  const { user, mode, setMode, showToast, theme } = useApp();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

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

  const greet = new Date().getHours() < 12 ? 'Good morning,' : new Date().getHours() < 17 ? 'Good afternoon,' : 'Good evening,';

  // Sensory State Simulation
  const [sensory, setSensory] = useState({ noise: 22, crowd: 38, air: 76, vibe: 85 });
  useEffect(() => {
    const nS=[22,18,28,15,25,20,16], cS=[38,44,35,50,40,30,45], aS=[74,78,82,72,80,86,76], vS=[85,90,88,82,92,87,84];
    let si = 0;
    const updateS = () => {
      si = (si + 1) % nS.length;
      setSensory({ noise: nS[si], crowd: cS[si], air: aS[si], vibe: vS[si] });
    };
    const i = setInterval(updateS, 3500);
    return () => clearInterval(i);
  }, []);

  // Map Initialization
  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps && mapRef.current && !mapInstance.current) {
        clearInterval(checkGoogleMaps);
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 12.9716, lng: 77.5946 }, zoom: 14,
          styles: MAP_STYLES[theme === 'light' ? 'light' : 'dark'][mode],
          disableDefaultUI: true, gestureHandling: 'greedy',
        });
        
        MAP_PLACES.forEach((p, i) => {
          const m = new window.google.maps.Marker({
            position: { lat: p.lat, lng: p.lng }, map: mapInstance.current,
            icon: {
              path: 'M 0,-16 C -9,-16 -16,-9 -16,0 C -16,9 0,22 0,22 C 0,22 16,9 16,0 C 16,-9 9,-16 0,-16 Z',
              fillColor: p.color, fillOpacity: .92, strokeColor: 'rgba(255,255,255,.25)', 
              strokeWeight: 1.5, scale: 1, anchor: new window.google.maps.Point(0, 22), 
              labelOrigin: new window.google.maps.Point(0, 0)
            },
            label: { text: p.emoji, fontSize: '14px' },
            animation: window.google.maps.Animation.DROP,
          });
          m.addListener('click', () => {
             // Handle place click mapping behavior natively to React state if needed.
             // Currently invoking toast to emulate interaction.
             showToast(p.emoji, `Picked ${p.emoji} area!`);
             mapInstance.current.setCenter({ lat: p.lat, lng: p.lng });
          });
        });
      }
    }, 500);
    return () => clearInterval(checkGoogleMaps);
  }, []);

  // Map Style Reactivity Layer
  useEffect(() => {
    if (mapInstance.current && window.google) {
      mapInstance.current.setOptions({ styles: MAP_STYLES[theme === 'light' ? 'light' : 'dark'][mode] });
    }
  }, [theme, mode]);

  const locateMe = () => {
    if (!mapInstance.current) return showToast('⏳', 'Map loading…');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapInstance.current.setCenter(ll);
        mapInstance.current.setZoom(16);
        new window.google.maps.Marker({
          position: ll, map: mapInstance.current,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#5eb88a', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
        });
        showToast('◎', 'Located you!');
      }, () => showToast('⚠️', 'Location unavailable'));
    }
  };

  return (
    <div className="page active full-right map-container-grid" id="page-map" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
      
      {/* LEFT PANEL */}
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">
            {greet}<br/><em>{user.name}</em> <span className="wave">👋</span>
          </div>
          <div className="greeting-sub">The city is <span className="gs-hi">calm right now</span>. You're walking <span className="gs-hi">Malleshwaram</span> chapter.</div>
        </div>

        {/* Profile Mini */}
        <NavLink to="/app/settings" className="profile-mini" style={{textDecoration: 'none'}}>
          <div className="pm-avatar">{user.initial}</div>
          <div className="pm-info">
            <div className="pm-name">{user.name}</div>
            <div className="pm-xp-row">
              <span className="pm-xp-label">Lv {user.level} · {user.rank}</span>
              <div className="pm-xp-track"><div className="pm-xp-fill" style={{width: '68%'}}></div></div>
              <span className="pm-xp-pct">68%</span>
            </div>
          </div>
          <span className="pm-arrow">›</span>
        </NavLink>

        {/* Active Mode Banner */}
        <div className="active-banner">
          <div className="ab-dot" style={{ background: mode === 'calm' ? 'var(--teal)' : mode === 'comfort' ? 'var(--gold)' : 'var(--plum2)' }}></div>
          <div className="ab-text">
            <strong>{mode === 'calm' ? 'Calm Mode' : mode === 'comfort' ? 'Comfort Mode' : 'Explore Mode'}</strong> · 
            <span>{mode === 'calm' ? ' Low noise, green routes' : mode === 'comfort' ? ' Cafés & rest spots' : ' Discover the unknown'}</span>
          </div>
          <div className="ab-badge">Active</div>
        </div>

        {/* Experience Modes */}
        <div className="sec-divider"><span className="sec-icon">⊹</span><span className="sec-label">Experience Mode</span><div className="sec-line"></div></div>
        <div className="modes-wrap">
          <div className={`mode-card calm ${mode === 'calm' ? 'active' : ''}`} onClick={() => { setMode('calm'); showToast('🌿', 'Calm Mode activated'); }}>
            <div className="mode-ico-wrap">🌿</div>
            <div className="mode-body"><div className="mode-title">Calm</div><div className="mode-desc">Quiet routes, parks & green pockets</div></div>
            <div className="mode-radio"></div>
          </div>
          <div className={`mode-card comfort ${mode === 'comfort' ? 'active' : ''}`} onClick={() => { setMode('comfort'); showToast('☕', 'Comfort Mode activated'); }}>
            <div className="mode-ico-wrap">☕</div>
            <div className="mode-body"><div className="mode-title">Comfort</div><div className="mode-desc">Cozy cafés, rest stops, familiar paths</div></div>
            <div className="mode-radio"></div>
          </div>
          <div className={`mode-card explore ${mode === 'explore' ? 'active' : ''}`} onClick={() => { setMode('explore'); showToast('🔭', 'Explore Mode activated'); }}>
            <div className="mode-ico-wrap">🔭</div>
            <div className="mode-body"><div className="mode-title">Explore</div><div className="mode-desc">Hidden gems, art lanes & chapters</div></div>
            <div className="mode-radio"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Today's Journey</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile" onClick={() => showToast('👟','12,480 steps today!')}><div className="stat-emoji">👟</div><div className="stat-num">12<sup>k</sup></div><div className="stat-lbl">Steps</div></div>
          <div className="stat-tile" onClick={() => showToast('📍','7 places visited!')}><div className="stat-emoji">📍</div><div className="stat-num">7</div><div className="stat-lbl">Places</div></div>
          <div className="stat-tile" onClick={() => showToast('🃏','3 new cards!')}><div className="stat-emoji">🃏</div><div className="stat-num">3</div><div className="stat-lbl">Cards</div></div>
        </div>

        {/* Nearby list */}
        <div className="sec-divider"><span className="sec-icon">◉</span><span className="sec-label">Nearby</span><div className="sec-line"></div></div>
        <div className="places-list">
          <div className="place-row" onClick={() => showToast('🌳', 'Cubbon Park')}>
            <div className="place-thumb">🌳</div>
            <div className="place-details">
              <div className="place-name-row"><span className="place-nm">Cubbon Park</span><span className="place-hot">Trending</span></div>
              <div className="place-meta-row"><span className="place-dist">150m</span><span className="place-tag">Green</span><span className="place-mode-dot" style={{background:'var(--teal)'}}></span></div>
            </div>
            <div className="place-rating"><span className="rating-num">4.8</span><span className="rating-stars">★★★★★</span></div>
          </div>
          <div className="place-row" onClick={() => showToast('☕', 'Matteo Coffee')}>
            <div className="place-thumb">☕</div>
            <div className="place-details">
              <div className="place-name-row"><span className="place-nm">Matteo Coffee</span></div>
              <div className="place-meta-row"><span className="place-dist">320m</span><span class="place-tag">Café</span><span className="place-mode-dot" style={{background:'var(--gold)'}}></span></div>
            </div>
            <div className="place-rating"><span className="rating-num">4.6</span><span className="rating-stars">★★★★½</span></div>
          </div>
          <div className="place-row" onClick={() => showToast('🎨', 'Pottery Lane')}>
            <div className="place-thumb">🎨</div>
            <div className="place-details">
              <div className="place-name-row"><span className="place-nm">Pottery Lane</span><span className="place-hot">Hidden Gem</span></div>
              <div className="place-meta-row"><span className="place-dist">0.8km</span><span className="place-tag">Art</span><span className="place-mode-dot" style={{background:'var(--plum2)'}}></span></div>
            </div>
            <div className="place-rating"><span className="rating-num">4.9</span><span className="rating-stars">★★★★★</span></div>
          </div>
          <div className="place-row" onClick={() => showToast('🚶', 'MG Road Walk')}>
            <div className="place-thumb">🚶</div>
            <div className="place-details">
              <div className="place-name-row"><span className="place-nm">MG Road Walk</span></div>
              <div className="place-meta-row"><span className="place-dist">1.2km</span><span className="place-tag">Heritage</span><span className="place-mode-dot" style={{background:'var(--sky)'}}></span></div>
            </div>
            <div className="place-rating"><span className="rating-num">4.5</span><span className="rating-stars">★★★★½</span></div>
          </div>
          <div className="place-row" onClick={() => showToast('🌊', 'Ulsoor Lake Walk')}>
            <div className="place-thumb">🌊</div>
            <div className="place-details">
              <div className="place-name-row"><span className="place-nm">Ulsoor Lake</span><span className="place-hot">Sunrise</span></div>
              <div className="place-meta-row"><span className="place-dist">1.8km</span><span className="place-tag">Lakeside</span><span className="place-mode-dot" style={{background:'var(--teal)'}}></span></div>
            </div>
            <div className="place-rating"><span className="rating-num">4.7</span><span className="rating-stars">★★★★★</span></div>
          </div>
        </div>

        {/* STREET CARDS */}
        <div className="sec-divider"><span className="sec-icon">🃏</span><span className="sec-label">Street Cards</span><div className="sec-line"></div></div>
        <div className="cards-scroll-wrap">
          <div className="cards-scroll">
            <NavLink to="/app/cards" className="street-card sc-green" style={{textDecoration:'none'}}><div className="sc-badge">✓</div><span className="sc-glyph">🌸</span><div className="sc-name">Blossom Corner</div><div className="sc-type">Green · Rare</div></NavLink>
            <NavLink to="/app/cards" className="street-card sc-sky" style={{textDecoration:'none'}}><div className="sc-badge">✓</div><span className="sc-glyph">🌙</span><div className="sc-name">Night Lantern</div><div className="sc-type">Night · Rare</div></NavLink>
            <NavLink to="/app/cards" className="street-card sc-gold" style={{textDecoration:'none'}}><span className="sc-glyph">🏛</span><div className="sc-name">Heritage Walk</div><div className="sc-type">Cultural · Locked</div><div className="sc-locked">🔒</div></NavLink>
            <NavLink to="/app/cards" className="street-card sc-plum" style={{textDecoration:'none'}}><span className="sc-glyph">🔮</span><div className="sc-name">Hidden Alcove</div><div className="sc-type">Mystery · Epic</div><div className="sc-locked">🔒</div></NavLink>
            <NavLink to="/app/cards" className="street-card sc-coral" style={{textDecoration:'none'}}><span className="sc-glyph">🌅</span><div className="sc-name">Dawn Walker</div><div className="sc-type">Morning · Epic</div><div className="sc-locked">🔒</div></NavLink>
          </div>
        </div>

      </aside>

      {/* RIGHT PANEL: MAP */}
      <div className="right-panel">
        <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
        <div className="map-vignette"></div>
        
        {/* Map UI Overlays */}
        <div className="map-ui">
          <div className="map-top">
            <div className="map-mode-chip">
              <div className="mmc-dot" style={{ background: mode === 'calm' ? 'var(--teal)' : mode === 'comfort' ? 'var(--gold)' : 'var(--plum2)' }}></div>
              <span>{mode === 'calm' ? '🌿 Calm Mode' : mode === 'comfort' ? '☕ Comfort Mode' : '🔭 Explore Mode'}</span>
            </div>
            <div className="filter-row">
              <div className="fchip active fc-teal">🌿 Green</div>
              <div className="fchip active fc-sky">🚶 Walks</div>
              <div className="fchip active fc-gold">🏛 Heritage</div>
              <div className="fchip">☕ Cafés</div>
              <div className="fchip">🎨 Art</div>
              <div className="fchip">📍 Hidden</div>
              <div className="fchip">🌊 Lakeside</div>
            </div>
          </div>
          
          <div className="sensory-panel">
            <div className="sp-header"><span className="sp-title">Sensory Awareness</span><div className="sp-pulse"></div></div>
            <div className="sp-row"><span className="sp-icon">🔊</span><span className="sp-label">Noise</span><div className="sp-track"><div className={`sp-fill ${sensory.noise < 30 ? 'sf-green' : sensory.noise < 60 ? 'sf-yellow' : 'sf-red'}`} style={{width: `${sensory.noise}%`}}></div></div><span className="sp-val">{sensory.noise < 30 ? 'Low' : sensory.noise < 60 ? 'Mid' : 'High'}</span></div>
            <div className="sp-row"><span className="sp-icon">👥</span><span className="sp-label">Crowd</span><div className="sp-track"><div className="sp-fill sf-yellow" style={{width: `${sensory.crowd}%`}}></div></div><span className="sp-val">{sensory.crowd < 30 ? 'Low' : sensory.crowd < 60 ? 'Mid' : 'High'}</span></div>
            <div className="sp-row"><span className="sp-icon">🌬</span><span className="sp-label">Air</span><div className="sp-track"><div className="sp-fill sf-green" style={{width: `${sensory.air}%`}}></div></div><span className="sp-val">{sensory.air > 70 ? 'Good' : sensory.air > 40 ? 'Fair' : 'Poor'}</span></div>
            <div className="sp-row"><span className="sp-icon">✨</span><span className="sp-label">Vibe</span><div className="sp-track"><div className="sp-fill sf-blue" style={{width: `${sensory.vibe}%`}}></div></div><span className="sp-val">{sensory.vibe > 80 ? 'High' : sensory.vibe > 50 ? 'Mid' : 'Low'}</span></div>
          </div>

          <div className="map-controls">
            <div className="mctrl" onClick={() => mapInstance.current && mapInstance.current.setZoom(mapInstance.current.getZoom()+1)}>＋</div>
            <div className="mctrl" onClick={() => mapInstance.current && mapInstance.current.setZoom(mapInstance.current.getZoom()-1)}>－</div>
            <div className="mctrl" onClick={locateMe}>◎</div>
            <div className="mctrl" onClick={() => showToast('⊞','Map layers')}>⊞</div>
            <div className="mctrl" onClick={() => showToast('⇝','Route planner')}>⇝</div>
          </div>
          <div className="map-bottom">
            <div className="map-legend">
              <div className="ml-title">Map Key</div>
              <div className="ml-row"><div className="ml-dot" style={{background:'var(--teal)'}}></div>Calm / Green</div>
              <div className="ml-row"><div className="ml-dot" style={{background:'var(--gold)'}}></div>Comfort</div>
              <div className="ml-row"><div className="ml-dot" style={{background:'var(--plum2)'}}></div>Explore</div>
              <div className="ml-row"><div className="ml-line" style={{background:'var(--sky)'}}></div>Walk routes</div>
            </div>
            <div className="chapter-card">
              <div className="cc-label">📖 Current Chapter</div>
              <div className="cc-chapter"><em>Malleshwaram</em></div>
              <div style={{fontSize:'10px',fontFamily:'Courier Prime,monospace',color:'var(--text3)',marginBottom:'6px'}}>Chapter II · Bengaluru</div>
              <div className="cc-progress"><div className="cc-track"><div className="cc-fill" style={{width:'40%'}}></div></div><span className="cc-pct">40%</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
