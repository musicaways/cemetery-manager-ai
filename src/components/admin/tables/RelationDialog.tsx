
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
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!open) {
      setSelectedColumn("");
      setSelectedTable("");
      setSelectedForeignColumn("");
    }
  }, [open]);

  const isPrimaryKey = (column: any) => {
    // Una colonna è considerata chiave primaria se:
    // 1. Ha il flag is_pk impostato a true
    // 2. O ha una sequenza come default value (nextval) ed è NOT NULL
    // 3. O si chiama "id"
    // 4. O è di tipo uuid ed è NOT NULL
    return column.is_pk || 
           (column.column_default?.includes('nextval') && column.is_nullable === 'NO') ||
           column.column_name === 'id' ||
           (column.data_type === 'uuid' && column.is_nullable === 'NO');
  };

  const handleSubmit = async () => {
    try {
      if (!selectedColumn || !selectedTable || !selectedForeignColumn) {
        toast.error("Tutti i campi sono obbligatori");
        return;
      }

      setLoading(true);

      // Verifichiamo se la colonna di riferimento è una chiave primaria
      const foreignTable = tables.find(t => t.table_name === selectedTable);
      const foreignColumn = foreignTable?.columns.find(c => c.column_name === selectedForeignColumn);
      
      if (!foreignColumn || !isPrimaryKey(foreignColumn)) {
        toast.error("La colonna di riferimento deve essere una chiave primaria");
        setLoading(false);
        return;
      }

      // Prima rimuoviamo eventuali relazioni esistenti sulla colonna
      const dropExistingConstraintSQL = `
        DO $$
        BEGIN
          EXECUTE (
            SELECT 'ALTER TABLE "' || '${currentTable.table_name}' || '" DROP CONSTRAINT "' || conname || '"'
            FROM pg_constraint
            WHERE conrelid = '"${currentTable.table_name}"'::regclass
            AND conkey = ARRAY[(
              SELECT attnum
              FROM pg_attribute
              WHERE attrelid = '"${currentTable.table_name}"'::regclass
              AND attname = '${selectedColumn}'
            )]
            AND contype = 'f'
            LIMIT 1
          );
        EXCEPTION WHEN OTHERS THEN
          -- Ignoriamo eventuali errori se il constraint non esiste
        END $$;
      `;

      // Modifichiamo il tipo della colonna se necessario
      const columnTypeSQL = `
        ALTER TABLE "${currentTable.table_name}"
        ALTER COLUMN "${selectedColumn}" TYPE ${foreignColumn.data_type} 
        USING "${selectedColumn}"::${foreignColumn.data_type};
      `;

      // Creiamo la nuova relazione
      const relationSQL = `
        ALTER TABLE "${currentTable.table_name}"
        ADD CONSTRAINT "fk_${currentTable.table_name}_${selectedTable}_${selectedColumn}"
        FOREIGN KEY ("${selectedColumn}")
        REFERENCES "${selectedTable}"("${selectedForeignColumn}")
        ON DELETE CASCADE;
      `;

      // Eseguiamo le operazioni in sequenza
      const { error: error1 } = await supabase.rpc('execute_sql', {
        sql: dropExistingConstraintSQL
      });
      if (error1) throw error1;

      const { error: error2 } = await supabase.rpc('execute_sql', {
        sql: columnTypeSQL
      });
      if (error2) throw error2;

      const { error: error3 } = await supabase.rpc('execute_sql', {
        sql: relationSQL
      });
      if (error3) throw error3;

      toast.success("Relazione creata con successo");
      onRelationModified?.();
      onClose();
    } catch (error: any) {
      console.error("Error creating relation:", error);
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

  // Filtriamo solo le colonne che sono chiavi primarie per la tabella di riferimento
  const primaryKeyColumns = selectedTableInfo?.columns.filter(isPrimaryKey) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-[#1A1F2C] border-[#2A2F3C] p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-white">
            {relationToEdit ? "Modifica" : "Aggiungi"} Relazione
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {relationToEdit 
              ? "Modifica una relazione esistente"
              : `Crea una relazione tra ${currentTable.table_name} e un'altra tabella`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="column" className="text-white">
              Colonna locale
            </Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger 
                id="column"
                className="bg-[#2A2F3C] border-[#4F46E5] text-white min-h-[2.5rem]"
              >
                <SelectValue placeholder="Seleziona una colonna" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3C] border-[#4F46E5] max-h-[200px]">
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
              Tabella di riferimento
            </Label>
            <Select value={selectedTable} onValueChange={(value) => {
              setSelectedTable(value);
              setSelectedForeignColumn(""); // Reset della colonna selezionata
            }}>
              <SelectTrigger 
                id="table"
                className="bg-[#2A2F3C] border-[#4F46E5] text-white min-h-[2.5rem]"
              >
                <SelectValue placeholder="Seleziona una tabella" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3C] border-[#4F46E5] max-h-[200px]">
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
                Colonna di riferimento (chiave primaria)
              </Label>
              <Select value={selectedForeignColumn} onValueChange={setSelectedForeignColumn}>
                <SelectTrigger 
                  id="foreignColumn"
                  className="bg-[#2A2F3C] border-[#4F46E5] text-white min-h-[2.5rem]"
                >
                  <SelectValue placeholder="Seleziona una colonna" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2F3C] border-[#4F46E5] max-h-[200px]">
                  {primaryKeyColumns.map((column) => (
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
              {primaryKeyColumns.length === 0 && selectedTable && (
                <p className="text-yellow-400 text-sm mt-1">
                  Attenzione: questa tabella non ha colonne chiave primaria disponibili
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex-col space-y-2 sm:space-y-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="w-full sm:w-auto order-2 sm:order-1 border-gray-600 text-gray-300 hover:bg-[#2A2F3C] hover:text-white"
            >
              Annulla
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
            >
              {loading ? "Salvataggio..." : "Crea Relazione"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
