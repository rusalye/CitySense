import { useLocation, useNavigate } from 'react-router-dom'
import '../assets/styles/Dashboard.css'

function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = location.state?.user || 'Explorer'

  // Placeholder locations
  const locations = [
    { id: 1, name: 'Central Park', visited: true, icon: '🌳' },
    { id: 2, name: 'City Museum', visited: false, icon: '🏛️' },
    { id: 3, name: 'Riverside Walk', visited: true, icon: '🌊' },
    { id: 4, name: 'Old Town Square', visited: false, icon: '🏰' },
    { id: 5, name: 'Heritage Fort', visited: false, icon: '🏯' },
    { id: 6, name: 'Sunset Beach', visited: true, icon: '🌅' },
  ]

  const handleLogout = () => {
    navigate('/', { replace: true })
  }

  const visitedCount = locations.filter(loc => loc.visited).length
  const totalCount = locations.length

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome to CitySense, {user.split('@')[0]}!</h1>
          <p className="progress-text">
            Locations visited: <strong>{visitedCount}</strong> of <strong>{totalCount}</strong>
          </p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <p className="dashboard-subtitle">
        Track your visits and earn achievements by exploring new places around the city.
      </p>

      <div className="locations-grid">
        {locations.map((loc) => (
          <div key={loc.id} className={`location-card ${loc.visited ? 'visited' : ''}`}>
            <div className="card-icon">{loc.icon}</div>
            <div className="location-name">{loc.name}</div>
            {loc.visited && <span className="badge">✓ Visited</span>}
            {!loc.visited && <button className="visit-btn">Mark as Visited</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
