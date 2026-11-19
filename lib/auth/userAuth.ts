import { cookies } from "next/headers";
import crypto from "node:crypto";
import { getDb } from "@/lib/admin/db";

export interface UserSessionPayload {
  userId: string;
  email: string;
  accountType: "talent" | "company";
  fullName: string;
  avatarUrl?: string;
  status?: "active" | "suspended" | "deactivated";
  accessToken?: string;
  exp: number; // Unix timestamp in seconds
}

export const USER_SESSION_COOKIE = "ricoz_user_session";
export const ACCESS_TOKEN_COOKIE = "insforge_access_token";
export const REFRESH_TOKEN_COOKIE = "insforge_refresh_token";

/**
 * Retrieves the dedicated session signing secret from the environment.
 * Strictly enforces that SESSION_SECRET is configured.
 * Never falls back to INSFORGE_API_KEY or any hardcoded default string.
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "SESSION_SECRET is not configured. Please configure SESSION_SECRET in your environment variables for secure session signing."
    );
  }
  return secret.trim();
}

/**
 * Sign session payload with HMAC-SHA256 using dedicated SESSION_SECRET
 */
export function signSession(payload: UserSessionPayload): string {
  const secret = getSessionSecret();
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(b64).digest("base64url");
  return `${b64}.${signature}`;
}

/**
 * Verify and decode session token using dedicated SESSION_SECRET.
 * Fails closed on any invalid, missing, malformed, non-numeric, non-finite, zero, negative, or expired values.
 */
export function verifySession(token: string): UserSessionPayload | null {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    // Strictly reject malformed tokens or tokens with unexpected extra segments
    if (parts.length !== 2) return null;

    const [b64, signature] = parts;
    if (!b64 || !signature) return null;

    const secret = getSessionSecret();
    const expectedSig = crypto.createHmac("sha256", secret).update(b64).digest("base64url");
    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }

    const json = Buffer.from(b64, "base64url").toString("utf8");
    const payload = JSON.parse(json) as UserSessionPayload;

    const now = Math.floor(Date.now() / 1000);

    // Fail closed: reject missing, null, zero, negative, non-numeric, non-finite, and expired exp values
    if (
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= 0 ||
      payload.exp < now
    ) {
      return null;
    }

    // Fail closed: validate all required payload fields
    if (
      !payload.userId ||
      typeof payload.userId !== "string" ||
      payload.userId.trim().length === 0 ||
      !payload.email ||
      typeof payload.email !== "string" ||
      payload.email.trim().length === 0 ||
      (payload.accountType !== "talent" && payload.accountType !== "company") ||
      !payload.fullName ||
      typeof payload.fullName !== "string" ||
      payload.fullName.trim().length === 0
    ) {
      return null;
    }

    return payload;
  } catch (err: any) {
    if (err?.message?.includes("SESSION_SECRET is not configured")) {
      throw err;
    }
    return null;
  }
}

/**
 * Read the current authenticated public user session from cookies.
 * Performs real-time status check against PostgreSQL.
 * Suspended, deactivated, or deleted accounts lose access immediately,
 * even when an old valid HMAC cookie exists.
 */
export async function getCurrentUserSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(USER_SESSION_COOKIE);
  if (!sessionCookie?.value) return null;

  const payload = verifySession(sessionCookie.value);
  if (!payload) return null;

  try {
    const db = getDb();
    const userRow = (await db.prepare(
      "SELECT status FROM public.user_profiles WHERE id = ?"
    ).get(payload.userId)) as { status?: string } | undefined;

    // Reject non-existent, suspended, or deactivated accounts immediately
    if (!userRow || userRow.status !== "active") {
      return null;
    }

    return {
      ...payload,
      status: userRow.status as "active",
    };
  } catch (err) {
    console.error("Error verifying user session status in database:", err);
    return null;
  }
}

/**
 * Set public user session cookies
 */
export async function setUserSessionCookies(
  payload: UserSessionPayload,
  accessToken?: string | null,
  refreshToken?: string | null
) {
  const cookieStore = await cookies();
  const signedToken = signSession(payload);
  const maxAge = 60 * 60 * 24 * 7; // 7 days

  cookieStore.set(USER_SESSION_COOKIE, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  if (accessToken) {
    // Stored as HTTP-only to protect raw JWT from client XSS extraction
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  if (refreshToken) {
    // HTTP-only for server-owned refresh
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
  }
}

/**
 * Clear public user session cookies (leaves admin session untouched)
 */
export async function clearUserSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export interface GetProfileOptions {
  allowSelfHealing?: boolean;
}

export class ProfileRecoveryError extends Error {
  constructor(message: string, public readonly userId: string, public readonly originalError?: unknown) {
    super(message);
    this.name = "ProfileRecoveryError";
  }
}

/**
 * Fetch full profile data from PostgreSQL.
 * By default (allowSelfHealing = false), this function performs a strictly read-only query.
 * Self-healing is only executed when explicitly enabled for authenticated user sessions or recovery workflows,
 * ensuring client-supplied IDs cannot create or modify other users' profiles.
 */
export async function getFullUserProfile(userId: string, options?: GetProfileOptions) {
  const allowSelfHealing = options?.allowSelfHealing === true;
  const db = getDb();

  const userProfile = (await db.prepare(`
    SELECT id, account_type, email, full_name, avatar_url, is_verified, status, created_at
    FROM public.user_profiles
    WHERE id = ?
  `).get(userId)) as {
    id: string;
    account_type: "talent" | "company";
    email: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
    status: "active" | "suspended" | "deactivated";
    created_at: string;
  } | undefined;

  if (!userProfile) return null;

  let details: any = null;
  if (userProfile.account_type === "talent") {
    details = await db.prepare(`
      SELECT headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability
      FROM public.talent_profiles
      WHERE user_id = ?
    `).get(userId);

    // Self-healing: Only run when explicitly authorized for authenticated sessions or recovery
    if (!details && allowSelfHealing) {
      try {
        await db.prepare(`
          INSERT INTO public.talent_profiles (
            id, user_id, headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability, created_at, updated_at
          ) VALUES (?, ?, 'Creative Director & Brand Specialist', '', '', 5, '$150/hr', '', '[]'::jsonb, 'Available now', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `).run(userId, userId);

        details = await db.prepare(`
          SELECT headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability
          FROM public.talent_profiles
          WHERE user_id = ?
        `).get(userId);
      } catch (err: any) {
        console.error("Database failure during talent profile self-healing for user:", userId, err?.message || err);
        throw new ProfileRecoveryError("Database recovery failed during talent profile self-healing", userId, err);
      }

      if (!details) {
        throw new ProfileRecoveryError("Profile self-healing completed but specialized talent profile was not found", userId);
      }
    }
  } else if (userProfile.account_type === "company") {
    details = await db.prepare(`
      SELECT company_name, contact_name, business_email, industry, company_size, website_url, billing_country
      FROM public.company_profiles
      WHERE user_id = ?
    `).get(userId);

    // Self-healing: Only run when explicitly authorized for authenticated sessions or recovery
    if (!details && allowSelfHealing) {
      try {
        await db.prepare(`
          INSERT INTO public.company_profiles (
            id, user_id, company_name, contact_name, business_email, industry, company_size, website_url, billing_country, created_at, updated_at
          ) VALUES (?, ?, 'Enterprise Client', ?, ?, 'Technology & Innovation', '10-50', '', '', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `).run(userId, userId, userProfile.full_name || "Enterprise Contact", userProfile.email);

        details = await db.prepare(`
          SELECT company_name, contact_name, business_email, industry, company_size, website_url, billing_country
          FROM public.company_profiles
          WHERE user_id = ?
        `).get(userId);
      } catch (err: any) {
        console.error("Database failure during company profile self-healing for user:", userId, err?.message || err);
        throw new ProfileRecoveryError("Database recovery failed during company profile self-healing", userId, err);
      }

      if (!details) {
        throw new ProfileRecoveryError("Profile self-healing completed but specialized company profile was not found", userId);
      }
    }
  }

  return {
    ...userProfile,
    details,
  };
}
