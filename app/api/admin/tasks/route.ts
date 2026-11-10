import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("tasks.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assigneeId");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let query = `
      SELECT 
        t.id, t.title, t.description, t.department_id, t.assignee_id, t.creator_id,
        t.priority, t.status, t.blocker_note, t.is_escalated, t.due_date, t.completed_at,
        t.created_at, t.updated_at,
        d.name as department_name,
        u.full_name as assignee_name,
        c.full_name as creator_name,
        (SELECT count(*) FROM task_comments tc WHERE tc.task_id = t.id) as comments_count
      FROM tasks t
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN admin_users u ON t.assignee_id = u.id
      LEFT JOIN admin_users c ON t.creator_id = c.id
      WHERE 1=1
    `;

    const params: (string | number | null)[] = [];

    if (departmentId) {
      query += " AND t.department_id = ?";
      params.push(departmentId);
    }

    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }

    if (priority) {
      query += " AND t.priority = ?";
      params.push(priority);
    }

    if (assigneeId) {
      query += " AND t.assignee_id = ?";
      params.push(assigneeId);
    }

    if (search) {
      query += " AND (LOWER(t.title) LIKE ? OR LOWER(t.description) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY 
      CASE t.priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        ELSE 4 
      END, 
      t.due_date ASC`;

    const tasks = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("tasks.create", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const body = await req.json();
    const { title, description, departmentId, assigneeId, priority, dueDate, blockerNote, isEscalated } = body;

    if (!title || !departmentId || !priority || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Title, Department, Priority, and Due Date are mandatory." },
        { status: 400 }
      );
    }

    const db = getDb();
    const taskId = `tsk-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO tasks (
        id, title, description, department_id, assignee_id, creator_id,
        priority, status, blocker_note, is_escalated, due_date, completed_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, NULL, ?, ?)
    `);

    insert.run(
      taskId,
      title.trim(),
      (description || "").trim(),
      departmentId,
      assigneeId || null,
      user.id,
      priority,
      blockerNote ? blockerNote.trim() : null,
      isEscalated ? 1 : 0,
      dueDate,
      now,
      now
    );

    recordAuditLog({
      actor: user,
      action: "TASK_CREATED",
      entityType: "task",
      entityId: taskId,
      changeSummary: `Created task "${title}" (${priority}) assigned to ${assigneeId || "unassigned"}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    // Create notification if assigned to another user
    if (assigneeId && assigneeId !== user.id) {
      const notifId = `ntf-${Date.now()}`;
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
        VALUES (?, ?, ?, ?, 'task_assigned', ?, 0, ?)
      `).run(
        notifId,
        assigneeId,
        "New Task Assignment",
        `${user.fullName} assigned you task: "${title}" (Due: ${dueDate})`,
        `/admin/tasks?id=${taskId}`,
        now
      );
    }

    return NextResponse.json({
      success: true,
      taskId,
      message: "Task created successfully.",
    });
  } catch (error) {
    console.error("Task POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 });
  }
}
