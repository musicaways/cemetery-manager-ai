
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

    if (queryType === 'database') {
      let result = null;
      let searchText = '';
      const queryLower = query.toLowerCase();

      // Gestione ricerca cimiteri
      if (queryLower.includes('cimitero') || queryLower.includes('cimiteri')) {
        const { data, error } = await supabase
          .from('Cimitero')
          .select('*');
        
        if (error) throw error;
        result = data;
        searchText = 'Ecco i cimiteri trovati:';
      }
      // Gestione ricerca defunti
      else if (queryLower.includes('defunto') || queryLower.includes('defunti') || queryLower.includes('nome')) {
        let query = supabase
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

        // Se c'è un nome specifico nella ricerca
        const words = queryLower.split(' ');
        const nameIndex = words.findIndex(w => w === 'nome') + 1;
        if (nameIndex > 0 && words[nameIndex]) {
          const searchName = words[nameIndex];
          query = query.ilike('Nominativo', `%${searchName}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        result = data;
        searchText = 'Ecco i defunti trovati:';
      }
      // Gestione ricerca loculi
      else if (queryLower.includes('loculo') || queryLower.includes('loculi')) {
        // Estrai eventuali numeri dalla query
        const numbers = query.match(/\d+/g);
        let query = supabase
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

        // Se c'è un numero specifico
        if (numbers && numbers.length > 0) {
          query = query.eq('Numero', numbers[0]);
        }

        const { data, error } = await query;
        if (error) throw error;
        result = data;
        searchText = 'Ecco i loculi trovati:';
      }
      // Gestione ricerca settori
      else if (queryLower.includes('settore') || queryLower.includes('settori')) {
        const { data, error } = await supabase
          .from('Settore')
          .select(`
            *,
            Cimitero (*)
          `);
        
        if (error) throw error;
        result = data;
        searchText = 'Ecco i settori trovati:';
      }
      // Gestione ricerca blocchi
      else if (queryLower.includes('blocco') || queryLower.includes('blocchi')) {
        const { data, error } = await supabase
          .from('Blocco')
          .select(`
            *,
            Settore (
              *,
              Cimitero (*)
            )
          `);
        
        if (error) throw error;
        result = data;
        searchText = 'Ecco i blocchi trovati:';
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
            text: "Mi dispiace, non ho trovato risultati. Puoi provare a:\n" +
                 "- Cercare un cimitero specifico\n" +
                 "- Cercare un defunto per nome\n" +
                 "- Cercare un loculo per numero\n" +
                 "- Visualizzare tutti i settori o blocchi\n" +
                 "Esempio: 'cerca defunto con nome Mario' oppure 'mostra tutti i cimiteri'",
            data: null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Gestione ricerca web
    if (queryType === 'web') {
      return new Response(
        JSON.stringify({ 
          text: "La ricerca web non è ancora disponibile. Posso aiutarti a:\n" +
                "- Cercare informazioni sui cimiteri\n" +
                "- Trovare un defunto per nome\n" +
                "- Cercare loculi specifici\n" +
                "- Visualizzare settori e blocchi",
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Risposta di default
    return new Response(
      JSON.stringify({
        text: "Non ho capito bene cosa vuoi cercare. Puoi:\n" +
              "- Cercare un cimitero specifico\n" +
              "- Cercare un defunto per nome (es: 'cerca defunto con nome Mario')\n" +
              "- Cercare un loculo per numero\n" +
              "- Visualizzare tutti i settori o blocchi",
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
