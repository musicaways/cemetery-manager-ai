
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, PencilLine, Trash2, Code, PlayCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AIFunctionEditor } from "@/components/admin/ai-functions/AIFunctionEditor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AIFunction {
  id: string;
  name: string;
  description: string | null;
  trigger_phrases: string[];
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AIFunctions = () => {
  const [selectedFunction, setSelectedFunction] = useState<AIFunction | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: functions, isLoading } = useQuery({
    queryKey: ['ai-functions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_chat_functions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIFunction[];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('ai_chat_functions')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-functions'] });
      toast.success("Stato della funzione aggiornato con successo");
    },
    onError: (error) => {
      toast.error(`Errore durante l'aggiornamento: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_chat_functions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-functions'] });
      toast.success("Funzione eliminata con successo");
    },
    onError: (error) => {
      toast.error(`Errore durante l'eliminazione: ${error.message}`);
    },
  });

  const handleCreateNew = () => {
    setSelectedFunction(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (func: AIFunction) => {
    setSelectedFunction(func);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa funzione?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    await toggleActiveMutation.mutateAsync({ id, isActive: !currentState });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Funzioni Chat AI</h1>
        <Button
          onClick={handleCreateNew}
          className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Funzione
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white">Descrizione</TableHead>
              <TableHead className="text-white">Frasi Trigger</TableHead>
              <TableHead className="text-white text-center">Stato</TableHead>
              <TableHead className="text-white text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {functions?.map((func) => (
              <TableRow key={func.id} className="hover:bg-white/5">
                <TableCell className="font-medium text-white">
                  {func.name}
                </TableCell>
                <TableCell className="text-gray-400">
                  {func.description || '-'}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <div className="flex flex-wrap gap-1">
                    {func.trigger_phrases.slice(0, 3).map((phrase, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[var(--primary-color)]/20 text-[var(--primary-color)]"
                      >
                        {phrase}
                      </span>
                    ))}
                    {func.trigger_phrases.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/10 text-gray-400">
                        +{func.trigger_phrases.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${
                      func.is_active
                        ? "text-green-500 hover:text-green-600"
                        : "text-red-500 hover:text-red-600"
                    }`}
                    onClick={() => handleToggleActive(func.id, func.is_active)}
                  >
                    {func.is_active ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--primary-color)] hover:text-[var(--primary-hover)]"
                      onClick={() => handleEdit(func)}
                    >
                      <PencilLine className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(func.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AIFunctionEditor
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={selectedFunction}
      />
    </div>
  );
};

