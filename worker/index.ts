/**
 * Worker Manager - Cloudflare Worker Entry Point
 *
 * This Worker handles all API requests for managing Workers and Pages projects.
 */

import { type Env } from "./types";
import { handleCORS, corsHeaders } from "./utils/cors";
import { validateAuth, isLocalDev, getUserEmail } from "./utils/auth";
import { handleWorkersRoutes } from "./routes/workers";
import { handlePagesRoutes } from "./routes/pages";
import { handleMetricsRoutes } from "./routes/metrics";
import { handleJobsRoutes } from "./routes/jobs";
import { handleWebhooksRoutes } from "./routes/webhooks";
import { handleBackupsRoutes } from "./routes/backups";

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const isLocal = isLocalDev(request);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    // Only validate auth for API routes (not static assets)
    const isApiRoute = url.pathname.startsWith("/api/");

    if (isApiRoute && !isLocal) {
      const authResult = await validateAuth(request, env);
      if (!authResult.valid) {
        return new Response(
          JSON.stringify({ error: "Unauthorized", message: authResult.error }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    const userEmail = getUserEmail(request);

    try {
      // Route API requests
      if (isApiRoute) {
        return await handleApiRequest(request, env, url, isLocal, userEmail);
      }

      // Health check
      if (url.pathname === "/health") {
        return new Response(
          JSON.stringify({
            status: "ok",
            timestamp: new Date().toISOString(),
            version: "0.1.0",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // For static assets, return 404 - assets are served at the edge before hitting Worker
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("[ERROR] Unhandled exception:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  },
};

async function handleApiRequest(
  request: Request,
  env: Env,
  url: URL,
  isLocal: boolean,
  userEmail: string,
): Promise<Response> {
  const path = url.pathname;

  // Workers routes (includes zones for route management)
  if (path.startsWith("/api/workers") || path === "/api/zones") {
    return handleWorkersRoutes(request, env, url, isLocal, userEmail);
  }

  // Pages routes
  if (path.startsWith("/api/pages")) {
    return handlePagesRoutes(request, env, url, isLocal, userEmail);
  }

  // Metrics endpoint
  if (path.startsWith("/api/metrics")) {
    return handleMetricsRoutes(request, env, url, isLocal);
  }

  // Jobs endpoint
  if (path.startsWith("/api/jobs")) {
    return handleJobsRoutes(request, env, url);
  }

  // Webhooks endpoints
  if (path.startsWith("/api/webhooks")) {
    return handleWebhooksRoutes(request, env, url);
  }

  // Backups endpoint
  if (path.startsWith("/api/backups")) {
    return handleBackupsRoutes(request, env, url, userEmail);
  }

  // Not found
  return new Response(JSON.stringify({ error: "Endpoint not found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
