import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export async function GET(req: NextRequest) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

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
