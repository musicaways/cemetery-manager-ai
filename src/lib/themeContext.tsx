
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
  const [theme, setTheme] = useState<'modern' | 'chatgpt'>(() => {
    const savedTheme = localStorage.getItem('app_theme');
    return (savedTheme as 'modern' | 'chatgpt') || 'modern';
  });
  const [avatarShape, setAvatarShape] = useState(() => {
    return localStorage.getItem('avatar_shape') || 'circle';
  });

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('avatar_shape', avatarShape);
  }, [avatarShape]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      avatarShape,
      setAvatarShape,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
