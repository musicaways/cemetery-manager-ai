
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddEditColumnDialogProps {
  open: boolean;
  onClose: () => void;
  tableName: string;
  onColumnModified?: () => void;
  columnToEdit?: {
    name: string;
    type: string;
    isNullable: boolean;
    defaultValue: string | null;
  };
}

export const AddEditColumnDialog = ({
  open,
  onClose,
  tableName,
  columnToEdit,
  onColumnModified,
}: AddEditColumnDialogProps) => {
  const [columnName, setColumnName] = useState(columnToEdit?.name || "");
  const [columnType, setColumnType] = useState(columnToEdit?.type || "text");
  const [isNullable, setIsNullable] = useState(columnToEdit?.isNullable || false);
  const [defaultValue, setDefaultValue] = useState(columnToEdit?.defaultValue || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!columnName) {
        toast.error("Il nome della colonna è obbligatorio");
        return;
      }

      // Validazione del nome della colonna
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(columnName)) {
        toast.error("Il nome della colonna può contenere solo lettere, numeri e underscore, e deve iniziare con una lettera");
        return;
      }

      setLoading(true);

      let sql = '';
      if (columnToEdit) {
        sql = `
          ALTER TABLE "${tableName}" 
          ALTER COLUMN "${columnName}" TYPE ${columnType} USING "${columnName}"::${columnType},
          ALTER COLUMN "${columnName}" ${isNullable ? 'DROP NOT NULL' : 'SET NOT NULL'},
          ALTER COLUMN "${columnName}" ${defaultValue ? `SET DEFAULT ${defaultValue}` : 'DROP DEFAULT'};
        `;
      } else {
        sql = `
          ALTER TABLE "${tableName}" 
          ADD COLUMN "${columnName}" ${columnType}
          ${isNullable ? '' : 'NOT NULL'}
          ${defaultValue ? `DEFAULT ${defaultValue}` : ''};
        `;
      }

      const { error } = await supabase.rpc('execute_sql', { sql });

      if (error) throw error;

      toast.success(`Colonna ${columnToEdit ? 'modificata' : 'aggiunta'} con successo`);
      onColumnModified?.();
      onClose();
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const dataTypes = [
    { value: "text", label: "Testo" },
    { value: "integer", label: "Numero intero" },
    { value: "decimal", label: "Numero decimale" },
    { value: "boolean", label: "Booleano" },
    { value: "date", label: "Data" },
    { value: "timestamp", label: "Data e ora" },
    { value: "jsonb", label: "JSON" },
    { value: "uuid", label: "UUID" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{columnToEdit ? "Modifica" : "Aggiungi"} Colonna</DialogTitle>
          <DialogDescription>
            {columnToEdit
              ? "Modifica i dettagli della colonna esistente"
              : "Aggiungi una nuova colonna alla tabella"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value.toLowerCase())}
              className="col-span-3"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select value={columnType} onValueChange={setColumnType} disabled={loading}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleziona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nullable" className="text-right">
              Nullable
            </Label>
            <div className="col-span-3">
              <Switch
                id="nullable"
                checked={isNullable}
                onCheckedChange={setIsNullable}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="default" className="text-right">
              Default
            </Label>
            <Input
              id="default"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              className="col-span-3"
              placeholder="Valore di default"
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? (columnToEdit ? "Salvataggio..." : "Aggiunta...") : (columnToEdit ? "Salva" : "Aggiungi")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
