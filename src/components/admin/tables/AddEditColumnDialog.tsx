
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

interface AddEditColumnDialogProps {
  open: boolean;
  onClose: () => void;
  tableName: string;
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
}: AddEditColumnDialogProps) => {
  const [columnName, setColumnName] = useState(columnToEdit?.name || "");
  const [columnType, setColumnType] = useState(columnToEdit?.type || "text");
  const [isNullable, setIsNullable] = useState(columnToEdit?.isNullable || false);
  const [defaultValue, setDefaultValue] = useState(columnToEdit?.defaultValue || "");

  const handleSubmit = async () => {
    try {
      if (!columnName) {
        toast.error("Il nome della colonna è obbligatorio");
        return;
      }

      // Costruisci la query SQL
      const operation = columnToEdit ? "ALTER" : "ADD";
      const query = columnToEdit
        ? `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE ${columnType};
           ALTER TABLE "${tableName}" ${isNullable ? 'DROP NOT NULL' : 'SET NOT NULL'};
           ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" ${defaultValue ? `SET DEFAULT ${defaultValue}` : 'DROP DEFAULT'};`
        : `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${columnType}${isNullable ? '' : ' NOT NULL'}${defaultValue ? ` DEFAULT ${defaultValue}` : ''};`;

      toast.success(`Colonna ${columnToEdit ? 'modificata' : 'aggiunta'} con successo`);
      onClose();
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    }
  };

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
              onChange={(e) => setColumnName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select value={columnType} onValueChange={setColumnType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleziona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="integer">Integer</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="timestamp">Timestamp</SelectItem>
                <SelectItem value="uuid">UUID</SelectItem>
                <SelectItem value="jsonb">JSONB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nullable" className="text-right">
              Nullable
            </Label>
            <Switch
              id="nullable"
              checked={isNullable}
              onCheckedChange={setIsNullable}
            />
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {columnToEdit ? "Salva" : "Aggiungi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
