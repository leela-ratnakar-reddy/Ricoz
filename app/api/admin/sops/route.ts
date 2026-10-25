import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest, hasPermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let query = `
      SELECT 
        s.id, s.title, s.slug, s.department_id, s.category, s.summary,
        s.content_markdown, s.version, s.status, s.owner_id, s.last_reviewed_at,
        s.created_at, s.updated_at,
        d.name as department_name,
        u.full_name as owner_name
      FROM sops s
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN admin_users u ON s.owner_id = u.id
      WHERE 1=1
    `;

    const params: (string | number | null)[] = [];

    if (departmentId) {
      query += " AND s.department_id = ?";
      params.push(departmentId);
    }

    if (search) {
      query += " AND (LOWER(s.title) LIKE ? OR LOWER(s.summary) LIKE ? OR LOWER(s.category) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY s.title ASC";

    const sops = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      sops,
    });
  } catch (error) {
    console.error("SOPs GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch SOPs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    if (!hasPermission(user.role, "manage_sops")) {
      return NextResponse.json({ success: false, error: "Permission denied." }, { status: 403 });
    }

    const body = await req.json();
    const { title, departmentId, category, summary, contentMarkdown, version } = body;

    if (!title || !departmentId || !summary || !contentMarkdown) {
      return NextResponse.json({ success: false, error: "Title, Department, Summary, and Content are required." }, { status: 400 });
    }

    const db = getDb();
    const sopId = `sop-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO sops (
        id, title, slug, department_id, category, summary, content_markdown,
        version, status, owner_id, last_reviewed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `).run(
      sopId,
      title.trim(),
      slug,
      departmentId,
      category || "Standard Procedure",
      summary.trim(),
      contentMarkdown.trim(),
      version || "v1.0",
      user.id,
      now,
      now,
      now
    );

    recordAuditLog({
      actor: user,
      action: "SOP_CREATED",
      entityType: "sop",
      entityId: sopId,
      changeSummary: `Created standard operating procedure "${title}" (${version || "v1.0"})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, sopId, message: "SOP created successfully." });
  } catch (error) {
    console.error("SOP POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create SOP" }, { status: 500 });
  }
}
