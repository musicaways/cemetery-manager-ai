
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface CreateTableDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTableDialog = ({ open, onClose }: CreateTableDialogProps) => {
  const [tableName, setTableName] = useState("");

  const handleSubmit = async () => {
    try {
      if (!tableName) {
        toast.error("Il nome della tabella è obbligatorio");
        return;
      }

      // Costruisci la query SQL
      const query = `CREATE TABLE "${tableName}" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`;

      toast.success("Tabella creata con successo");
      onClose();
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crea Nuova Tabella</DialogTitle>
          <DialogDescription>
            Crea una nuova tabella nel database. Verranno automaticamente aggiunti
            i campi id, created_at e updated_at.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="col-span-3"
              placeholder="nome_tabella"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Crea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
