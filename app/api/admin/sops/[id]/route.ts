import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("sops.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const db = getDb();

    const sop = db.prepare(`
      SELECT 
        s.id, s.title, s.slug, s.department_id, s.category, s.summary,
        s.content_markdown, s.version, s.status, s.owner_id, s.last_reviewed_at,
        s.created_at, s.updated_at,
        d.name as department_name,
        u.full_name as owner_name
      FROM sops s
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN admin_users u ON s.owner_id = u.id
      WHERE s.id = ? OR s.slug = ?
    `).get(id, id);

    if (!sop) {
      return NextResponse.json({ success: false, error: "SOP not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sop });
  } catch (error) {
    console.error("SOP GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch SOP" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("sops.edit", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT * FROM sops WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, error: "SOP not found" }, { status: 404 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    const title = body.title !== undefined ? body.title : existing.title;
    const category = body.category !== undefined ? body.category : existing.category;
    const summary = body.summary !== undefined ? body.summary : existing.summary;
    const contentMarkdown = body.contentMarkdown !== undefined ? body.contentMarkdown : existing.content_markdown;
    const version = body.version !== undefined ? body.version : existing.version;
    const status = body.status !== undefined ? body.status : existing.status;

    db.prepare(`
      UPDATE sops SET
        title = ?,
        category = ?,
        summary = ?,
        content_markdown = ?,
        version = ?,
        status = ?,
        last_reviewed_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(title, category, summary, contentMarkdown, version, status, now, now, id);

    recordAuditLog({
      actor: user,
      action: "SOP_UPDATED",
      entityType: "sop",
      entityId: id,
      changeSummary: `Updated SOP "${title}" to version ${version}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "SOP updated successfully." });
  } catch (error) {
    console.error("SOP PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update SOP" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("sops.delete", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT title FROM sops WHERE id = ?").get(id) as { title: string } | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, error: "SOP not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM sops WHERE id = ?").run(id);

    recordAuditLog({
      actor: user,
      action: "SOP_DELETED",
      entityType: "sop",
      entityId: id,
      changeSummary: `Deleted SOP "${existing.title}".`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "SOP deleted successfully." });
  } catch (error) {
    console.error("SOP DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete SOP" }, { status: 500 });
  }
}
