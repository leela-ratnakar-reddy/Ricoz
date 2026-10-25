import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "node:crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { message, isInternalNote } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ success: false, error: "Response message cannot be empty." }, { status: 400 });
    }

    const db = getDb();
    const responseId = `tr-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO ticket_responses (id, ticket_id, user_id, message, is_internal_note, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(responseId, id, user.id, message.trim(), isInternalNote ? 1 : 0, now);

    recordAuditLog({
      actor: user,
      action: "TICKET_RESPONSE_ADDED",
      entityType: "support_ticket",
      entityId: id,
      changeSummary: `Posted ${isInternalNote ? "internal note" : "reply"} to ticket ${id}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Response posted successfully." });
  } catch (error) {
    console.error("Ticket response POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to post response" }, { status: 500 });
  }
}
