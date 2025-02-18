
import { ArrowLeft, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  return (
    <header className="border-b border-[#2A2F3C]/40 bg-[#1A1F2C]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-12">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#9b87f5] hover:text-[#7E69AB] h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 ml-3">
            <h1 className="text-sm font-semibold text-gray-100">Assistente Cimiteriale</h1>
            <p className="text-xs text-[#8E9196]">AI Assistant</p>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
