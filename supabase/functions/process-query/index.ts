
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const processWithGroq = async (query: string) => {
  const response = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant managing a cemetery database. You have access to the following tables:
            - Cimitero (Id, Codice, Descrizione)
            - Settore (Id, Codice, Descrizione, IdCimitero)
            - Blocco (Id, Codice, Descrizione, IdSettore, NumeroFile, NumeroLoculi)
            - Loculo (Id, IdBlocco, Numero, Fila, Annotazioni)
            - Defunto (Id, IdLoculo, Nominativo, DataNascita, DataDecesso, Eta, Sesso)
            
            Convert user queries into appropriate SQL queries and explain what you're doing.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      model: "mixtral-8x7b-32768",
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
};

const processWithGemini = async (query: string) => {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': Deno.env.get('GEMINI_API_KEY')!,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: query
        }]
      }]
    })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const processWithDeepseek = async (query: string) => {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a cemetery database assistant."
        },
        {
          role: "user",
          content: query
        }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let aiResponse;
    const provider = Deno.env.get('AI_PROVIDER') || 'groq';

    // Process with selected AI provider
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

    // Extract SQL query if present and execute
    const sqlMatch = aiResponse.match(/```sql\n([\s\S]*?)\n```/);
    let data = null;
    
    if (sqlMatch) {
      const sqlQuery = sqlMatch[1];
      const { data: queryResult, error: queryError } = await supabase.rpc(
        'get_complete_schema'
      );
      
      if (queryError) throw queryError;
      data = queryResult;
    }

    return new Response(
      JSON.stringify({ text: aiResponse, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
