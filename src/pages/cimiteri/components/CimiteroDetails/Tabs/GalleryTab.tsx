
import { CimiteroFoto } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { FileUploadZone } from "../components/FileUploadZone";
import { PhotoGrid } from "./Gallery/PhotoGrid";
import { DeleteConfirmDialog } from "./Gallery/DeleteConfirmDialog";
import { useGallery } from "./Gallery/useGallery";

interface GalleryTabProps {
  foto: CimiteroFoto[];
  onDelete?: () => void;
  canEdit?: boolean;
  cimiteroId: number;
  onUploadComplete: () => void;
}

export const GalleryTab = ({ 
  foto, 
  onDelete, 
  canEdit, 
  cimiteroId, 
  onUploadComplete 
}: GalleryTabProps) => {
  const {
    selectedIndex,
    setSelectedIndex,
    isUploading,
    localFoto,
    deleteDialogOpen,
    setDeleteDialogOpen,
    photoToDelete,
    setPhotoToDelete,
    handleDeleteClick,
    handleDelete,
    handleFileSelect
  } = useGallery(foto, cimiteroId, onUploadComplete, onDelete);

  return (
    <div className="space-y-4">
      {canEdit && (
        <FileUploadZone
          onFileSelect={handleFileSelect}
          accept="image/*"
          maxSize={5}
          disabled={isUploading}
        />
      )}

      {localFoto?.length > 0 ? (
        <PhotoGrid
          photos={localFoto}
          onPhotoClick={setSelectedIndex}
          onDeleteClick={handleDeleteClick}
          canEdit={canEdit}
        />
      ) : (
        !canEdit && (
          <div className="text-center py-8 text-gray-500">
            Nessuna foto disponibile
          </div>
        )
      )}

      <MediaViewer
        items={localFoto}
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
          if (photoToDelete) {
            handleDelete(photoToDelete);
            setPhotoToDelete(null);
            setDeleteDialogOpen(false);
          }
        }}
        onCancel={() => {
          setPhotoToDelete(null);
          setDeleteDialogOpen(false);
        }}
      />
    </div>
  );
};
