import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("departments.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    const departments = db.prepare(`
      SELECT 
        d.id, d.name, d.slug, d.description, d.head_user_id, d.created_at,
        u.full_name as head_user_name,
        (SELECT count(*) FROM admin_users m WHERE m.department_id = d.id AND m.status = 'active') as member_count,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id AND t.status != 'completed') as active_task_count,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id AND t.status != 'completed' AND t.due_date < ?) as overdue_task_count
      FROM departments d
      LEFT JOIN admin_users u ON d.head_user_id = u.id
      ORDER BY d.name ASC
    `).all(today);

    return NextResponse.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Departments GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("departments.create", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const body = await req.json();
    const { name, description, slug } = body;

    if (!name || !description) {
      return NextResponse.json({ success: false, error: "Department name and description are required." }, { status: 422 });
    }

    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const deptId = `dept-${cleanSlug}`;
    const now = new Date().toISOString();

    const db = getDb();
    const existing = db.prepare("SELECT id FROM departments WHERE slug = ? OR name = ?").get(cleanSlug, name);
    if (existing) {
      return NextResponse.json({ success: false, error: "A department with this name or slug already exists." }, { status: 409 });
    }

    db.prepare(`
      INSERT INTO departments (id, name, slug, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(deptId, name.trim(), cleanSlug, description.trim(), now);

    recordAuditLog({
      actor: user,
      action: "DEPARTMENT_CREATED",
      entityType: "department",
      entityId: deptId,
      changeSummary: `Created department "${name}" (${cleanSlug}).`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Department created successfully.",
      department: { id: deptId, name, slug: cleanSlug, description },
    });
  } catch (error) {
    console.error("Departments POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create department" }, { status: 500 });
  }
}
