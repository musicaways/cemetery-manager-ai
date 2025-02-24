
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnInfo, TableInfo } from "@/types/database";
import { isPrimaryKey } from "../../utils/relationQueries";

interface RelationFieldsProps {
  currentTable: TableInfo;
  otherTables: TableInfo[];
  selectedColumn: string;
  selectedTable: string;
  selectedForeignColumn: string;
  primaryKeyColumns: ColumnInfo[];
  onColumnChange: (value: string) => void;
  onTableChange: (value: string) => void;
  onForeignColumnChange: (value: string) => void;
}

export const RelationFields = ({
  currentTable,
  otherTables,
  selectedColumn,
  selectedTable,
  selectedForeignColumn,
  primaryKeyColumns,
  onColumnChange,
  onTableChange,
  onForeignColumnChange,
}: RelationFieldsProps) => {
  const availableTables = otherTables.map(table => ({
    ...table,
    hasPrimaryKey: table.columns.some(isPrimaryKey)
  }));

  return (
    <div className="grid gap-6 py-4">
      <div className="grid gap-2">
        <Label htmlFor="column" className="text-white">
          Colonna locale
        </Label>
        <Select value={selectedColumn} onValueChange={onColumnChange}>
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
        <Select value={selectedTable} onValueChange={onTableChange}>
          <SelectTrigger 
            id="table"
            className="bg-[#2A2F3C] border-[#4F46E5] text-white min-h-[2.5rem]"
          >
            <SelectValue placeholder="Seleziona una tabella" />
          </SelectTrigger>
          <SelectContent className="bg-[#2A2F3C] border-[#4F46E5] max-h-[300px]">
            {availableTables.map((table) => (
              <SelectItem 
                key={table.table_name} 
                value={table.table_name}
                className="text-white hover:bg-[#4F46E5] focus:bg-[#4F46E5]"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{table.table_name}</span>
                  {!table.hasPrimaryKey && (
                    <span className="text-yellow-400 text-xs">(no PK)</span>
                  )}
                </div>
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
          <Select value={selectedForeignColumn} onValueChange={onForeignColumnChange}>
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
                  <span className="text-gray-400 text-xs ml-2">({column.data_type})</span>
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
  );
};
