
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AIFunctionEditor } from "@/components/admin/ai-functions/AIFunctionEditor";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { AIFunction } from "@/components/admin/ai-functions/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AIFunctions = () => {
  const [functions, setFunctions] = useState<AIFunction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<AIFunction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [functionToDelete, setFunctionToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_chat_functions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFunctions(data || []);
    } catch (error) {
      console.error('Errore nel caricamento delle funzioni:', error);
      toast.error('Errore', { description: 'Impossibile caricare le funzioni AI' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (func: AIFunction) => {
    setSelectedFunction(func);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedFunction(null);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!functionToDelete) return;
    
    try {
      const { error } = await supabase
        .from('ai_chat_functions')
        .delete()
        .eq('id', functionToDelete);

      if (error) throw error;
      
      toast.success('Funzione eliminata', { description: 'La funzione è stata eliminata con successo' });
      setFunctions(functions.filter(f => f.id !== functionToDelete));
    } catch (error) {
      console.error('Errore nella cancellazione della funzione:', error);
      toast.error('Errore', { description: 'Impossibile eliminare la funzione' });
    } finally {
      setDeleteDialogOpen(false);
      setFunctionToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setFunctionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const toggleFunctionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_chat_functions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      loadFunctions();
      toast.success(
        currentStatus ? 'Funzione disattivata' : 'Funzione attivata', 
        { description: `La funzione è stata ${currentStatus ? 'disattivata' : 'attivata'} con successo` }
      );
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato della funzione:', error);
      toast.error('Errore', { description: 'Impossibile aggiornare lo stato della funzione' });
    }
  };

  const handleSave = () => {
    loadFunctions();
    setIsEditorOpen(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Funzioni AI</h1>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuova Funzione
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {functions.length === 0 ? (
              <div className="text-center p-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Non ci sono funzioni AI configurate
                </p>
                <Button onClick={handleCreate} variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crea la prima funzione
                </Button>
              </div>
            ) : (
              functions.map((func) => (
                <div
                  key={func.id}
                  className={`border ${func.is_active ? 'border-primary/30 bg-primary/5' : 'border-muted'} rounded-lg p-4 transition-colors`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{func.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {func.description?.substring(0, 120)}{func.description && func.description.length > 120 ? '...' : ''}
                      </p>
                      
                      {func.trigger_phrases && func.trigger_phrases.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-xs font-medium text-muted-foreground mb-1">FRASI TRIGGER:</h4>
                          <div className="flex flex-wrap gap-2">
                            {func.trigger_phrases.slice(0, 3).map((phrase, i) => (
                              <span key={i} className="bg-muted px-2 py-1 rounded-md text-xs">
                                {phrase}
                              </span>
                            ))}
                            {func.trigger_phrases.length > 3 && (
                              <span className="bg-muted px-2 py-1 rounded-md text-xs">
                                +{func.trigger_phrases.length - 3} altre
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleFunctionStatus(func.id, func.is_active)}
                        title={func.is_active ? "Disattiva" : "Attiva"}
                      >
                        {func.is_active ? (
                          <ToggleRight className="h-5 w-5 text-primary" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(func)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => confirmDelete(func.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
            <AIFunctionEditor
              initialFunction={selectedFunction}
              onSave={handleSave}
              onCancel={() => setIsEditorOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione eliminerà definitivamente la funzione AI e non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};
