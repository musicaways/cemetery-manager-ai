
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
import { toast } from "sonner";

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

  // Aggiorna searchTerm quando la ricerca globale viene utilizzata
  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchTerm(e.detail);
    };
    
    window.addEventListener('global-search', handleSearch as EventListener);
    return () => window.removeEventListener('global-search', handleSearch as EventListener);
  }, []);

  const filteredTables = tables.filter(table =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestione Tabelle</h1>
      </div>
      
      <div className="space-y-4">
        {filteredTables.map((table) => (
          <Accordion type="single" collapsible key={table.table_name}>
            <AccordionItem value={table.table_name} className="bg-[#1A1F2C] rounded-lg border border-[#2A2F3C]/40">
              <AccordionTrigger className="px-4 py-2 text-white hover:text-[var(--primary-color)]">
                {table.table_name}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Colonna</TableHead>
                      <TableHead className="text-gray-400">Tipo</TableHead>
                      <TableHead className="text-gray-400">Nullable</TableHead>
                      <TableHead className="text-gray-400">Default</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.columns.map((column) => (
                      <TableRow key={column.column_name}>
                        <TableCell className="text-white font-medium">{column.column_name}</TableCell>
                        <TableCell className="text-white">{column.data_type}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${column.is_nullable === 'YES' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {column.is_nullable}
                          </span>
                        </TableCell>
                        <TableCell className="text-white">{column.column_default || '-'}</TableCell>
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
  );
};

export default TablesAdmin;
