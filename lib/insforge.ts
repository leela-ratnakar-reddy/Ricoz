import { createClient, createAdminClient } from "@insforge/sdk";

const DEFAULT_INSFORGE_URL = "https://2cbr24z5.us-east.insforge.app";

/**
 * Public InsForge client for public auth operations (signup, login, OTP verification, password reset).
 * Uses NEXT_PUBLIC_INSFORGE_ANON_KEY exclusively.
 * Strictly enforces credential separation: does NOT fall back to INSFORGE_API_KEY.
 * Throws a clear configuration error if NEXT_PUBLIC_INSFORGE_ANON_KEY is not configured.
 */
export function getInsforgeClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || DEFAULT_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_INSFORGE_URL is not configured.");
  }
  if (!anonKey) {
    throw new Error(
      "NEXT_PUBLIC_INSFORGE_ANON_KEY is not configured. Please configure NEXT_PUBLIC_INSFORGE_ANON_KEY in your environment variables."
    );
  }
  return createClient({
    baseUrl,
    anonKey,
  });
}

/**
 * User-scoped server InsForge client.
 * Takes the authenticated user's JWT / access token.
 * All operations execute with the user's identity and subject to user RLS.
 */
export function getInsforgeUserClient(accessToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || DEFAULT_INSFORGE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_INSFORGE_URL is not configured.");
  }
  return createClient({
    baseUrl,
    accessToken,
  });
}

/**
 * Server-only InsForge Admin Client (Project-Admin privileges).
 * Uses INSFORGE_API_KEY. NEVER expose this to client components.
 */
export function getInsforgeAdminClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || DEFAULT_INSFORGE_URL;
  const adminApiKey = process.env.INSFORGE_API_KEY || "";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_INSFORGE_URL is not configured.");
  }
  if (!adminApiKey) {
    throw new Error("INSFORGE_API_KEY is not configured on the server.");
  }
  return createAdminClient({
    baseUrl,
    apiKey: adminApiKey,
  });
}
