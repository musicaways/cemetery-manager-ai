
import { useState, useEffect } from "react";

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchTerm(e.detail);
    };
    
    window.addEventListener('global-search', handleSearch as EventListener);
    return () => window.removeEventListener('global-search', handleSearch as EventListener);
  }, []);

  return { searchTerm };
};
