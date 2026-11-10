import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb, hashPassword } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("departments.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    const members = db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.role, u.department_id, u.status, u.avatar, u.last_login_at, u.created_at,
        d.name as department_name,
        (SELECT count(*) FROM tasks t WHERE t.assignee_id = u.id AND t.status != 'completed') as active_tasks,
        (SELECT count(*) FROM tasks t WHERE t.assignee_id = u.id AND t.status = 'completed') as completed_tasks,
        (SELECT count(*) FROM tasks t WHERE t.assignee_id = u.id AND t.status != 'completed' AND t.due_date < ?) as overdue_tasks
      FROM admin_users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.role = 'super_admin' DESC, u.full_name ASC
    `).all(today);

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error("Team members GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("users.create", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const body = await req.json();
    const { email, fullName, role, departmentId, password } = body;

    if (!email || !fullName || !role || !password) {
      return NextResponse.json({ success: false, error: "Email, Full Name, Role, and Password are required." }, { status: 400 });
    }

    const db = getDb();

    // Check if email already exists
    const existing = db.prepare("SELECT id FROM admin_users WHERE LOWER(email) = LOWER(?)").get(email.trim());
    if (existing) {
      return NextResponse.json({ success: false, error: "A user with this email address already exists." }, { status: 400 });
    }

    const userId = `usr-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
    const { hash, salt } = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, salt, full_name, role, department_id, status, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(userId, email.trim().toLowerCase(), hash, salt, fullName.trim(), role, departmentId || null, initials, now);

    if (departmentId) {
      db.prepare(`
        INSERT INTO admin_department_members (id, admin_user_id, department_id, membership_role, is_primary, created_at)
        VALUES (?, ?, ?, 'member', 1, ?)
      `).run(`dmem-${userId}-${departmentId}`, userId, departmentId, now);
    }

    recordAuditLog({
      actor: user,
      action: "USER_PROVISIONED",
      entityType: "admin_user",
      entityId: userId,
      changeSummary: `Provisioned user ${fullName} (${role}) in department ${departmentId || "unassigned"}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Team member provisioned successfully.",
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        fullName,
        role,
        departmentId,
      },
    });
  } catch (error) {
    console.error("Team member POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to provision user" }, { status: 500 });
  }
}
