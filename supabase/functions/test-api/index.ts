
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

    let success = false;
    let errorMessage = '';

    switch (provider.toLowerCase()) {
      case 'groq': {
        try {
          const response = await fetch('https://api.groq.com/v1/models', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          
          if (response.ok && Array.isArray(data.data)) {
            success = true;
          } else {
            errorMessage = data.error?.message || 'Errore nella verifica della chiave Groq';
          }
        } catch (error) {
          console.error('Groq API error:', error);
          errorMessage = 'Errore nella connessione a Groq API';
        }
        break;
      }

      case 'gemini': {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const data = await response.json();
          
          if (response.ok && Array.isArray(data.models)) {
            success = true;
          } else {
            errorMessage = data.error?.message || 'Errore nella verifica della chiave Gemini';
          }
        } catch (error) {
          console.error('Gemini API error:', error);
          errorMessage = 'Errore nella connessione a Gemini API';
        }
        break;
      }

      case 'perplexity': {
        try {
          const response = await fetch('https://api.perplexity.ai/chat/models', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          
          if (response.ok && Array.isArray(data.models)) {
            success = true;
          } else {
            errorMessage = data.error?.message || 'Errore nella verifica della chiave Perplexity';
          }
        } catch (error) {
          console.error('Perplexity API error:', error);
          errorMessage = 'Errore nella connessione a Perplexity API';
        }
        break;
      }

      case 'huggingface': {
        try {
          const response = await fetch('https://api-inference.huggingface.co/status', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            success = true;
          } else {
            const data = await response.json();
            errorMessage = data.error || 'Errore nella verifica della chiave HuggingFace';
          }
        } catch (error) {
          console.error('HuggingFace API error:', error);
          errorMessage = 'Errore nella connessione a HuggingFace API';
        }
        break;
      }

      default:
        errorMessage = `Provider ${provider} non supportato`;
    }

    if (success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Test dell'API di ${provider} completato con successo!`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(errorMessage);
    }

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
