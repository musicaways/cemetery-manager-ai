
import { useState } from "react";
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

export const TablesList = ({ tables, onTableChange }: TablesListProps) => {
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => setIsCreateTableOpen(true)}
          className="text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-200 rounded-full h-8 px-3"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-sm font-medium">Nuova tabella</span>
        </Button>
      </div>

      {tables.map((table) => (
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
              <TableDetails 
                table={table} 
                tables={tables} 
                onTableDeleted={onTableChange}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}

      <CreateTableDialog
        open={isCreateTableOpen}
        onClose={() => setIsCreateTableOpen(false)}
      />
    </div>
  );
};

export default TablesList;
