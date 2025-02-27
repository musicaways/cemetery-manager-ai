
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestione CORS per le richieste preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { fileName, fileType, bucket } = await req.json();
    
    if (!fileName || !fileType || !bucket) {
      throw new Error('Missing required fields: fileName, fileType, or bucket');
    }
    
    // Verifica se il bucket esiste
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) throw bucketsError;
    
    const bucketExists = buckets.some(b => b.name === bucket);
    
    if (!bucketExists) {
      // Crea il bucket se non esiste
      const { error: createError } = await supabase
        .storage
        .createBucket(bucket, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
      if (createError) throw createError;
    }
    
    // Genera un URL firmato per il caricamento diretto
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUploadUrl(fileName);
      
    if (error) throw error;
    
    // Ottieni l'URL pubblico
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return new Response(
      JSON.stringify({
        data: {
          url: data.signedUrl,
          path: data.path,
          publicUrl
        }
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error generating signed URL:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred',
        uploadError: true
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});
