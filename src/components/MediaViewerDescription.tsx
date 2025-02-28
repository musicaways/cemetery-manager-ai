
interface MediaViewerDescriptionProps {
  description: string | null | undefined;
  currentIndex?: number;
  totalItems?: number;
}

export const MediaViewerDescription = ({ 
  description,
  currentIndex,
  totalItems
}: MediaViewerDescriptionProps) => {
  if (!description) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
      <p className="text-white text-center">{description}</p>
      {totalItems && totalItems > 1 && (
        <p className="text-white/60 text-sm text-center mt-1">
          {currentIndex !== undefined ? currentIndex + 1 : ''} di {totalItems}
        </p>
      )}
    </div>
  );
};

export default MediaViewerDescription;
