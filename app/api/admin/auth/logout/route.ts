import { NextRequest, NextResponse } from "next/server";
import { destroyAdminSession, getAdminUserFromRequest, SESSION_COOKIE_NAME } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  try {
    const user = getAdminUserFromRequest(req);
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      destroyAdminSession(sessionToken);
    }

    if (user) {
      recordAuditLog({
        actor: user,
        action: "USER_LOGOUT",
        entityType: "admin_user",
        entityId: user.id,
        changeSummary: `User ${user.fullName} logged out.`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ success: false, error: "Logout failed." }, { status: 500 });
  }
}
