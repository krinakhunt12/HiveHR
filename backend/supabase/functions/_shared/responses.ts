import { corsHeaders } from "./cors.ts";

/**
 * Standardized JSON response — consistent headers + body shape.
 * Success shape:  { success: true,  message, data, meta, timestamp }
 * Error shape:    { success: false, code, message, errors, timestamp }
 */
export function jsonRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function successRes<T>(
  message: string,
  data?: T,
  meta?: Record<string, unknown>
): Response {
  return jsonRes(200, {
    success: true,
    message,
    data: data ?? null,
    meta: meta ?? null,
    timestamp: new Date().toISOString(),
  });
}

export function createdRes<T>(message: string, data: T): Response {
  return jsonRes(201, {
    success: true,
    message,
    data,
    meta: null,
    timestamp: new Date().toISOString(),
  });
}

const FRIENDLY_ERROR_MAP: Record<string, string> = {
  "23505": "A record with this information already exists. Please check for duplicates.",
  "23503": "This action cannot be completed because a related record is missing or was deleted.",
  "23502": "Required information is missing. Please fill in all fields.",
  "42P01": "Database configuration error. Please contact system support.",
  "PGRST116": "We couldn't find the requested information.",
  "42703": "The system encountered a technical configuration error. Please contact support.",
  "VALIDATION_ERROR": "Some information is missing or incorrect. Please review the form.",
  "PLAN_LIMIT_EXCEEDED": "You've reached the limit for your current plan. Please upgrade to add more.",
  "INSUFFICIENT_BALANCE": "You do not have enough leave balance for this request.",
  "UNAUTHORIZED": "Your session has expired. Please log in again.",
  "FORBIDDEN": "You don't have permission to perform this action.",
  "CONFLICT": "This action conflicts with existing records. Please review your data.",
  "INTERNAL_ERROR": "Something went wrong on our end. Our team has been notified."
};

export function errorRes(err: unknown, prefix = "Service"): Response {
  console.error(`[${prefix}]`, err);
  const e = err as Record<string, unknown>;
  
  const code = (e?.code as string) ?? "INTERNAL_ERROR";
  const status = typeof e?.status === "number" ? e.status : 500;
  let message = (e?.message as string) ?? "An unexpected error occurred";

  // If we have a friendly mapping for this code, use it to override cryptic messages
  if (FRIENDLY_ERROR_MAP[code]) {
    message = FRIENDLY_ERROR_MAP[code];
  } else if (status === 500) {
    message = FRIENDLY_ERROR_MAP["INTERNAL_ERROR"];
  }

  return jsonRes(status, {
    success: false,
    code,
    message,
    errors: (e?.errors as unknown[]) ?? null,
    timestamp: new Date().toISOString(),
  });
}

export function validationErrorRes(
  errors: { field: string; message: string }[]
): Response {
  return jsonRes(422, {
    success: false,
    code: "VALIDATION_ERROR",
    message: "Validation failed. Please check the highlighted fields.",
    errors,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Strips the Supabase gateway prefix so internal routing sees clean paths.
 * /functions/v1/employee/123  →  /123
 */
export function normalizePath(
  pathname: string,
  functionName: string
): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  while (
    segments.length > 0 &&
    ["functions", "v1", functionName].includes(segments[0])
  ) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

/** Parse query string into a plain object */
export function parseQuery(url: URL): Record<string, string> {
  const obj: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
}

/** Robust OPTIONS handler for CORS preflight */
export function handleOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

