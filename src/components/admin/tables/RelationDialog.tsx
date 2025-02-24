
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
import { supabase } from "@/integrations/supabase/client";

interface RelationDialogProps {
  open: boolean;
  onClose: () => void;
  currentTable: TableInfo;
  tables: TableInfo[];
  relationToEdit?: {
    column: string;
    foreign_table: string;
    foreign_column: string;
  };
  onRelationModified?: () => void;
}

export const RelationDialog = ({
  open,
  onClose,
  currentTable,
  tables,
  relationToEdit,
  onRelationModified,
}: RelationDialogProps) => {
  const [selectedColumn, setSelectedColumn] = useState(relationToEdit?.column || "");
  const [selectedTable, setSelectedTable] = useState(relationToEdit?.foreign_table || "");
  const [selectedForeignColumn, setSelectedForeignColumn] = useState(relationToEdit?.foreign_column || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!selectedColumn || !selectedTable || !selectedForeignColumn) {
        toast.error("Tutti i campi sono obbligatori");
        return;
      }

      setLoading(true);

      if (relationToEdit) {
        // Prima rimuoviamo la vecchia relazione
        await supabase.rpc('execute_sql', {
          sql: `
            ALTER TABLE "${currentTable.table_name}"
            DROP CONSTRAINT IF EXISTS "fk_${currentTable.table_name}_${relationToEdit.foreign_table}_${relationToEdit.column}";
          `
        });
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

      toast.success(relationToEdit ? "Relazione modificata con successo" : "Relazione creata con successo");
      onRelationModified?.();
      onClose();
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!relationToEdit) return;

    try {
      setLoading(true);
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          ALTER TABLE "${currentTable.table_name}"
          DROP CONSTRAINT IF EXISTS "fk_${currentTable.table_name}_${relationToEdit.foreign_table}_${relationToEdit.column}";
        `
      });

      if (error) throw error;

      toast.success("Relazione eliminata con successo");
      onRelationModified?.();
      onClose();
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    } finally {
      setLoading(false);
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
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C]">
        <DialogHeader>
          <DialogTitle>{relationToEdit ? "Modifica" : "Aggiungi"} Relazione</DialogTitle>
          <DialogDescription>
            {relationToEdit ? "Modifica una relazione esistente" : `Crea una relazione tra ${currentTable.table_name} e un'altra tabella`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="column" className="text-right text-white">
              Colonna
            </Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className="col-span-3 bg-[#2A2F3C] border-[#4F46E5] text-white">
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
            <Label htmlFor="table" className="text-right text-white">
              Tabella
            </Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="col-span-3 bg-[#2A2F3C] border-[#4F46E5] text-white">
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
              <Label htmlFor="foreignColumn" className="text-right text-white">
                Colonna Esterna
              </Label>
              <Select
                value={selectedForeignColumn}
                onValueChange={setSelectedForeignColumn}
              >
                <SelectTrigger className="col-span-3 bg-[#2A2F3C] border-[#4F46E5] text-white">
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
        <DialogFooter className="space-x-2">
          {relationToEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="mr-auto"
            >
              Elimina Relazione
            </Button>
          )}
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
            {loading ? "Salvataggio..." : (relationToEdit ? "Salva" : "Crea Relazione")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
