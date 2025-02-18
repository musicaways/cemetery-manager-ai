
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

    // Se è una ricerca web, utilizziamo Groq invece di Gemini
    if (queryType === 'web') {
      try {
        const groqKey = Deno.env.get('GROQ_API_KEY');
        if (!groqKey) {
          throw new Error('API key di Groq mancante');
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [
              {
                role: 'system',
                content: 'Sei un assistente AI italiano disponibile ad aiutare con qualsiasi domanda.'
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          console.error('Errore nella risposta di Groq:', await response.text());
          throw new Error(`Errore nella chiamata a Groq: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Risposta completa da Groq:', data);

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Risposta di Groq non valida');
        }

        const aiResponse = data.choices[0].message.content;

        return new Response(
          JSON.stringify({
            text: aiResponse,
            data: null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error("Errore durante la chiamata a Groq:", error);
        return new Response(
          JSON.stringify({
            text: "Mi dispiace, ma al momento non riesco a rispondere alla tua domanda. Riprova più tardi o disattiva la modalità Internet per cercare informazioni nel database.",
            data: null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Altrimenti, procedi con la ricerca nel database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurazione Supabase mancante');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Estrai le parole chiave dal testo della query
    const queryLower = query.toLowerCase();
    const isCimiteroQuery = queryLower.includes('cimitero');
    const isDefuntoQuery = queryLower.includes('defunto');
    const isBloccoQuery = queryLower.includes('blocco');
    const isLoculoQuery = queryLower.includes('loculo');

    let result = null;
    let searchText = '';

    if (isCimiteroQuery) {
      const { data: cimiteriData } = await supabase
        .from('Cimitero')
        .select('*')
        .order('Descrizione');
      
      result = cimiteriData;
      searchText = `Ho trovato ${result?.length || 0} cimiteri`;
    } 
    else if (isDefuntoQuery) {
      const nomeMatch = queryLower.match(/defunto\s+([^,\.]+)/i);
      const nome = nomeMatch ? nomeMatch[1].trim() : '';

      const { data: defuntiData } = await supabase
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
        `)
        .ilike('Nominativo', `%${nome}%`)
        .limit(20);

      result = defuntiData;
      searchText = `Ho trovato ${result?.length || 0} defunti con nome "${nome}"`;
    }
    else if (isBloccoQuery || isLoculoQuery) {
      const cimiteroMatch = queryLower.match(/cimitero\s+([^,\.]+)/i);
      const cimitero = cimiteroMatch ? cimiteroMatch[1].trim() : '';

      if (cimitero) {
        const { data: cimiteroData } = await supabase
          .from('Cimitero')
          .select('Id, Descrizione')
          .ilike('Descrizione', `%${cimitero}%`)
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
          searchText = `Non ho trovato il cimitero "${cimitero}"`;
        }
      } else {
        searchText = "Per cercare blocchi o loculi, specifica anche il nome del cimitero";
      }
    }
    else {
      searchText = "Non ho capito cosa vuoi cercare. Prova a specificare se vuoi informazioni su cimiteri, blocchi, loculi o defunti.";
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
