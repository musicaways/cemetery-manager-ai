
import { Button } from "@/components/ui/button";
import { Download, Link2, Plus, Trash } from "lucide-react";

interface TableActionsProps {
  onAddColumn: () => void;
  onAddRelation: () => void;
  onDeleteTable: () => void;
  onExportTable: () => void;
}

export const TableActions = ({
  onAddColumn,
  onAddRelation,
  onDeleteTable,
  onExportTable
}: TableActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddColumn}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Colonna
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddRelation}
          className="w-full sm:w-auto"
        >
          <Link2 className="h-4 w-4 mr-2" />
          Aggiungi Relazione
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full sm:w-auto text-gray-400 hover:text-red-500"
          onClick={onDeleteTable}
        >
          <Trash className="h-4 w-4 mr-2" />
          Elimina Tabella
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full sm:w-auto text-gray-400 hover:text-[var(--primary-color)]"
        onClick={onExportTable}
      >
        <Download className="h-4 w-4 mr-2" />
        Esporta Schema
      </Button>
    </div>
  );
};
