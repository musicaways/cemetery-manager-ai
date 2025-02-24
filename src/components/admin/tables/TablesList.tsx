
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TableInfo } from "@/types/database";
import TableDetails from "./TableDetails";

interface TablesListProps {
  tables: TableInfo[];
}

export const TablesList = ({ tables }: TablesListProps) => {
  return (
    <div className="space-y-4">
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
              <TableDetails table={table} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default TablesList;
