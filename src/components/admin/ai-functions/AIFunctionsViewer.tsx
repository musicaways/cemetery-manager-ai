
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AIFunction {
  name: string;
  trigger_phrases: string[];
  code: string;
}

export const AIFunctionsViewer = () => {
  const { data: functions, isLoading, error } = useQuery({
    queryKey: ['ai-functions-view'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_chat_functions')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="p-4 text-center">Caricamento funzioni...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Errore nel caricamento delle funzioni</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold mb-4">Funzioni AI Attive</h2>
      {functions?.map((func: AIFunction) => (
        <div key={func.name} className="border border-gray-700 rounded-lg p-4 bg-[#1A1F2C]">
          <h3 className="text-lg font-semibold mb-2 text-[var(--primary-color)]">
            {func.name}
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Frasi trigger:</p>
            <ul className="list-disc pl-5 space-y-1">
              {func.trigger_phrases.map((phrase, index) => (
                <li key={index} className="text-sm">
                  &quot;{phrase}&quot;
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};
