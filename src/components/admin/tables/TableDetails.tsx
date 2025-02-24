import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableInfo } from "@/types/database";
import { Copy, Download, Link2, Pencil, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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
  const [selectedColumn, setSelectedColumn] = useState<{
    name: string;
    type: string;
    isNullable: boolean;
    defaultValue: string | null;
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
      }))
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

  const renderRelations = () => {
    if (!table.foreign_keys?.length) return null;
    
    return (
      <div className="mt-4 p-4 bg-[#2A2F3C]/20 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Relazioni
        </h3>
        <div className="space-y-2">
          {table.foreign_keys.map((fk, index) => (
            <div key={index} className="text-sm text-white flex items-center gap-2">
              <span className="text-gray-400">{fk.column}</span>
              <span className="text-gray-500">→</span>
              <span className="text-[var(--primary-color)]">{fk.foreign_table}</span>
              <span className="text-gray-500">({fk.foreign_column})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddColumnOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Colonna
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddRelationOpen(true)}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Aggiungi Relazione
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-500"
              onClick={handleDeleteTable}
            >
              <Trash className="h-4 w-4 mr-2" />
              Elimina Tabella
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-[var(--primary-color)]"
            onClick={handleExportTable}
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta Schema
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-400">Colonna</TableHead>
              <TableHead className="text-gray-400">Tipo</TableHead>
              <TableHead className="text-gray-400">Nullable</TableHead>
              <TableHead className="text-gray-400">Default</TableHead>
              <TableHead className="text-gray-400 w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.columns.map((column) => (
              <TableRow key={column.column_name}>
                <TableCell className="text-white font-medium">
                  <Tooltip>
                    <TooltipTrigger>{column.column_name}</TooltipTrigger>
                    <TooltipContent>
                      Clicca sull'icona per copiare il nome
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-white">{column.data_type}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${column.is_nullable === 'YES' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {column.is_nullable}
                  </span>
                </TableCell>
                <TableCell className="text-white">{column.column_default || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-[var(--primary-color)]"
                      onClick={() => handleCopyColumnName(column.column_name)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-[var(--primary-color)]"
                      onClick={() => handleEditColumn(column)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteColumn(column.column_name)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderRelations()}

        <AddEditColumnDialog
          open={isAddColumnOpen}
          onClose={() => setIsAddColumnOpen(false)}
          tableName={table.table_name}
        />

        <AddEditColumnDialog
          open={isEditColumnOpen}
          onClose={() => {
            setIsEditColumnOpen(false);
            setSelectedColumn(null);
          }}
          tableName={table.table_name}
          columnToEdit={selectedColumn || undefined}
        />

        <RelationDialog
          open={isAddRelationOpen}
          onClose={() => setIsAddRelationOpen(false)}
          currentTable={table}
          tables={tables}
        />
      </div>
    </TooltipProvider>
  );
};

export default TableDetails;
