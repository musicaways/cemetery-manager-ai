
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, apiKey, model } = await req.json();

    if (!provider || !apiKey) {
      throw new Error('Provider e API key sono richiesti');
    }

    let response;

    switch (provider.toLowerCase()) {
      case 'groq':
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'mixtral-8x7b-32768',
            messages: [
              {
                role: 'system',
                content: 'Rispondi solo "OK" per verificare che funzioni.'
              },
              {
                role: 'user',
                content: 'Test API'
              }
            ],
            temperature: 0.7,
            max_tokens: 10,
          }),
        });
        break;

      case 'gemini':
        response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro/generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Test API. Rispondi solo OK.'
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 10,
            },
          }),
        });
        break;

      case 'perplexity':
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'pplx-7b-online',
            messages: [
              {
                role: 'system',
                content: 'Rispondi solo "OK" per verificare che funzioni.'
              },
              {
                role: 'user',
                content: 'Test API'
              }
            ],
          }),
        });
        break;

      case 'huggingface':
        response = await fetch('https://api-inference.huggingface.co/models/' + (model || 'mistral-7b'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: 'Test API. Rispondi solo OK.',
            parameters: {
              max_new_tokens: 10,
              temperature: 0.7,
            }
          }),
        });
        break;

      default:
        throw new Error(`Provider ${provider} non supportato`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`${provider} API error:`, errorData);
      throw new Error(`Errore nella chiamata a ${provider} API: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log(`${provider} test response:`, data);

    // Verifica la risposta in base al provider
    switch (provider.toLowerCase()) {
      case 'gemini':
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Risposta non valida da Gemini API');
        }
        break;
      case 'groq':
        if (!data.choices?.[0]?.message?.content) {
          throw new Error('Risposta non valida da Groq API');
        }
        break;
      case 'perplexity':
        if (!data.choices?.[0]?.message?.content) {
          throw new Error('Risposta non valida da Perplexity API');
        }
        break;
      case 'huggingface':
        if (!data[0]?.generated_text) {
          throw new Error('Risposta non valida da HuggingFace API');
        }
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in test-api-provider:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
