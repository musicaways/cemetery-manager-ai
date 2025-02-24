
import { Button } from "@/components/ui/button";
import { Image, File, Map } from "lucide-react";
import { Cimitero } from "../../../types";

interface MediaButtonsProps {
  cimitero: Cimitero;
  onTabChange: (tab: 'gallery' | 'documents' | 'maps') => void;
}

export const MediaButtons = ({ cimitero, onTabChange }: MediaButtonsProps) => {
  return (
    <div className="pt-4 border-t border-gray-800">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Media e Documenti</h3>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 relative"
          onClick={() => onTabChange('gallery')}
        >
          <Image className="w-4 h-4" />
          {cimitero.foto?.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
              {cimitero.foto.length}
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 relative"
          onClick={() => onTabChange('documents')}
        >
          <File className="w-4 h-4" />
          {cimitero.documenti?.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
              {cimitero.documenti.length}
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 relative"
          onClick={() => onTabChange('maps')}
        >
          <Map className="w-4 h-4" />
          {cimitero.mappe?.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
              {cimitero.mappe.length}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
