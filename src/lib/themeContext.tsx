
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'modern' | 'chatgpt';
  setTheme: (theme: 'modern' | 'chatgpt') => void;
  avatarShape: string;
  setAvatarShape: (shape: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'modern',
  setTheme: () => {},
  avatarShape: 'circle',
  setAvatarShape: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'modern' | 'chatgpt'>('modern');
  const [avatarShape, setAvatarShape] = useState('circle');

  useEffect(() => {
    // Recupera il tema salvato
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) {
      setTheme(savedTheme as 'modern' | 'chatgpt');
    }

    // Recupera la forma dell'avatar salvata
    const savedShape = localStorage.getItem('avatar_shape');
    if (savedShape) {
      setAvatarShape(savedShape);
    }
  }, []);

  useEffect(() => {
    // Rimuovi tutte le classi di tema esistenti
    document.documentElement.classList.remove('theme-modern', 'theme-chatgpt');
    // Aggiungi la classe del tema corrente
    document.documentElement.classList.add(`theme-${theme}`);
    // Salva il tema nelle localStorage
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('avatar_shape', avatarShape);
  }, [avatarShape]);

  const value = {
    theme,
    setTheme,
    avatarShape,
    setAvatarShape,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
