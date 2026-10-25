"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  X,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Task, TaskPriority, TaskStatus, Department, AdminUser } from "@/lib/admin/types";

export default function AdminTasksPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialId = searchParams.get("id") || "";
  const initialStatus = searchParams.get("status") || "";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [departmentId, setDepartmentId] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState(initialStatus);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isBlockerComment, setIsBlockerComment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Task Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDept, setNewDept] = useState("dept-ops");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newDueDate, setNewDueDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]);
  const [newBlocker, setNewBlocker] = useState("");
  const [newEscalated, setNewEscalated] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (departmentId) params.append("departmentId", departmentId);
      if (status) params.append("status", status);
      if (priority) params.append("priority", priority);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTasks(data.tasks);
          if (initialId && !selectedTask) {
            const found = data.tasks.find((t: Task) => t.id === initialId);
            if (found) openTaskDetail(found);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [deptRes, teamRes] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch("/api/admin/departments/members"),
      ]);

      if (deptRes.ok) {
        const d = await deptRes.json();
        if (d.success) setDepartments(d.departments);
      }
      if (teamRes.ok) {
        const t = await teamRes.json();
        if (t.success) setTeamMembers(t.members);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [departmentId, status, priority, search]);

  const openTaskDetail = async (task: Task) => {
    setSelectedTask(task);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`);
      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          setSelectedTask(d.task);
          setTaskComments(d.comments || []);
        }
      }
    } catch {
      // fallback
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          departmentId: newDept,
          assigneeId: newAssignee || null,
          priority: newPriority,
          dueDate: newDueDate,
          blockerNote: newBlocker || null,
          isEscalated: newEscalated,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to create task");
        setActionLoading(false);
        return;
      }

      setCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewBlocker("");
      setNewEscalated(false);
      fetchTasks();
    } catch {
      setFormError("Server request failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment, isBlockerUpdate: isBlockerComment }),
      });

      if (res.ok) {
        setNewComment("");
        setIsBlockerComment(false);
        // Refresh details
        openTaskDetail(selectedTask);
      }
    } catch {
      // Non-blocking
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedTask(null);
        fetchTasks();
      } else {
        const d = await res.json();
        alert(d.error || "Delete failed");
      }
    } catch {
      alert("Delete request failed");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const kanbanColumns: { status: TaskStatus; label: string; color: string }[] = [
    { status: "todo", label: "To Do", color: "border-slate-700" },
    { status: "in_progress", label: "In Progress", color: "border-blue-600/50" },
    { status: "blocked", label: "Blocked", color: "border-amber-600/80 bg-amber-950/10" },
    { status: "in_review", label: "In Review", color: "border-purple-600/50" },
    { status: "completed", label: "Completed", color: "border-emerald-600/50" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & NEW TASK BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Task & Workflow Management
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Cross-department assignments, blocker escalations, and deadline tracking.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* 2. FILTER & VIEW MODE BAR */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#0A0D14]">{d.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Priorities</option>
            <option value="urgent" className="bg-[#0A0D14]">Urgent</option>
            <option value="high" className="bg-[#0A0D14]">High</option>
            <option value="medium" className="bg-[#0A0D14]">Medium</option>
            <option value="low" className="bg-[#0A0D14]">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Statuses</option>
            <option value="todo" className="bg-[#0A0D14]">To Do</option>
            <option value="in_progress" className="bg-[#0A0D14]">In Progress</option>
            <option value="blocked" className="bg-[#0A0D14]">Blocked</option>
            <option value="in_review" className="bg-[#0A0D14]">In Review</option>
            <option value="completed" className="bg-[#0A0D14]">Completed</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1 rounded-xl self-end md:self-auto">
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "kanban" ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Kanban Board View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "table" ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Table List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. TASK CONTENT DISPLAY */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <CheckSquare className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No tasks match selected filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting the department or status filter, or create a new operational task.
          </p>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className={`bg-[#0E1118]/80 border ${col.color} rounded-2xl p-3 flex flex-col min-h-[450px] shadow-lg`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => {
                    const isOverdue = t.status !== "completed" && Boolean(t.due_date && t.due_date < today);
                    return (
                      <div
                        key={t.id}
                        onClick={() => openTaskDetail(t)}
                        className={`p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border transition-all cursor-pointer space-y-2 group ${
                          t.status === "blocked"
                            ? "border-amber-500/40 hover:border-amber-500/80"
                            : isOverdue
                            ? "border-red-500/40 hover:border-red-500/80"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            t.priority === "urgent"
                              ? "bg-red-950/80 text-red-400 border-red-800/60"
                              : t.priority === "high"
                              ? "bg-amber-950/80 text-amber-400 border-amber-800/60"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}>
                            {t.priority}
                          </span>

                          {t.is_escalated ? (
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-red-900/60 text-red-300 border border-red-700/50">
                              Escalated
                            </span>
                          ) : null}
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                          {t.title}
                        </h4>

                        {t.blocker_note && (
                          <div className="text-[10px] text-amber-300/90 bg-amber-950/40 border border-amber-800/40 p-1.5 rounded font-mono">
                            <span className="font-bold">Blocker: </span>
                            {t.blocker_note}
                          </div>
                        )}

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="truncate max-w-[100px]">{t.assignee_name || "Unassigned"}</span>
                          <span className={`${isOverdue ? "text-red-400 font-bold" : ""}`}>
                            {t.due_date}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090F] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {tasks.map((t) => {
                  const isOverdue = t.status !== "completed" && Boolean(t.due_date && t.due_date < today);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => openTaskDetail(t)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white max-w-md truncate">
                          {t.title}
                        </div>
                        {t.blocker_note && (
                          <div className="text-[10px] text-amber-400 font-mono mt-0.5 truncate max-w-sm">
                            Blocker: {t.blocker_note}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {t.department_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {t.assignee_name || "Unassigned"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          t.priority === "urgent"
                            ? "bg-red-950/80 text-red-400 border-red-800/60"
                            : t.priority === "high"
                            ? "bg-amber-950/80 text-amber-400 border-amber-800/60"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                          t.status === "completed"
                            ? "bg-emerald-950/80 text-emerald-400"
                            : t.status === "blocked"
                            ? "bg-amber-950/80 text-amber-400"
                            : "bg-slate-800 text-slate-300"
                        }`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-mono text-[11px] ${isOverdue ? "text-red-400 font-bold" : ""}`}>
                        {t.due_date}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskDetail(t);
                          }}
                          className="text-xs font-mono text-slate-400 hover:text-white"
                        >
                          View &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CREATE TASK MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create Operational Task</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q4 Creative Partner SLA Review"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details, deliverable requirements, or instructions..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#0A0D14]">{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Assignee
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="" className="bg-[#0A0D14]">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#0A0D14]">{m.fullName} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Priority *
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="low" className="bg-[#0A0D14]">Low</option>
                    <option value="medium" className="bg-[#0A0D14]">Medium</option>
                    <option value="high" className="bg-[#0A0D14]">High</option>
                    <option value="urgent" className="bg-[#0A0D14]">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Initial Blocker Note (Optional)
                </label>
                <input
                  type="text"
                  value={newBlocker}
                  onChange={(e) => setNewBlocker(e.target.value)}
                  placeholder="Specify any active impediment..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="escalate-checkbox"
                  checked={newEscalated}
                  onChange={(e) => setNewEscalated(e.target.checked)}
                  className="rounded border-white/10 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="escalate-checkbox" className="text-xs text-slate-300 font-mono cursor-pointer">
                  Mark as critical escalation immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono uppercase tracking-wider disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. TASK DETAIL & COMMENT THREAD MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {selectedTask.department_name}
                  </span>
                  <span>•</span>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedTask.priority === "urgent"
                      ? "bg-red-950/80 text-red-400 border-red-800/60"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}>
                    {selectedTask.priority}
                  </span>
                  {selectedTask.is_escalated ? (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700/50">
                      Escalated
                    </span>
                  ) : null}
                </div>
                <h3 className="text-base font-bold text-white">
                  {selectedTask.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Control Strip */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Status:</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateTaskStatus(selectedTask.id, e.target.value as TaskStatus)}
                  className="px-2 py-1 rounded bg-[#0A0D14] border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>Assignee: <strong className="text-slate-200">{selectedTask.assignee_name || "Unassigned"}</strong></span>
                <span>Due: <strong className="text-slate-200">{selectedTask.due_date}</strong></span>
              </div>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Deliverable Description
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-white/[0.01] p-3 rounded-lg border border-white/5">
                  {selectedTask.description}
                </p>
              </div>
            )}

            {/* Blocker Alert if active */}
            {selectedTask.blocker_note && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300 font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Active Blocker Impediment</span>
                </div>
                <p>{selectedTask.blocker_note}</p>
              </div>
            )}

            {/* Comment & Activity Thread */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Workflow Comments & Updates ({taskComments.length})</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {taskComments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No notes or blocker updates posted yet.</p>
                ) : (
                  taskComments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-lg text-xs space-y-1 border ${
                        c.is_blocker_update
                          ? "bg-amber-950/20 border-amber-900/40"
                          : "bg-white/[0.02] border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-slate-200">{c.user_name} ({c.user_role})</span>
                        <span>{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300 font-sans">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post progress update or log impediment..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="blocker-comment-check"
                      checked={isBlockerComment}
                      onChange={(e) => setIsBlockerComment(e.target.checked)}
                      className="rounded border-white/10 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="blocker-comment-check" className="text-[11px] font-mono text-slate-400 cursor-pointer">
                      Flag as blocker update
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || !newComment.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-white transition-colors disabled:opacity-50"
                  >
                    Post Update
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Actions: Delete Task */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="text-xs font-mono text-red-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
