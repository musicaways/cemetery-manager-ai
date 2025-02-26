
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AIFunction, AIFunctionInput } from "../types";

export const useAIFunctionForm = (initialData: AIFunction | null, onClose: () => void) => {
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
      setTriggerPhrasesText(`mostrami il cimitero
mostra il cimitero
mostrami cimitero
mostra cimitero
apri il cimitero
apri cimitero
dettagli cimitero
informazioni cimitero
mostra informazioni cimitero
mostra informazioni sul cimitero
mostra informazioni del cimitero
voglio vedere il cimitero
fammi vedere il cimitero
visualizza cimitero
visualizza il cimitero`);
      setCode(`const cimiteroName = query.toLowerCase().match(/(?:mostr|apri|vedi|informazioni|dettagli|visualizza)(?:[a-z\\s]+)(?:il\\s+)?cimitero(?:\\s+di\\s+)?([a-zA-Z\\s]+)?/)?.[1]?.trim();

if (cimiteroName) {
  const cimitero = await findCimiteroByName(cimiteroName);
  if (cimitero) {
    return {
      text: \`Ho trovato il cimitero "\${cimitero.Descrizione}"\`,
      data: {
        type: 'cimitero',
        cimitero
      }
    };
  } else {
    return {
      text: \`Non ho trovato nessun cimitero con il nome "\${cimiteroName}"\`,
    };
  }
}`);
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: async (data: AIFunctionInput) => {
      if (initialData) {
        const { error } = await supabase
          .from('ai_chat_functions')
          .update(data)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_chat_functions')
          .insert(data);
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

  const handleClose = () => {
    setName("");
    setDescription("");
    setTriggerPhrasesText("");
    setCode("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const triggerPhrases = triggerPhrasesText
      .split("\n")
      .map(phrase => phrase.trim().toLowerCase())
      .filter(phrase => phrase.length > 0);

    if (!name || triggerPhrases.length === 0 || !code) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    const functionData: AIFunctionInput = {
      name,
      description: description || null,
      trigger_phrases: triggerPhrases,
      code,
      is_active: true
    };

    mutation.mutate(functionData);
  };

  return {
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
  };
};
