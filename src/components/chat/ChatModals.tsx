
import { MediaUpload } from "@/components/MediaUpload";
import { FunctionsModal } from "@/components/FunctionsModal";

interface ChatModalsProps {
  isMediaUploadOpen: boolean;
  isFunctionsOpen: boolean;
  onMediaUploadClose: () => void;
  onFunctionsClose: () => void;
  onMediaUpload: (url: string) => void;
  onFunctionSelect: (functionType: string) => void;
}

export const ChatModals = ({
  isMediaUploadOpen,
  isFunctionsOpen,
  onMediaUploadClose,
  onFunctionsClose,
  onMediaUpload,
  onFunctionSelect
}: ChatModalsProps) => {
  return (
    <>
      <MediaUpload 
        isOpen={isMediaUploadOpen}
        onClose={onMediaUploadClose}
        onUpload={(url) => onMediaUpload(`Analizza questa immagine: ${url}`)}
      />

      <FunctionsModal
        isOpen={isFunctionsOpen}
        onClose={onFunctionsClose}
        onFunctionSelect={onFunctionSelect}
      />
    </>
  );
};
