import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Leer tema guardado o usar 'light' por defecto
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('pcu-theme');
      return savedTheme || 'light';
    } catch {
      return 'light';
    }
  });

  // Aplicar el tema al documento
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark');
      root.classList.remove('dark-theme');
    }

    // Guardar en localStorage
    try {
      localStorage.setItem('pcu-theme', theme);
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
