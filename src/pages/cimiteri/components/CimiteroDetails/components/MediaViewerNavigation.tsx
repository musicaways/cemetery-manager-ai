
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaViewerNavigationProps {
  showNavigation: boolean;
  onPrevious: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export const MediaViewerNavigation = ({ 
  showNavigation, 
  onPrevious, 
  onNext 
}: MediaViewerNavigationProps) => {
  if (!showNavigation) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-between z-10 pointer-events-none">
      <div className="w-16 flex justify-start pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </div>
      <div className="w-16 flex justify-end pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};
