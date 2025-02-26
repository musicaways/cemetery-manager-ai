
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
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      throw new Error('Provider e API key sono richiesti');
    }

    let response;
    console.log(`Testing ${provider} API...`);

    switch (provider.toLowerCase()) {
      case 'gemini':
        response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + apiKey);
        break;

      case 'groq':
        response = await fetch('https://api.groq.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        break;

      case 'perplexity':
        response = await fetch('https://api.perplexity.ai/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        break;

      case 'huggingface':
        response = await fetch('https://huggingface.co/api/models?token=' + apiKey);
        break;

      case 'googlemaps':
        response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${apiKey}`
        );
        break;

      case 'serpstack':
        response = await fetch(
          `http://api.serpstack.com/search?access_key=${apiKey}&query=test`
        );
        break;

      default:
        throw new Error(`Provider ${provider} non supportato`);
    }

    const data = await response.json();
    console.log(`${provider} test response:`, data);

    if (!response.ok) {
      throw new Error(`Errore nella chiamata a ${provider} API: ${JSON.stringify(data)}`);
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
