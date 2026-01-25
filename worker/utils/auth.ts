/**
 * Authentication utilities for worker-manager
 */

import { type Env } from "../types";

interface AuthResult {
  valid: boolean;
  email?: string;
  error?: string;
}

/**
 * Check if request is from local development or workers.dev (no Access protection)
 */
export function isLocalDev(request: Request): boolean {
  const url = new URL(request.url);
  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".workers.dev")
  );
}

/**
 * Validate Cloudflare Access JWT token
 */
export async function validateAuth(
  request: Request,
  env: Env,
): Promise<AuthResult> {
  // Skip auth for local development
  if (isLocalDev(request)) {
    return { valid: true, email: "local@dev" };
  }

  // Get JWT from CF-Access-JWT-Assertion header or cookie
  const jwt =
    request.headers.get("CF-Access-JWT-Assertion") ??
    getCookieValue(request.headers.get("Cookie"), "CF_Authorization");

  if (!jwt) {
    return { valid: false, error: "No authorization token provided" };
  }

  try {
    // Note: Cloudflare Access validates the JWT cryptographically at the edge
    // before the request reaches the Worker. We only need to decode the claims
    // and verify audience/expiration for defense-in-depth.

    // Decode JWT (signature already verified by Cloudflare Access)
    const parts = jwt.split(".");
    const payloadB64 = parts[1];
    if (!payloadB64) {
      return { valid: false, error: "Invalid token format" };
    }

    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      aud?: string[];
      email?: string;
      exp?: number;
      iat?: number;
    };

    // Check audience
    if (!payload.aud?.includes(env.POLICY_AUD)) {
      return { valid: false, error: "Invalid token audience" };
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp !== undefined && payload.exp < now) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, email: payload.email };
  } catch (error) {
    console.error("[AUTH] Validation error:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Token validation failed",
    };
  }
}

/**
 * Extract cookie value by name
 */
function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.trim().split("=");
    if (cookieName === name) {
      return rest.join("=");
    }
  }
  return null;
}

/**
 * Get user email from request
 */
export function getUserEmail(request: Request): string {
  return request.headers.get("CF-Access-Authenticated-User-Email") ?? "unknown";
}
