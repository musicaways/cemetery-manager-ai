
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  chatStyle: string;
  setChatStyle: (style: string) => void;
  avatarShape: string;
  setAvatarShape: (shape: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  chatStyle: 'modern',
  setChatStyle: () => {},
  avatarShape: 'circle',
  setAvatarShape: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatStyle, setChatStyle] = useState('modern');
  const [avatarShape, setAvatarShape] = useState('circle');

  useEffect(() => {
    document.documentElement.style.setProperty('--avatar-shape', avatarShape);
    document.body.className = `chat-${chatStyle}`;
  }, [chatStyle, avatarShape]);

  return (
    <ThemeContext.Provider value={{
      chatStyle,
      setChatStyle,
      avatarShape,
      setAvatarShape,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
