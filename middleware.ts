import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "ricoz_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow login endpoints to remain publicly accessible
  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  const hasValidCookieFormat = Boolean(sessionCookie && sessionCookie.value && sessionCookie.value.length >= 16);

  // 2. Intercept unauthenticated API requests to /api/admin/*
  if (pathname.startsWith("/api/admin")) {
    if (!hasValidCookieFormat) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 3. Intercept unauthenticated web browser requests to /admin/*
  if (pathname.startsWith("/admin")) {
    if (!hasValidCookieFormat) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Attach standard security headers to response
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
  ],
};
