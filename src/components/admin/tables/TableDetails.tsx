
import { TableInfo } from "@/types/database";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TableActions } from "./components/TableActions";
import { ColumnsTable } from "./components/ColumnsTable";
import { RelationsSection } from "./components/RelationsSection";
import { AddEditColumnDialog } from "./AddEditColumnDialog";
import { RelationDialog } from "./RelationDialog";

interface TableDetailsProps {
  table: TableInfo;
  tables: TableInfo[];
  onTableDeleted: () => void;
}

export const TableDetails = ({ table, tables, onTableDeleted }: TableDetailsProps) => {
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);
  const [isAddRelationOpen, setIsAddRelationOpen] = useState(false);
  const [isEditRelationOpen, setIsEditRelationOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<{
    name: string;
    type: string;
    isNullable: boolean;
    defaultValue: string | null;
  } | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<{
    column: string;
    foreign_table: string;
    foreign_column: string;
  } | null>(null);

  const handleCopyColumnName = (columnName: string) => {
    navigator.clipboard.writeText(columnName);
    toast.success("Nome colonna copiato!");
  };

  const handleExportTable = () => {
    const data = {
      table: table.table_name,
      columns: table.columns.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable,
        default: col.column_default
      })),
      relations: table.foreign_keys
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${table.table_name}-schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Schema esportato con successo!");
  };

  const handleDeleteTable = async () => {
    if (window.confirm(`Sei sicuro di voler eliminare la tabella ${table.table_name}?`)) {
      try {
        const { error } = await supabase.rpc('execute_sql', {
          sql: `DROP TABLE IF EXISTS "${table.table_name}" CASCADE;`
        });

        if (error) throw error;

        toast.success("Tabella eliminata con successo");
        onTableDeleted();
      } catch (error: any) {
        toast.error(`Errore: ${error.message}`);
      }
    }
  };

  const handleEditColumn = (column: any) => {
    setSelectedColumn({
      name: column.column_name,
      type: column.data_type,
      isNullable: column.is_nullable === 'YES',
      defaultValue: column.column_default
    });
    setIsEditColumnOpen(true);
  };

  const handleDeleteColumn = async (columnName: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare la colonna ${columnName}?`)) {
      try {
        const { error } = await supabase.rpc('execute_sql', {
          sql: `ALTER TABLE "${table.table_name}" DROP COLUMN IF EXISTS "${columnName}";`
        });

        if (error) throw error;

        toast.success("Colonna eliminata con successo");
        onTableDeleted();
      } catch (error: any) {
        toast.error(`Errore: ${error.message}`);
      }
    }
  };

  const handleEditRelation = (relation: any) => {
    setSelectedRelation(relation);
    setIsEditRelationOpen(true);
  };

  const handleDeleteRelation = async (relation: any) => {
    if (window.confirm(`Sei sicuro di voler eliminare la relazione tra ${table.table_name}.${relation.column} e ${relation.foreign_table}.${relation.foreign_column}?`)) {
      try {
        const dropConstraintSQL = `
          ALTER TABLE "${table.table_name}"
          DROP CONSTRAINT IF EXISTS "${relation.name}";
        `;

        const { error } = await supabase.rpc('execute_sql', {
          sql: dropConstraintSQL
        });

        if (error) throw error;

        toast.success("Relazione eliminata con successo");
        onTableDeleted();
      } catch (error: any) {
        toast.error(`Errore: ${error.message}`);
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <TableActions
          onAddColumn={() => setIsAddColumnOpen(true)}
          onAddRelation={() => setIsAddRelationOpen(true)}
          onDeleteTable={handleDeleteTable}
          onExportTable={handleExportTable}
        />
        
        <ColumnsTable
          columns={table.columns}
          onCopyColumn={handleCopyColumnName}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
        />

        <RelationsSection
          relations={table.foreign_keys || []}
          onEditRelation={handleEditRelation}
          onDeleteRelation={handleDeleteRelation}
        />

        <AddEditColumnDialog
          open={isAddColumnOpen}
          onClose={() => setIsAddColumnOpen(false)}
          tableName={table.table_name}
          onColumnModified={onTableDeleted}
        />

        <AddEditColumnDialog
          open={isEditColumnOpen}
          onClose={() => {
            setIsEditColumnOpen(false);
            setSelectedColumn(null);
          }}
          tableName={table.table_name}
          columnToEdit={selectedColumn || undefined}
          onColumnModified={onTableDeleted}
        />

        <RelationDialog
          open={isAddRelationOpen}
          onClose={() => setIsAddRelationOpen(false)}
          currentTable={table}
          tables={tables}
          onRelationModified={onTableDeleted}
        />

        <RelationDialog
          open={isEditRelationOpen}
          onClose={() => {
            setIsEditRelationOpen(false);
            setSelectedRelation(null);
          }}
          currentTable={table}
          tables={tables}
          relationToEdit={selectedRelation || undefined}
          onRelationModified={onTableDeleted}
        />
      </div>
    </TooltipProvider>
  );
};

export default TableDetails;
