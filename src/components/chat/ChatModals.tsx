
import { useState } from "react";
import { MediaUpload } from "@/components/MediaUpload";
import { FunctionsModal } from "@/components/FunctionsModal";
import { CimiteroEditor } from "@/pages/cimiteri/components/CimiteroEditor";
import type { Cimitero } from "@/pages/cimiteri/types";

interface ChatModalsProps {
  isMediaUploadOpen: boolean;
  isFunctionsOpen: boolean;
  onMediaUploadClose: () => void;
  onFunctionsClose: () => void;
  onMediaUpload: (url: string) => void;
  onFunctionSelect: (functionType: string) => void;
  selectedCimitero?: Cimitero | null;
  onCimiteroEditorClose?: () => void;
}

export const ChatModals = ({
  isMediaUploadOpen,
  isFunctionsOpen,
  onMediaUploadClose,
  onFunctionsClose,
  onMediaUpload,
  onFunctionSelect,
  selectedCimitero,
  onCimiteroEditorClose
}: ChatModalsProps) => {
  const handleSave = async (data: Partial<Cimitero>, coverImage?: File): Promise<void> => {
    // Per ora non implementiamo il salvataggio nella chat
    return Promise.resolve();
  };

  const handleUploadComplete = async (url: string): Promise<void> => {
    // Per ora non implementiamo l'upload nella chat
    return Promise.resolve();
  };

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

      {selectedCimitero && (
        <CimiteroEditor
          cimitero={selectedCimitero}
          onClose={onCimiteroEditorClose}
          onSave={handleSave}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  );
};
