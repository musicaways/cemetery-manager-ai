
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  chatStyle: string;
  theme: 'modern' | 'chatgpt';  // Aggiungiamo la proprietà theme
  setChatStyle: (style: string) => void;
  setTheme: (theme: 'modern' | 'chatgpt') => void;  // Aggiungiamo il setter per theme
  avatarShape: string;
  setAvatarShape: (shape: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  chatStyle: 'modern',
  theme: 'modern',
  setChatStyle: () => {},
  setTheme: () => {},
  avatarShape: 'circle',
  setAvatarShape: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatStyle, setChatStyle] = useState('modern');
  const [theme, setTheme] = useState<'modern' | 'chatgpt'>('modern');
  const [avatarShape, setAvatarShape] = useState('circle');

  useEffect(() => {
    document.documentElement.style.setProperty('--avatar-shape', avatarShape);
    document.body.className = `theme-${theme}`;
  }, [theme, avatarShape]);

  return (
    <ThemeContext.Provider value={{
      chatStyle,
      theme,
      setChatStyle,
      setTheme,
      avatarShape,
      setAvatarShape,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
