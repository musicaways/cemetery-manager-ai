import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Funzione migliorata per estrarre il nome del cimitero
const extractCemeteryName = (query: string): string | null => {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(' ');
  const cimiteroIndex = words.findIndex(w => w === 'cimitero');
  
  if (cimiteroIndex >= 0 && cimiteroIndex < words.length - 1) {
    // Prendi tutte le parole dopo "cimitero" fino alla prossima preposizione o fine frase
    const prepositions = ['di', 'del', 'dello', 'della', 'dei', 'degli', 'delle'];
    let name = [];
    for (let i = cimiteroIndex + 1; i < words.length; i++) {
      if (prepositions.includes(words[i])) continue;
      if ([',', 'e', 'con', 'nel', 'in'].includes(words[i])) break;
      name.push(words[i]);
    }
    return name.length > 0 ? name.join(' ') : null;
  }
  return null;
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
      const cemeteryName = extractCemeteryName(query);
      console.log("Nome cimitero estratto:", cemeteryName);

      // Ricerca blocchi di un cimitero specifico con tutte le informazioni correlate
      if (queryLower.includes('blocchi') || queryLower.includes('blocco')) {
        if (cemeteryName) {
          // Prima troviamo l'ID del cimitero
          const { data: cimiteroData, error: cimiteroError } = await supabase
            .from('Cimitero')
            .select('Id, Descrizione')
            .ilike('Descrizione', `%${cemeteryName}%`)
            .limit(1);

          if (cimiteroError) throw cimiteroError;
          
          if (cimiteroData && cimiteroData.length > 0) {
            // Poi usiamo l'ID per trovare i blocchi correlati
            const { data: blocchiData, error: blocchiError } = await supabase
              .from('Blocco')
              .select(`
                Id,
                Codice,
                Descrizione,
                NumeroLoculi,
                Settore (
                  Id,
                  Codice,
                  Descrizione
                )
              `)
              .eq('Settore.IdCimitero', cimiteroData[0].Id);

            if (blocchiError) throw blocchiError;

            if (blocchiData && blocchiData.length > 0) {
              // Recuperiamo loculi in una query separata
              const { data: loculiData, error: loculiError } = await supabase
                .from('Loculo')
                .select(`
                  Id,
                  Numero,
                  Fila,
                  IdBlocco,
                  Defunto (
                    Id,
                    Nominativo,
                    DataNascita,
                    DataDecesso
                  )
                `)
                .in('IdBlocco', blocchiData.map(b => b.Id));

              if (loculiError) throw loculiError;

              // Organizziamo i dati per blocco
              result = blocchiData.map(blocco => ({
                ...blocco,
                Loculi: loculiData?.filter(l => l.IdBlocco === blocco.Id) || []
              }));
              
              searchText = `Ecco i blocchi del cimitero "${cimiteroData[0].Descrizione}" con relative informazioni:`;
            } else {
              result = [];
              searchText = `Non ho trovato blocchi nel cimitero "${cimiteroData[0].Descrizione}"`;
            }
          } else {
            searchText = `Non ho trovato nessun cimitero che corrisponde a "${cemeteryName}"`;
          }
        }
      }
      // Ricerca cimiteri
      else if (queryLower.includes('cimitero') || queryLower.includes('cimiteri')) {
        const cemeteryName = extractCemeteryName(query);
        let cimiteroQuery = supabase.from('Cimitero').select('*');

        if (cemeteryName) {
          cimiteroQuery = cimiteroQuery.ilike('Descrizione', `%${cemeteryName}%`);
        }

        const { data, error } = await cimiteroQuery;
        if (error) throw error;
        result = data;
        searchText = cemeteryName 
          ? `Ecco i cimiteri che contengono "${cemeteryName}" nel nome:`
          : 'Ecco tutti i cimiteri:';
      }
      // Ricerca defunti in un cimitero specifico
      else if ((queryLower.includes('defunto') || queryLower.includes('defunti')) && queryLower.includes('cimitero')) {
        const cemeteryName = extractCemeteryName(query);
        let defuntiQuery = supabase
          .from('Defunto')
          .select(`
            *,
            Loculo!inner (
              *,
              Blocco!inner (
                *,
                Settore!inner (
                  *,
                  Cimitero!inner (*)
                )
              )
            )
          `);

        if (cemeteryName) {
          defuntiQuery = defuntiQuery.ilike('Loculo.Blocco.Settore.Cimitero.Descrizione', `%${cemeteryName}%`);
        }

        // Se c'è anche una ricerca per nome
        const words = queryLower.split(' ');
        const nameIndex = words.findIndex(w => w === 'nome') + 1;
        if (nameIndex > 0 && words[nameIndex]) {
          defuntiQuery = defuntiQuery.ilike('Nominativo', `%${words[nameIndex]}%`);
        }

        const { data, error } = await defuntiQuery;
        if (error) throw error;
        result = data;
        searchText = cemeteryName 
          ? `Ecco i defunti nel cimitero che contiene "${cemeteryName}" nel nome:`
          : 'Ecco i defunti trovati:';
      }
      // Gestione ricerca loculi in un cimitero specifico
      else if (queryLower.includes('loculo') || queryLower.includes('loculi')) {
        const cemeteryName = extractCemeteryName(query);
        let loculiQuery = supabase
          .from('Loculo')
          .select(`
            *,
            Blocco!inner (
              *,
              Settore!inner (
                *,
                Cimitero!inner (*)
              )
            )
          `);

        if (cemeteryName) {
          loculiQuery = loculiQuery.ilike('Blocco.Settore.Cimitero.Descrizione', `%${cemeteryName}%`);
        }

        // Se c'è un numero specifico
        const numbers = query.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          loculiQuery = loculiQuery.eq('Numero', numbers[0]);
        }

        const { data, error } = await loculiQuery;
        if (error) throw error;
        result = data;
        searchText = cemeteryName 
          ? `Ecco i loculi nel cimitero che contiene "${cemeteryName}" nel nome:`
          : 'Ecco i loculi trovati:';
      }
      // Gestione ricerca settori
      else if (queryLower.includes('settore') || queryLower.includes('settori')) {
        const cemeteryName = extractCemeteryName(query);
        let settoriQuery = supabase
          .from('Settore')
          .select(`
            *,
            Cimitero!inner (*)
          `);

        if (cemeteryName) {
          settoriQuery = settoriQuery.ilike('Cimitero.Descrizione', `%${cemeteryName}%`);
        }

        const { data, error } = await settoriQuery;
        if (error) throw error;
        result = data;
        searchText = cemeteryName 
          ? `Ecco i settori nel cimitero che contiene "${cemeteryName}" nel nome:`
          : 'Ecco i settori trovati:';
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
            text: "Mi dispiace, non ho trovato risultati per il cimitero specificato. Assicurati di:\n" +
                 "- Scrivere correttamente il nome del cimitero\n" +
                 "- Usare un formato come 'mostrami i blocchi del cimitero villa fastigi'\n" +
                 "- Verificare che il cimitero esista nel database",
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
                "- Trovare defunti in un cimitero specifico\n" +
                "- Cercare loculi in un determinato cimitero\n" +
                "- Visualizzare settori e blocchi di un cimitero",
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        text: "Non ho capito bene cosa vuoi cercare. Puoi:\n" +
              "- Cercare blocchi di un cimitero specifico (es: 'blocchi del cimitero centrale')\n" +
              "- Cercare defunti in un cimitero (es: 'defunti nel cimitero nuovo')\n" +
              "- Cercare loculi per numero in un cimitero\n" +
              "- Visualizzare settori di un cimitero specifico",
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
