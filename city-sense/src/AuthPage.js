import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in', { email, password });
    navigate('/dashboard', { state: { user: email } });
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    console.log('Signing up', { email, password });
    navigate('/dashboard', { state: { user: email } });
  };

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-content">
        <div className="auth-logo">CitySense</div>
        
        <div className="auth-container">
          <div className="auth-tabs">
            <button
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <h2>Welcome back!</h2>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="submit-btn">Sign In</button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <h2>Join CitySense</h2>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button type="submit" className="submit-btn">Sign Up</button>
            </form>
          )}
        </div>

        <div className="auth-footer">
          <p>Start exploring and earning badges by visiting amazing places in your city.</p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
