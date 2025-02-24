import { Menu, LogOut, Settings, Users, MessageCircle, Search, Bell, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface HeaderProps {
  onSettingsClick: () => void;
  onSearch: (text: string) => void;
}

export const Header = ({ onSettingsClick, onSearch }: HeaderProps) => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nuovo messaggio", message: "Hai ricevuto una nuova risposta", read: false, type: "info" },
    { id: 2, title: "Errore", message: "Si è verificato un errore durante l'elaborazione", read: false, type: "error" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchNavigation = (direction: 'up' | 'down') => {
    const elements = document.querySelectorAll('[data-message-index]');
    let matches: Element[] = [];
    
    elements.forEach(el => {
      if (el.textContent?.toLowerCase().includes(searchText.toLowerCase())) {
        matches.push(el);
      }
    });

    setTotalMatches(matches.length);

    if (matches.length > 0) {
      let newMatch = currentMatch;
      if (direction === 'up') {
        newMatch = (currentMatch - 1 + matches.length) % matches.length;
      } else {
        newMatch = (currentMatch + 1) % matches.length;
      }
      setCurrentMatch(newMatch);
      
      matches[newMatch].scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
      matches[newMatch].classList.add('search-highlight');
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchText);
      handleSearchNavigation('down');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success("Tutte le notifiche sono state cancellate");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector('.search-container');
      if (showSearch && searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearch(false);
        setSearchText("");
        setCurrentMatch(0);
        setTotalMatches(0);
        document.querySelectorAll('.search-highlight').forEach(el => {
          el.classList.remove('search-highlight');
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchText("");
    setCurrentMatch(0);
    setTotalMatches(0);
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });
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

          <div className="flex-1 flex items-center justify-end gap-2 pr-0">
            {showSearch && (
              <div className="search-container relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Cerca nella chat..."
                  className="bg-[#1A1F2C] text-white text-sm rounded-full px-4 py-1.5 border-2 border-white/20 focus:border-[#9b87f5] focus:outline-none w-48 transition-all duration-200"
                  autoFocus
                />
                {searchText && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {totalMatches > 0 && (
                      <>
                        <button
                          onClick={() => handleSearchNavigation('up')}
                          className="p-1 text-gray-400 hover:text-[#9b87f5]"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleSearchNavigation('down')}
                          className="p-1 text-gray-400 hover:text-[#9b87f5]"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <span className="text-xs text-gray-400">
                          {currentMatch + 1}/{totalMatches}
                        </span>
                      </>
                    )}
                    <button
                      onClick={closeSearch}
                      className="p-1 text-gray-400 hover:text-[#9b87f5] ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) {
                  setSearchText("");
                  setCurrentMatch(0);
                  setTotalMatches(0);
                }
              }}
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
                <SheetHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-lg font-semibold text-white">Notifiche</SheetTitle>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllNotifications}
                        className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Nessuna notifica</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`relative p-3 rounded-lg border group touch-pan-x transform transition-transform will-change-transform ${
                          notification.type === 'error' 
                            ? 'bg-red-500/10 border-red-500/20' 
                            : 'bg-[#2A2F3C] border-white/10'
                        } ${!notification.read && 'bg-opacity-50'}`}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          const div = e.currentTarget;
                          const startX = touch.clientX;
                          
                          const handleTouchMove = (e: TouchEvent) => {
                            const currentX = e.touches[0].clientX;
                            const diff = currentX - startX;
                            if (diff > 0) {
                              div.style.transform = `translateX(${diff}px)`;
                            }
                          };
                          
                          const handleTouchEnd = (e: TouchEvent) => {
                            const currentX = e.changedTouches[0].clientX;
                            const diff = currentX - startX;
                            
                            if (diff > 100) {
                              deleteNotification(notification.id);
                            } else {
                              div.style.transform = '';
                            }
                            
                            div.removeEventListener('touchmove', handleTouchMove);
                            div.removeEventListener('touchend', handleTouchEnd);
                          };
                          
                          div.addEventListener('touchmove', handleTouchMove);
                          div.addEventListener('touchend', handleTouchEnd);
                        }}
                      >
                        <h3 className="font-medium text-sm text-white">{notification.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
