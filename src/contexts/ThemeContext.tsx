import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ThemeContextType, AppTheme } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Definición de temas
const lightTheme: AppTheme = {
  colors: {
    primary: '#fd8412',
    secondary: '#1D1F3C',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    text: '#1f2937',
    textSecondary: '#6b7280',
    error: '#dc2626',
    success: '#059669',
    warning: '#d97706',
    border: '#e5e7eb',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
};

const darkTheme: AppTheme = {
  colors: {
    primary: '#fd8412',
    secondary: '#1D1F3C',
    background: '#111827',
    surface: '#1f2937',
    surfaceVariant: '#374151',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    border: '#4b5563',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  },
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar preferencia de tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    const theme = isDarkMode ? darkTheme : lightTheme;
    
    // Aplicar variables CSS personalizadas
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Agregar clase dark al HTML para Tailwind
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Agregar clase al body para estilos globales
    document.body.className = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  const toggleTheme = (): void => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export default ThemeContext; 