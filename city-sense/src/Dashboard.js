import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || 'Explorer';

  // placeholder locations
  const locations = [
    { name: 'Central Park', visited: true },
    { name: 'City Museum', visited: false },
    { name: 'Riverside Walk', visited: true },
    { name: 'Old Town Square', visited: false },
    { name: 'Heritage Fort', visited: false },
    { name: 'Sunset Beach', visited: true },
  ];

  const handleLogout = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to CitySense!</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <p className="dashboard-subtitle">Track your visits and earn achievements by exploring new places around the city.</p>
      <div className="locations-grid">
        {locations.map((loc, idx) => (
          <div key={idx} className={`location-card ${loc.visited ? 'visited' : ''}`}>
            <div className="location-name">{loc.name}</div>
            {loc.visited && <span className="badge">✓ Visited</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
