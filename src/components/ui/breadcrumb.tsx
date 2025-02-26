
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <div className="fixed top-16 left-0 right-0 z-10 bg-[var(--chat-bg)] border-b border-gray-800/50">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center space-x-1 text-sm text-gray-400">
          <div className="flex items-center">
            <Link to="/" className="hover:text-gray-300">
              <Home className="h-4 w-4" />
            </Link>
            {items.map((item, index) => (
              <div key={index} className="flex items-center">
                <ChevronRight className="h-4 w-4" />
                {item.href ? (
                  <Link to={item.href} className="hover:text-gray-300">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-300">{item.label}</span>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};
