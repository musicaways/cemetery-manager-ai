
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
Rispondi sempre in italiano.`;

const processWithGroq = async (query: string) => {
  try {
    console.log("Avvio chiamata Groq API con query:", query);
    
    const response = await fetch('https://api.groq.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore risposta Groq API:", errorText);
      throw new Error(`Groq API ha restituito status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Risposta raw Groq API:", JSON.stringify(data, null, 2));

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

const processWithGemini = async (query: string) => {
  try {
    console.log("Avvio chiamata Gemini API con query:", query);

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY')!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt + "\n\nQuery utente: " + query
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
        safetySettings: [{
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore risposta Gemini API:", errorText);
      throw new Error(`Gemini API ha restituito status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Risposta raw Gemini API:", JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Struttura risposta Gemini API non valida:", data);
      throw new Error('Struttura risposta Gemini API non valida');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Errore in processWithGemini:", error);
    throw new Error(`Errore Gemini API: ${error.message}`);
  }
};

const processWithDeepseek = async (query: string) => {
  try {
    console.log("Avvio chiamata DeepSeek API con query:", query);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore risposta DeepSeek API:", errorText);
      throw new Error(`DeepSeek API ha restituito status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Risposta raw DeepSeek API:", JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      console.error("Struttura risposta DeepSeek API non valida:", data);
      throw new Error('Struttura risposta DeepSeek API non valida');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Errore in processWithDeepSeek:", error);
    throw new Error(`Errore DeepSeek API: ${error.message}`);
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
    const provider = Deno.env.get('AI_PROVIDER') || 'groq';
    console.log("Provider AI in uso:", provider);

    try {
      switch (provider) {
        case 'groq':
          aiResponse = await processWithGroq(query);
          break;
        case 'gemini':
          aiResponse = await processWithGemini(query);
          break;
        case 'deepseek':
          aiResponse = await processWithDeepseek(query);
          break;
        default:
          aiResponse = await processWithGroq(query);
      }
    } catch (error) {
      console.error("Errore durante l'elaborazione con il provider AI:", error);
      throw new Error(`Errore nell'elaborazione della query con ${provider}: ${error.message}`);
    }

    if (!aiResponse) {
      throw new Error('Nessuna risposta ricevuta dal provider AI');
    }

    console.log("Risposta AI ricevuta:", aiResponse);

    // Estrai e esegui query SQL se presente
    const sqlMatch = aiResponse.match(/```sql\n([\s\S]*?)\n```/);
    let data = null;
    
    if (sqlMatch) {
      const sqlQuery = sqlMatch[1].trim();
      console.log("Query SQL estratta:", sqlQuery);
      
      try {
        const { data: queryResult, error: queryError } = await supabase
          .from('Cimitero')
          .select('*');
        
        if (queryError) throw queryError;
        data = queryResult;
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
