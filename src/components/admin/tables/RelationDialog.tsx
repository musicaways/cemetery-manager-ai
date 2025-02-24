
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TableInfo } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { RelationFields } from "./components/relation-dialog/RelationFields";
import { createRelationQueries, isPrimaryKey } from "./utils/relationQueries";

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

  const handleSubmit = async () => {
    try {
      if (!selectedColumn || !selectedTable || !selectedForeignColumn) {
        toast.error("Tutti i campi sono obbligatori");
        return;
      }

      setLoading(true);

      const foreignTable = tables.find(t => t.table_name === selectedTable);
      const foreignColumn = foreignTable?.columns.find(c => c.column_name === selectedForeignColumn);
      
      if (!foreignColumn || !isPrimaryKey(foreignColumn)) {
        toast.error("La colonna di riferimento deve essere una chiave primaria");
        setLoading(false);
        return;
      }

      const queries = createRelationQueries(
        currentTable.table_name,
        selectedColumn,
        selectedTable,
        selectedForeignColumn,
        foreignColumn.data_type
      );

      // Eseguiamo le operazioni in sequenza
      const { error: error1 } = await supabase.rpc('execute_sql', {
        sql: queries.dropExistingConstraintSQL
      });
      if (error1) throw error1;

      const { error: error2 } = await supabase.rpc('execute_sql', {
        sql: queries.columnTypeSQL
      });
      if (error2) throw error2;

      const { error: error3 } = await supabase.rpc('execute_sql', {
        sql: queries.relationSQL
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

        <RelationFields
          currentTable={currentTable}
          otherTables={otherTables}
          selectedColumn={selectedColumn}
          selectedTable={selectedTable}
          selectedForeignColumn={selectedForeignColumn}
          primaryKeyColumns={primaryKeyColumns}
          onColumnChange={setSelectedColumn}
          onTableChange={(value) => {
            setSelectedTable(value);
            setSelectedForeignColumn("");
          }}
          onForeignColumnChange={setSelectedForeignColumn}
        />

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
