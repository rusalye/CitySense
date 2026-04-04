import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getJournal } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';

export default function JournalPage() {
  const { showToast } = useApp();
  const [journalData, setJournalData] = useState([]);
  const { isTracking, startTracking, stopTracking, distanceKm, steps } = useGeolocation();

  useEffect(() => {
    getJournal().then(setJournalData).catch(e => console.error(e));
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

  return (
    <div className="page active" id="page-journal" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Your<br/><em>City Journal</em> 📖</div>
          <div className="greeting-sub">Every walk tells a story. <span className="gs-hi">{journalData.length} entries</span> written so far.</div>
        </div>
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Journal Stats</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">📝</div><div className="stat-num">{journalData.length}</div><div className="stat-lbl">Entries</div></div>
          {isTracking ? (
             <div className="stat-tile" style={{border: '1px solid var(--teal)'}}><div className="stat-emoji">👟</div><div className="stat-num" style={{color: 'var(--teal)'}}>{steps}</div><div className="stat-lbl">Live Steps</div></div>
          ) : (
             <div className="stat-tile"><div className="stat-emoji">🚶</div><div className="stat-num">38<sup>k</sup></div><div className="stat-lbl">Total km</div></div>
          )}
          <div className="stat-tile"><div className="stat-emoji">🗺</div><div className="stat-num">12</div><div className="stat-lbl">Zones</div></div>
        </div>
        
        <div className="sec-divider"><span className="sec-icon">🌙</span><span className="sec-label">Best Moods</span><div className="sec-line"></div></div>
        <div style={{padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><span style={{fontSize: '18px'}}>😌</span><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Peaceful walks</span><span className="badge badge-teal">8 times</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><span style={{fontSize: '18px'}}>🤩</span><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Excited discoveries</span><span className="badge badge-gold">4 times</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><span style={{fontSize: '18px'}}>☕</span><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Cozy afternoons</span><span className="badge badge-sky">2 times</span></div>
        </div>
      </aside>

      <div className="right-panel journal-right">
        <div className="journal-header">
          <div className="section-h">Walking <em>Stories</em></div>
          {isTracking ? (
              <button className="add-btn" style={{background: 'var(--card)', color: 'var(--red)', border: '1px solid var(--red)'}} onClick={() => { stopTracking(); showToast('🛑', `Walk ended. ${steps} steps logged!`); }}>■ End Walk ({distanceKm.toFixed(2)}km)</button>
          ) : (
              <button className="add-btn" onClick={() => { startTracking(); showToast('👟','Walk started. Tracking live steps!'); }}>▶ Start Walk</button>
          )}
        </div>
        <div className="journal-timeline anim-in">
          {journalData.map((j, i) => (
            <div key={i} className="journal-entry" onClick={() => showToast('📖','Opening entry...')}>
              <div className="je-date">
                {j.date}
                <span className={`badge badge-${j.moodColor === 'var(--teal)' ? 'teal' : j.moodColor === 'var(--gold)' ? 'gold' : 'plum'}`}>
                  {j.tags[0]}
                </span>
              </div>
              <div className="je-title" dangerouslySetInnerHTML={{__html: j.title}} />
              <div className="je-body">{j.body}</div>
              <div className="je-tags">
                {j.tags.map(t => <span key={t} className="badge badge-sky">{t}</span>)}
              </div>
              <div className="je-stats">
                <div className="je-stat">👟 {j.steps}</div>
                <div className="je-stat">⏱ {j.duration}</div>
                <div className="je-stat">📍 Bengaluru</div>
              </div>
              <div className="je-mood">{j.mood}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
