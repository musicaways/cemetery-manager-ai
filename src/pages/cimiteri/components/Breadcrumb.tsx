
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumb = () => {
  return (
    <div className="fixed top-16 left-0 right-0 z-10 bg-[var(--chat-bg)] border-b border-gray-800/50">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center space-x-1 text-sm text-gray-400">
          <div className="flex items-center">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-300">Lista Cimiteri</span>
          </div>
        </nav>
      </div>
    </div>
  );
};
