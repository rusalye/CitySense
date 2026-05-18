import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCards, getZones } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CardsPage() {
  const { showToast, setActiveChapter, setSelectedZone, user } = useApp();
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState('all');
  const [cardsData, setCardsData] = useState([]);
  const [zonesData, setZonesData] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    getCards().then(setCardsData).catch(console.error);
    getZones(null, null, user?.age_group).then(setZonesData).catch(console.error);
  }, [user?.age_group]);

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

  let data = cardsData.map(c => ({ ...c, collected: true }));
  if (filterMode === 'collected') data = data; // All are collected now
  else if (filterMode === 'rare') data = data.filter(x => x.rarity === 'rare' || x.rarity === 'epic' || x.rarity === 'legendary');

  return (
    <div className="page active" id="page-cards">
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Street<br/><em>Card Collection</em> 🃏</div>
          <div className="greeting-sub"><span className="gs-hi">5 of 24</span> cards collected. Keep exploring to unlock more!</div>
        </div>
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Collection Stats</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">✅</div><div className="stat-num">{cardsData.length}</div><div className="stat-lbl">Collected</div></div>
          <div className="stat-tile"><div className="stat-emoji">💎</div><div className="stat-num">{cardsData.filter(x => x.rarity !== 'common').length}</div><div className="stat-lbl">Rare+</div></div>
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
          <span className="badge badge-gold">{cardsData.length} / 24 Collected</span>
        </div>
        <div className="cards-filter-row">
          <div className={`ctab ${filterMode === 'all' ? 'active' : ''}`} onClick={() => setFilterMode('all')}>All</div>
          <div className={`ctab ${filterMode === 'rare' ? 'active' : ''}`} onClick={() => setFilterMode('rare')}>Rare+</div>
        </div>
        <div className="card-grid anim-in">
          {data.map((card, i) => (
            <div 
              key={i} 
              className={`big-card rarity-${card.rarity} ${card.collected ? '' : 'locked'}`} 
              onClick={() => setSelectedCard(card)}
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
      
      {/* CARD DETAIL OVERLAY */}
      {selectedCard && (
        <div className="card-overlay anim-in" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 7, 9, 0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }} onClick={() => setSelectedCard(null)}>
          <div className="card-detail-panel" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '800px', height: '70vh', display: 'flex', overflow: 'hidden', position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div className="cdp-left" style={{ flex: '0.8', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
               <div style={{ fontSize: '100px', marginBottom: '24px', filter: !selectedCard.collected ? 'grayscale(1) opacity(0.5)' : 'drop-shadow(0 0 40px rgba(94, 184, 138, 0.2))' }}>{selectedCard.emoji}</div>
               <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>{selectedCard.name}</div>
               <div style={{ color: 'var(--text2)', fontWeight: '500' }}>{selectedCard.set}</div>
               <div style={{ marginTop: '16px', color: selectedCard.rarity === 'legendary' ? 'var(--gold)' : selectedCard.rarity === 'epic' ? 'var(--plum2)' : selectedCard.rarity === 'rare' ? 'var(--teal)' : 'var(--text3)', textTransform: 'capitalize', letterSpacing: '2px', fontSize: '12px', fontWeight: '600' }}>{selectedCard.rarity}</div>
            </div>
            <div className="cdp-right" style={{ flex: '1.2', padding: '40px', overflowY: 'auto', background: 'var(--bg)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                 <h3 style={{ margin: 0, fontFamily: 'Cormorant Garamond,serif', fontSize: '32px', fontWeight: 600 }}>Known Locations</h3>
                 <span className="badge badge-teal">{zonesData.filter(z => z.card_name === selectedCard.name).length} places</span>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {zonesData.filter(z => z.card_name === selectedCard.name).map(z => (
                   <div key={z.id} style={{ padding: '20px', background: 'var(--card2)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'} onClick={() => {
                     setActiveChapter({ id: z.chapter_id, name: z.chapter_id === 'mgroad' ? 'MG Road / Church Street' : 'Malleshwaram Hub', centerLat: z.lat, centerLng: z.lng });
                     setSelectedZone(z);
                     navigate('/app/map');
                   }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${z.color}22`, color: z.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: `1px solid ${z.color}44` }}>{z.emoji}</div>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>{z.title}</div>
                       <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'capitalize', fontFamily: 'Courier Prime,monospace' }}>{z.chapter_id} Chapter</div>
                     </div>
                     <div style={{ color: 'var(--text3)' }}>›</div>
                   </div>
                 ))}
                 {zonesData.filter(z => z.card_name === selectedCard.name).length === 0 && (
                   <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)', background: 'var(--card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                     <div style={{ fontSize: '32px', marginBottom: '16px' }}>🗺</div>
                     No mapped locations drop this card yet.<br/><span style={{ fontSize: '13px' }}>The city holds many secrets.</span>
                   </div>
                 )}
               </div>
            </div>
            <div style={{ position: 'absolute', top: '24px', right: '24px', cursor: 'pointer', background: 'var(--card)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', transition: 'background 0.2s' }} onClick={() => setSelectedCard(null)} onMouseOver={e => e.currentTarget.style.background = 'var(--card2)'} onMouseOut={e => e.currentTarget.style.background = 'var(--card)'}>✕</div>
          </div>
        </div>
      )}
    </div>
  );
}
