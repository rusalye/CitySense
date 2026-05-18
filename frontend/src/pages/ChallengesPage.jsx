import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getChallenges } from '../services/api';

export default function ChallengesPage() {
  const { showToast, user } = useApp();
  const [filterMode, setFilterMode] = useState('all');
  const [challengesData, setChallengesData] = useState([]);

  useEffect(() => {
    getChallenges().then(setChallengesData).catch(console.error);
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

  const data = filterMode === 'all' ? challengesData
    : filterMode === 'active' ? challengesData.filter(x => x.type === 'active')
    : filterMode === 'completed' ? challengesData.filter(x => x.type === 'completed')
    : challengesData.filter(x => x.daily);

  return (
    <div className="page active" id="page-challenges">
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">City<br/><em>Challenges</em> 🏆</div>
          <div className="greeting-sub"><span className="gs-hi">3 active</span> challenges. You're on a <span className="gs-hi">5-day streak!</span></div>
        </div>
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Your Progress</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">✅</div><div className="stat-num">{user?.challengesCompleted || 0}</div><div className="stat-lbl">Done</div></div>
          <div className="stat-tile"><div className="stat-emoji">🔥</div><div className="stat-num">{user?.daysActive || 1}</div><div className="stat-lbl">Streak</div></div>
          <div className="stat-tile"><div className="stat-emoji">⭐</div><div className="stat-num">{user?.xp || 0}</div><div className="stat-lbl">XP Earned</div></div>
        </div>
        <div className="sec-divider"><span className="sec-icon">🏅</span><span className="sec-label">Recent Badges</span><div className="sec-line"></div></div>
        <div style={{padding: '0 16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
          {user?.badges?.length > 0 ? user.badges.map(b => {
             const emoji = b.split(' ')[0];
             const name = b.split(' ').slice(1).join('\n');
             return (
               <div key={b} style={{textAlign: 'center', cursor: 'pointer'}} onClick={() => showToast(emoji, `${b} badge earned!`)}>
                 <div style={{fontSize: '32px', marginBottom: '4px'}}>{emoji}</div>
                 <div style={{fontSize: '9px', fontFamily: 'Courier Prime,monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'pre-line'}}>{name}</div>
               </div>
             );
          }) : (
             <div style={{textAlign: 'center', opacity: '.4', width: '100%'}}>
               <div style={{fontSize: '32px', marginBottom: '4px'}}>🔒</div>
               <div style={{fontSize: '9px', fontFamily: 'Courier Prime,monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em'}}>No Badges<br/>Yet</div>
             </div>
          )}
        </div>
      </aside>

      <div className="right-panel challenges-right">
        <div className="challenges-hero">
          <div className="ch-trophy">🏆</div>
          <div className="ch-hero-text">
            <h2>You're on a <em>roll!</em></h2>
            <p>Keep exploring to maintain your streak and earn rare street cards.</p>
            <div className="ch-streak">🔥 <strong>5-day streak</strong> — don't break it today!</div>
          </div>
        </div>
        <div className="challenges-tabs">
          <div className={`ctab ${filterMode === 'all' ? 'active' : ''}`} onClick={() => setFilterMode('all')}>All</div>
          <div className={`ctab ${filterMode === 'active' ? 'active' : ''}`} onClick={() => setFilterMode('active')}>Active</div>
          <div className={`ctab ${filterMode === 'completed' ? 'active' : ''}`} onClick={() => setFilterMode('completed')}>Completed</div>
          <div className={`ctab ${filterMode === 'daily' ? 'active' : ''}`} onClick={() => setFilterMode('daily')}>Daily</div>
        </div>
        <div className="challenges-grid anim-in">
          {data.map(ch => {
            const userProg = user?.challengeProgress?.[ch.id] !== undefined ? user.challengeProgress[ch.id] : ch.progress;
            const pct = Math.round((userProg/ch.total)*100);
            const done = userProg >= ch.total;
            return (
              <div key={ch.id} className={`challenge-card ${done ? 'completed' : ''}`} onClick={() => showToast(ch.icon, ch.title)}>
                <div className="cc-top">
                  <div className="cc-icon-wrap">{ch.icon}</div>
                  <div className="cc-info">
                    <div className="cc-title">{ch.title}</div>
                    <div className="cc-desc">{ch.desc}</div>
                    <div className="cc-reward">🎁 {ch.reward}</div>
                  </div>
                  {done && <div className="cc-complete-check">✅</div>}
                </div>
                <div className="cc-progress-wrap">
                  <div className="cc-prog-track">
                    <div className="cc-prog-fill" style={{width: `${pct}%`, background: ch.color}}></div>
                  </div>
                  <div className="cc-prog-lbl">{userProg} / {ch.total}{done && ' · Done'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
