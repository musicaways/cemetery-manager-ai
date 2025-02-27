
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { X, Home, Database, Users, Settings, LogOut, Code, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const Sidebar = ({ isOpen, onClose, className }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };
  
  return (
    <aside className={cn("bg-sidebar border-r border-sidebar-border flex flex-col", className)}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <h2 className="text-xl font-semibold text-gradient">Gestione Cimiteri</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="flex-grow p-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/")}
            className={cn(
              "sidebar-link",
              isActive("/") && "active"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            <span>Assistente</span>
          </button>
          
          <button
            onClick={() => navigate("/cimiteri")}
            className={cn(
              "sidebar-link",
              isActive("/cimiteri") && "active"
            )}
          >
            <Database className="h-5 w-5" />
            <span>Cimiteri</span>
          </button>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Amministrazione
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => navigate("/admin/tables")}
              className={cn(
                "sidebar-link",
                isActive("/admin/tables") && "active"
              )}
            >
              <Database className="h-5 w-5" />
              <span>Tabelle</span>
            </button>
            
            <button
              onClick={() => navigate("/admin/users")}
              className={cn(
                "sidebar-link",
                isActive("/admin/users") && "active"
              )}
            >
              <Users className="h-5 w-5" />
              <span>Utenti</span>
            </button>
            
            <button
              onClick={() => navigate("/admin/ai-functions")}
              className={cn(
                "sidebar-link",
                isActive("/admin/ai-functions") && "active"
              )}
            >
              <Code className="h-5 w-5" />
              <span>Funzioni AI</span>
            </button>
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="space-y-2">
          <button
            onClick={() => navigate("/settings")}
            className="sidebar-link"
          >
            <Settings className="h-5 w-5" />
            <span>Impostazioni</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="sidebar-link text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
