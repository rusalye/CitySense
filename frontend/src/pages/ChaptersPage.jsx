import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getChapters } from '../services/api';

export default function ChaptersPage() {
  const { showToast, setActiveChapter } = useApp();
  const navigate = useNavigate();
  const [activeCityId, setActiveCityId] = useState('bengaluru');
  const [citiesData, setCitiesData] = useState([]);

  useEffect(() => {
    getChapters().then(setCitiesData).catch(e => console.error(e));
  }, []);

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

  const activeCity = citiesData.find(c => c.id === activeCityId);

  return (
    <div className="page active" id="page-chapters" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Urban<br/><em>Chapters</em> 🌍</div>
          <div className="greeting-sub">Cities as stories. Each area hides a <span className="gs-hi">chapter waiting to be walked.</span></div>
        </div>

        <div className="sec-divider"><span className="sec-icon">🌆</span><span className="sec-label">Your Cities</span><div className="sec-line"></div></div>
        <div className="city-selector">
          {citiesData.map(city => (
            <div 
              key={city.id} 
              className={`city-pill ${activeCityId === city.id ? 'selected' : ''}`} 
              onClick={() => setActiveCityId(city.id)}
            >
              <span className="cp-emoji">{city.emoji}</span>
              <div className="cp-info">
                <div className="cp-name">{city.name}</div>
                <div className="cp-meta">{city.comingSoon ? `Coming soon · ${city.country.split(',')[0]}` : `${city.chaptersUnlocked} / ${city.chaptersTotal} chapters · ${city.country.split(',')[0]}`}</div>
              </div>
              {city.userHere && <span className="cp-here">Here</span>}
            </div>
          ))}
        </div>

        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Progress</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">📖</div><div className="stat-num">1</div><div className="stat-lbl">Active</div></div>
          <div className="stat-tile"><div className="stat-emoji">✅</div><div className="stat-num">1</div><div className="stat-lbl">Complete</div></div>
          <div className="stat-tile"><div className="stat-emoji">🔒</div><div className="stat-num">1</div><div className="stat-lbl">Locked</div></div>
        </div>

        <div className="sec-divider"><span className="sec-icon">🎯</span><span className="sec-label">Next Stop</span><div className="sec-line"></div></div>
        <div style={{padding: '0 16px 20px'}}>
          <div style={{background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer'}} onClick={() => showToast('🌸','Head to Sankey Tank!')}>
            <div style={{fontSize: '18px', marginBottom: '6px'}}>🌸</div>
            <div style={{fontSize: '13px', fontWeight: '500', color: 'var(--text)', marginBottom: '3px'}}>Sankey Tank</div>
            <div style={{fontSize: '11px', color: 'var(--text2)', lineHeight: '1.5', marginBottom: '9px'}}>Stop 3 of 5 in <em style={{color: 'var(--gold)'}}>Malleshwaram</em> chapter</div>
            <div style={{height: '4px', background: 'var(--bg3)', borderRadius: '2px', overflow: 'hidden'}}><div style={{height: '100%', width: '40%', background: 'linear-gradient(90deg,var(--gold),var(--teal))', borderRadius: '2px'}}></div></div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '5px'}}>
              <span style={{fontSize: '10px', fontFamily: 'Courier Prime,monospace', color: 'var(--text3)'}}>2 / 5 stops done</span>
              <span style={{fontSize: '10px', fontFamily: 'Courier Prime,monospace', color: 'var(--gold)'}}>+280 XP on complete</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="right-panel chapters-right">
        <div className="chapters-hero">
          <h2 style={{fontFamily: 'Cormorant Garamond,serif', fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px', lineHeight: '1.2'}}>Cities as <em style={{fontStyle: 'italic', color: 'var(--gold)'}}>Living Stories</em></h2>
          <p style={{fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', maxWidth: '600px'}}>Every city has its own chapters — not narrative ones, but <em style={{color: 'var(--text)'}}>areas waiting to be walked</em>. From busy commercial streets to quiet old neighbourhoods, each urban chapter reveals a different layer of a place.</p>
          <div style={{display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap'}}>
            <span className="badge badge-teal">🌆 2 Cities</span>
            <span className="badge badge-gold">📖 3 Urban Chapters</span>
            <span className="badge badge-sky">✅ 1 Completed</span>
          </div>
        </div>

        <div className="ch-chapters-list anim-in" style={{paddingBottom: '32px'}}>
          {citiesData.map(city => {
            const isActive = city.id === activeCityId;
            return (
              <div key={city.id} className={`city-block ${isActive ? 'city-active' : ''}`}>
                <div className="city-header" onClick={() => setActiveCityId(city.id)}>
                  <div className="city-emblem" style={{background: `${city.colorHex}22`, borderColor: `${city.colorHex}44`}}>
                    <span>{city.emoji}</span>
                  </div>
                  <div className="city-header-info">
                    <div className="city-name-row">
                      <span className="city-name">{city.name}</span>
                      {city.userHere && <span className="city-you-badge">📍 You are here</span>}
                      {city.comingSoon && <span className="city-soon-badge">Coming Soon</span>}
                    </div>
                    <div className="city-sub">{city.country} · <em style={{color: city.colorHex, fontStyle: 'italic'}}>{city.tagline}</em></div>
                    {!city.comingSoon ? (
                      <div className="city-progress-row">
                        <div className="city-prog-track"><div className="city-prog-fill" style={{width: `${Math.round(city.chaptersUnlocked/city.chaptersTotal*100)}%`, background: city.colorHex}}></div></div>
                        <span className="city-prog-lbl">{city.chaptersUnlocked}/{city.chaptersTotal} chapters</span>
                      </div>
                    ) : (
                      <div className="city-sub" style={{marginTop: '6px'}}>Urban chapters being mapped — check back soon.</div>
                    )}
                  </div>
                  <div className="city-chevron">{isActive ? '▾' : '›'}</div>
                </div>

                {isActive && !city.comingSoon && (
                  <div className="city-chapters-list">
                    {city.chapters.map(ch => {
                      const statusIcon = ch.status === 'complete' ? '✅' : '🔶';
                      const handleChapterClick = () => {
                        setActiveChapter({
                          id: ch.id,
                          name: ch.area,
                          num: ch.num,
                          centerLat: ch.centerLat || 12.9716,
                          centerLng: ch.centerLng || 77.5946,
                          sensoryBase: ch.sensoryBase || { noise: 50, crowd: 50, air: 50, vibe: 50 }
                        });
                        showToast(ch.emoji, `Exploring ${ch.area}`);
                        navigate('/app/map');
                      };
                      return (
                        <div key={ch.id} className={`chapter-item ${ch.status === 'active' ? 'active-ch' : ''}`} onClick={handleChapterClick}>
                          <div className="ci-num" style={{borderColor: `${ch.colorHex}55`, color: ch.colorHex, background: `${ch.colorHex}12`}}>
                            {ch.emoji}
                          </div>
                          <div className="ci-info">
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px'}}>
                              <span className="ci-chapter-num" style={{color: ch.colorHex}}>{ch.num}</span>
                              <span className="ci-area">{ch.area}</span>
                              <span className="ci-status-icon">{statusIcon}</span>
                            </div>
                            <div className="ci-theme">{ch.theme}</div>
                            <div className="ci-desc">{ch.desc}</div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px'}}>
                              <div className="ci-stops-row">
                                {ch.stops.slice(0,3).map((s, i) => (
                                  <span key={i} className={`ci-stop ${i < ch.stopsVisited ? 'visited' : ''}`}>{i < ch.stopsVisited ? '✓' : String(i+1)}</span>
                                ))}
                                <span style={{fontSize: '10px', color: 'var(--text3)', fontFamily: "'Courier Prime',monospace"}}> +{ch.stopsTotal-3} more</span>
                              </div>
                            </div>
                            <div className="ci-progress" style={{marginTop: '8px'}}>
                              <div className="ci-track"><div className="ci-fill" style={{width: `${ch.progress}%`, background: ch.colorHex}}></div></div>
                              <div className="ci-pct">{ch.progress + '%'}</div>
                            </div>
                            <div className="ci-reward">🎁 {ch.xp} XP · {ch.card}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
