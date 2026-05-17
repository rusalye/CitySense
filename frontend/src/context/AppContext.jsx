import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateProfile } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check system preference on load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [toastData, setToastData] = useState({ visible: false, icon: '', message: '' });
  const [mode, setMode] = useState('calm');
  const [activeCity, setActiveCity] = useState('bengaluru');
  const [activeChapter, setActiveChapter] = useState({
    id: 'amrita',
    name: 'Amrita Vishwa Vidyapeetham',
    num: 'Chapter IV',
    centerLat: 12.895193,
    centerLng: 77.675684,
    sensoryBase: { noise: 60, crowd: 80, air: 65, vibe: 90 }
  });
  const [selectedZone, setSelectedZone] = useState(null);
  const [visitedZones, setVisitedZones] = useState([]);
  
  // Base user state for mock features
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('citysense_user')) || null);

  const [env, setEnv] = useState({ temperature: 24, aqi: 50, aqi_grade: 'A+', weather_desc: 'Partly cloudy', weather_icon: '⛅', crowd: 'Moderate', crowdPerc: 50 });

  // Fetch real-time environment data whenever chapter changes
  useEffect(() => {
    if (activeChapter) {
      fetch(`http://localhost:8000/environment?lat=${activeChapter.centerLat}&lng=${activeChapter.centerLng}`)
        .then(res => res.json())
        .then(data => {
            const hour = new Date().getHours();
            const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
            const crowdLevel = isPeak ? 'High' : (hour < 6 || hour > 22 ? 'Low' : 'Moderate');
            const crowdPerc = isPeak ? 85 : (hour < 6 || hour > 22 ? 20 : 50);
            const wCodes = {0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast', 45:'Fog', 48:'Fog', 51:'Drizzle', 61:'Rain', 63:'Rain', 71:'Snow', 95:'Thunderstorm'};
            
            setEnv({
                temperature: data.temperature,
                aqi: data.aqi,
                aqi_grade: data.aqi_grade,
                weather_desc: wCodes[data.weather_code] || 'Cloudy',
                weather_icon: (data.weather_code <= 1) ? '☀️' : (data.weather_code <= 3) ? '⛅' : '🌦️',
                crowd: crowdLevel,
                crowdPerc: crowdPerc
            });
        }).catch(err => console.error("Error fetching environment:", err));
    }
  }, [activeChapter]);

  // Sync user state with localStorage to persist login
  useEffect(() => {
    if (user) {
      localStorage.setItem('citysense_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('citysense_user');
    }
  }, [user]);

  // Apply theme to document and listen for system changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange); // Fallback for older browsers
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  const showToast = (icon, message) => {
    setToastData({ visible: true, icon, message });
    setTimeout(() => {
      setToastData(prev => ({ ...prev, visible: false }));
    }, 2600);
  };

  const visitPlace = async (zone) => {
    if (!user) return;
    
    const cp = { ...(user.challengeProgress || {}) };
    const chapProg = { ...(user.chapterProgress || {}) };
    let xpGained = 0;
    let newBadges = [];
    
    // Evaluate chapter progress
    if (zone.chapter_id) {
      chapProg[zone.chapter_id] = (chapProg[zone.chapter_id] || 0) + 1;
      if (chapProg[zone.chapter_id] === 5) {
        xpGained += 400;
        showToast('🎉', 'Chapter Completed! +400 XP');
      }
    }
    
    // Evaluate challenges
    if (zone.mode === 'comfort' || zone.title.toLowerCase().includes('cafe') || zone.title.toLowerCase().includes('coffee')) {
      cp['c2'] = (cp['c2'] || 0) + 1;
      if (cp['c2'] === 5) {
        xpGained += 200;
        newBadges.push('☕ Café Hopper');
        showToast('🏆', 'Challenge Complete: Café Connoisseur!');
      }
    }
    
    if (zone.type === 'discover') {
      cp['c3'] = (cp['c3'] || 0) + 1;
      if (cp['c3'] === 3) {
        xpGained += 300;
        newBadges.push('🔮 Mystery Locked');
        showToast('🏆', 'Challenge Complete: Hidden City Explorer!');
      }
    }
    
    const hour = new Date().getHours();
    if (hour < 9 && zone.mode === 'calm') {
      cp['c1'] = (cp['c1'] || 0) + 1;
      if (cp['c1'] === 3) {
        xpGained += 120;
        newBadges.push('🌿 Green Walker');
        showToast('🏆', 'Challenge Complete: Morning Green Walk!');
      }
    }
    
    const updatedUser = {
      ...user,
      placesVisited: (user.placesVisited || 0) + 1,
      xp: (user.xp || 0) + xpGained + 10,
      challengeProgress: cp,
      chapterProgress: chapProg,
      badges: [...(user.badges || []), ...newBadges]
    };
    
    setUser(updatedUser);
    
    try {
      if(user.id) {
        await updateProfile(user.id, {
          xp: updatedUser.xp,
          placesVisited: updatedUser.placesVisited,
          badges: updatedUser.badges,
          challengeProgress: updatedUser.challengeProgress,
          chapterProgress: updatedUser.chapterProgress
        });
      }
    } catch(err) {
      console.error("Failed to sync progress", err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('citysense_user');
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      toastData, showToast,
      mode, setMode,
      activeCity, setActiveCity,
      activeChapter, setActiveChapter,
      selectedZone, setSelectedZone,
      user, setUser, logout,
      env, visitedZones, setVisitedZones, visitPlace
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
