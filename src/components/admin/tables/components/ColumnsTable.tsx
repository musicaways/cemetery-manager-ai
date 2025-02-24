
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Pencil, Trash } from "lucide-react";
import { ColumnInfo } from "@/types/database";

interface ColumnsTableProps {
  columns: ColumnInfo[];
  onCopyColumn: (name: string) => void;
  onEditColumn: (column: ColumnInfo) => void;
  onDeleteColumn: (name: string) => void;
}

export const ColumnsTable = ({
  columns,
  onCopyColumn,
  onEditColumn,
  onDeleteColumn
}: ColumnsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-400 bg-[#1A1F2C] min-w-[120px]">Colonna</TableHead>
            <TableHead className="text-gray-400 bg-[#1A1F2C] min-w-[100px] hidden sm:table-cell">Tipo</TableHead>
            <TableHead className="text-gray-400 bg-[#1A1F2C] w-[80px]">Null</TableHead>
            <TableHead className="text-gray-400 bg-[#1A1F2C] hidden sm:table-cell">Default</TableHead>
            <TableHead className="text-gray-400 bg-[#1A1F2C] w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {columns.map((column) => (
            <TableRow key={column.column_name} className="hover:bg-[#2A2F3C]/50">
              <TableCell className="text-white font-medium">
                <div className="flex flex-col">
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer hover:text-[var(--primary-color)] truncate">
                      {column.column_name}
                    </TooltipTrigger>
                    <TooltipContent>
                      Clicca per copiare il nome
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-xs text-gray-400 sm:hidden">{column.data_type}</span>
                </div>
              </TableCell>
              <TableCell className="text-white hidden sm:table-cell">{column.data_type}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${column.is_nullable === 'YES' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {column.is_nullable === 'YES' ? 'SI' : 'NO'}
                </span>
              </TableCell>
              <TableCell className="text-white max-w-[200px] truncate hidden sm:table-cell">
                {column.column_default || '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-[var(--primary-color)]"
                    onClick={() => onCopyColumn(column.column_name)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-[var(--primary-color)]"
                    onClick={() => onEditColumn(column)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => onDeleteColumn(column.column_name)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
