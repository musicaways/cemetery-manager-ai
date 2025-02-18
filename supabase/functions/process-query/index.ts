
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
    const { query } = await req.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process the query with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('Failed to process query with AI');
    }

    const aiResult = await openAIResponse.json();
    const aiResponse = aiResult.choices[0].message.content;

    // Extract SQL query from AI response if present
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
