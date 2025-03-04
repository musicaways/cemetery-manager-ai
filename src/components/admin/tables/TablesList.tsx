
import { useState, memo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TableInfo } from "@/types/database";
import TableDetails from "./TableDetails";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateTableDialog } from "./CreateTableDialog";

interface TablesListProps {
  tables: TableInfo[];
  onTableChange: () => void;
}

// Ottimizziamo il rendering del componente AccordionContent
const MemoizedTableDetails = memo(TableDetails);

export const TablesList = ({ tables, onTableChange }: TablesListProps) => {
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);

  return (
    <div className="space-y-4 relative pb-20">
      <div className="grid gap-4">
        {tables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nessuna tabella presente. Crea la tua prima tabella!
          </div>
        ) : (
          tables.map((table) => (
            <Accordion type="single" collapsible key={table.table_name}>
              <AccordionItem value={table.table_name} className="bg-[#1A1F2C] rounded-lg border border-[#2A2F3C]/40">
                <AccordionTrigger className="px-4 py-2 text-white hover:text-[var(--primary-color)]">
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
                    onTableDeleted={onTableChange}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))
        )}
      </div>

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
        onTableCreated={onTableChange}
      />
    </div>
  );
};

export default memo(TablesList);
