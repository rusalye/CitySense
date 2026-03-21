import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainLayout from './components/MainLayout';
import MapPage from './pages/MapPage';
import ExplorePage from './pages/ExplorePage';
import JournalPage from './pages/JournalPage';
import ChallengesPage from './pages/ChallengesPage';
import CardsPage from './pages/CardsPage';
import ChaptersPage from './pages/ChaptersPage';
import SettingsPage from './pages/SettingsPage';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<Navigate to="map" replace />} />
            <Route path="map" element={<MapPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="chapters" element={<ChaptersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
