
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Database, Copy, Download, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TableInfo = {
  table_name: string;
  columns: ColumnInfo[];
};

type ColumnInfo = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
};

type SchemaResponse = {
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      is_nullable: boolean;
      default_value: string | null;
    }>;
  }>;
};

export const TablesAdmin = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadTables = async () => {
    try {
      const { data: schemaData, error } = await supabase
        .rpc('get_complete_schema')
        .single<SchemaResponse>();

      if (error) throw error;

      if (schemaData?.tables) {
        const formattedTables: TableInfo[] = schemaData.tables.map(table => ({
          table_name: table.name,
          columns: table.columns.map(col => ({
            column_name: col.name,
            data_type: col.type,
            is_nullable: col.is_nullable ? 'YES' : 'NO',
            column_default: col.default_value
          }))
        }));
        setTables(formattedTables);
      }
    } catch (error: any) {
      toast.error("Errore nel caricamento delle tabelle: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchTerm(e.detail);
    };
    
    window.addEventListener('global-search', handleSearch as EventListener);
    return () => window.removeEventListener('global-search', handleSearch as EventListener);
  }, []);

  const handleCopyColumnName = (columnName: string) => {
    navigator.clipboard.writeText(columnName);
    toast.success("Nome colonna copiato!");
  };

  const handleExportTable = (tableName: string, columns: ColumnInfo[]) => {
    const data = {
      table: tableName,
      columns: columns.map(col => ({
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
    a.download = `${tableName}-schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Schema esportato con successo!");
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredTables = tables
    .filter(table => table.table_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const comparison = a.table_name.localeCompare(b.table_name);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-[var(--primary-color)]" />
            <h1 className="text-2xl font-bold text-white">Gestione Tabelle</h1>
            <span className="px-2 py-1 rounded-md bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-sm">
              {tables.length} tabelle
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSort}
            className="text-gray-400 hover:text-[var(--primary-color)]"
          >
            {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="space-y-4">
          {filteredTables.map((table) => (
            <Accordion type="single" collapsible key={table.table_name}>
              <AccordionItem value={table.table_name} className="bg-[#1A1F2C] rounded-lg border border-[#2A2F3C]/40">
                <AccordionTrigger className="px-4 py-2 text-white hover:text-[var(--primary-color)]">
                  <div className="flex items-center gap-3">
                    <span>{table.table_name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-xs">
                      {table.columns.length} colonne
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-[var(--primary-color)]"
                      onClick={() => handleExportTable(table.table_name, table.columns)}
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
                        <TableHead className="text-gray-400 w-[50px]"></TableHead>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-[var(--primary-color)]"
                              onClick={() => handleCopyColumnName(column.column_name)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TablesAdmin;
