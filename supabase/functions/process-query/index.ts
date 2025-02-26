
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  allowGenericResponse?: boolean;
}

interface AIResponse {
  text?: string;
  data?: any;
  error?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getGroqResponse(query: string): Promise<string> {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey) {
    throw new Error('GROQ_API_KEY non configurata');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente AI italiano utile e cordiale. Rispondi in modo conciso e chiaro.'
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
    throw new Error('Errore nella chiamata a Groq API');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function getGeminiResponse(query: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configurata');
  }

  console.log("Using Gemini API Key:", apiKey);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: query
        }]
      }]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API Error:", errorData);
    throw new Error(`Errore nella chiamata a Gemini API: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("Gemini Response:", data);

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Risposta non valida da Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

async function handleCimiteriQuery(): Promise<AIResponse> {
  try {
    const { data: cimiteri, error } = await supabase
      .from('Cimitero')
      .select(`
        *,
        settori:Settore(
          Id,
          Codice,
          Descrizione,
          blocchi:Blocco(
            Id,
            Codice,
            Descrizione,
            NumeroFile,
            NumeroLoculi
          )
        ),
        foto:CimiteroFoto(*),
        documenti:CimiteroDocumenti(*),
        mappe:CimiteroMappe(*)
      `)
      .order('Descrizione', { ascending: true });

    if (error) throw error;

    return {
      text: "Ecco la lista dei cimiteri disponibili:",
      data: {
        type: 'cimiteri',
        cimiteri: cimiteri || []
      }
    };
  } catch (error) {
    console.error('Error fetching cimiteri:', error);
    return {
      text: "Mi dispiace, si è verificato un errore nel recupero dei cimiteri.",
      error: error.message
    };
  }
}

async function processQuery(query: string, aiProvider: string): Promise<AIResponse> {
  try {
    // Check if query is about cemeteries
    const cimiteriKeywords = ['cimiteri', 'cimitero', 'lista cimiteri', 'elenco cimiteri', 'mostra cimiteri', 'vedere i cimiteri'];
    const isCimiteriQuery = cimiteriKeywords.some(keyword => query.toLowerCase().includes(keyword.toLowerCase()));

    if (isCimiteriQuery) {
      return await handleCimiteriQuery();
    }

    // Handle normal AI responses
    const aiResponse = await (aiProvider === 'gemini' ? getGeminiResponse(query) : getGroqResponse(query));
    return {
      text: aiResponse
    };
  } catch (error: any) {
    console.error("Error processing query:", error);
    return {
      text: "Si è verificato un errore durante l'elaborazione della richiesta.",
      error: error.message
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody: QueryRequest = await req.json();
    const { query, aiProvider, isTest } = requestBody;

    console.log("Ricevuta query:", query);
    console.log("Provider AI:", aiProvider);

    if (!query) {
      throw new Error("Query is required.");
    }

    const aiResponse = await processQuery(query, aiProvider);
    console.log("Risposta:", aiResponse);

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
      JSON.stringify({ 
        text: "Si è verificato un errore durante l'elaborazione della richiesta.",
        error: error.message
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
