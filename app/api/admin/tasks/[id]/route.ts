import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest, hasPermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const task = db.prepare(`
      SELECT 
        t.id, t.title, t.description, t.department_id, t.assignee_id, t.creator_id,
        t.priority, t.status, t.blocker_note, t.is_escalated, t.due_date, t.completed_at,
        t.created_at, t.updated_at,
        d.name as department_name,
        u.full_name as assignee_name,
        c.full_name as creator_name
      FROM tasks t
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN admin_users u ON t.assignee_id = u.id
      LEFT JOIN admin_users c ON t.creator_id = c.id
      WHERE t.id = ?
    `).get(id);

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const comments = db.prepare(`
      SELECT 
        tc.id, tc.task_id, tc.user_id, tc.comment, tc.is_blocker_update, tc.created_at,
        u.full_name as user_name, u.avatar as user_avatar, u.role as user_role
      FROM task_comments tc
      JOIN admin_users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
    `).all(id);

    return NextResponse.json({
      success: true,
      task,
      comments,
    });
  } catch (error) {
    console.error("Task detail error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch task details" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    // RBAC: Team members can only update status, comments or blocker notes on assigned tasks
    if (user.role === "team_member" && existing.assignee_id !== user.id) {
      return NextResponse.json({ success: false, error: "You can only update tasks assigned to you." }, { status: 403 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    const newStatus = String(body.status !== undefined ? body.status : existing.status);
    const newPriority = String(body.priority !== undefined ? body.priority : existing.priority);
    const newAssigneeId = body.assigneeId !== undefined ? (body.assigneeId ? String(body.assigneeId) : null) : (existing.assignee_id ? String(existing.assignee_id) : null);
    const newBlockerNote = body.blockerNote !== undefined ? (body.blockerNote ? String(body.blockerNote) : null) : (existing.blocker_note ? String(existing.blocker_note) : null);
    const newIsEscalated = body.isEscalated !== undefined ? (body.isEscalated ? 1 : 0) : Number(existing.is_escalated || 0);
    const newDueDate = String(body.dueDate !== undefined ? body.dueDate : existing.due_date);
    const newTitle = String(body.title !== undefined ? body.title : existing.title);
    const newDescription = String(body.description !== undefined ? body.description : existing.description);

    const completedAt = newStatus === "completed" && existing.status !== "completed"
      ? now
      : newStatus !== "completed"
      ? null
      : existing.completed_at ? String(existing.completed_at) : null;

    const update = db.prepare(`
      UPDATE tasks SET
        title = ?,
        description = ?,
        priority = ?,
        status = ?,
        assignee_id = ?,
        blocker_note = ?,
        is_escalated = ?,
        due_date = ?,
        completed_at = ?,
        updated_at = ?
      WHERE id = ?
    `);

    update.run(
      newTitle,
      newDescription,
      newPriority,
      newStatus,
      newAssigneeId,
      newBlockerNote,
      newIsEscalated,
      newDueDate,
      completedAt,
      now,
      id
    );

    recordAuditLog({
      actor: user,
      action: "TASK_UPDATED",
      entityType: "task",
      entityId: id,
      changeSummary: `Updated task "${newTitle}": status=${newStatus}, priority=${newPriority}, escalated=${newIsEscalated}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Task updated successfully." });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    if (!hasPermission(user.role, "delete_tasks")) {
      return NextResponse.json({ success: false, error: "Only Super Admin and Ops Admin can delete tasks." }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT title FROM tasks WHERE id = ?").get(id) as { title: string } | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

    recordAuditLog({
      actor: user,
      action: "TASK_DELETED",
      entityType: "task",
      entityId: id,
      changeSummary: `Deleted task "${existing.title}"`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    console.error("Task delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
  }
}
