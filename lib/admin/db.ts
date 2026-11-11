import type { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { runMigrations } from "./migrations/runner";

// Safely resolve DatabaseSync constructor if native node:sqlite is supported in the current Node runtime (Node 22.5+)
// Fallback gracefully on Node 20 or serverless build environments so next build never crashes
let DatabaseSyncConstructor: (new (path: string) => DatabaseSync) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqlite = require("node:sqlite");
  DatabaseSyncConstructor = sqlite.DatabaseSync;
} catch {
  DatabaseSyncConstructor = null;
}

let dbInstance: DatabaseSync | null = null;

export function getDbPath(): string {
  if (process.env.ADMIN_DB_PATH) {
    return process.env.ADMIN_DB_PATH;
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "ricoz_admin.db");
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const userSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, userSalt, 64).toString("hex");
  return { hash, salt: userSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
  } catch {
    return false;
  }
}

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  if (!DatabaseSyncConstructor) {
    throw new Error(
      "Native SQLite (node:sqlite) is not available in the current runtime environment. " +
      "The Ricoz Admin Panel is operating in Frontend Demo Mode with in-browser mock services."
    );
  }

  const dbPath = getDbPath();
  const db = new DatabaseSyncConstructor(dbPath);

  // Configure high-performance WAL mode and enforce foreign keys
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  initSchema(db);
  seedInitialData(db);
  runMigrations(db);

  dbInstance = db;
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      head_user_id TEXT,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL, -- super_admin, ops_admin, dept_manager, team_member, auditor
      department_id TEXT,
      status TEXT NOT NULL DEFAULT 'active', -- active, suspended
      avatar TEXT NOT NULL,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      department_id TEXT NOT NULL,
      assignee_id TEXT,
      creator_id TEXT NOT NULL,
      priority TEXT NOT NULL, -- low, medium, high, urgent
      status TEXT NOT NULL, -- todo, in_progress, blocked, in_review, completed
      blocker_note TEXT,
      is_escalated INTEGER NOT NULL DEFAULT 0,
      due_date TEXT NOT NULL,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
      FOREIGN KEY (assignee_id) REFERENCES admin_users(id) ON DELETE SET NULL,
      FOREIGN KEY (creator_id) REFERENCES admin_users(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      comment TEXT NOT NULL,
      is_blocker_update INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company_size TEXT NOT NULL,
      onboarding_stage TEXT NOT NULL, -- inquiry, contract_review, kickoff, active, churned
      assigned_owner_id TEXT,
      notes TEXT NOT NULL DEFAULT '',
      next_follow_up TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (assigned_owner_id) REFERENCES admin_users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS client_onboarding_items (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      completed_by_user_id TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (completed_by_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      service_category TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      phone TEXT NOT NULL,
      onboarding_stage TEXT NOT NULL, -- application, document_review, vetting, approved, rejected
      verification_status TEXT NOT NULL, -- unverified, pending_review, verified
      assigned_coordinator_id TEXT,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (assigned_coordinator_id) REFERENCES admin_users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS vendor_documents (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      document_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      verified_by_user_id TEXT,
      verified_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      ticket_ref TEXT UNIQUE NOT NULL,
      client_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      category TEXT NOT NULL, -- onboarding, billing, talent_matching, platform_bug, service_quality
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL, -- low, medium, high, critical
      status TEXT NOT NULL, -- open, pending, escalated, resolved
      assigned_user_id TEXT,
      resolved_at TEXT,
      resolution_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ticket_responses (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_internal_note INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sops (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      department_id TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      content_markdown TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', -- draft, active, archived
      owner_id TEXT,
      last_reviewed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
      FOREIGN KEY (owner_id) REFERENCES admin_users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL, -- task_assigned, task_overdue, ticket_escalated, vendor_pending, system
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      change_summary TEXT NOT NULL,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    -- Create optimal performance indexes
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_dept ON tasks(department_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
  `);
}

function seedInitialData(db: DatabaseSync) {
  const checkDept = db.prepare("SELECT count(*) as count FROM departments").get() as { count: number };
  if (checkDept && checkDept.count > 0) {
    return; // Already seeded
  }

  const now = new Date().toISOString();

  // 1. Departments
  const departments = [
    { id: "dept-ops", name: "Operations", slug: "operations", desc: "Core platform workflows, vetting, quality standards, and day-to-day coordination" },
    { id: "dept-tech", name: "Technology", slug: "technology", desc: "Platform engineering, AI matching engine, infrastructure, and security" },
    { id: "dept-sales", name: "Sales & Partnerships", slug: "sales", desc: "Enterprise client acquisitions, project scoping, and creative partner retainers" },
    { id: "dept-marketing", name: "Marketing", slug: "marketing", desc: "Brand communication, editorial case studies, and creative community outreach" },
    { id: "dept-hr", name: "People & Talent Ops", slug: "hr", desc: "Internal team recruiting, culture, capacity planning, and talent relations" },
    { id: "dept-support", name: "Customer Support", slug: "support", desc: "Client success, creative dispute resolution, and after-sales service quality" },
  ];

  const insertDept = db.prepare("INSERT INTO departments (id, name, slug, description, created_at) VALUES (?, ?, ?, ?, ?)");
  for (const d of departments) {
    insertDept.run(d.id, d.name, d.slug, d.desc, now);
  }

  // 2. Admin Users
  // Passwords can be customized via INITIAL_ADMIN_PASSWORD; default provided for standard local environment
  const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || "Ricozhoo@123";
  const { hash, salt } = hashPassword(defaultPassword);

  const users = [
    {
      id: "usr-super",
      email: process.env.INITIAL_ADMIN_EMAIL || "aadinathachary@gmail.com",
      name: "Aadinath Achary",
      role: "super_admin",
      deptId: "dept-ops",
      avatar: "AA",
    },
    {
      id: "usr-ops-lead",
      email: "elena.ramos@ricoz.io",
      name: "Elena Ramos",
      role: "ops_admin",
      deptId: "dept-ops",
      avatar: "ER",
    },
    {
      id: "usr-tech-lead",
      email: "kai.chen@ricoz.io",
      name: "Kai Chen",
      role: "dept_manager",
      deptId: "dept-tech",
      avatar: "KC",
    },
    {
      id: "usr-sales-lead",
      email: "sarah.jenkins@ricoz.io",
      name: "Sarah Jenkins",
      role: "dept_manager",
      deptId: "dept-sales",
      avatar: "SJ",
    },
    {
      id: "usr-support-lead",
      email: "david.ross@ricoz.io",
      name: "David Ross",
      role: "dept_manager",
      deptId: "dept-support",
      avatar: "DR",
    },
    {
      id: "usr-ops-spec",
      email: "maya.lin@ricoz.io",
      name: "Maya Lin",
      role: "team_member",
      deptId: "dept-ops",
      avatar: "ML",
    },
    {
      id: "usr-auditor",
      email: "audit@ricoz.io",
      name: "Rachel Thorne",
      role: "auditor",
      deptId: null,
      avatar: "RT",
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO admin_users (id, email, password_hash, salt, full_name, role, department_id, status, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.id, u.email, hash, salt, u.name, u.role, u.deptId, u.avatar, now);
  }

  // Update department heads
  db.prepare("UPDATE departments SET head_user_id = ? WHERE id = ?").run("usr-ops-lead", "dept-ops");
  db.prepare("UPDATE departments SET head_user_id = ? WHERE id = ?").run("usr-tech-lead", "dept-tech");
  db.prepare("UPDATE departments SET head_user_id = ? WHERE id = ?").run("usr-sales-lead", "dept-sales");
  db.prepare("UPDATE departments SET head_user_id = ? WHERE id = ?").run("usr-support-lead", "dept-support");

  // 3. Seed Clients (Bridging enterprise companies from domain data)
  const clients = [
    {
      id: "cli-1",
      name: "Aura Health Systems",
      industry: "Healthcare",
      contactName: "Dr. Evelyn Reed",
      contactEmail: "evelyn.reed@aurahealth.com",
      phone: "+1 (617) 555-0192",
      companySize: "250-500 employees",
      stage: "active",
      owner: "usr-sales-lead",
      notes: "High-value enterprise client undergoing multi-year digital diagnostics rebranding.",
    },
    {
      id: "cli-2",
      name: "Kinetics Capital",
      industry: "Finance",
      contactName: "Julian Ward",
      contactEmail: "jward@kineticscapital.com",
      phone: "+1 (212) 555-0144",
      companySize: "100-250 employees",
      stage: "kickoff",
      owner: "usr-sales-lead",
      notes: "Fintech brand architecture mandate. Kickoff scheduled with senior creative team.",
    },
    {
      id: "cli-3",
      name: "Vantage Robotics",
      industry: "Technology",
      contactName: "Alex Vance",
      contactEmail: "alex@vantagerobotics.com",
      phone: "+1 (415) 555-0811",
      companySize: "50-100 employees",
      stage: "contract_review",
      owner: "usr-ops-lead",
      notes: "Reviewing mutual NDA and custom milestone escrow terms for hardware identity design.",
    },
    {
      id: "cli-4",
      name: "Cortex Bio",
      industry: "Biotechnology",
      contactName: "Dr. Sophia Patel",
      contactEmail: "spatel@cortexbio.io",
      phone: "+1 (650) 555-0322",
      companySize: "20-50 employees",
      stage: "inquiry",
      owner: "usr-ops-spec",
      notes: "Requested concierge project briefing for 3D molecular visualization and identity.",
    },
    {
      id: "cli-5",
      name: "Luminary Media Group",
      industry: "Media & Entertainment",
      contactName: "Christian Gray",
      contactEmail: "cgray@luminarymedia.com",
      phone: "+1 (310) 555-0955",
      companySize: "500+ employees",
      stage: "active",
      owner: "usr-sales-lead",
      notes: "Quarterly creative retainer for kinetic motion and streaming broadcast packaging.",
    },
  ];

  const insertClient = db.prepare(`
    INSERT INTO clients (id, name, industry, contact_name, contact_email, phone, company_size, onboarding_stage, assigned_owner_id, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of clients) {
    insertClient.run(c.id, c.name, c.industry, c.contactName, c.contactEmail, c.phone, c.companySize, c.stage, c.owner, c.notes, now, now);
  }

  // 4. Seed Client Onboarding Checklists
  const checklistItems = [
    { title: "Execute Mutual Standard NDA", category: "Legal", completed: 1 },
    { title: "Verified Enterprise Billing Profile", category: "Finance", completed: 1 },
    { title: "Define Project Deliverables & Creative Brief", category: "Scoping", completed: 1 },
    { title: "Confirm Escrow Milestone Structure", category: "Finance", completed: 0 },
    { title: "Creative Lead Introduction & Alignment", category: "Kickoff", completed: 0 },
  ];

  const insertChecklist = db.prepare(`
    INSERT INTO client_onboarding_items (id, client_id, title, category, is_completed, completed_at, completed_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  clients.forEach((c, idx) => {
    checklistItems.forEach((item, itemIdx) => {
      const isComp = c.stage === "active" ? 1 : idx < 2 && item.completed ? 1 : 0;
      insertChecklist.run(
        `chk-${c.id}-${itemIdx}`,
        c.id,
        item.title,
        item.category,
        isComp,
        isComp ? now : null,
        isComp ? "usr-ops-lead" : null
      );
    });
  });

  // 5. Seed Creative Vendors & Partners
  const vendors = [
    {
      id: "ven-1",
      name: "Apex Type Foundry",
      category: "Custom Typography & Font Engineering",
      contactName: "Lucas Haddon",
      contactEmail: "lucas@apextype.de",
      phone: "+49 30 555-0821",
      stage: "approved",
      status: "verified",
      coordinator: "usr-ops-lead",
      notes: "Top-tier Swiss/Berlin typography atelier with extensive proprietary font licensing catalog.",
    },
    {
      id: "ven-2",
      name: "Solaria Kinetic & Motion Lab",
      category: "3D Motion & Broadcast Packaging",
      contactName: "Astrid Lindholm",
      contactEmail: "astrid@solarialab.se",
      phone: "+46 8 555-0129",
      stage: "approved",
      status: "verified",
      coordinator: "usr-ops-spec",
      notes: "Unreal Engine and Houdini simulation specialists. Completed 8 verified projects through RICOZ.",
    },
    {
      id: "ven-3",
      name: "Atelier Spatial 3D",
      category: "Spatial Computing & Interactive WebGL",
      contactName: "Henri Moreau",
      contactEmail: "henri@atelierspatial.fr",
      phone: "+33 1 555-0412",
      stage: "vetting",
      status: "pending_review",
      coordinator: "usr-tech-lead",
      notes: "Submitting WebGL token performance benchmarks and shader security audits.",
    },
    {
      id: "ven-4",
      name: "Northstar Sustainable Print & Packaging",
      category: "Physical Packaging & Sustainable Prototyping",
      contactName: "Karin Olsen",
      contactEmail: "kolsen@northstarprint.no",
      phone: "+47 22 555-0783",
      stage: "document_review",
      status: "unverified",
      coordinator: "usr-ops-spec",
      notes: "Pending FSC eco-certification proof and international distribution insurance documentation.",
    },
  ];

  const insertVendor = db.prepare(`
    INSERT INTO vendors (id, name, service_category, contact_name, contact_email, phone, onboarding_stage, verification_status, assigned_coordinator_id, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const v of vendors) {
    insertVendor.run(v.id, v.name, v.category, v.contactName, v.contactEmail, v.phone, v.stage, v.status, v.coordinator, v.notes, now, now);
  }

  // Seed vendor documents
  const insertVendorDoc = db.prepare(`
    INSERT INTO vendor_documents (id, vendor_id, document_type, file_name, file_url, is_verified, verified_by_user_id, verified_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVendorDoc.run("vdoc-1", "ven-1", "Master Services Agreement", "apex_msa_signed.pdf", "/docs/vendors/apex_msa.pdf", 1, "usr-ops-lead", now, now);
  insertVendorDoc.run("vdoc-2", "ven-1", "Tax & Remittance W-8BEN", "apex_w8ben_2026.pdf", "/docs/vendors/apex_w8.pdf", 1, "usr-ops-lead", now, now);
  insertVendorDoc.run("vdoc-3", "ven-2", "Motion Studio Portfolio Verification", "solaria_reel_audit.pdf", "/docs/vendors/solaria_audit.pdf", 1, "usr-ops-spec", now, now);
  insertVendorDoc.run("vdoc-4", "ven-3", "WebGL Shader Performance Audit", "spatial_webgl_audit.pdf", "/docs/vendors/spatial_audit.pdf", 0, null, null, now);
  insertVendorDoc.run("vdoc-5", "ven-4", "FSC Eco-Certification", "northstar_fsc_pending.pdf", "/docs/vendors/fsc_pending.pdf", 0, null, null, now);

  // 6. Seed Operational Tasks & Workflows
  const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0];
  const pastDue = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];

  const tasks = [
    {
      id: "tsk-101",
      title: "Quarterly Creative Partner SLA Audit",
      description: "Perform comprehensive delivery review across all 57 verified senior talent profiles against studio SLA benchmarks.",
      dept: "dept-ops",
      assignee: "usr-ops-lead",
      priority: "high",
      status: "in_progress",
      dueDate: in3Days,
      blocker: null,
      escalated: 0,
    },
    {
      id: "tsk-102",
      title: "Review Atelier Spatial 3D WebGL Shader Audit",
      description: "Verify WebGL shader memory bounds and cross-browser mobile performance before promoting vendor to verified partner status.",
      dept: "dept-tech",
      assignee: "usr-tech-lead",
      priority: "medium",
      status: "in_review",
      dueDate: in7Days,
      blocker: null,
      escalated: 0,
    },
    {
      id: "tsk-103",
      title: "Vantage Robotics Milestone Escrow Resolution",
      description: "Client requested clarification regarding final IP assignment timeline prior to milestone release.",
      dept: "dept-ops",
      assignee: "usr-ops-spec",
      priority: "urgent",
      status: "blocked",
      dueDate: pastDue,
      blocker: "Awaiting legal counsel sign-off on custom California IP carve-out language.",
      escalated: 1,
    },
    {
      id: "tsk-104",
      title: "Execute Kinetics Capital Rebrand Kickoff Package",
      description: "Finalize creative director pod schedule and transmit mutual NDA documentation to stakeholders.",
      dept: "dept-sales",
      assignee: "usr-sales-lead",
      priority: "high",
      status: "in_progress",
      dueDate: in3Days,
      blocker: null,
      escalated: 0,
    },
    {
      id: "tsk-105",
      title: "Standardize Support Response SLA Protocol for Tier-1 Clients",
      description: "Publish updated SOP regarding 2-hour first response window for enterprise client inquiries.",
      dept: "dept-support",
      assignee: "usr-support-lead",
      priority: "medium",
      status: "completed",
      dueDate: yesterday,
      blocker: null,
      escalated: 0,
    },
    {
      id: "tsk-106",
      title: "AI Match V3.1 Query Latency Profiling",
      description: "Benchmark Gemini project analyzer response times and ensure fallback deterministic engine triggers under 400ms.",
      dept: "dept-tech",
      assignee: "usr-tech-lead",
      priority: "low",
      status: "todo",
      dueDate: in7Days,
      blocker: null,
      escalated: 0,
    },
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, department_id, assignee_id, creator_id, priority, status, blocker_note, is_escalated, due_date, completed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of tasks) {
    insertTask.run(
      t.id,
      t.title,
      t.description,
      t.dept,
      t.assignee,
      "usr-super",
      t.priority,
      t.status,
      t.blocker,
      t.escalated,
      t.dueDate,
      t.status === "completed" ? now : null,
      now,
      now
    );
  }

  // Comments on tasks
  const insertTaskComment = db.prepare(`
    INSERT INTO task_comments (id, task_id, user_id, comment, is_blocker_update, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertTaskComment.run(
    "tcm-1",
    "tsk-103",
    "usr-ops-spec",
    "Escalated to legal department. Client counsel requested explicit retention of pre-existing background IP.",
    1,
    now
  );
  insertTaskComment.run(
    "tcm-2",
    "tsk-103",
    "usr-ops-lead",
    "Reviewed with Marcus. We have approved the standard addendum template. Transmitting draft to Vantage Robotics today.",
    0,
    now
  );

  // 7. Seed Customer Support Tickets
  const tickets = [
    {
      id: "tkt-1",
      ref: "REF-2026-001",
      client: "cli-3",
      custName: "Alex Vance",
      custEmail: "alex@vantagerobotics.com",
      category: "billing",
      subject: "Milestone Escrow Payment Schedule Question",
      desc: "We would like to split Milestone 2 into two 50% tranches based on component delivery. How do we configure this in the contract view?",
      priority: "high",
      status: "open",
      assigned: "usr-ops-lead",
    },
    {
      id: "tkt-2",
      ref: "REF-2026-002",
      client: "cli-1",
      custName: "Dr. Evelyn Reed",
      custEmail: "evelyn.reed@aurahealth.com",
      category: "service_quality",
      subject: "Requesting additional font licensing documentation",
      desc: "Our enterprise legal audit requires perpetual webfont license certificates for Northstar Cloud subdomains.",
      priority: "critical",
      status: "escalated",
      assigned: "usr-support-lead",
    },
    {
      id: "tkt-3",
      ref: "REF-2026-003",
      client: "cli-2",
      custName: "Julian Ward",
      custEmail: "jward@kineticscapital.com",
      category: "talent_matching",
      subject: "Additional Senior Typography Specialist for brand architecture pod",
      desc: "Our board requested an exploratory review with an additional specialist focusing on financial numeral typography.",
      priority: "medium",
      status: "pending",
      assigned: "usr-sales-lead",
    },
    {
      id: "tkt-4",
      ref: "REF-2026-004",
      client: "cli-5",
      custName: "Christian Gray",
      custEmail: "cgray@luminarymedia.com",
      category: "platform_bug",
      subject: "Asset download link expiration notice",
      desc: "Large 4K kinetic rendering deliverables archive timed out during transfer.",
      priority: "low",
      status: "resolved",
      assigned: "usr-tech-lead",
    },
  ];

  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (id, ticket_ref, client_id, customer_name, customer_email, category, subject, description, priority, status, assigned_user_id, resolved_at, resolution_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tk of tickets) {
    insertTicket.run(
      tk.id,
      tk.ref,
      tk.client,
      tk.custName,
      tk.custEmail,
      tk.category,
      tk.subject,
      tk.desc,
      tk.priority,
      tk.status,
      tk.assigned,
      tk.status === "resolved" ? now : null,
      tk.status === "resolved" ? "Extended presigned storage download TTL to 48 hours and retransmitted secure link." : null,
      now,
      now
    );
  }

  // 8. Seed SOPs (Standard Operating Procedures)
  const sops = [
    {
      id: "sop-1",
      title: "Creative Talent Quality & Background Verification",
      slug: "sop-ops-talent-vetting",
      dept: "dept-ops",
      category: "Quality Assurance",
      summary: "Standard procedure for vetting, interview verification, and portfolio case-study authentication before talent listing.",
      content: `### 1. Objective
Establish transparent criteria for verifying creative leadership backgrounds before inclusion in the RICOZ 57-profile directory.

### 2. Mandatory Verification Steps
1. **Studio Background Verification:** Minimum 8+ years verifiable agency or independent studio leadership.
2. **Case Study Proof:** Deliverable source verification (design system tokens, typography specimens, or client reference).
3. **Identity & NDA:** Standard mutual non-disclosure and professional indemnity verification.

### 3. Review Cadence
Bi-annual audit of active talent availability and commercial rate adjustments.`,
      version: "v2.1",
      owner: "usr-ops-lead",
    },
    {
      id: "sop-2",
      title: "Enterprise Client Escalation Protocol",
      slug: "sop-cs-escalation-protocol",
      dept: "dept-support",
      category: "Customer Experience",
      summary: "Tier-1 enterprise incident handling, SLA commitment windows, and executive notification matrix.",
      content: `### 1. SLA Commitment
- **Critical Issues:** 60-minute acknowledgment, 4-hour mitigation plan.
- **High Priority:** 2-hour acknowledgment, 24-hour resolution window.

### 2. Escalation Matrix
- **Tier 1:** Operations Specialist (`+"`usr-ops-spec`"+`)
- **Tier 2:** Operations Administrator (`+"`usr-ops-lead`"+`)
- **Tier 3:** Executive Management (`+"`usr-super`"+`)`,
      version: "v1.4",
      owner: "usr-support-lead",
    },
    {
      id: "sop-3",
      title: "Vendor Document Verification & Remittance Standard",
      slug: "sop-ven-compliance-standard",
      dept: "dept-ops",
      category: "Vendor Relations",
      summary: "Verification requirements for specialized production vendors, foundries, and 3D rendering studios.",
      content: `### 1. Required Documents
- Valid Master Services Agreement (MSA)
- W-9 (US) or W-8BEN / W-8BEN-E (International)
- Commercial General Liability Insurance Certificate
- Deliverables Quality Sample or Code Review

### 2. Approval Authorization
Only users with role **ops_admin** or **super_admin** may mark a vendor as **verified**.`,
      version: "v1.0",
      owner: "usr-ops-lead",
    },
  ];

  const insertSOP = db.prepare(`
    INSERT INTO sops (id, title, slug, department_id, category, summary, content_markdown, version, status, owner_id, last_reviewed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
  `);

  for (const s of sops) {
    insertSOP.run(s.id, s.title, s.slug, s.dept, s.category, s.summary, s.content, s.version, s.owner, now, now, now);
  }

  // 9. Initial Audit Log Entries
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, entity_type, entity_id, change_summary, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run("aud-1", "usr-super", "Marcus Vance", "super_admin", "SYSTEM_INITIALIZED", "system", "ricoz-admin", "Admin database initialized with 6 departments, security policies, and seed records.", "127.0.0.1", now);
  insertAudit.run("aud-2", "usr-ops-lead", "Elena Ramos", "ops_admin", "CLIENT_ONBOARDING_UPDATE", "client", "cli-3", "Escalated contract review for Vantage Robotics custom escrow terms.", "127.0.0.1", now);
  insertAudit.run("aud-3", "usr-super", "Marcus Vance", "super_admin", "VENDOR_VERIFICATION", "vendor", "ven-1", "Verified Apex Type Foundry after W-8BEN and MSA execution.", "127.0.0.1", now);

  // 10. Initial Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run("ntf-1", "usr-ops-lead", "Overdue Task Alert", "Task 'Vantage Robotics Milestone Escrow Resolution' is overdue.", "task_overdue", "/admin/tasks?id=tsk-103", 0, now);
  insertNotif.run("ntf-2", "usr-ops-lead", "Critical Ticket Escalation", "Ticket REF-2026-002 (Dr. Evelyn Reed) has been marked critical.", "ticket_escalated", "/admin/support?ref=REF-2026-002", 0, now);
  insertNotif.run("ntf-3", "usr-tech-lead", "Vendor Review Required", "Atelier Spatial 3D submitted WebGL shader benchmarks for review.", "vendor_pending", "/admin/vendors?id=ven-3", 0, now);
}
