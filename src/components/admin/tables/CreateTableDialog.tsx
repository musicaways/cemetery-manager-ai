
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface CreateTableDialogProps {
  open: boolean;
  onClose: () => void;
  onTableCreated: (name: string) => void;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (name: string) => void;
}

export const CreateTableDialog = ({ 
  open, 
  onClose, 
  onTableCreated, 
  onOpenChange, 
  onSuccess 
}: CreateTableDialogProps) => {
  const [tableName, setTableName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTable = async () => {
    if (!tableName.trim()) {
      setError("Il nome della tabella è obbligatorio");
      return;
    }

    // Controllo validità del nome tabella
    const tableNameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!tableNameRegex.test(tableName)) {
      setError("Il nome della tabella può contenere solo lettere, numeri e underscore, e deve iniziare con una lettera");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Creiamo la tabella con un ID seriale come primary key per default
      const createTableSQL = `
        CREATE TABLE "${tableName}" (
          "id" SERIAL PRIMARY KEY,
          "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const { error: createError } = await supabase.rpc('execute_sql', {
        sql: createTableSQL
      });

      if (createError) throw new Error(createError.message);

      toast.success("Tabella creata con successo");
      // Invochiamo il callback
      if (onSuccess) {
        onSuccess(tableName);
      } else if (onTableCreated) {
        onTableCreated(tableName);
      }
    } catch (err: any) {
      console.error("Error creating table:", err);
      setError(err.message);
      toast.error(`Errore: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTableName("");
    setError("");
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] text-white border-[#2A2F3C]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Crea Nuova Tabella</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tableName">Nome Tabella</Label>
            <Input
              id="tableName"
              placeholder="nome_tabella"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="bg-[#141825] border-[#2A2F3C] text-white"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
          <div className="text-sm text-gray-400">
            <p>La tabella verrà creata con:</p>
            <ul className="list-disc list-inside pl-2 mt-1">
              <li>Una colonna <code className="text-gray-300">id</code> come chiave primaria</li>
              <li>Una colonna <code className="text-gray-300">created_at</code> per il timestamp</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} className="border-[#2A2F3C] text-gray-300 hover:bg-[#2A2F3C] hover:text-white">
            Annulla
          </Button>
          <Button 
            onClick={handleCreateTable} 
            disabled={isLoading}
            className="bg-[#4F46E5] hover:bg-[#4F46E5]/90"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              "Crea Tabella"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
