
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  description: string;
}

export const Breadcrumb = ({ description }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-400 mb-4">
      <div className="flex items-center">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span>Cimiteri</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-300">{description}</span>
      </div>
    </nav>
  );
};
