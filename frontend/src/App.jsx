import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainLayout from './components/MainLayout';
import MapPage from './pages/MapPage';
import ExplorePage from './pages/ExplorePage';
import JournalPage from './pages/JournalPage';
import ChallengesPage from './pages/ChallengesPage';
import CardsPage from './pages/CardsPage';
import ChaptersPage from './pages/ChaptersPage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';
import { AppProvider, useApp } from './context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="map" replace />} />
            <Route path="map" element={<MapPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="chapters" element={<ChaptersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
