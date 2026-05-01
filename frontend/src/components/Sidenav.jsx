import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Sidenav() {
  const { logout, showToast } = useApp();
  
  return (
    <nav className="sidenav">
      <NavLink to="/app/map" className={({isActive}) => `snav-btn ${isActive ? 'active' : ''}`}>
        🗺<span className="tip">Map</span>
      </NavLink>
      <NavLink to="/app/explore" className={({isActive}) => `snav-btn ${isActive ? 'active' : ''}`}>
        ✦<span className="tip">Explore</span>
      </NavLink>
      <NavLink to="/app/journal" className={({isActive}) => `snav-btn ${isActive ? 'active' : ''}`}>
        📖<span className="tip">Journal</span>
      </NavLink>
      <NavLink to="/app/challenges" className={({isActive}) => `snav-btn ${isActive ? 'active' : ''}`}>
        🏆<span className="tip">Challenges</span>
      </NavLink>
      
      <div className="snav-sep"></div>
      
      <NavLink to="/app/cards" className={({isActive}) => `snav-btn ${isActive ? 'active' : ''}`}>
        🃏<span className="tip">Street Cards</span>
      </NavLink>
      <NavLink to="/app/chapters" className={({isActive}) => `snav-btn ${isActive ? 'active' : ''}`}>
        🌍<span className="tip">City Chapters</span>
      </NavLink>
      
      <div className="snav-bottom">
        <div className="snav-btn" onClick={() => { showToast('👋', 'Logged out!'); setTimeout(logout, 1000); }} style={{ cursor: 'pointer', color: 'var(--coral)' }}>
          🚪<span className="tip">Log Out</span>
        </div>
      </div>
    </nav>
  );
}
