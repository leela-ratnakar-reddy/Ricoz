/**
 * RICOZ Admin — Frontend Demo Tasks Service
 */

import { Task, TaskComment, AdminUser, Department } from "@/lib/admin/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage";
import { DEFAULT_TASKS, DEFAULT_TASK_COMMENTS, DEFAULT_USERS, DEFAULT_DEPARTMENTS } from "./seedData";
import { logAuditEvent } from "./audit";

export function getTasks(filters?: {
  departmentId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}): Task[] {
  let tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  const comments = getStorageItem<TaskComment[]>(STORAGE_KEYS.TASK_COMMENTS, DEFAULT_TASK_COMMENTS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);

  // Populate names & commentsCount
  tasks = tasks.map((t) => {
    const taskComments = comments.filter((c) => c.taskId === t.id);
    const assignee = users.find((u) => u.id === t.assigneeId);
    const creator = users.find((u) => u.id === t.creatorId);
    const dept = depts.find((d) => d.id === t.departmentId);

    return {
      ...t,
      assigneeName: assignee ? assignee.fullName : t.assigneeName,
      creatorName: creator ? creator.fullName : t.creatorName,
      departmentName: dept ? dept.name : t.departmentName,
      commentsCount: taskComments.length,
    };
  });

  if (filters?.departmentId) {
    tasks = tasks.filter((t) => t.departmentId === filters.departmentId);
  }

  if (filters?.status) {
    tasks = tasks.filter((t) => t.status === filters.status);
  }

  if (filters?.priority) {
    tasks = tasks.filter((t) => t.priority === filters.priority);
  }

  if (filters?.assigneeId) {
    tasks = tasks.filter((t) => t.assigneeId === filters.assigneeId);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.blockerNote || "").toLowerCase().includes(q)
    );
  }

  return tasks;
}

export function getTaskById(id: string): { task: Task | null; comments: TaskComment[] } {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id) || null;
  const allComments = getStorageItem<TaskComment[]>(STORAGE_KEYS.TASK_COMMENTS, DEFAULT_TASK_COMMENTS);
  const comments = allComments.filter((c) => c.taskId === id);

  return { task, comments };
}

export function createTask(data: Partial<Task>): Task {
  const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);

  const assignee = users.find((u) => u.id === data.assigneeId);
  const dept = depts.find((d) => d.id === data.departmentId);
  const now = new Date().toISOString();

  const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

  const newTask: Task = {
    id: `tsk-${Date.now().toString(36)}`,
    title: data.title || "Untitled Operational Task",
    description: data.description || "",
    departmentId: data.departmentId || "dept-ops",
    departmentName: dept ? dept.name : "Operations",
    assigneeId: data.assigneeId || null,
    assigneeName: assignee ? assignee.fullName : undefined,
    creatorId: "usr-super",
    creatorName: "Aadinath Achary",
    priority: data.priority || "medium",
    status: data.status || "todo",
    dueDate: data.dueDate || in3Days,
    blockerNote: data.blockerNote || null,
    isEscalated: data.isEscalated ?? false,
    commentsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  setStorageItem(STORAGE_KEYS.TASKS, [newTask, ...tasks]);

  logAuditEvent("task.create", "task", newTask.id, `Created task "${newTask.title}" [${newTask.priority.toUpperCase()}]`);

  return newTask;
}

export function updateTask(id: string, data: Partial<Task>): Task | null {
  const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);

  const assigneeId = data.assigneeId !== undefined ? data.assigneeId : tasks[idx].assigneeId;
  const assignee = users.find((u) => u.id === assigneeId);

  const deptId = data.departmentId !== undefined ? data.departmentId : tasks[idx].departmentId;
  const dept = depts.find((d) => d.id === deptId);

  const isCompletedNow = data.status === "completed" && tasks[idx].status !== "completed";

  const updated: Task = {
    ...tasks[idx],
    ...data,
    assigneeName: assignee ? assignee.fullName : tasks[idx].assigneeName,
    departmentName: dept ? dept.name : tasks[idx].departmentName,
    completedAt: isCompletedNow ? new Date().toISOString() : data.status && data.status !== "completed" ? null : tasks[idx].completedAt,
    updatedAt: new Date().toISOString(),
  };

  tasks[idx] = updated;
  setStorageItem(STORAGE_KEYS.TASKS, tasks);

  logAuditEvent(
    "task.update",
    "task",
    id,
    `Updated task "${updated.title}" (Status: ${updated.status}, Priority: ${updated.priority})`
  );

  return updated;
}

export function deleteTask(id: string): boolean {
  const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  const comments = getStorageItem<TaskComment[]>(STORAGE_KEYS.TASK_COMMENTS, DEFAULT_TASK_COMMENTS);

  const target = tasks.find((t) => t.id === id);
  const filteredTasks = tasks.filter((t) => t.id !== id);
  const filteredComments = comments.filter((c) => c.taskId !== id);

  setStorageItem(STORAGE_KEYS.TASKS, filteredTasks);
  setStorageItem(STORAGE_KEYS.TASK_COMMENTS, filteredComments);

  logAuditEvent("task.delete", "task", id, `Deleted task "${target?.title || id}"`);
  return true;
}

export function addTaskComment(
  taskId: string,
  comment: string,
  isBlockerUpdate = false,
  author?: { id: string; name: string; avatar: string; role: AdminUser["role"] }
): TaskComment {
  const comments = getStorageItem<TaskComment[]>(STORAGE_KEYS.TASK_COMMENTS, DEFAULT_TASK_COMMENTS);

  const newComment: TaskComment = {
    id: `tcom-${Date.now().toString(36)}`,
    taskId,
    userId: author?.id || "usr-super",
    userName: author?.name || "Aadinath Achary",
    userAvatar: author?.avatar || "AA",
    userRole: author?.role || "super_admin",
    comment,
    isBlockerUpdate,
    createdAt: new Date().toISOString(),
  };

  setStorageItem(STORAGE_KEYS.TASK_COMMENTS, [...comments, newComment]);

  if (isBlockerUpdate) {
    updateTask(taskId, { blockerNote: comment, isEscalated: true, status: "blocked" });
  }

  logAuditEvent("task.comment", "task_comment", newComment.id, `Added comment on task ${taskId}`);

  return newComment;
}
