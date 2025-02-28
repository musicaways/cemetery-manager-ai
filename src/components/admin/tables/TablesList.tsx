
import { useState, memo, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TableInfo } from "@/types/database";
import TableDetails from "./TableDetails";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateTableDialog } from "./CreateTableDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TablesListProps {
  tables?: TableInfo[];
  onTableChange?: () => void;
  onSelectTable?: (name: string) => void;
}

// Struttura del risultato della funzione get_complete_schema
interface SchemaResult {
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      notnull: boolean;
      default: string | null;
    }>;
    foreign_keys?: Array<{
      column: string;
      foreign_table: string;
      foreign_column: string;
    }>;
  }>;
}

// Ottimizziamo il rendering del componente AccordionContent
const MemoizedTableDetails = memo(TableDetails);

export const TablesList = ({ tables: initialTables, onTableChange, onSelectTable }: TablesListProps) => {
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTables) {
      setTables(initialTables);
      setLoading(false);
    } else {
      loadTables();
    }
  }, [initialTables]);

  const loadTables = async () => {
    setLoading(true);
    try {
      // Utilizziamo get_complete_schema che è disponibile nei tipi
      const { data, error } = await supabase.rpc('get_complete_schema');
      if (error) throw error;
      
      // Cast del risultato al tipo che conosciamo
      const schemaData = data as unknown as SchemaResult;
      
      // Estraiamo le informazioni sulle tabelle dal risultato
      const tablesInfo: TableInfo[] = schemaData.tables?.map((table) => ({
        table_name: table.name,
        columns: table.columns.map((col) => ({
          column_name: col.name,
          data_type: col.type,
          is_nullable: col.notnull ? 'NO' : 'YES',
          column_default: col.default
        })),
        foreign_keys: table.foreign_keys?.map((fk) => ({
          column: fk.column,
          foreign_table: fk.foreign_table,
          foreign_column: fk.foreign_column
        })) || []
      })) || [];
      
      setTables(tablesInfo);
    } catch (error: any) {
      console.error("Error loading tables:", error);
      toast.error(`Errore nel caricamento delle tabelle: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTableCreated = () => {
    loadTables();
    setIsCreateTableOpen(false);
    if (onTableChange) onTableChange();
  };

  return (
    <div className="space-y-4 relative pb-20">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {tables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessuna tabella presente. Crea la tua prima tabella!
            </div>
          ) : (
            tables.map((table) => (
              <Accordion type="single" collapsible key={table.table_name}>
                <AccordionItem value={table.table_name} className="bg-[#1A1F2C] rounded-lg border border-[#2A2F3C]/40">
                  <AccordionTrigger 
                    className="px-4 py-2 text-white hover:text-[var(--primary-color)]"
                    onClick={() => onSelectTable && onSelectTable(table.table_name)}
                  >
                    <div className="flex items-center gap-3">
                      <span>{table.table_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-xs">
                        {table.columns.length} colonne
                      </span>
                      {table.foreign_keys && table.foreign_keys.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs">
                          {table.foreign_keys.length} relazioni
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <MemoizedTableDetails 
                      table={table} 
                      tables={tables} 
                      onTableDeleted={() => {
                        loadTables();
                        if (onTableChange) onTableChange();
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))
          )}
        </div>
      )}

      <div className="fixed bottom-8 right-8">
        <Button
          onClick={() => setIsCreateTableOpen(true)}
          size="sm"
          className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 shadow-lg rounded-full w-12 h-12 p-0 transition-transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Aggiungi tabella</span>
        </Button>
      </div>

      <CreateTableDialog
        open={isCreateTableOpen}
        onClose={() => setIsCreateTableOpen(false)}
        onTableCreated={handleTableCreated}
      />
    </div>
  );
};

export default memo(TablesList);
