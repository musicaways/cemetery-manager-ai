
import { Button } from "@/components/ui/button";
import { Image, File, Map } from "lucide-react";
import { Cimitero } from "../../../types";

interface MediaButtonsProps {
  cimitero: Cimitero;
  onTabChange: (tab: 'gallery' | 'documents' | 'maps') => void;
}

export const MediaButtons = ({ cimitero, onTabChange }: MediaButtonsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Media e Documenti</h3>
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="flex-1 h-auto py-4 px-3 bg-black/20 border-gray-800 hover:bg-gray-800/50 hover:border-[var(--primary-color)] transition-all group relative"
          onClick={() => onTabChange('gallery')}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Image className="w-6 h-6 text-[var(--primary-color)] group-hover:scale-110 transition-transform" />
              {cimitero.foto?.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
                  {cimitero.foto.length}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Foto</span>
          </div>
        </Button>

        <Button
          variant="outline"
          className="flex-1 h-auto py-4 px-3 bg-black/20 border-gray-800 hover:bg-gray-800/50 hover:border-[var(--primary-color)] transition-all group relative"
          onClick={() => onTabChange('documents')}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <File className="w-6 h-6 text-[var(--primary-color)] group-hover:scale-110 transition-transform" />
              {cimitero.documenti?.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
                  {cimitero.documenti.length}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Documenti</span>
          </div>
        </Button>

        <Button
          variant="outline"
          className="flex-1 h-auto py-4 px-3 bg-black/20 border-gray-800 hover:bg-gray-800/50 hover:border-[var(--primary-color)] transition-all group relative"
          onClick={() => onTabChange('maps')}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Map className="w-6 h-6 text-[var(--primary-color)] group-hover:scale-110 transition-transform" />
              {cimitero.mappe?.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
                  {cimitero.mappe.length}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Mappe</span>
          </div>
        </Button>
      </div>
    </div>
  );
};
