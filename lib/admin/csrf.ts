import type { NextRequest } from "next/server";

export interface CsrfCheckResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates request origin and referer for state-changing HTTP methods (POST, PUT, PATCH, DELETE).
 * Safe read-only methods (GET, HEAD, OPTIONS) bypass this check.
 */
export function verifyCsrfOrigin(req: NextRequest): CsrfCheckResult {
  const method = req.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true };
  }

  // Extract host from headers
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) {
    return { valid: false, error: "Missing Host header in state-changing request" };
  }

  // Check Origin header first
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return {
          valid: false,
          error: `Cross-site request forgery blocked: Origin '${originUrl.host}' does not match Host '${host}'`,
        };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "Malformed Origin header" };
    }
  }

  // Fallback to Referer header if Origin is omitted (e.g. some same-origin form requests)
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return {
          valid: false,
          error: `Cross-site request forgery blocked: Referer '${refererUrl.host}' does not match Host '${host}'`,
        };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "Malformed Referer header" };
    }
  }

  // In production, reject mutating requests that provide neither Origin nor Referer
  if (process.env.NODE_ENV === "production") {
    return { valid: false, error: "State-changing requests must include an Origin or Referer header" };
  }

  return { valid: true };
}
