import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "ricoz_admin_session";
const USER_SESSION_COOKIE = "ricoz_user_session";

interface PublicUserToken {
  userId: string;
  email: string;
  accountType: "talent" | "company";
  exp: number;
}

async function verifyUserSessionCookie(cookieValue: string | undefined): Promise<PublicUserToken | null> {
  if (!cookieValue) return null;
  try {
    const parts = cookieValue.split(".");
    if (parts.length !== 2) return null;
    const [b64, signature] = parts;

    // Cryptographic signature verification using standard Web Crypto API (Edge-compatible)
    // Strictly requires dedicated SESSION_SECRET; never falls back to INSFORGE_API_KEY or hardcoded defaults
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.trim().length === 0) {
      console.error(
        "SESSION_SECRET is not configured in middleware runtime. Denying access to protected routes."
      );
      return null;
    }
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret.trim()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigB64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const sigPad = sigB64 + "=".repeat((4 - (sigB64.length % 4)) % 4);
    const sigStr = atob(sigPad);
    const sigBytes = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(b64)
    );

    if (!isValid) return null;

    // Decode base64url payload
    const payloadB64 = b64.replace(/-/g, "+").replace(/_/g, "/");
    const payloadPad = payloadB64 + "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const json = atob(payloadPad);
    const payload = JSON.parse(json) as PublicUserToken;

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

    // Fail closed: validate required payload fields
    if (
      !payload.userId ||
      typeof payload.userId !== "string" ||
      payload.userId.trim().length === 0 ||
      !payload.email ||
      typeof payload.email !== "string" ||
      payload.email.trim().length === 0 ||
      (payload.accountType !== "talent" && payload.accountType !== "company")
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // -------------------------------------------------------------
  // 1. ADMIN PANEL ROUTE PROTECTION (Strictly Isolated)
  // -------------------------------------------------------------
  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") {
    return NextResponse.next();
  }

  const adminCookie = req.cookies.get(ADMIN_SESSION_COOKIE);
  const hasValidAdminCookie = Boolean(
    adminCookie && adminCookie.value && adminCookie.value.length >= 16
  );

  // Intercept unauthenticated API requests to /api/admin/*
  if (pathname.startsWith("/api/admin")) {
    if (!hasValidAdminCookie) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Intercept unauthenticated browser requests to /admin/*
  if (pathname.startsWith("/admin")) {
    if (!hasValidAdminCookie) {
      const loginUrl = new URL("/admin/login", req.url);
      if (pathname !== "/admin/login" && pathname !== "/admin/login/") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // -------------------------------------------------------------
  // 2. PUBLIC WORKSPACE ACCOUNT PROTECTION (/dashboard/*, /api/user/*)
  // -------------------------------------------------------------
  if (pathname.startsWith("/api/user")) {
    const userCookie = req.cookies.get(USER_SESSION_COOKIE);
    const userToken = await verifyUserSessionCookie(userCookie?.value);
    if (!userToken) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const userCookie = req.cookies.get(USER_SESSION_COOKIE);
    const userToken = await verifyUserSessionCookie(userCookie?.value);

    // If no regular user token but authorized admin session exists, direct to admin
    if (!userToken && hasValidAdminCookie) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // If unauthenticated or token signature invalid / expired, redirect to public login
    if (!userToken) {
      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/login" && pathname !== "/login/") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    // Route root /dashboard to appropriate workspace
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      const destination = userToken.accountType === "talent" ? "/dashboard/designer" : "/dashboard/company";
      return NextResponse.redirect(new URL(destination, req.url));
    }

    // Enforce role segregation between talent and company workspaces
    if (pathname.startsWith("/dashboard/designer") && userToken.accountType === "company") {
      return NextResponse.redirect(new URL("/dashboard/company", req.url));
    }
    if (pathname.startsWith("/dashboard/company") && userToken.accountType === "talent") {
      return NextResponse.redirect(new URL("/dashboard/designer", req.url));
    }
  }

  // -------------------------------------------------------------
  // 3. SECURITY HEADERS
  // -------------------------------------------------------------
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/api/user/:path*",
  ],
};
