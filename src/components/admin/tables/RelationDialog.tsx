
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

      // Prima verifichiamo se la colonna di riferimento è una chiave primaria
      const foreignTable = tables.find(t => t.table_name === selectedTable);
      const foreignColumn = foreignTable?.columns.find(c => c.column_name === selectedForeignColumn);
      
      if (!foreignColumn?.column_default?.includes('nextval') && !foreignColumn?.is_nullable === false) {
        toast.error("La colonna di riferimento deve essere una chiave primaria");
        return;
      }

      if (relationToEdit) {
        // Prima rimuoviamo la vecchia relazione
        await supabase.rpc('execute_sql', {
          sql: `
            ALTER TABLE "${currentTable.table_name}"
            DROP CONSTRAINT IF EXISTS "fk_${currentTable.table_name}_${relationToEdit.foreign_table}_${relationToEdit.column}";
          `
        });
      }

      // Ci assicuriamo che la colonna locale sia dello stesso tipo della colonna di riferimento
      const columnTypeSQL = `
        ALTER TABLE "${currentTable.table_name}"
        ALTER COLUMN "${selectedColumn}" TYPE ${foreignColumn?.data_type} USING "${selectedColumn}"::${foreignColumn?.data_type};
      `;

      // Creiamo la relazione
      const relationSQL = `
        ALTER TABLE "${currentTable.table_name}"
        ADD CONSTRAINT "fk_${currentTable.table_name}_${selectedTable}_${selectedColumn}"
        FOREIGN KEY ("${selectedColumn}")
        REFERENCES "${selectedTable}"("${selectedForeignColumn}")
        ON DELETE CASCADE;
      `;

      // Eseguiamo entrambe le operazioni
      const { error } = await supabase.rpc('execute_sql', {
        sql: `${columnTypeSQL} ${relationSQL}`
      });

      if (error) throw error;

      toast.success(relationToEdit ? "Relazione modificata con successo" : "Relazione creata con successo");
      onRelationModified?.();
      onClose();
    } catch (error: any) {
      console.error("Error creating relation:", error);
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
      <DialogContent className="sm:max-w-[425px] w-[95%] mx-auto bg-[#1A1F2C] border-[#2A2F3C] p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-white">
            {relationToEdit ? "Modifica" : "Aggiungi"} Relazione
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {relationToEdit ? "Modifica una relazione esistente" : `Crea una relazione tra ${currentTable.table_name} e un'altra tabella`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="column" className="text-white">
              Colonna
            </Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className="bg-[#2A2F3C] border-[#4F46E5] text-white">
                <SelectValue placeholder="Seleziona una colonna" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3C] border-[#4F46E5]">
                {currentTable.columns.map((column) => (
                  <SelectItem 
                    key={column.column_name} 
                    value={column.column_name}
                    className="text-white hover:bg-[#4F46E5] focus:bg-[#4F46E5]"
                  >
                    {column.column_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="table" className="text-white">
              Tabella
            </Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="bg-[#2A2F3C] border-[#4F46E5] text-white">
                <SelectValue placeholder="Seleziona una tabella" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3C] border-[#4F46E5]">
                {otherTables.map((table) => (
                  <SelectItem 
                    key={table.table_name} 
                    value={table.table_name}
                    className="text-white hover:bg-[#4F46E5] focus:bg-[#4F46E5]"
                  >
                    {table.table_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedTable && (
            <div className="grid gap-2">
              <Label htmlFor="foreignColumn" className="text-white">
                Colonna di Riferimento
              </Label>
              <Select value={selectedForeignColumn} onValueChange={setSelectedForeignColumn}>
                <SelectTrigger className="bg-[#2A2F3C] border-[#4F46E5] text-white">
                  <SelectValue placeholder="Seleziona una colonna" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2F3C] border-[#4F46E5]">
                  {selectedTableInfo?.columns.map((column) => (
                    <SelectItem 
                      key={column.column_name} 
                      value={column.column_name}
                      className="text-white hover:bg-[#4F46E5] focus:bg-[#4F46E5]"
                    >
                      {column.column_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
          {relationToEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Elimina Relazione
            </Button>
          )}
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-[#2A2F3C] hover:text-white"
            >
              Annulla
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
            >
              {loading ? "Salvataggio..." : (relationToEdit ? "Salva" : "Crea Relazione")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
