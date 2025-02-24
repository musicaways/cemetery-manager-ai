
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

export const TablesAdmin = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTables = async () => {
    try {
      // Carica tutte le tabelle del database
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) throw tablesError;

      const tableInfoPromises = tablesData.map(async (table) => {
        const { data: columnsData, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', table.table_name);

        if (columnsError) throw columnsError;

        return {
          table_name: table.table_name,
          columns: columnsData
        };
      });

      const tableInfo = await Promise.all(tableInfoPromises);
      setTables(tableInfo);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle tabelle: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Gestione Tabelle</h1>
      
      <div className="space-y-4">
        {tables.map((table) => (
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
                        <TableCell className="text-white">{column.column_name}</TableCell>
                        <TableCell className="text-white">{column.data_type}</TableCell>
                        <TableCell className="text-white">{column.is_nullable}</TableCell>
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
