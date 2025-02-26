
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumb = () => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-400 mb-4">
      <div className="flex items-center">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-300">Lista Cimiteri</span>
      </div>
    </nav>
  );
};
