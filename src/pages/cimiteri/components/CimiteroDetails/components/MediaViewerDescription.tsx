
interface MediaViewerDescriptionProps {
  description?: string | null;
}

export const MediaViewerDescription = ({ description }: MediaViewerDescriptionProps) => {
  if (!description) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
      <p className="text-white text-center">{description}</p>
    </div>
  );
};
