
import { Button } from "@/components/ui/button";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { ForeignKeyInfo } from "@/types/database";

interface RelationsSectionProps {
  relations: ForeignKeyInfo[];
  onEditRelation: (relation: ForeignKeyInfo) => void;
  onDeleteRelation: (relation: ForeignKeyInfo) => void;
}

export const RelationsSection = ({ relations, onEditRelation, onDeleteRelation }: RelationsSectionProps) => {
  if (!relations?.length) return null;
  
  return (
    <div className="mt-4 p-4 bg-[#2A2F3C]/20 rounded-lg">
      <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
        <Link2 className="h-4 w-4" />
        Relazioni
      </h3>
      <div className="space-y-2">
        {relations.map((relation, index) => (
          <div key={index} className="text-sm text-white flex items-center justify-between gap-2 pr-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-[var(--primary-color)]"
              onClick={() => onEditRelation(relation)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              <span className="text-gray-400">{relation.column}</span>
              <span className="text-gray-500">→</span>
              <span className="text-[var(--primary-color)]">{relation.foreign_table}</span>
              <span className="text-gray-500">({relation.foreign_column})</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-500"
              onClick={() => onDeleteRelation(relation)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
