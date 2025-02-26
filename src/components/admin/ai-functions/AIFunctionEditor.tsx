
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIFunction {
  id: string;
  name: string;
  description: string | null;
  trigger_phrases: string[];
  code: string;
  is_active: boolean;
}

interface AIFunctionEditorProps {
  open: boolean;
  onClose: () => void;
  initialData: AIFunction | null;
}

export const AIFunctionEditor = ({ open, onClose, initialData }: AIFunctionEditorProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerPhrasesText, setTriggerPhrasesText] = useState("");
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setTriggerPhrasesText(initialData.trigger_phrases.join("\n"));
      setCode(initialData.code);
    } else {
      setName("");
      setDescription("");
      setTriggerPhrasesText("");
      setCode("");
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<AIFunction>) => {
      if (initialData) {
        const { error } = await supabase
          .from('ai_chat_functions')
          .update(data)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_chat_functions')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-functions'] });
      toast.success(
        initialData 
          ? "Funzione aggiornata con successo" 
          : "Funzione creata con successo"
      );
      handleClose();
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const triggerPhrases = triggerPhrasesText
      .split("\n")
      .map(phrase => phrase.trim())
      .filter(phrase => phrase.length > 0);

    if (!name || triggerPhrases.length === 0 || !code) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    mutation.mutate({
      name,
      description: description || null,
      trigger_phrases: triggerPhrases,
      code,
      is_active: true
    });
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setTriggerPhrasesText("");
    setCode("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-[#1A1F2C] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData ? "Modifica" : "Nuova"} Funzione
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#2A2F3C] border-[#4F46E5] text-white"
                placeholder="Nome della funzione"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Descrizione
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#2A2F3C] border-[#4F46E5] text-white"
                placeholder="Descrizione della funzione"
              />
            </div>

            <div>
              <Label htmlFor="trigger_phrases" className="text-white">
                Frasi Trigger (una per riga)
              </Label>
              <textarea
                id="trigger_phrases"
                value={triggerPhrasesText}
                onChange={(e) => setTriggerPhrasesText(e.target.value)}
                className="w-full h-32 p-3 rounded-md bg-[#2A2F3C] border border-[#4F46E5] text-white resize-none"
                placeholder="Inserisci le frasi trigger, una per riga"
              />
            </div>

            <div>
              <Label htmlFor="code" className="text-white">
                Codice
              </Label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-3 rounded-md bg-[#2A2F3C] border border-[#4F46E5] text-white font-mono resize-none"
                placeholder="Inserisci il codice della funzione"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
                initialData ? "Salva Modifiche" : "Crea Funzione"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

