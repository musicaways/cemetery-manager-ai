
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Sei un assistente AI che gestisce un database cimiteriale. Hai accesso alle seguenti tabelle:
  - Cimitero (Id, Codice, Descrizione)
  - Settore (Id, Codice, Descrizione, IdCimitero)
  - Blocco (Id, Codice, Descrizione, IdSettore, NumeroFile, NumeroLoculi)
  - Loculo (Id, IdBlocco, Numero, Fila, Annotazioni)
  - Defunto (Id, IdLoculo, Nominativo, DataNascita, DataDecesso, Eta, Sesso)

Converti le domande dell'utente in query SQL appropriate e spiega cosa stai facendo in italiano.
La tua risposta dovrebbe seguire questo formato:
1. Spiegazione in italiano di cosa farai
2. Query SQL racchiusa tra \`\`\`sql e \`\`\`
3. Spiegazione dei risultati attesi

Esempio:
"Vado a cercare tutti i cimiteri nel database.

\`\`\`sql
SELECT * FROM Cimitero;
\`\`\`

Questa query mostrerà l'elenco completo dei cimiteri con i loro codici e descrizioni."

Rispondi sempre in italiano.`;

const processWithGroq = async (query: string) => {
  try {
    const apiKey = Deno.env.get('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('Groq API key non configurata');
    }

    console.log("Avvio chiamata Groq API con query:", query);
    
    // URL corretto per l'API Groq v1
    const response = await fetch('https://api.groq.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        stream: false
      }),
    });

    // Log dettagliato della risposta
    console.log("Status risposta Groq:", response.status);
    console.log("Headers risposta Groq:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Testo risposta Groq:", responseText);

    if (!response.ok) {
      throw new Error(`Groq API ha restituito status ${response.status}: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Errore nel parsing della risposta JSON:", e);
      throw new Error("Risposta non valida da Groq API");
    }

    console.log("Risposta Groq API parsata:", JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      console.error("Struttura risposta Groq API non valida:", data);
      throw new Error('Struttura risposta Groq API non valida');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Errore in processWithGroq:", error);
    throw new Error(`Errore Groq API: ${error.message}`);
  }
};

const executeQuery = async (sqlQuery: string, supabase: any) => {
  try {
    console.log("Esecuzione query SQL:", sqlQuery);
    
    // Rimuovi eventuali punti e virgola finali
    sqlQuery = sqlQuery.trim().replace(/;$/, '');
    
    // Analizza la query per determinare la tabella principale
    const lowerQuery = sqlQuery.toLowerCase();
    let mainTable = '';
    
    if (lowerQuery.includes('from cimitero')) mainTable = 'Cimitero';
    else if (lowerQuery.includes('from settore')) mainTable = 'Settore';
    else if (lowerQuery.includes('from blocco')) mainTable = 'Blocco';
    else if (lowerQuery.includes('from loculo')) mainTable = 'Loculo';
    else if (lowerQuery.includes('from defunto')) mainTable = 'Defunto';
    
    if (!mainTable) {
      throw new Error('Tabella non riconosciuta nella query');
    }

    // Costruisci la query Supabase
    let query = supabase.from(mainTable).select('*');
    
    // Se la query originale ha una clausola WHERE, aggiungila
    const whereMatch = lowerQuery.match(/where\s+(.*?)(?:\s+(?:order|group|limit|$))/i);
    if (whereMatch) {
      query = query.or(whereMatch[1].replace(/'/g, ''));
    }
    
    // Se la query ha un ORDER BY, aggiungilo
    const orderMatch = lowerQuery.match(/order\s+by\s+(.*?)(?:\s+(?:limit|$))/i);
    if (orderMatch) {
      query = query.order(orderMatch[1]);
    }
    
    // Se la query ha un LIMIT, aggiungilo
    const limitMatch = lowerQuery.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      query = query.limit(parseInt(limitMatch[1]));
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;

  } catch (error) {
    console.error("Errore nell'esecuzione della query:", error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log("Query ricevuta:", query);
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query non valida o mancante');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let aiResponse;
    try {
      aiResponse = await processWithGroq(query);
    } catch (error) {
      console.error("Errore durante l'elaborazione con Groq:", error);
      throw new Error(`Errore nell'elaborazione della query: ${error.message}`);
    }

    if (!aiResponse) {
      throw new Error('Nessuna risposta ricevuta da Groq');
    }

    console.log("Risposta AI ricevuta:", aiResponse);

    // Estrai e esegui query SQL se presente
    const sqlMatch = aiResponse.match(/```sql\n([\s\S]*?)\n```/);
    let data = null;
    
    if (sqlMatch) {
      const sqlQuery = sqlMatch[1].trim();
      console.log("Query SQL estratta:", sqlQuery);
      
      try {
        data = await executeQuery(sqlQuery, supabase);
      } catch (error) {
        console.error("Errore nell'esecuzione della query SQL:", error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ 
        text: aiResponse, 
        data 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("Errore nella funzione:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
