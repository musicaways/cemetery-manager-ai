
import { ChevronRight } from "lucide-react";

export const Breadcrumb = () => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400">
      <span className="text-[var(--primary-color)]">Admin</span>
      <ChevronRight className="h-4 w-4" />
      <span className="text-white">Database</span>
    </nav>
  );
};

export default Breadcrumb;
