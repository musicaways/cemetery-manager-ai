
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Se la modalità web è attiva, aggiungiamo il contesto di ricerca
    let enhancedQuery = query;
    if (queryType === 'web' && !isTest) {
      const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('serpstack_key')
        .maybeSingle();

      if (apiKeys?.serpstack_key) {
        try {
          const searchResponse = await fetch(`https://api.serpstack.com/search?access_key=${apiKeys.serpstack_key}&query=${encodeURIComponent(query)}`);
          const searchData = await searchResponse.json();
          if (searchData.organic_results) {
            const topResults = searchData.organic_results.slice(0, 3);
            const context = topResults.map((result: any) => result.snippet).join('\n');
            enhancedQuery = `Basandoti su queste informazioni dal web:\n${context}\n\nRispondi a questa domanda: ${query}`;
          }
        } catch (error) {
          console.error('Errore nella ricerca web:', error);
          // Procediamo con la query originale se la ricerca web fallisce
        }
      }
    }

    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('api_keys')
      .select('*')
      .maybeSingle();

    if (apiKeysError) {
      throw new Error('Errore nel recupero delle chiavi API');
    }

    if (!apiKeys) {
      throw new Error('Nessuna chiave API trovata. Configura le chiavi API nelle impostazioni.');
    }

    let response;
    if (aiProvider === 'groq') {
      if (!apiKeys.groq_key) {
        throw new Error('Chiave API Groq non configurata');
      }

      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeys.groq_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: 'system', content: 'Sei un assistente AI. Rispondi in italiano.' },
            { role: 'user', content: isTest ? 'Chi sei?' : enhancedQuery }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
    } else if (aiProvider === 'gemini') {
      if (!apiKeys.gemini_key) {
        throw new Error('Chiave API Gemini non configurata');
      }

      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKeys.gemini_key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: isTest ? 'Chi sei?' : enhancedQuery
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        }
      );
    } else if (aiProvider === 'huggingface') {
      if (!apiKeys.huggingface_key) {
        throw new Error('Chiave API HuggingFace non configurata');
      }

      // Verifica che il modello sia supportato
      const supportedModels = [
        'mistralai/Mistral-7B-Instruct-v0.2',
        'meta-llama/Llama-2-70b-chat-hf'
      ];

      if (!supportedModels.includes(aiModel)) {
        throw new Error(`Il modello ${aiModel} non è supportato. Usa uno dei seguenti modelli: ${supportedModels.join(', ')}`);
      }

      const hf = new HfInference(apiKeys.huggingface_key);
      const result = await hf.textGeneration({
        model: aiModel,
        inputs: isTest ? 'Chi sei?' : enhancedQuery,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        }
      });

      return new Response(
        JSON.stringify({ 
          text: result.generated_text,
          data: null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(`Provider AI non supportato: ${aiProvider}`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Errore API ${aiProvider}:`, errorData);
      throw new Error(`Errore dal provider AI: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`Risposta da ${aiProvider}:`, data);

    let aiResponse = '';
    if (aiProvider === 'groq') {
      aiResponse = data.choices?.[0]?.message?.content;
    } else if (aiProvider === 'gemini') {
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (!aiResponse) {
      throw new Error('Risposta non valida dal provider AI');
    }

    return new Response(
      JSON.stringify({ 
        text: aiResponse,
        data: null 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Errore:', error);
    return new Response(
      JSON.stringify({
        text: "Mi dispiace, si è verificato un errore. " + error.message,
        error: error.message
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
