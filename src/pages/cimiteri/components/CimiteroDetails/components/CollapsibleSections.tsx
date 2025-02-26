
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Cimitero } from "../../../types";
import { InfoTab } from "../Tabs/InfoTab";
import { GalleryTab } from "../Tabs/GalleryTab";
import { DocumentsTab } from "../Tabs/DocumentsTab";
import { MapsTab } from "../Tabs/MapsTab";
import { SectorsTab } from "../Tabs/SectorsTab";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionsProps {
  cimitero: Cimitero;
  openSection: string | null;
  setOpenSection: (section: string | null) => void;
  editMode: boolean;
  editedData: Partial<Cimitero>;
  onInputChange: (field: string, value: string | number | null) => void;
  handleRefresh: () => void;
}

export const CollapsibleSections = ({
  cimitero,
  openSection,
  setOpenSection,
  editMode,
  editedData,
  onInputChange,
  handleRefresh
}: CollapsibleSectionsProps) => {
  return (
    <div className="space-y-3">
      {/* Info Section */}
      <Collapsible 
        open={openSection === 'info'} 
        onOpenChange={() => setOpenSection(openSection === 'info' ? null : 'info')}
      >
        <CollapsibleTrigger className="w-full group">
          <div className={cn(
            "px-3 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg",
            "hover:bg-gray-800/30 transition-all duration-200",
            "active:scale-[0.98]",
            openSection === 'info' && "bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20"
          )}>
            <span className="text-sm font-medium text-white">Informazioni</span>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              openSection === 'info' && "transform rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 animate-accordion-down">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
            <InfoTab
              cimitero={cimitero}
              editMode={editMode}
              editedData={editedData}
              onInputChange={onInputChange}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Gallery Section */}
      <Collapsible 
        open={openSection === 'gallery'} 
        onOpenChange={() => setOpenSection(openSection === 'gallery' ? null : 'gallery')}
      >
        <CollapsibleTrigger className="w-full group">
          <div className={cn(
            "px-3 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg",
            "hover:bg-gray-800/30 transition-all duration-200",
            "active:scale-[0.98]",
            openSection === 'gallery' && "bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Galleria Foto</span>
              {cimitero.foto?.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-[var(--primary-color)] text-white rounded-full">
                  {cimitero.foto.length}
                </span>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              openSection === 'gallery' && "transform rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 animate-accordion-down">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
            <GalleryTab 
              foto={cimitero.foto} 
              onDelete={handleRefresh}
              canEdit={editMode}
              cimiteroId={cimitero.Id}
              onUploadComplete={handleRefresh}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Documents Section */}
      <Collapsible 
        open={openSection === 'documents'} 
        onOpenChange={() => setOpenSection(openSection === 'documents' ? null : 'documents')}
      >
        <CollapsibleTrigger className="w-full group">
          <div className={cn(
            "px-3 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg",
            "hover:bg-gray-800/30 transition-all duration-200",
            "active:scale-[0.98]",
            openSection === 'documents' && "bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Documenti</span>
              {cimitero.documenti?.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-[var(--primary-color)] text-white rounded-full">
                  {cimitero.documenti.length}
                </span>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              openSection === 'documents' && "transform rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 animate-accordion-down">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
            <DocumentsTab 
              documenti={cimitero.documenti}
              onDelete={handleRefresh}
              canEdit={editMode}
              cimiteroId={cimitero.Id}
              onUploadComplete={handleRefresh}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Maps Section */}
      <Collapsible 
        open={openSection === 'maps'} 
        onOpenChange={() => setOpenSection(openSection === 'maps' ? null : 'maps')}
      >
        <CollapsibleTrigger className="w-full group">
          <div className={cn(
            "px-3 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg",
            "hover:bg-gray-800/30 transition-all duration-200",
            "active:scale-[0.98]",
            openSection === 'maps' && "bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20"
          )}>
            <span className="text-sm font-medium text-white">Mappa</span>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              openSection === 'maps' && "transform rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 animate-accordion-down">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
            <MapsTab 
              mappe={cimitero.mappe}
              onDelete={handleRefresh}
              canEdit={editMode}
              latitude={cimitero.Latitudine}
              longitude={cimitero.Longitudine}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sectors Section - Always visible */}
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
        <h3 className="text-sm font-medium text-white mb-4">Settori</h3>
        <SectorsTab settori={cimitero.settori} />
      </div>
    </div>
  );
};
