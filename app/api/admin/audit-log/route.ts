import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("audit_logs.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let query = `
      SELECT id, actor_id, actor_name, actor_role, action, entity_type, entity_id, change_summary, ip_address, created_at
      FROM audit_logs
      WHERE 1=1
    `;

    const params: (string | number | null)[] = [];

    if (action) {
      query += " AND action = ?";
      params.push(action);
    }

    if (entityType) {
      query += " AND entity_type = ?";
      params.push(entityType);
    }

    if (search) {
      query += " AND (LOWER(change_summary) LIKE ? OR LOWER(actor_name) LIKE ? OR LOWER(entity_id) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC LIMIT 100";

    const logs = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Audit log GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
