export { corsHeaders } from "./cors.ts";

/**
 * Standardized JSON Response pattern.
 * Ensures consistent headers and status codes across all Edge Functions.
 */
export function jsonRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Robust Path Normalization.
 * Strips the Supabase Edge Function prefix to allow clean internal routing.
 * @param pathname The raw URL pathname from the request.
 * @param functionName The name of the function (e.g., 'auth', 'employee').
 */
export function normalizePath(pathname: string, functionName: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  
  // Shift out standard Supabase and function-specific segments
  while (
    segments.length > 0 &&
    ["functions", "v1", functionName].includes(segments[0])
  ) {
    segments.shift();
  }
  
  const finalPath = segments.length > 0 ? `/${segments.join("/")}` : "/";
  return finalPath;
}

/**
 * Standardized Error Response handler.
 * Logs the error and returns a consistent JSON error response.
 * @param err The error object.
 * @param prefix Optional prefix for the console log (usually the function name).
 */
export function errorRes(err: any, prefix = "Service"): Response {
  console.error(`[${prefix}]`, err);
  const message = err.message || "An unexpected error occurred";
  
  // Attempt to extract status from various error formats (Postgrest, Auth, etc)
  const status = typeof err.status === 'number' ? err.status : 400;
  
  return jsonRes(status, { 
    error: message, 
    message, // Fallback for various frontend parsers
    details: err.details || null,
    code: err.code || null
  });
}
