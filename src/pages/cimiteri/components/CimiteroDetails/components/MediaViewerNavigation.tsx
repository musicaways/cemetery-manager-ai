
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaViewerNavigationProps {
  showNavigation: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const MediaViewerNavigation = ({ 
  showNavigation, 
  onPrevious, 
  onNext 
}: MediaViewerNavigationProps) => {
  if (!showNavigation) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 z-50 text-white hover:bg-white/20"
        onClick={onPrevious}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 z-50 text-white hover:bg-white/20"
        onClick={onNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </>
  );
};
