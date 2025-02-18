
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
    const { provider, apiKey } = await req.json();
    console.log(`Testing ${provider} API...`);

    let testEndpoint = '';
    let testBody = {};
    let testHeaders = { 'Content-Type': 'application/json' };

    switch (provider.toLowerCase()) {
      case 'groq':
        testEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
        testHeaders = {
          ...testHeaders,
          'Authorization': `Bearer ${apiKey}`,
        };
        testBody = {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'Ciao!' }],
          temperature: 0.7,
        };
        break;

      case 'gemini':
        testEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        testHeaders = {
          ...testHeaders,
          'x-goog-api-key': apiKey,
        };
        testBody = {
          contents: [{ parts: [{ text: 'Ciao!' }] }],
        };
        break;

      case 'perplexity':
        testEndpoint = 'https://api.perplexity.ai/chat/completions';
        testHeaders = {
          ...testHeaders,
          'Authorization': `Bearer ${apiKey}`,
        };
        testBody = {
          model: 'mixtral-8x7b',
          messages: [{ role: 'user', content: 'Ciao!' }],
        };
        break;

      case 'huggingface':
        testEndpoint = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';
        testHeaders = {
          ...testHeaders,
          'Authorization': `Bearer ${apiKey}`,
        };
        testBody = {
          inputs: 'Ciao!',
          parameters: {
            max_length: 50,
            temperature: 0.7,
          },
        };
        break;

      default:
        throw new Error(`Provider ${provider} non supportato`);
    }

    console.log(`Making test request to ${testEndpoint}...`);
    
    const response = await fetch(testEndpoint, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify(testBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API test failed for ${provider}:`, errorText);
      throw new Error(`Test fallito per ${provider}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Test successful for ${provider}:`, data);

    return new Response(
      JSON.stringify({ success: true, message: `Test dell'API di ${provider} completato con successo!` }),
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
