
import { useState, useEffect } from "react";
import { Cimitero } from "../types";

export const useSearch = (initialItems: Cimitero[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<Cimitero[]>(initialItems);

  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchTerm(e.detail);
    };
    
    window.addEventListener('global-search', handleSearch as EventListener);
    return () => window.removeEventListener('global-search', handleSearch as EventListener);
  }, []);

  useEffect(() => {
    if (initialItems.length > 0) {
      const filtered = initialItems.filter(item => 
        item.Descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Indirizzo && item.Indirizzo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, initialItems]);

  return { searchTerm, setSearchTerm, filteredItems };
};
