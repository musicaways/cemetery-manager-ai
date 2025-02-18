
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
    const { query, queryType, isTest } = await req.json();
    console.log("Query ricevuta:", { query, queryType, isTest });

    if (isTest) {
      return new Response(
        JSON.stringify({
          text: "Ciao! Sono il tuo assistente AI alimentato da Groq e utilizzo il modello mixtral-8x7b-32768. Come posso aiutarti oggi?",
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (queryType === 'database') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configurazione Supabase mancante');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      let result = null;
      let searchText = '';

      // Estrai termini di ricerca rilevanti
      const searchTerms = query.toLowerCase().match(/cerca|trova|mostra|lista|cimitero|defunto|loculo/g);
      
      if (query.toLowerCase().includes('cimitero')) {
        const { data, error } = await supabase
          .from('Cimitero')
          .select('*');
        
        if (error) throw error;
        result = data;
        searchText = 'Ecco i cimiteri trovati:';
      }
      else if (query.toLowerCase().includes('defunto')) {
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
        searchText = 'Ecco i defunti trovati:';
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
        searchText = 'Ecco i loculi trovati:';
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
            text: "Mi dispiace, non ho trovato risultati per la tua ricerca. Prova a essere più specifico o usa termini diversi.",
            data: null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (queryType === 'web') {
      // Implementa la ricerca web usando un servizio esterno
      const searchResponse = "Mi dispiace, al momento la ricerca web non è ancora implementata. Prova a cercare informazioni nel database del cimitero.";
      
      return new Response(
        JSON.stringify({ 
          text: searchResponse,
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Risposta di default se non viene identificato un tipo specifico
    return new Response(
      JSON.stringify({
        text: "Scusa, non ho capito bene cosa vuoi cercare. Puoi provare a:\n- Cercare informazioni sui cimiteri\n- Cercare un defunto\n- Cercare informazioni sui loculi",
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
