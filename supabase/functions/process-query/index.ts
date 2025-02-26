
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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

// Initialize Supabase client
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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: query
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
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

async function getAIResponse(query: string, provider: string): Promise<string> {
  try {
    switch (provider.toLowerCase()) {
      case 'groq':
        return await getGroqResponse(query);
      case 'gemini':
        return await getGeminiResponse(query);
      default:
        return await getGroqResponse(query); // Fallback to Groq
    }
  } catch (error) {
    console.error(`Error with ${provider} API:`, error);
    throw error;
  }
}

async function findMatchingFunction(query: string): Promise<{ code: string } | null> {
  const { data: functions, error } = await supabase
    .from('ai_chat_functions')
    .select('code, trigger_phrases')
    .eq('is_active', true);

  if (error) {
    console.error("Error fetching functions:", error);
    return null;
  }

  const normalizedQuery = query.toLowerCase().trim();

  for (const func of functions) {
    const matches = func.trigger_phrases.some(phrase => 
      normalizedQuery.includes(phrase.toLowerCase())
    );
    
    if (matches) {
      return { code: func.code };
    }
  }

  return null;
}

async function processQuery(query: string, aiProvider: string): Promise<AIResponse> {
  try {
    // Prima cerca una funzione corrispondente
    const matchingFunction = await findMatchingFunction(query);

    if (matchingFunction) {
      // Se trova una funzione personalizzata, la esegue
      const functionCode = matchingFunction.code;
      const func = new Function('supabase', `return (${functionCode})();`);
      return await func(supabase);
    }

    // Se non trova una funzione personalizzata, usa il provider AI selezionato
    const aiResponse = await getAIResponse(query, aiProvider);
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
    const { query, aiProvider } = requestBody;

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
        status: 200, // Cambiato da 400 a 200 per evitare errori di CORS
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
