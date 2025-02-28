
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Cimitero } from "@/pages/cimiteri/types";
import { CimiteroDetailsView } from "./CimiteroDetailsView";

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
  if (!cimitero) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl bg-transparent border-none">
        <CimiteroDetailsView cimitero={cimitero} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
