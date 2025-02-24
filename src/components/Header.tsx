
import { Menu, LogOut, Settings, Users, Database, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="border-b border-[#2A2F3C]/40 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-12">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] h-8 w-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-black border-r border-[#2A2F3C]/40">
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="admin" className="border-[#2A2F3C]/40">
                    <AccordionTrigger className="text-white hover:text-[var(--primary-color)]">
                      Amministrazione
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-400 hover:text-[var(--primary-color)]"
                            onClick={() => navigate("/admin/tables")}
                          >
                            <Database className="mr-2 h-4 w-4" />
                            Tabelle
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-400 hover:text-[var(--primary-color)]"
                            onClick={() => navigate("/admin/users")}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Utenti
                          </Button>
                        </SheetClose>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

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
            <h1 className="text-sm font-semibold text-gray-100">Assistente Cimiteriale</h1>
            <p className="text-xs text-[#8E9196]">AI Assistant</p>
          </div>
        </div>
      </div>
    </header>
  );
};
