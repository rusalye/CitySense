import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';

function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div className="App">
      {!isAuthPage && (
        <nav className="main-nav">
          <div className="logo">CitySense</div>
          <ul className="nav-links">
            {user && <li className="welcome">Welcome, {user}</li>}
          </ul>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={<Dashboard user={location.state?.user || user} />}
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
