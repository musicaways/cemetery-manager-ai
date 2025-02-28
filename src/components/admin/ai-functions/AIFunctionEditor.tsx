
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AIFunctionFormFields } from "./components/AIFunctionFormFields";
import { AIFunctionTester } from "./components/AIFunctionTester";
import { useAIFunctionForm } from "./hooks/useAIFunctionForm";
import type { AIFunctionEditorProps } from "./types";

export const AIFunctionEditor = ({ open, onClose, initialData, function: funcProp, onSave, onCancel }: AIFunctionEditorProps) => {
  // Usa initialData oppure function se initialData non è definito
  const functionData = initialData || funcProp;
  
  const {
    name,
    setName,
    description,
    setDescription,
    triggerPhrasesText,
    setTriggerPhrasesText,
    code,
    setCode,
    handleSubmit,
    handleClose,
    mutation
  } = useAIFunctionForm(functionData, onClose || onCancel);

  return (
    <div className="p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
          {functionData ? "Modifica" : "Nuova"} Funzione
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <AIFunctionFormFields
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          triggerPhrasesText={triggerPhrasesText}
          setTriggerPhrasesText={setTriggerPhrasesText}
          code={code}
          setCode={setCode}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || onClose || handleClose}
            className="border-gray-600 text-gray-300 hover:bg-[#2A2F3C] hover:text-white"
          >
            Annulla
          </Button>
          <Button
            type="submit"
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              functionData ? "Salva Modifiche" : "Crea Funzione"
            )}
          </Button>
        </div>
      </form>

      {functionData && (
        <AIFunctionTester func={functionData} />
      )}
    </div>
  );
};

export default AIFunctionEditor;
