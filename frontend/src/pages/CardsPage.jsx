import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CARDS_DATA } from '../data/mockData';

export default function CardsPage() {
  const { showToast } = useApp();
  const [filterMode, setFilterMode] = useState('all');

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

  let data = CARDS_DATA;
  if (filterMode === 'collected') data = data.filter(x => x.collected);
  else if (filterMode === 'locked') data = data.filter(x => !x.collected);
  else if (filterMode === 'rare') data = data.filter(x => x.rarity === 'rare' || x.rarity === 'epic' || x.rarity === 'legendary');

  return (
    <div className="page active" id="page-cards" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Street<br/><em>Card Collection</em> 🃏</div>
          <div className="greeting-sub"><span className="gs-hi">5 of 24</span> cards collected. Keep exploring to unlock more!</div>
        </div>
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Collection Stats</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">✅</div><div className="stat-num">5</div><div className="stat-lbl">Collected</div></div>
          <div className="stat-tile"><div className="stat-emoji">🔒</div><div className="stat-num">19</div><div className="stat-lbl">Locked</div></div>
          <div className="stat-tile"><div className="stat-emoji">💎</div><div className="stat-num">2</div><div className="stat-lbl">Rare+</div></div>
        </div>
        <div className="sec-divider"><span className="sec-icon">✦</span><span className="sec-label">Rarity Guide</span><div className="sec-line"></div></div>
        <div style={{padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><div style={{width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text3)'}}></div><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Common</span><span style={{fontSize: '10px', color: 'var(--text3)', fontFamily: 'Courier Prime,monospace'}}>9 cards</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><div style={{width: '14px', height: '14px', borderRadius: '50%', background: 'var(--teal)'}}></div><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Rare</span><span style={{fontSize: '10px', color: 'var(--text3)', fontFamily: 'Courier Prime,monospace'}}>8 cards</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><div style={{width: '14px', height: '14px', borderRadius: '50%', background: 'var(--plum)'}}></div><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Epic</span><span style={{fontSize: '10px', color: 'var(--text3)', fontFamily: 'Courier Prime,monospace'}}>5 cards</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><div style={{width: '14px', height: '14px', borderRadius: '50%', background: 'linear-gradient(90deg,var(--gold),var(--coral))'}}></div><span style={{fontSize: '12px', color: 'var(--text2)', flex: '1'}}>Legendary</span><span style={{fontSize: '10px', color: 'var(--text3)', fontFamily: 'Courier Prime,monospace'}}>2 cards</span></div>
        </div>
      </aside>
      <div className="right-panel cards-right">
        <div className="cards-header-row">
          <div className="section-h">Your <em>Collection</em></div>
          <span className="badge badge-gold">5 / 24 Collected</span>
        </div>
        <div className="cards-filter-row">
          <div className={`ctab ${filterMode === 'all' ? 'active' : ''}`} onClick={() => setFilterMode('all')}>All</div>
          <div className={`ctab ${filterMode === 'collected' ? 'active' : ''}`} onClick={() => setFilterMode('collected')}>Collected</div>
          <div className={`ctab ${filterMode === 'locked' ? 'active' : ''}`} onClick={() => setFilterMode('locked')}>Locked</div>
          <div className={`ctab ${filterMode === 'rare' ? 'active' : ''}`} onClick={() => setFilterMode('rare')}>Rare+</div>
        </div>
        <div className="card-grid anim-in">
          {data.map((card, i) => (
            <div 
              key={i} 
              className={`big-card rarity-${card.rarity} ${card.collected ? '' : 'locked'}`} 
              onClick={() => showToast(card.collected ? card.emoji : '🔒', card.collected ? `${card.name} — collected!` : `Keep exploring to unlock ${card.name}!`)}
            >
              <span className="bc-emoji">{card.emoji}</span>
              <div className="bc-name">{card.name}</div>
              <div className="bc-set">{card.set}</div>
              <div className="bc-rarity" style={{color: card.rarity === 'legendary' ? 'var(--gold)' : card.rarity === 'epic' ? 'var(--plum2)' : card.rarity === 'rare' ? 'var(--teal)' : 'var(--text3)'}}>{card.rarity}</div>
              {!card.collected && <div className="bc-lock">🔒</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
