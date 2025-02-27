
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Database, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <nav className="bottom-nav">
      <button
        onClick={() => navigate("/")}
        className={cn("bottom-nav-item", isActive("/") && "active")}
      >
        <MessageSquare className="h-5 w-5 mb-1" />
        <span>Chat</span>
      </button>
      
      <button
        onClick={() => navigate("/cimiteri")}
        className={cn("bottom-nav-item", isActive("/cimiteri") && "active")}
      >
        <Database className="h-5 w-5 mb-1" />
        <span>Cimiteri</span>
      </button>
      
      <button
        onClick={() => navigate("/admin/tables")}
        className={cn("bottom-nav-item", isActive("/admin") && "active")}
      >
        <Home className="h-5 w-5 mb-1" />
        <span>Admin</span>
      </button>
      
      <button
        onClick={() => navigate("/auth")}
        className={cn("bottom-nav-item", isActive("/auth") && "active")}
      >
        <User className="h-5 w-5 mb-1" />
        <span>Account</span>
      </button>
    </nav>
  );
};
