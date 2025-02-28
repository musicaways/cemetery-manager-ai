
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { AISettings } from "./AISettings";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Gestisce la modalità responsive
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Check iniziale
    checkIfMobile();
    
    // Aggiorna lo stato quando la finestra viene ridimensionata
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const handleSearch = (text: string) => {
    // Implementa la logica di ricerca se necessario nel Layout
    console.log("Search in Layout:", text);
  };

  return (
    <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar desktop */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[var(--sidebar-width)] bg-sidebar border-r border-sidebar-border transform transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          // In desktop la sidebar è sempre visibile quando aperta
          "lg:static lg:transform-none lg:transition-none"
        )}
      />
      
      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onSettingsClick={() => setIsSettingsOpen(true)} 
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSearch={handleSearch}
          isSidebarOpen={isSidebarOpen}
        />
        
        <main className={cn(
          "container mx-auto py-4 flex-grow transition-all duration-300",
          // Quando la sidebar è aperta su desktop, adatta il margine
          isSidebarOpen && !isMobile ? "lg:ml-0" : ""
        )}>
          {children}
        </main>
        
        {/* Navigazione mobile inferiore */}
        <MobileNav />
      </div>
      
      <AISettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
