
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

    if (isTest) {
      return new Response(
        JSON.stringify({
          text: `Ciao! Sono il tuo assistente AI alimentato da ${aiProvider.toUpperCase()} e utilizzo il modello ${aiModel}. Come posso aiutarti oggi?`,
          data: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurazione Supabase mancante');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('api_keys')
      .select('*')
      .maybeSingle();

    if (apiKeysError || !apiKeys) {
      throw new Error('Chiavi API non trovate');
    }

    let apiKey = '';
    let endpoint = '';
    let requestBody = {};
    let headers = { 'Content-Type': 'application/json' };

    switch (aiProvider.toLowerCase()) {
      case 'groq':
        apiKey = apiKeys.groq_key;
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        requestBody = {
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: 'Sei un assistente AI. Cerca di essere preciso e diretto nelle tue risposte.' },
            { role: 'user', content: query }
          ],
          temperature: 0.7,
          max_tokens: 1000
        };
        break;

      case 'gemini':
        apiKey = apiKeys.gemini_key;
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        requestBody = {
          contents: [{
            parts: [{
              text: query
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        };
        break;

      default:
        throw new Error(`Provider ${aiProvider} non supportato`);
    }

    if (!apiKey) {
      throw new Error(`Chiave API per ${aiProvider} non trovata`);
    }

    console.log(`Invio richiesta a ${aiProvider}...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Errore dalla risposta di ${aiProvider}:`, errorText);
      throw new Error(`Errore nella chiamata a ${aiProvider}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Risposta da ${aiProvider}:`, data);

    let aiResponse = '';
    if (aiProvider.toLowerCase() === 'groq') {
      aiResponse = data.choices[0]?.message?.content || '';
    } else if (aiProvider.toLowerCase() === 'gemini') {
      aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';
    }

    if (!aiResponse) {
      throw new Error('Risposta non valida dall\'AI');
    }

    return new Response(
      JSON.stringify({ text: aiResponse, data: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Errore dettagliato:", error);
    return new Response(
      JSON.stringify({
        text: "Mi dispiace, ma al momento non riesco a rispondere alla tua domanda. Verifica che le chiavi API siano corrette nelle impostazioni.",
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
