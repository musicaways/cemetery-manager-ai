import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const isGreeting = (query: string) => {
  const greetings = ['ciao', 'buongiorno', 'buonasera', 'salve', 'hey', 'come stai', 'come va'];
  return greetings.some(greeting => query.toLowerCase().includes(greeting));
};

const isSmallTalk = (query: string) => {
  return query.toLowerCase().includes('come stai') || 
         query.toLowerCase().includes('come va') ||
         query.toLowerCase().includes('che fai');
};

const isSearchQuery = (query: string) => {
  return query.toLowerCase().includes('cerca') || 
         query.toLowerCase().includes('trovami') ||
         query.toLowerCase().includes('ricerca') ||
         query.toLowerCase().includes('informazioni su');
};

const isDatabaseQuery = (query: string) => {
  const databaseTerms = ['cimitero', 'defunto', 'loculo', 'settore', 'blocco'];
  return databaseTerms.some(term => query.toLowerCase().includes(term));
};

const generateSmallTalkResponse = () => {
  const responses = [
    "Sto bene, grazie! Sono qui per aiutarti con qualsiasi informazione sul cimitero. Come posso esserti utile oggi?",
    "Tutto bene, grazie della domanda! Sono pronto ad assisterti nelle tue ricerche. Di cosa hai bisogno?",
    "Molto bene! Sto lavorando per fornire le migliori informazioni possibili. Come posso aiutarti?",
    "Bene, grazie! Sono sempre felice di poter essere d'aiuto. Cosa ti serve sapere?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateGreeting = () => {
  const greetings = [
    "Ciao! Sono il tuo assistente cimiteriale. Come posso aiutarti oggi?",
    "Salve! Sono qui per aiutarti a trovare le informazioni che cerchi. Di cosa hai bisogno?",
    "Buongiorno! Sono pronto ad assisterti nelle tue ricerche. Come posso esserti utile?",
    "Ciao! Sono qui per aiutarti. Hai bisogno di informazioni specifiche?"
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
};

const systemPrompt = `Sei un assistente AI che gestisce un database cimiteriale. 
Hai accesso alle seguenti tabelle:
  - Cimitero (Id, Codice, Descrizione)
  - Settore (Id, Codice, Descrizione, IdCimitero)
  - Blocco (Id, Codice, Descrizione, IdSettore, NumeroFile, NumeroLoculi)
  - Loculo (Id, IdBlocco, Numero, Fila, Annotazioni)
  - Defunto (Id, IdLoculo, Nominativo, DataNascita, DataDecesso, Eta, Sesso)

Quando l'utente fa una richiesta:
1. Se è una domanda sul database, converti la domanda in SQL
2. Se è una richiesta di ricerca web, cerca le informazioni rilevanti
3. Se è una conversazione generale, rispondi in modo naturale e amichevole
4. Se hai bisogno di chiarimenti, chiedi gentilmente all'utente

Rispondi sempre in italiano in modo cordiale e professionale.`;

async function performWebSearch(query: string) {
  try {
    // Qui potresti integrare una vera API di ricerca web come Google Custom Search
    // Per ora simuliamo una risposta
    return `Mi dispiace, ma al momento non ho accesso diretto a internet per fare ricerche web. 
    Posso aiutarti con informazioni presenti nel nostro database cimiteriale o rispondere a domande generali.
    Se hai bisogno di informazioni specifiche dal web, ti consiglio di consultare direttamente un motore di ricerca.`;
  } catch (error) {
    console.error("Errore nella ricerca web:", error);
    return null;
  }
}

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

    if (isGreeting(query)) {
      return new Response(
        JSON.stringify({ 
          text: generateGreeting(),
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isSmallTalk(query)) {
      return new Response(
        JSON.stringify({ 
          text: generateSmallTalkResponse(),
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isSearchQuery(query)) {
      const searchResults = await performWebSearch(query);
      return new Response(
        JSON.stringify({ 
          text: searchResults,
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isDatabaseQuery(query)) {
      const aiResponse = await processWithGroq(query);
      console.log("Risposta AI ottenuta:", aiResponse);

      const sqlMatch = aiResponse.match(/```sql\n([\s\S]*?)\n```/);
      let data = null;
      
      if (sqlMatch) {
        const sqlQuery = sqlMatch[1].trim();
        console.log("Query SQL estratta:", sqlQuery);
        
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
          
          if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Configurazione Supabase mancante');
          }

          const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        text: "Mi sembra una domanda interessante, ma ho bisogno di qualche dettaglio in più per poterti aiutare al meglio. Puoi essere più specifico?",
        data: null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Errore generale nella funzione:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

const processWithGroq = async (query: string) => {
  try {
    const apiKey = Deno.env.get('GROQ_API_KEY');
    if (!apiKey) {
      console.error('GROQ_API_KEY non trovata nelle variabili di ambiente');
      throw new Error('Chiave API Groq non configurata');
    }

    console.log("Inizio chiamata Groq con query:", query);
    console.log("API Key presente:", !!apiKey);

    const requestBody = {
      model: "mixtral-8x7b-32768",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      stream: false
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Risposta Groq - Status:", response.status);
    console.log("Risposta Groq - Headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Risposta Groq - Body:", responseText);

    if (!response.ok) {
      throw new Error(`Groq API ha restituito status ${response.status}: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Risposta Groq parsata:", JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Errore nel parsing della risposta JSON:", e);
      throw new Error("Risposta non valida da Groq API");
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error("Struttura risposta Groq API non valida:", data);
      throw new Error('Struttura risposta Groq API non valida');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Errore dettagliato in processWithGroq:", error);
    throw new Error(`Errore Groq API: ${error.message}`);
  }
};

const executeQuery = async (sqlQuery: string, supabase: any) => {
  try {
    console.log("Esecuzione query SQL:", sqlQuery);
    
    sqlQuery = sqlQuery.trim().replace(/;$/, '');
    
    const lowerQuery = sqlQuery.toLowerCase();
    console.log("Query in lowercase:", lowerQuery);
    
    let mainTable = '';
    
    const fromMatch = lowerQuery.match(/from\s+([a-z0-9_"]+)/i);
    if (fromMatch) {
      mainTable = fromMatch[1].replace(/"/g, '');
      console.log("Tabella rilevata:", mainTable);
    }
    
    const tableMap: { [key: string]: string } = {
      'cimitero': 'Cimitero',
      'settore': 'Settore',
      'blocco': 'Blocco',
      'loculo': 'Loculo',
      'defunto': 'Defunto',
      'tipologico': 'TipoLoculo'
    };
    
    const actualTable = tableMap[mainTable.toLowerCase()];
    
    if (!actualTable) {
      console.error("Tabella non riconosciuta:", mainTable);
      console.error("Query completa:", sqlQuery);
      throw new Error(`Tabella non riconosciuta: ${mainTable}. Query: ${sqlQuery}`);
    }

    console.log("Utilizzando tabella:", actualTable);
    let query = supabase.from(actualTable).select('*');
    
    const whereMatch = lowerQuery.match(/where\s+([^;]+?)(?:\s+(?:order|group|limit|$))/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      console.log("Clausola WHERE:", whereClause);
      query = query.or(whereClause.replace(/'/g, ''));
    }
    
    const orderMatch = lowerQuery.match(/order\s+by\s+([^;]+?)(?:\s+(?:limit|$)|$)/i);
    if (orderMatch) {
      const orderClause = orderMatch[1].trim();
      console.log("Clausola ORDER BY:", orderClause);
      query = query.order(orderClause);
    }
    
    const limitMatch = lowerQuery.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      console.log("LIMIT:", limit);
      query = query.limit(limit);
    }

    console.log("Query Supabase finale:", query);
    const { data, error } = await query;
    
    if (error) {
      console.error("Errore Supabase:", error);
      throw error;
    }

    console.log("Risultati query:", data);
    return data;

  } catch (error) {
    console.error("Errore dettagliato in executeQuery:", error);
    throw error;
  }
};
