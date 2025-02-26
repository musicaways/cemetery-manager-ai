
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueryRequest {
  query: string;
  queryType: 'database' | 'web' | 'test';
  aiProvider: string;
  aiModel: string;
  isTest: boolean;
}

interface AIResponse {
  text?: string;
  data?: any;
  error?: string;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function processQuery(query: string): Promise<AIResponse> {
  // Normalizza il testo della query (rimuovi punteggiatura e rendi minuscolo)
  const normalizedQuery = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  // Array di pattern per riconoscere la richiesta di visualizzazione cimiteri
  const cimiteriPatterns = [
    "mostrami i cimiteri",
    "mostrami la lista dei cimiteri",
    "mostra i cimiteri",
    "mostra la lista dei cimiteri",
    "visualizza i cimiteri",
    "fammi vedere i cimiteri",
    "vedi i cimiteri",
    "lista dei cimiteri",
    "elenco dei cimiteri",
    "quali cimiteri ci sono",
    "che cimiteri ci sono",
    "vedi lista cimiteri",
    "show me the cemeteries",
    "show cemeteries",
    "list cemeteries",
    "view cemeteries",
    "display cemeteries",
    "cemetery list"
  ];

  // Verifica se la query corrisponde a una richiesta di visualizzazione cimiteri
  const isCimiteriRequest = cimiteriPatterns.some(pattern => 
    normalizedQuery.includes(pattern.toLowerCase())
  );

  if (isCimiteriRequest) {
    try {
      const { data: cimiteri, error } = await supabase
        .from('Cimitero')
        .select(`
          *,
          settori:Settore(
            Id,
            Codice,
            Descrizione,
            blocchi:Blocco(*)
          ),
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*)
        `)
        .order('Descrizione', { ascending: true });

      if (error) throw error;

      return {
        text: "Ecco la lista dei cimiteri disponibili:",
        data: {
          type: 'cimiteri',
          cimiteri: cimiteri
        }
      };
    } catch (error: any) {
      console.error("Errore nel recupero dei cimiteri:", error);
      return {
        text: "Mi dispiace, si è verificato un errore nel recupero dei cimiteri.",
        error: error.message
      };
    }
  }

  if (query.startsWith("/test-model")) {
    return {
      text: "Test command executed successfully."
    };
  }

  // If no special command is recognized, return a default response
  return {
    text: "Mi dispiace, non ho capito la tua richiesta. Puoi provare a riformularla?"
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody: QueryRequest = await req.json();
    const { query, queryType, aiProvider, aiModel, isTest } = requestBody;

    console.log("Ricevuta query:", query);
    console.log("Tipo di query:", queryType);
    console.log("AI Provider:", aiProvider);
    console.log("AI Model:", aiModel);
    console.log("Is Test:", isTest);

    if (!query) {
      throw new Error("Query is required.");
    }

    const aiResponse = await processQuery(query);
    console.log("Risposta AI:", aiResponse);

    return new Response(
      JSON.stringify(aiResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error("Errore durante l'elaborazione:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
