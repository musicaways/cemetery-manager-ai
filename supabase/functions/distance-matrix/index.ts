
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');

    if (!origin || !destination) {
      return new Response(
        JSON.stringify({ error: 'Origin and destination are required' }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Costruiamo l'URL corretto per l'API di Google Distance Matrix
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&language=it&key=${Deno.env.get('GOOGLE_MAPS_API_KEY')}`;
    
    console.log("Calling Google Maps API:", apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log("Google Maps API Response:", data);

    return new Response(
      JSON.stringify(data),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error in distance-matrix function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
