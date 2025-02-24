
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TableInfo, SchemaResponse } from "@/types/database";
import TablesList from "@/components/admin/tables/TablesList";
import Breadcrumb from "@/components/admin/tables/Breadcrumb";

export const TablesAdmin = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadTables = useCallback(async () => {
    try {
      console.log("Loading tables...");
      const { data: schemaData, error } = await supabase
        .rpc('get_complete_schema')
        .single<SchemaResponse>();

      if (error) {
        console.error("Error loading schema:", error);
        throw error;
      }

      console.log("Raw schema data:", schemaData);

      if (schemaData?.tables) {
        const formattedTables: TableInfo[] = schemaData.tables
          .filter(table => !table.name.startsWith('_')) // Escludiamo le tabelle di sistema
          .map(table => {
            console.log(`Processing table ${table.name}:`, table);
            return {
              table_name: table.name,
              columns: table.columns.map(col => {
                console.log(`Processing column ${col.name} in table ${table.name}:`, col);
                return {
                  column_name: col.name,
                  data_type: col.type,
                  is_nullable: !col.is_nullable ? 'YES' : 'NO',
                  column_default: col.default_value
                };
              }),
              foreign_keys: (table.foreign_keys || []).map(fk => ({
                name: fk.column,
                column: fk.column,
                foreign_table: fk.foreign_table,
                foreign_column: fk.foreign_column
              }))
            };
          });

        console.log("Formatted tables:", formattedTables);
        setTables(formattedTables);
      }
    } catch (error: any) {
      console.error("Error loading tables:", error);
      toast.error("Errore nel caricamento delle tabelle: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

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
      <Breadcrumb />
      <TablesList 
        tables={filteredTables} 
        onTableChange={loadTables}
      />
    </div>
  );
};

export default TablesAdmin;
