
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { provider, apiKey } = await req.json();
    console.log(`Testing ${provider} API...`);

    switch (provider.toLowerCase()) {
      case 'groq': {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: 'Test' }],
            max_tokens: 5
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Errore nella verifica della chiave Groq');
        }
        break;
      }

      case 'gemini': {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: "Test"
                }]
              }]
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Errore nella verifica della chiave Gemini');
        }
        break;
      }

      case 'ollama': {
        try {
          const response = await fetch('http://localhost:11434/api/list', {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error('Errore nella connessione a Ollama');
          }
          
          // Se arriviamo qui, Ollama è in esecuzione
          break;
        } catch (error) {
          throw new Error('Impossibile connettersi a Ollama. Assicurati che sia in esecuzione su localhost:11434');
        }
      }

      default:
        throw new Error(`Provider ${provider} non supportato`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Test dell'API di ${provider} completato con successo!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error during API test:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || `Errore durante il test dell'API`
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
