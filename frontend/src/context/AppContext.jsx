import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [toastData, setToastData] = useState({ visible: false, icon: '', message: '' });
  const [mode, setMode] = useState('calm');
  const [activeCity, setActiveCity] = useState('bengaluru');
  
  // Base user state for mock features
  const [user] = useState({
    name: 'Swetha Pai',
    initial: 'S',
    level: 7,
    xp: 2840,
    xpNext: 4200,
    rank: 'Urban Wanderer',
    streak: 5
  });

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
      user
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
