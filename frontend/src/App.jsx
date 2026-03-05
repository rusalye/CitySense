import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/' || location.pathname === '/auth'

  return (
    <div className="App">
      {!isAuthPage && (
        <nav className="main-nav">
          <div className="logo">CitySense</div>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
