
import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(
    localStorage.getItem('web_search_enabled') === 'true'
  );

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      console.log("Online status: connected");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("Online status: disconnected");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleWebSearch = () => {
    const newValue = !webSearchEnabled;
    setWebSearchEnabled(newValue);
    localStorage.setItem('web_search_enabled', newValue.toString());
  };

  return { isOnline, webSearchEnabled, toggleWebSearch };
};
