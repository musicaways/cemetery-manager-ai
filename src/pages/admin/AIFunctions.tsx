
import { AIFunctionsViewer } from "@/components/admin/ai-functions/AIFunctionsViewer";
import { AIFunctionEditor } from "@/components/admin/ai-functions/AIFunctionEditor";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface AIFunction {
  id: string;
  name: string;
  description: string | null;
  trigger_phrases: string[];
  code: string;
  is_active: boolean;
}

export const AIFunctions = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<AIFunction | null>(null);

  const { data: functions, isLoading } = useQuery({
    queryKey: ['ai-functions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_chat_functions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIFunction[];
    }
  });

  const handleEdit = (func: AIFunction) => {
    setSelectedFunction(func);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedFunction(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Funzioni AI</h1>
        <Button onClick={handleCreate}>
          Nuova Funzione
        </Button>
      </div>

      {/* Visualizzatore delle funzioni e frasi trigger */}
      <AIFunctionsViewer />

      <AIFunctionEditor 
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={selectedFunction}
      />
    </div>
  );
};

export default AIFunctions;
