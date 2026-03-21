import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidenav() {
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
        <NavLink to="/app/settings" className={({isActive}) => `snav-btn ${isActive ? 'active' : ''}`}>
          ⚙<span className="tip">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
