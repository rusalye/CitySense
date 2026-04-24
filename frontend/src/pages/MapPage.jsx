import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MAP_STYLES } from '../data/mockData';
import { NavLink, useNavigate } from 'react-router-dom';
import { getEnvironment, getZones, getChapters } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';

export default function MapPage() {
  const { user, mode, setMode, showToast, theme, activeChapter, setActiveChapter, selectedZone, setSelectedZone } = useApp();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const dirRenderer = useRef(null);
  const dirService = useRef(null);
  const markersRef = useRef([]);
  const { location, startTracking } = useGeolocation();
  const [env, setEnv] = useState({ temperature: 24, aqi: 50, aqi_grade: 'A+' });
  const [zones, setZones] = useState([]);

  // Frontend Filtering System
  const AVAILABLE_FILTERS = React.useMemo(() => [
    { label: '🌿 Green', keys: ['green', 'park', 'nature', 'botanical'], color: 'teal' },
    { label: '🚶 Walks', keys: ['walk', 'stroll', 'path'], color: 'sky' },
    { label: '🏛 Heritage', keys: ['heritage', 'history', 'temple', 'church', 'historic'], color: 'gold' },
    { label: '☕ Cafés', keys: ['cafe', 'coffee', 'bakery', 'brew', 'stall'], color: 'gold' },
    { label: '🎨 Art', keys: ['art', 'gallery', 'museum'], color: 'plum' },
    { label: '📍 Hidden', keys: ['hidden', 'explore', 'secret', 'discover'], color: 'plum2' },
    { label: '🌊 Lakeside', keys: ['lake', 'water'], color: 'sky' }
  ], []);

  const [activeFilters, setActiveFilters] = useState([]);
  const toggleFilter = (fLabel) => {
    setActiveFilters(prev => prev.includes(fLabel) ? prev.filter(l => l !== fLabel) : [...prev, fLabel]);
  };

  const filteredZones = React.useMemo(() => {
    let res = zones.filter(z => z.mode === mode);
    if (activeFilters.length > 0) {
      const searchTerms = activeFilters.flatMap(fLabel => {
         const found = AVAILABLE_FILTERS.find(f => f.label === fLabel);
         return found ? found.keys : [];
      });
      res = res.filter(z => {
        const txt = `${z.title} ${z.description} ${z.badgeTxt}`.toLowerCase();
        return searchTerms.some(term => txt.includes(term));
      });
    }
    return res;
  }, [zones, mode, activeFilters, AVAILABLE_FILTERS]);

  const [activeRoute, setActiveRoute] = useState(null);
  const destMarkerRef = useRef(null);

  useEffect(() => {
    startTracking();
  }, []);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState(330);
  const dragState = useRef({ isDragging: false, startX: 0, startWidth: 330 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState.current.isDragging) return;
      const dx = dragState.current.startX - e.clientX;
      const newWidth = Math.max(260, Math.min(dragState.current.startWidth + dx, 600));
      setRightPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (dragState.current.isDragging) {
        dragState.current.isDragging = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeStart = (e) => {
    dragState.current = { isDragging: true, startX: e.clientX, startWidth: rightPanelWidth };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  useEffect(() => {
    if (activeChapter) {
      getZones(activeChapter.id).then(setZones).catch(console.error);
    }
  }, [activeChapter]);

  useEffect(() => {
    if (mapInstance.current && activeChapter && window.google) {
      mapInstance.current.panTo({ lat: activeChapter.centerLat, lng: activeChapter.centerLng });
      mapInstance.current.setZoom(14);
    }
  }, [activeChapter]);

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

  const greet = new Date().getHours() < 12 ? 'Good morning,' : new Date().getHours() < 17 ? 'Good afternoon,' : 'Good evening,';

  // Sensory State Simulation
  const [sensory, setSensory] = useState({ noise: 22, crowd: 38, air: 76, vibe: 85 });
  useEffect(() => {
    if (!activeChapter) return;
    const base = activeChapter.sensoryBase || { noise: 50, crowd: 50, air: 50, vibe: 50 };
    const updateS = () => {
      setSensory({ 
        noise: Math.min(100, Math.max(0, base.noise + Math.floor(Math.random() * 10 - 5))), 
        crowd: Math.min(100, Math.max(0, base.crowd + Math.floor(Math.random() * 8 - 4))), 
        air: Math.min(100, Math.max(0, base.air + Math.floor(Math.random() * 12 - 6))), 
        vibe: Math.min(100, Math.max(0, base.vibe + Math.floor(Math.random() * 5 - 2))) 
      });
    };
    updateS();
    const i = setInterval(updateS, 3500);
    return () => clearInterval(i);
  }, [activeChapter]);

  // Dropdown chapters
  const navigate = useNavigate();
  const [availableChapters, setAvailableChapters] = useState([]);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);
  useEffect(() => {
    getChapters().then(cities => {
      const b = cities.find(c => c.name === 'Bengaluru' || c.id === 'bengaluru');
      if(b) setAvailableChapters(b.chapters);
    }).catch(console.error);
  }, []);

  // Map Initialization
  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps && mapRef.current && !mapInstance.current) {
        clearInterval(checkGoogleMaps);
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: activeChapter ? activeChapter.centerLat : 12.9716, lng: activeChapter ? activeChapter.centerLng : 77.5946 }, zoom: 14,
          styles: MAP_STYLES[theme === 'light' ? 'light' : 'dark'][mode],
          disableDefaultUI: true, gestureHandling: 'greedy',
        });
        
        dirService.current = new window.google.maps.DirectionsService();
        dirRenderer.current = new window.google.maps.DirectionsRenderer({
          map: mapInstance.current, suppressMarkers: true,
          polylineOptions: { strokeColor: '#5eb88a', strokeOpacity: 0.8, strokeWeight: 5 }
        });
      }
    }, 500);
    return () => {
      clearInterval(checkGoogleMaps);
      mapInstance.current = null;
    };
  }, [theme, mode]);

  // Route Drawing Logic
  const drawRoute = (zone) => {
    if (!dirService.current || !dirRenderer.current) return;
    const origin = location ? { lat: location.lat, lng: location.lng } : { lat: 12.9716, lng: 77.5946 };
    dirService.current.route({
      origin: origin,
      destination: { lat: zone.lat, lng: zone.lng },
      travelMode: window.google.maps.TravelMode.WALKING
    }, (result, status) => {
      if (status === 'OK') {
        dirRenderer.current.setDirections(result);
        setActiveRoute(zone);
        if (destMarkerRef.current) destMarkerRef.current.setMap(null);
        destMarkerRef.current = new window.google.maps.Marker({
          position: { lat: zone.lat, lng: zone.lng },
          map: mapInstance.current,
          icon: {
            path: 'M 0,-16 C -9,-16 -16,-9 -16,0 C -16,9 0,22 0,22 C 0,22 16,9 16,0 C 16,-9 9,-16 0,-16 Z',
            fillColor: '#8B2525', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2, scale: 1.5, anchor: new window.google.maps.Point(0, 22)
          },
          label: { text: "🏁", fontSize: "16px" }
        });
        showToast('⇝', `Navigating to ${zone.title}`);
      } else {
        showToast('⚠️', 'Route unavailable');
      }
    });
  };

  const endRoute = () => {
    setActiveRoute(null);
    if (dirRenderer.current) dirRenderer.current.setDirections({ routes: [] });
    if (destMarkerRef.current) { destMarkerRef.current.setMap(null); destMarkerRef.current = null; }
    showToast('✕', 'Navigation ended');
    
    if (selectedZone && mapInstance.current) {
       mapInstance.current.panTo({ lat: selectedZone.lat, lng: selectedZone.lng });
       mapInstance.current.setZoom(16);
    }
  };

  // Render Dynamic Zones
  useEffect(() => {
    if (!mapInstance.current || !window.google) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    filteredZones.forEach(p => {
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
         showToast(p.emoji, p.title);
         mapInstance.current.setCenter({ lat: p.lat, lng: p.lng });
         setSelectedZone(p);
      });
      m.zoneId = p.id;
      m.origColor = p.color;
      markersRef.current.push(m);
    });
  }, [filteredZones, location]);

  // Dynamic Pin Highlighting & Zoom Scaling
  useEffect(() => {
    if (!mapInstance.current || !window.google) return;
    
    const updateMarkers = () => {
      const zoom = mapInstance.current.getZoom();
      let scaleBase = 1.0;
      if (zoom <= 11) scaleBase = 0.4;
      else if (zoom === 12) scaleBase = 0.6;
      else if (zoom === 13) scaleBase = 0.8;
      else if (zoom >= 16) scaleBase = 1.2;

      markersRef.current.forEach(m => {
        const isSelected = selectedZone?.id === m.zoneId;
        const currentIcon = m.getIcon();
        if (currentIcon) {
          m.setIcon({
            ...currentIcon,
            fillColor: m.origColor,
            scale: isSelected ? scaleBase * 1.5 : scaleBase,
            strokeColor: isSelected ? '#ffffff' : 'rgba(255,255,255,.25)',
            strokeWeight: isSelected ? 3 : 1.5
          });
          if (isSelected && !activeRoute) {
            m.setZIndex(100);
          } else {
            m.setZIndex(1);
          }
        }
      });
    };

    updateMarkers(); // Init on state change
    const listener = mapInstance.current.addListener('zoom_changed', updateMarkers);
    return () => window.google.maps.event.removeListener(listener);
  }, [selectedZone, activeRoute]);

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
    <div className="page active map-container-grid" id="page-map" style={{ display: 'grid', gridTemplateColumns: `320px 1fr ${rightPanelWidth}px` }}>
      
      {/* LEFT PANEL */}
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">
            {greet}<br/><em>{user.name}</em> <span className="wave">👋</span>
          </div>
          <div className="greeting-sub">The city is <span className="gs-hi">calm right now</span>. You're exploring the <span className="gs-hi">{activeChapter?.name.split(' / ')[0]}</span> chapter.</div>
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
      <div className="right-panel" style={{ height: '100%' }}>
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
              {AVAILABLE_FILTERS.map(f => {
                const isActive = activeFilters.includes(f.label);
                return (
                  <div key={f.label} 
                       className={`fchip ${isActive ? `active fc-${f.color}` : ''}`} 
                       onClick={() => toggleFilter(f.label)}>
                    {f.label}
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="sensory-panel">
            <div className="sp-header"><span className="sp-title">Sensory Awareness</span><div className="sp-pulse"></div></div>
            <div className="sp-row"><span className="sp-icon">🌡</span><span className="sp-label">Temp</span><div className="sp-track"><div className={`sp-fill sf-yellow`} style={{width: `${Math.min(100, Math.max(10, (env.temperature / 45) * 100))}%`}}></div></div><span className="sp-val">{env.temperature}°C</span></div>
            <div className="sp-row"><span className="sp-icon">👥</span><span className="sp-label">Crowd</span><div className="sp-track"><div className="sp-fill sf-yellow" style={{width: `${env.crowdPerc}%`}}></div></div><span className="sp-val">{env.crowd}</span></div>
            <div className="sp-row"><span className="sp-icon">🌬</span><span className="sp-label">Air AQI</span><div className="sp-track"><div className={`sp-fill ${env.aqi < 50 ? 'sf-green' : env.aqi < 100 ? 'sf-yellow' : 'sf-red'}`} style={{width: `${Math.min(100, Math.max(10, (env.aqi / 200) * 100))}%`}}></div></div><span className="sp-val">{env.aqi_grade}</span></div>
            <div className="sp-row"><span className="sp-icon">✨</span><span className="sp-label">Vibe</span><div className="sp-track"><div className="sp-fill sf-blue" style={{width: `${mode === 'calm' ? 80 : mode === 'comfort' ? 60 : 90}%`}}></div></div><span className="sp-val">{mode === 'calm' ? 'Peaceful' : mode === 'comfort' ? 'Cozy' : 'Electric'}</span></div>
          </div>

          <div className="map-controls">
            <div className="mctrl" onClick={() => mapInstance.current && mapInstance.current.setZoom(mapInstance.current.getZoom()+1)}>＋</div>
            <div className="mctrl" onClick={() => mapInstance.current && mapInstance.current.setZoom(mapInstance.current.getZoom()-1)}>－</div>
            <div className="mctrl" onClick={locateMe}>◎</div>
          </div>
          <div className="map-bottom" style={{ pointerEvents: 'none' }}>
            <div className="map-legend" style={{ pointerEvents: 'auto' }}>
              <div className="ml-title">Map Key</div>
              <div className="ml-row"><div className="ml-dot" style={{background:'var(--teal)'}}></div>Calm / Green</div>
              <div className="ml-row"><div className="ml-dot" style={{background:'var(--gold)'}}></div>Comfort</div>
              <div className="ml-row"><div className="ml-dot" style={{background:'var(--plum2)'}}></div>Explore</div>
              <div className="ml-row"><div className="ml-line" style={{background:'var(--sky)'}}></div>Walk routes</div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* EXTREME RIGHT PANEL: PLACES & CHAPTER */}
      <aside className="places-panel anim-in-right" style={{ background: 'var(--bg)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        
        {/* Resize Handle */}
        <div 
          onMouseDown={handleResizeStart}
          style={{ position: 'absolute', top: 0, left: '-3px', width: '6px', height: '100%', cursor: 'col-resize', zIndex: 100, background: 'transparent' }}
          onMouseEnter={(e) => { if (!dragState.current.isDragging) e.currentTarget.style.background = 'var(--gold)'; }}
          onMouseLeave={(e) => { if (!dragState.current.isDragging) e.currentTarget.style.background = 'transparent'; }}
        />

        {/* Sticky Header with City & Dropdown */}
        <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', zIndex: 10, position: 'relative' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Area Explorer</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text2)', fontWeight: 500 }}>🌆 Bengaluru <span style={{opacity:0.4}}>/</span></span>
            
            <div onClick={() => setIsChapterMenuOpen(!isChapterMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', fontWeight: 600, cursor: 'pointer', background: 'var(--card)', padding: '5px 10px', borderRadius: '10px', border: '1px solid var(--border2)' }}>
              {activeChapter?.emoji} {activeChapter?.name.split(' / ')[0]} <span style={{fontSize:'10px', color:'var(--text3)'}}>▾</span>
            </div>
          </div>
          
          {isChapterMenuOpen && (
            <div className="anim-in" style={{ position: 'absolute', top: 'calc(100% - 10px)', left: '16px', right: '16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '12px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: '10px', fontFamily:'Courier Prime,monospace', color: 'var(--text3)', padding: '6px 8px', textTransform: 'uppercase' }}>Available Chapters</div>
              {availableChapters.map(c => (
                <div key={c.id} onClick={() => {
                    setActiveChapter({ id: c.id, name: c.area, num: c.num, centerLat: c.centerLat, centerLng: c.centerLng, sensoryBase: c.sensoryBase, emoji: c.emoji });
                    setIsChapterMenuOpen(false);
                  }} 
                  style={{ padding: '12px 14px', borderRadius: '14px', cursor: 'pointer', background: c.id === activeChapter?.id ? 'var(--bg)' : 'transparent', border: '1px solid', borderColor: c.id === activeChapter?.id ? 'var(--border2)' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '20px' }}>{c.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{c.area.split(' / ')[0]}</div>
                    <div style={{ fontSize: '10px', fontFamily: 'Courier Prime,monospace', color: 'var(--text3)', marginTop: '2px' }}>{c.theme.substring(0, 22)}..</div>
                  </div>
                </div>
              ))}
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
              <div onClick={() => { navigate('/app/chapters'); setIsChapterMenuOpen(false); }} style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'Courier Prime,monospace' }}>VIEW ALL OVERVIEW ↗</div>
            </div>
          )}
        </div>

        {/* Vertical Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           {filteredZones.length === 0 ? (
             <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: '40px', fontSize: '13px' }}>
               No places found for your current vibe.
             </div>
           ) : filteredZones.map(z => (
             <div key={z.id} onClick={() => {
               setSelectedZone(selectedZone?.id === z.id ? null : z);
               if(mapInstance.current) {
                 mapInstance.current.panTo({ lat: z.lat, lng: z.lng });
               }
             }} style={{ flexShrink: 0, width: '100%', background: 'var(--card)', borderRadius: '20px', border: selectedZone?.id === z.id ? `2px solid ${z.color}` : '1px solid var(--border)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', transform: selectedZone?.id === z.id ? 'translateX(-4px)' : 'none', boxShadow: selectedZone?.id === z.id ? `0 8px 24px ${z.color}33` : '0 4px 12px rgba(0,0,0,0.1)' }}>
               <div style={{ height: '140px', width: '100%', background: `url(${z.image_url}) center/cover no-repeat`, position: 'relative' }}>
                 <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{z.emoji}</div>
                 <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '10px', fontSize: '11px', color: '#fff', fontWeight: 600 }}>★ {z.rating}</div>
               </div>
               <div style={{ padding: '16px' }}>
                 <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{z.title}</div>
                 <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{z.dist} away · {z.badgeTxt}</div>
                 
                 {/* Accordion Expansion */}
                 {selectedZone?.id === z.id && (
                   <div className="anim-in" style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                     <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                       <span className={`badge badge-${z.badge}`}>{z.badgeTxt}</span>
                       <span className="badge badge-sky" style={{textTransform: 'capitalize'}}>{z.mode}</span>
                     </div>
                     <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--text2)', lineHeight: '1.5' }}>{z.description}</p>
                     {activeRoute?.id === z.id ? (
                       <button className="pc-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--card2)', padding: '12px', borderRadius: '14px', color: 'var(--red, #d45b8a)', fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13.5px' }} onClick={(e) => { e.stopPropagation(); endRoute(); }}>
                         <span>✕</span> End Route ({activeRoute.dist})
                       </button>
                     ) : (
                       <button className="pc-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: z.color || 'var(--gold)', padding: '12px', borderRadius: '14px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '13.5px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }} onClick={(e) => { e.stopPropagation(); drawRoute(z); }}>
                         <span>✦</span> Navigate Here
                       </button>
                     )}
                   </div>
                 )}
               </div>
             </div>
           ))}
        </div>
      </aside>
    </div>
  );
}
