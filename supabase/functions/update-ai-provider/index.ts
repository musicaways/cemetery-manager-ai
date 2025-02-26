
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { provider, apiKey } = await req.json()

    if (!provider || !apiKey) {
      throw new Error('Provider and API key are required')
    }

    // Aggiungiamo la chiave alle variabili d'ambiente della Edge Function
    switch (provider.toLowerCase()) {
      case 'groq':
        await Deno.env.set('GROQ_API_KEY', apiKey)
        break
      case 'gemini':
        await Deno.env.set('GEMINI_API_KEY', apiKey)
        break
      default:
        throw new Error('Provider non supportato')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
