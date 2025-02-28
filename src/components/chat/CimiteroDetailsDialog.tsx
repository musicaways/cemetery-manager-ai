
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Cimitero } from "@/pages/cimiteri/types";
import { CimiteroDetailsView } from "./CimiteroDetailsView";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CimiteroDetailsDialogProps {
  cimitero: Cimitero | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CimiteroDetailsDialog = ({
  cimitero,
  isOpen,
  onClose
}: CimiteroDetailsDialogProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  if (!cimitero) return null;

  // Su dispositivi mobili usiamo Sheet, altrimenti Dialog
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="p-0 sm:max-w-xl w-full border-none bg-transparent">
          <CimiteroDetailsView cimitero={cimitero} onClose={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl bg-transparent border-none">
        <CimiteroDetailsView cimitero={cimitero} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
