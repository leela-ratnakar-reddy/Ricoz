import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminCredentials, createAdminSession, SESSION_COOKIE_NAME, SESSION_DURATION_HOURS } from "@/lib/admin/auth";
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

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const user = authenticateAdminCredentials(email, password);
    if (!user) {
      recordAuditLog({
        actor: null,
        action: "LOGIN_FAILED",
        entityType: "auth",
        entityId: email.trim().toLowerCase(),
        changeSummary: `Failed login attempt for email: ${email}`,
        ipAddress: ip,
      });

      return NextResponse.json(
        { success: false, error: "Invalid administrative credentials or account suspended." },
        { status: 401 }
      );
    }

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

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_HOURS * 3600,
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
