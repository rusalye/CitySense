import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../assets/styles/Dashboard.css";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || "Explorer";

  const [zones, setZones] = useState([]);
  const [visited, setVisited] = useState([]);

  // Fetch zones from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/zones")
      .then((res) => res.json())
      .then((data) => setZones(data))
      .catch((err) => console.error("Error fetching zones:", err));
  }, []);

  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  const markVisited = (id) => {
    if (!visited.includes(id)) {
      setVisited([...visited, id]);
    }
  };

  const visitedCount = visited.length;
  const totalCount = zones.length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome to CitySense, {user.split("@")[0]}!</h1>
          <p className="progress-text">
            Locations visited: <strong>{visitedCount}</strong> of{" "}
            <strong>{totalCount}</strong>
          </p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <p className="dashboard-subtitle">
        Track your visits and explore zones across the city.
      </p>

      <div className="locations-grid">
        {zones.map((zone) => (
          <div
            key={zone._id}
            className={`location-card ${
              visited.includes(zone._id) ? "visited" : ""
            }`}
          >
            <div className="card-icon">📍</div>

            <div className="location-name">{zone.name}</div>

            <p className="location-description">{zone.description}</p>

            {visited.includes(zone._id) ? (
              <span className="badge">✓ Visited</span>
            ) : (
              <button
                className="visit-btn"
                onClick={() => window.open("/test3.html", "_blank")}
              >
                Open Map
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;