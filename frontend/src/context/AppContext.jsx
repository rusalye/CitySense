import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [toastData, setToastData] = useState({ visible: false, icon: '', message: '' });
  const [mode, setMode] = useState('calm');
  const [activeCity, setActiveCity] = useState('bengaluru');
  const [activeChapter, setActiveChapter] = useState({
    id: 'mgroad',
    name: 'MG Road / Church Street',
    num: 'Chapter I',
    centerLat: 12.9740,
    centerLng: 77.6010,
    sensoryBase: { noise: 80, crowd: 85, air: 75, vibe: 95 }
  });
  const [selectedZone, setSelectedZone] = useState(null);
  
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

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  const showToast = (icon, message) => {
    setToastData({ visible: true, icon, message });
    setTimeout(() => {
      setToastData(prev => ({ ...prev, visible: false }));
    }, 2600);
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      toastData, showToast,
      mode, setMode,
      activeCity, setActiveCity,
      activeChapter, setActiveChapter,
      selectedZone, setSelectedZone,
      user, setUser,
      env
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
