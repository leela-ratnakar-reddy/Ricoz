import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminCredentials, createAdminSession, SESSION_COOKIE_NAME, SESSION_MAX_LIFETIME_HOURS } from "@/lib/admin/auth";
import { checkLoginRateLimit, recordLoginFailure, recordLoginSuccess } from "@/lib/admin/rateLimit";
import { recordAuditLog } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Sliding-window Brute Force Rate Limiting Check
    const rateLimit = checkLoginRateLimit(ip, normalizedEmail);
    if (!rateLimit.allowed) {
      recordAuditLog({
        actor: null,
        action: "LOGIN_RATE_LIMITED",
        entityType: "auth",
        entityId: normalizedEmail,
        changeSummary: `Brute-force lockout triggered for IP: ${ip}, Account: ${normalizedEmail}`,
        ipAddress: ip,
      });

      return NextResponse.json(
        {
          success: false,
          error: rateLimit.error || "Too many failed login attempts. Access temporarily locked.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds || 900),
          },
        }
      );
    }

    // 2. Authoritative Server-side Credential Verification
    const user = authenticateAdminCredentials(normalizedEmail, password);
    if (!user) {
      recordLoginFailure(ip, normalizedEmail);

      recordAuditLog({
        actor: null,
        action: "LOGIN_FAILED",
        entityType: "auth",
        entityId: normalizedEmail,
        changeSummary: `Failed administrative login attempt for account: ${normalizedEmail}`,
        ipAddress: ip,
      });

      return NextResponse.json(
        { success: false, error: "Invalid administrative credentials or account suspended." },
        { status: 401 }
      );
    }

    // Reset rate limit on successful authentication
    recordLoginSuccess(ip, normalizedEmail);

    // 3. Create Session with cryptographically random token
    const { token } = createAdminSession(user.id, ip, userAgent);

    recordAuditLog({
      actor: user,
      action: "USER_LOGIN",
      entityType: "admin_user",
      entityId: user.id,
      changeSummary: `User ${user.fullName} (${user.role}) logged in successfully.`,
      ipAddress: ip,
    });

    const response = NextResponse.json({
      success: true,
      user,
    });

    // 4. Set secure HTTP-only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_LIFETIME_HOURS * 3600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
