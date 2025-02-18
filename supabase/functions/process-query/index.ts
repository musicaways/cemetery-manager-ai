
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const processWithGroq = async (query: string) => {
  try {
    console.log("Starting Groq API call with query:", query);
    
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
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error response:", errorText);
      throw new Error(`Groq API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Groq API raw response:", JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid Groq API response structure:", data);
      throw new Error('Invalid response structure from Groq API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in processWithGroq:", error);
    throw new Error(`Groq API error: ${error.message}`);
  }
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
          text: `You are an AI assistant managing a cemetery database. You have access to the following tables:
            - Cimitero (Id, Codice, Descrizione)
            - Settore (Id, Codice, Descrizione, IdCimitero)
            - Blocco (Id, Codice, Descrizione, IdSettore, NumeroFile, NumeroLoculi)
            - Loculo (Id, IdBlocco, Numero, Fila, Annotazioni)
            - Defunto (Id, IdLoculo, Nominativo, DataNascita, DataDecesso, Eta, Sesso)
            
            Convert this query into appropriate SQL and explain what you're doing: ${query}`
        }]
      }]
    })
  });

  const data = await response.json();
  console.log("Gemini response:", data);
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    throw new Error('Invalid response from Gemini API');
  }
  
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
          content: `You are an AI assistant managing a cemetery database. You have access to the following tables:
            - Cimitero (Id, Codice, Descrizione)
            - Settore (Id, Codice, Descrizione, IdCimitero)
            - Blocco (Id, Codice, Descrizione, IdSettore, NumeroFile, NumeroLoculi)
            - Loculo (Id, IdBlocco, Numero, Fila, Annotazioni)
            - Defunto (Id, IdLoculo, Nominativo, DataNascita, DataDecesso, Eta, Sesso)
            
            Convert user queries into appropriate SQL queries and explain what you're doing.`
        },
        {
          role: "user",
          content: query
        }
      ]
    })
  });

  const data = await response.json();
  console.log("DeepSeek response:", data);
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from DeepSeek API');
  }
  
  return data.choices[0].message.content;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log("Received query:", query);
    
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid or missing query parameter');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let aiResponse;
    const provider = Deno.env.get('AI_PROVIDER') || 'groq';
    console.log("Using AI provider:", provider);

    // Process with selected AI provider
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
      console.error("Error processing with AI provider:", error);
      throw new Error(`Failed to process query with ${provider}: ${error.message}`);
    }

    if (!aiResponse) {
      throw new Error('No response received from AI provider');
    }

    console.log("AI Response received:", aiResponse);

    // Extract SQL query if present and execute
    const sqlMatch = aiResponse.match(/```sql\n([\s\S]*?)\n```/);
    let data = null;
    
    if (sqlMatch) {
      const sqlQuery = sqlMatch[1];
      console.log("Extracted SQL query:", sqlQuery);
      
      const { data: queryResult, error: queryError } = await supabase.rpc(
        'get_complete_schema'
      );
      
      if (queryError) {
        console.error("Error executing SQL query:", queryError);
        throw queryError;
      }
      
      data = queryResult;
    }

    return new Response(
      JSON.stringify({ text: aiResponse, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Function error:", error);
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
