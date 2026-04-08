import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [toastData, setToastData] = useState({ visible: false, icon: '', message: '' });
  const [mode, setMode] = useState('calm');
  const [activeCity, setActiveCity] = useState('bengaluru');
  
  // Base user state for mock features
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('citysense_user')) || null);

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
      user, setUser
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
