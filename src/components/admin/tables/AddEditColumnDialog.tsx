
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
import { useState, useEffect } from "react";
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
  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState("text");
  const [isNullable, setIsNullable] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (columnToEdit && open) {
      setColumnName(columnToEdit.name);
      setColumnType(columnToEdit.type);
      setIsNullable(columnToEdit.isNullable);
      setDefaultValue(columnToEdit.defaultValue || "");
    } else if (!open) {
      setColumnName("");
      setColumnType("text");
      setIsNullable(false);
      setDefaultValue("");
    }
  }, [columnToEdit, open]);

  const handleSubmit = async () => {
    try {
      if (!columnName) {
        toast.error("Il nome della colonna è obbligatorio");
        return;
      }

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
      if (onColumnModified) {
        await onColumnModified();
      }
      onClose();
    } catch (error: any) {
      console.error("Error modifying column:", error);
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
      <DialogContent className="bg-[#1A1F2C] border-0">
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
            <Label htmlFor="name" className="text-right text-white">
              Nome
            </Label>
            <Input
              id="name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value.toLowerCase())}
              className="col-span-3 bg-[#2A2F3C] border-[#4F46E5] text-white"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right text-white">
              Tipo
            </Label>
            <Select value={columnType} onValueChange={setColumnType} disabled={loading}>
              <SelectTrigger id="type" className="col-span-3 bg-[#2A2F3C] border-[#4F46E5] text-white">
                <SelectValue placeholder="Seleziona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="text-white"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nullable" className="text-right text-white">
              Nullable
            </Label>
            <div className="col-span-3">
              <Switch
                id="nullable"
                checked={isNullable}
                onCheckedChange={setIsNullable}
                disabled={loading}
                className="data-[state=checked]:bg-[#4F46E5]"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="default" className="text-right text-white">
              Default
            </Label>
            <Input
              id="default"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              className="col-span-3 bg-[#2A2F3C] border-[#4F46E5] text-white"
              placeholder="Valore di default"
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
            {loading ? (columnToEdit ? "Salvataggio..." : "Aggiunta...") : (columnToEdit ? "Salva" : "Aggiungi")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
