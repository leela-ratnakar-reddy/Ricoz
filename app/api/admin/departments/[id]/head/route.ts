import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/admin/db";
import { requirePermission } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("departments.assign_head", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { id: departmentId } = await params;
    const body = await req.json();
    const { headUserId } = body;

    const db = getDb();
    const dept = db.prepare("SELECT * FROM departments WHERE id = ?").get(departmentId) as Record<string, unknown> | undefined;
    if (!dept) {
      return NextResponse.json({ success: false, error: "Department not found." }, { status: 404 });
    }

    let headName = "None";
    if (headUserId) {
      const targetUser = db.prepare("SELECT id, full_name, email, status, role FROM admin_users WHERE id = ?").get(headUserId) as Record<string, unknown> | undefined;
      if (!targetUser) {
        return NextResponse.json({ success: false, error: "Designated department head user not found." }, { status: 404 });
      }
      if (targetUser.status !== "active") {
        return NextResponse.json({ success: false, error: "Cannot assign a suspended user as department head." }, { status: 422 });
      }
      headName = String(targetUser.full_name);

      // Upsert department membership
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO admin_department_members (id, admin_user_id, department_id, membership_role, is_primary, created_at)
        VALUES (?, ?, ?, 'head', 1, ?)
        ON CONFLICT(admin_user_id, department_id) DO UPDATE SET
          membership_role = 'head'
      `).run(`dmem-${headUserId}-${departmentId}`, headUserId, departmentId, now);
    }

    db.prepare("UPDATE departments SET head_user_id = ? WHERE id = ?").run(headUserId || null, departmentId);

    recordAuditLog({
      actor: auth.user,
      action: "DEPARTMENT_HEAD_ASSIGNED",
      entityType: "department",
      entityId: departmentId,
      changeSummary: `Assigned ${headName} (${headUserId || "unassigned"}) as Department Head for ${dept.name}.`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: `Department head for ${dept.name} updated successfully.`,
      departmentId,
      headUserId,
      headUserName: headName,
    });
  } catch (error) {
    console.error("Department head assignment error:", error);
    return NextResponse.json({ success: false, error: "Failed to reassign department head." }, { status: 500 });
  }
}
