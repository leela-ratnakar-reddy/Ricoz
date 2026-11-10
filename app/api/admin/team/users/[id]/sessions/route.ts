import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/admin/db";
import { requirePermission, revokeAllUserSessions, revokeSessionById } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("users.view", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { id } = await params;
    const db = getDb();
    const sessions = db.prepare(`
      SELECT id, ip_address, user_agent, expires_at, last_activity_at, created_at
      FROM admin_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(id);

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error("User sessions GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user sessions." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("users.revoke_sessions", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const { sessionId, revokeAll } = body;

    let revokedCount = 0;
    if (revokeAll) {
      revokedCount = revokeAllUserSessions(id);
    } else if (sessionId) {
      const success = revokeSessionById(sessionId);
      revokedCount = success ? 1 : 0;
    } else {
      return NextResponse.json({ success: false, error: "Specify sessionId or revokeAll=true." }, { status: 422 });
    }

    recordAuditLog({
      actor: auth.user,
      action: "SESSION_REVOKED",
      entityType: "admin_session",
      entityId: id,
      changeSummary: `Revoked ${revokedCount} session(s) for user ID: ${id}.`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: `Successfully revoked ${revokedCount} session(s).`,
      revokedCount,
    });
  } catch (error) {
    console.error("User sessions POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to revoke session." }, { status: 500 });
  }
}
