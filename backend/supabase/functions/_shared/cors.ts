export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  // Explicitly allow both common casings and API key headers used by Supabase
  "Access-Control-Allow-Headers": "Authorization, authorization, x-client-info, apikey, x-api-key, content-type",
  // Allow common HTTP methods used by the functions
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
};
