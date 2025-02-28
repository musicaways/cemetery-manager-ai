
import { useState } from "react";
import { Header } from "./Header";
import { AISettings } from "./AISettings";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSearch = (text: string) => {
    // Implementa la logica di ricerca se necessario nel Layout
    console.log("Search in Layout:", text);
  };

  return (
    <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100">
      <Header 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        onSearch={handleSearch}
      />
      <main className="container mx-auto px-4 py-4">
        {/* Utilizzare Outlet per renderizzare le routes annidate */}
        <Outlet />
        {/* Renderizzare children se fornito */}
        {children}
      </main>
      <AISettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
