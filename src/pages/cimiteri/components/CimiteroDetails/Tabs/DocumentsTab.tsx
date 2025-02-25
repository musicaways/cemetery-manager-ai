
import { useState } from "react";
import { CimiteroDocumenti } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { FileUploadZone } from "../components/FileUploadZone";
import { DocumentList } from "./Documents/DocumentList";
import { DeleteConfirmDialog } from "./Documents/DeleteConfirmDialog";
import { useDocuments } from "./Documents/useDocuments";

interface DocumentsTabProps {
  documenti: CimiteroDocumenti[];
  onDelete?: () => void;
  canEdit?: boolean;
  cimiteroId: number;
  onUploadComplete: () => void;
}

export const DocumentsTab = ({ documenti, onDelete, canEdit, cimiteroId, onUploadComplete }: DocumentsTabProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const {
    localDocumenti,
    isUploading,
    handleDelete,
    handleFileSelect
  } = useDocuments(documenti, cimiteroId, onUploadComplete, onDelete);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <FileUploadZone
          onFileSelect={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.bmp,.gif,.jpg,.jpeg,.png"
          maxSize={10}
          disabled={isUploading}
        />
      )}

      <DocumentList
        documenti={localDocumenti}
        canEdit={canEdit}
        onDelete={handleDeleteClick}
        onSelect={setSelectedIndex}
      />

      <MediaViewer
        items={localDocumenti}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onDelete={canEdit ? handleDelete : undefined}
        canDelete={canEdit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (documentToDelete) {
            handleDelete(documentToDelete);
            setDocumentToDelete(null);
            setDeleteDialogOpen(false);
          }
        }}
        onCancel={() => {
          setDocumentToDelete(null);
          setDeleteDialogOpen(false);
        }}
      />
    </div>
  );
};
