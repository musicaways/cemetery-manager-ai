import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, queryType, isTest, aiProvider, aiModel } = await req.json();
    console.log("Query ricevuta:", { query, queryType, isTest, aiProvider, aiModel });

    if (isTest) {
      return new Response(
        JSON.stringify({
          text: `Ciao! Sono il tuo assistente AI alimentato da ${aiProvider.toUpperCase()} e utilizzo il modello ${aiModel}. Come posso aiutarti oggi?`,
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurazione Supabase mancante');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Recupera le impostazioni AI dell'utente
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('*')
      .single();

    if (queryType === 'database') {
      let result = null;
      let searchText = '';

      // Query più specifiche per il database
      if (query.toLowerCase().includes('lista') || query.toLowerCase().includes('mostra') || query.toLowerCase().includes('tutti')) {
        if (query.toLowerCase().includes('cimiteri')) {
          const { data, error } = await supabase
            .from('Cimitero')
            .select('*');
          
          if (error) throw error;
          result = data;
          searchText = 'Ecco la lista completa dei cimiteri:';
        }
      } else if (query.toLowerCase().includes('cerca') || query.toLowerCase().includes('trova')) {
        if (query.toLowerCase().includes('defunto')) {
          const { data, error } = await supabase
            .from('Defunto')
            .select(`
              *,
              Loculo (
                *,
                Blocco (
                  *,
                  Settore (
                    *,
                    Cimitero (*)
                  )
                )
              )
            `);
          
          if (error) throw error;
          result = data;
          searchText = 'Ecco i risultati della ricerca per defunti:';
        }
        else if (query.toLowerCase().includes('loculo')) {
          const { data, error } = await supabase
            .from('Loculo')
            .select(`
              *,
              Blocco (
                *,
                Settore (
                  *,
                  Cimitero (*)
                )
              )
            `);
          
          if (error) throw error;
          result = data;
          searchText = 'Ecco i risultati della ricerca per loculi:';
        }
      }

      if (result && result.length > 0) {
        return new Response(
          JSON.stringify({
            text: searchText,
            data: result
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({
            text: "Mi dispiace, non ho trovato risultati. Prova a:\n- Usare 'lista' o 'mostra tutti' per vedere tutti i record\n- Usare 'cerca' seguito da ciò che stai cercando\n- Specificare se stai cercando un cimitero, un defunto o un loculo",
            data: null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (queryType === 'web') {
      return new Response(
        JSON.stringify({ 
          text: "La ricerca su Internet non è ancora disponibile. Per ora posso aiutarti a:\n- Cercare informazioni sui cimiteri\n- Trovare defunti\n- Cercare loculi specifici",
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        text: "Non ho capito bene cosa vuoi cercare. Puoi:\n- Usare 'lista' o 'mostra tutti' per vedere tutti i record\n- Usare 'cerca' seguito da ciò che stai cercando\n- Specificare se ti interessano cimiteri, defunti o loculi",
        data: null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Errore dettagliato:", error);
    
    return new Response(
      JSON.stringify({
        error: "Si è verificato un errore durante l'elaborazione della richiesta.",
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
