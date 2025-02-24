import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { TableInfo } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface RelationDialogProps {
  open: boolean;
  onClose: () => void;
  currentTable: TableInfo;
  tables: TableInfo[];
}

export const RelationDialog = ({
  open,
  onClose,
  currentTable,
  tables,
}: RelationDialogProps) => {
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedForeignColumn, setSelectedForeignColumn] = useState("");

  const handleSubmit = async () => {
    try {
      if (!selectedColumn || !selectedTable || !selectedForeignColumn) {
        toast.error("Tutti i campi sono obbligatori");
        return;
      }

      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          ALTER TABLE "${currentTable.table_name}"
          ADD CONSTRAINT "fk_${currentTable.table_name}_${selectedTable}_${selectedColumn}"
          FOREIGN KEY ("${selectedColumn}")
          REFERENCES "${selectedTable}"("${selectedForeignColumn}")
          ON DELETE CASCADE;
        `
      });

      if (error) throw error;

      toast.success("Relazione creata con successo");
      onClose();
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    }
  };

  const otherTables = tables.filter(
    (table) => table.table_name !== currentTable.table_name
  );

  const selectedTableInfo = tables.find(
    (table) => table.table_name === selectedTable
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aggiungi Relazione</DialogTitle>
          <DialogDescription>
            Crea una relazione tra {currentTable.table_name} e un'altra tabella
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="column" className="text-right">
              Colonna
            </Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleziona una colonna" />
              </SelectTrigger>
              <SelectContent>
                {currentTable.columns.map((column) => (
                  <SelectItem key={column.column_name} value={column.column_name}>
                    {column.column_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="table" className="text-right">
              Tabella
            </Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleziona una tabella" />
              </SelectTrigger>
              <SelectContent>
                {otherTables.map((table) => (
                  <SelectItem key={table.table_name} value={table.table_name}>
                    {table.table_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedTable && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="foreignColumn" className="text-right">
                Colonna Esterna
              </Label>
              <Select
                value={selectedForeignColumn}
                onValueChange={setSelectedForeignColumn}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona una colonna" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTableInfo?.columns.map((column) => (
                    <SelectItem key={column.column_name} value={column.column_name}>
                      {column.column_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Crea Relazione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
