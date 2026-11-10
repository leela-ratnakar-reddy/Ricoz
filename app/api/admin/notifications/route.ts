import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("notifications.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const db = getDb();
    const notifications = db.prepare(`
      SELECT id, user_id, title, message, type, link, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(user.id);

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission("notifications.manage", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const db = getDb();
    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(user.id);
    } else if (notificationId) {
      db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(notificationId, user.id);
    }

    return NextResponse.json({ success: true, message: "Notifications updated." });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update notifications" }, { status: 500 });
  }
}
