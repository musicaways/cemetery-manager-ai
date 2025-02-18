
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
    const { query, queryType, isTest, aiProvider, aiModel } = await req.json();
    console.log("Query ricevuta:", { query, queryType, isTest, aiProvider, aiModel });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: 'Sei un assistente AI. Rispondi in italiano.' },
            { role: 'user', content: isTest ? 'Chi sei?' : query }
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
                text: isTest ? 'Chi sei?' : query
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        }
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
