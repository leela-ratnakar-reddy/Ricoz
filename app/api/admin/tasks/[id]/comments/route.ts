import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "node:crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("tasks.edit", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const { id } = await params;
    const body = await req.json();
    const { comment, isBlockerUpdate } = body;

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ success: false, error: "Comment text cannot be empty." }, { status: 400 });
    }

    const db = getDb();
    const commentId = `tcm-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO task_comments (id, task_id, user_id, comment, is_blocker_update, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(commentId, id, user.id, comment.trim(), isBlockerUpdate ? 1 : 0, now);

    recordAuditLog({
      actor: user,
      action: "TASK_COMMENT_ADDED",
      entityType: "task",
      entityId: id,
      changeSummary: `Added comment to task ${id}${isBlockerUpdate ? " (blocker update)" : ""}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Comment added successfully." });
  } catch (error) {
    console.error("Task comment error:", error);
    return NextResponse.json({ success: false, error: "Failed to post comment" }, { status: 500 });
  }
}
