
import { Menu, LogOut, Settings, Users, MessageCircle, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nuovo messaggio", message: "Hai ricevuto una nuova risposta", read: false, type: "info" },
    { id: 2, title: "Errore", message: "Si è verificato un errore durante l'elaborazione", read: false, type: "error" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="border-b border-[#2A2F3C]/40 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-black border-r border-[#2A2F3C]/40">
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-400 hover:text-[var(--primary-color)]"
                      onClick={() => navigate("/")}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Assistente
                    </Button>
                  </SheetClose>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-400 hover:text-[var(--primary-color)]"
                      onClick={onSettingsClick}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Impostazioni
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-400 hover:text-[var(--primary-color)]"
                      onClick={() => navigate("/admin/users")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Amministrazione
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-400 hover:text-[var(--primary-color)]"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 ml-3">
            <h1 className="text-sm font-semibold text-gray-100">AI Assistant</h1>
          </div>

          <div className="flex items-center gap-2">
            {showSearch && (
              <input
                type="text"
                placeholder="Cerca nella chat..."
                className="bg-[#1A1F2C] text-white text-sm rounded-full px-4 py-1.5 border-2 border-white/20 focus:border-[#9b87f5] focus:outline-none w-48 transition-all duration-200"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200 relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#9b87f5] rounded-full text-[10px] flex items-center justify-center text-white font-medium">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-black border-l border-[#2A2F3C]/40">
                <div className="mt-4 space-y-4">
                  <h2 className="text-lg font-semibold text-white">Notifiche</h2>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.type === 'error' 
                            ? 'bg-red-500/10 border-red-500/20' 
                            : 'bg-[#2A2F3C] border-white/10'
                        } ${!notification.read && 'bg-opacity-50'}`}
                      >
                        <h3 className="font-medium text-sm text-white">{notification.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
