
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
import { supabase } from "@/integrations/supabase/client";

interface CreateTableDialogProps {
  open: boolean;
  onClose: () => void;
  onTableCreated?: () => void;
}

export const CreateTableDialog = ({ open, onClose, onTableCreated }: CreateTableDialogProps) => {
  const [tableName, setTableName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!tableName) {
        toast.error("Il nome della tabella è obbligatorio");
        return;
      }

      // Validazione del nome della tabella
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
        toast.error("Il nome della tabella può contenere solo lettere, numeri e underscore, e deve iniziare con una lettera");
        return;
      }

      setLoading(true);
      
      const { error } = await supabase.rpc('execute_sql', {
        sql: `CREATE TABLE "${tableName}" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TRIGGER update_${tableName}_updated_at
          BEFORE UPDATE ON "${tableName}"
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();`
      });

      if (error) throw error;

      toast.success("Tabella creata con successo");
      setTableName("");
      onTableCreated?.();
      onClose();
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuova Tabella</DialogTitle>
          <DialogDescription>
            Inserisci il nome della nuova tabella. Verranno automaticamente aggiunti
            i campi id, created_at e updated_at.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-white">
              Nome Tabella
            </Label>
            <Input
              id="name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.toLowerCase())}
              className="col-span-3 bg-[#2A2F3C] border-[#4F46E5] text-white"
              placeholder="nome_tabella"
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-[#2A2F3C] hover:text-white"
          >
            Annulla
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
          >
            {loading ? "Creazione..." : "Crea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
