
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const extractSearchParams = (query: string) => {
  const queryLower = query.toLowerCase();
  
  // Controllo se è una ricerca web
  if (queryLower.includes('cerca su internet:')) {
    return { type: 'web', term: query.split('cerca su internet:')[1].trim() };
  }

  // Estrai il nome del cimitero
  const cimiteroMatch = queryLower.match(/cimitero\s+([^,\.]+)/i);
  const cimitero = cimiteroMatch ? cimiteroMatch[1].trim() : null;

  // Estrai il nome del defunto
  const defuntoMatch = queryLower.match(/defunto\s+([^,\.]+)/i);
  const defunto = defuntoMatch ? defuntoMatch[1].trim() : null;

  // Determina il tipo di ricerca
  let type = 'unknown';
  if (queryLower.includes('blocch')) type = 'blocchi';
  else if (queryLower.includes('defunt')) type = 'defunti';
  else if (queryLower.includes('locul')) type = 'loculi';
  else if (queryLower.includes('cimiter')) type = 'cimiteri';

  return {
    type,
    cimitero: cimitero?.replace(/\b(di|del|della|dello|dei|degli|delle)\b/g, '').trim(),
    defunto: defunto?.replace(/\b(di|del|della|dello|dei|degli|delle)\b/g, '').trim()
  };
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

    // Se è una ricerca web o la modalità web è attiva, ignora il database
    if (queryType === 'web') {
      return new Response(
        JSON.stringify({
          text: `Come assistente AI, cercherò di rispondere alla tua domanda: ${query.replace('cerca su internet:', '')}`,
          data: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Altrimenti, procedi con la ricerca nel database
    const searchParams = extractSearchParams(query);
    console.log("Parametri estratti:", searchParams);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurazione Supabase mancante');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    let result = null;
    let searchText = '';

    switch (searchParams.type) {
      case 'blocchi':
        if (searchParams.cimitero) {
          const { data: cimiteroData } = await supabase
            .from('Cimitero')
            .select('Id, Descrizione')
            .ilike('Descrizione', `%${searchParams.cimitero}%`)
            .limit(1);

          if (cimiteroData?.length > 0) {
            const { data: blocchiData } = await supabase
              .from('Blocco')
              .select(`
                Id, Codice, Descrizione, NumeroLoculi,
                Settore!inner (
                  Id, Codice, Descrizione,
                  Cimitero!inner (Id, Descrizione)
                )
              `)
              .eq('Settore.Cimitero.Id', cimiteroData[0].Id);

            result = blocchiData;
            searchText = `Ho trovato ${result?.length || 0} blocchi nel cimitero "${cimiteroData[0].Descrizione}"`;
          } else {
            searchText = `Non ho trovato il cimitero "${searchParams.cimitero}"`;
          }
        }
        break;

      case 'defunti':
        const defuntoQuery = supabase
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

        if (searchParams.defunto) {
          defuntoQuery.ilike('Nominativo', `%${searchParams.defunto}%`);
        }
        
        if (searchParams.cimitero) {
          defuntoQuery.ilike('Loculo.Blocco.Settore.Cimitero.Descrizione', `%${searchParams.cimitero}%`);
        }

        const { data: defuntiData } = await defuntoQuery.limit(20);
        result = defuntiData;
        searchText = `Ho trovato ${result?.length || 0} defunti`;
        if (searchParams.defunto) searchText += ` con nome "${searchParams.defunto}"`;
        if (searchParams.cimitero) searchText += ` nel cimitero "${searchParams.cimitero}"`;
        break;

      case 'cimiteri':
        const { data: cimiteriData } = await supabase
          .from('Cimitero')
          .select('*')
          .order('Descrizione');
        
        result = cimiteriData;
        searchText = `Ho trovato ${result?.length || 0} cimiteri`;
        break;

      default:
        if (queryType === 'database') {
          searchText = "Non ho capito cosa vuoi cercare nel database. Prova a specificare se vuoi informazioni su cimiteri, blocchi, loculi o defunti.";
        } else {
          searchText = "Non ho capito la tua richiesta. Puoi riformularla in modo più chiaro?";
        }
    }

    return new Response(
      JSON.stringify({
        text: searchText,
        data: result || []
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
