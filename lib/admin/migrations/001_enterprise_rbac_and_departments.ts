import { DatabaseSync } from "node:sqlite";

export interface Migration {
  version: number;
  name: string;
  up: (db: DatabaseSync) => void;
}

export const migration001: Migration = {
  version: 1,
  name: "001_enterprise_rbac_and_departments",
  up: (db: DatabaseSync) => {
    const now = new Date().toISOString();

    // 1. Ensure last_activity_at exists on admin_sessions
    const sessionCols = db.prepare("PRAGMA table_info(admin_sessions)").all() as Array<{ name: string }>;
    const hasLastActivity = sessionCols.some((col) => col.name === "last_activity_at");
    if (!hasLastActivity) {
      db.exec("ALTER TABLE admin_sessions ADD COLUMN last_activity_at TEXT;");
    }

    // 2. Create RBAC tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_roles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        hierarchy_level INTEGER NOT NULL,
        is_system_role INTEGER NOT NULL DEFAULT 1,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_permissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        module TEXT NOT NULL,
        action TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_role_permissions (
        id TEXT PRIMARY KEY,
        role_id TEXT NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
        permission_id TEXT NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        UNIQUE(role_id, permission_id)
      );

      CREATE TABLE IF NOT EXISTS admin_user_permissions (
        id TEXT PRIMARY KEY,
        admin_user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        permission_id TEXT NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
        effect TEXT NOT NULL CHECK(effect IN ('allow', 'deny')),
        granted_by TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        expires_at TEXT,
        created_at TEXT NOT NULL,
        UNIQUE(admin_user_id, permission_id)
      );

      CREATE TABLE IF NOT EXISTS admin_department_members (
        id TEXT PRIMARY KEY,
        admin_user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        membership_role TEXT NOT NULL DEFAULT 'member', -- head, manager, member, observer
        is_primary INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        UNIQUE(admin_user_id, department_id)
      );

      CREATE INDEX IF NOT EXISTS idx_role_perms_role ON admin_role_permissions(role_id);
      CREATE INDEX IF NOT EXISTS idx_role_perms_perm ON admin_role_permissions(permission_id);
      CREATE INDEX IF NOT EXISTS idx_user_perms_user ON admin_user_permissions(admin_user_id);
      CREATE INDEX IF NOT EXISTS idx_dept_members_user ON admin_department_members(admin_user_id);
      CREATE INDEX IF NOT EXISTS idx_dept_members_dept ON admin_department_members(department_id);
    `);

    // 3. Idempotently Seed Missing Departments (Executive Management, Finance & Accounts, AI & Automation, Quality Assurance)
    const targetDepartments = [
      {
        id: "dept-exec",
        name: "Executive Management",
        slug: "executive",
        description: "Executive leadership, strategic direction, governance, and enterprise capital allocation",
      },
      {
        id: "dept-finance",
        name: "Finance & Accounts",
        slug: "finance",
        description: "Financial governance, escrow disbursement, invoicing, treasury, and audit compliance",
      },
      {
        id: "dept-ai",
        name: "AI & Automation",
        slug: "ai-automation",
        description: "AI matching engine algorithms, creative intelligence benchmarks, workflow automations",
      },
      {
        id: "dept-qa",
        name: "Quality Assurance",
        slug: "quality-assurance",
        description: "Creative deliverable verification, talent portfolio vetting standards, and platform QA",
      },
    ];

    const insertDeptStmt = db.prepare(`
      INSERT INTO departments (id, name, slug, description, created_at)
      SELECT ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM departments WHERE id = ? OR slug = ?)
    `);

    for (const d of targetDepartments) {
      insertDeptStmt.run(d.id, d.name, d.slug, d.description, now, d.id, d.slug);
    }

    // 4. Seed System Roles (13-Tier Hierarchy + Auditor + Legacy Aliases)
    const systemRoles = [
      { id: "role-super-admin", name: "Owner / Super Admin", slug: "super_admin", desc: "Full, unrestricted access across all operational modules, settings, and company data", level: 1 },
      { id: "role-exec-director", name: "Executive Director", slug: "exec_director", desc: "Enterprise governance, top-level performance oversight, and cross-department strategy", level: 2 },
      { id: "role-coo", name: "Chief Operations Officer", slug: "coo", desc: "Executive operational lead across platform delivery, client satisfaction, and partner management", level: 3 },
      { id: "role-dept-head", name: "Department Head", slug: "dept_head", desc: "Department lead managing functional workflows, team member allocation, and approvals", level: 4 },
      { id: "role-ops-manager", name: "Operations Manager", slug: "ops_manager", desc: "Day-to-day workflow tracking, task escalations, vendor vetting, and cross-team delivery", level: 5 },
      { id: "role-finance-manager", name: "Finance Manager", slug: "finance_manager", desc: "Client invoicing, platform escrow ledger, talent payouts, and financial reporting", level: 6 },
      { id: "role-hr-manager", name: "HR Manager", slug: "hr_manager", desc: "Internal team onboarding, capacity planning, department memberships, and culture", level: 7 },
      { id: "role-sales-manager", name: "Sales Manager", slug: "sales_manager", desc: "Enterprise client acquisitions, project mandating, intake scoping, and pipeline reporting", level: 8 },
      { id: "role-marketing-manager", name: "Marketing Manager", slug: "marketing_manager", desc: "Brand collateral, case study editorial publishing, and community engagement", level: 9 },
      { id: "role-tech-manager", name: "Technology Manager", slug: "tech_manager", desc: "Platform infrastructure, security audit review, bug resolutions, and technical integrations", level: 10 },
      { id: "role-ai-manager", name: "AI & Automation Manager", slug: "ai_manager", desc: "Creative knowledge taxonomy, AI matching algorithms, automated brief analyzers", level: 11 },
      { id: "role-qa-manager", name: "Quality Assurance Manager", slug: "qa_manager", desc: "Creative review, portfolio quality inspection, and platform bug ticket triage", level: 12 },
      { id: "role-team-member", name: "Team Member", slug: "team_member", desc: "Individual contributor executing assigned tasks, support resolutions, and tickets", level: 13 },
      { id: "role-auditor", name: "Auditor", slug: "auditor", desc: "Strict read-only oversight across company reports, workflows, and security audit logs", level: 14 },
      // Legacy Aliases
      { id: "role-ops-admin", name: "Operations Admin", slug: "ops_admin", desc: "Operations administrator (mapped to Operations Management)", level: 5 },
      { id: "role-dept-manager", name: "Department Manager", slug: "dept_manager", desc: "Department functional manager (mapped to Department Head/Manager)", level: 5 },
    ];

    const insertRoleStmt = db.prepare(`
      INSERT INTO admin_roles (id, name, slug, description, hierarchy_level, is_system_role, is_active, created_at, updated_at)
      SELECT ?, ?, ?, ?, ?, 1, 1, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE id = ? OR slug = ?)
    `);

    for (const r of systemRoles) {
      insertRoleStmt.run(r.id, r.name, r.slug, r.desc, r.level, now, now, r.id, r.slug);
    }

    // 5. Seed Permissions Catalogue
    const permissions = [
      // Dashboard
      { slug: "dashboard.view", name: "View Operations Dashboard", desc: "Access the operational metrics and summary dashboard", module: "dashboard", action: "view" },
      { slug: "dashboard.view_company_metrics", name: "View Company Metrics", desc: "View executive revenue, gross margin, and enterprise KPIs", module: "dashboard", action: "view" },

      // Users & Team
      { slug: "users.view", name: "View Team Members", desc: "View company team members and their administrative profiles", module: "users", action: "view" },
      { slug: "users.create", name: "Create Team Member", desc: "Provision new administrative team accounts", module: "users", action: "create" },
      { slug: "users.edit", name: "Edit Team Member", desc: "Update team member details, primary department, and roles", module: "users", action: "edit" },
      { slug: "users.suspend", name: "Suspend Team Member", desc: "Suspend administrative user access immediately", module: "users", action: "manage" },
      { slug: "users.activate", name: "Activate Team Member", desc: "Re-activate suspended administrative accounts", module: "users", action: "manage" },
      { slug: "users.reset_password", name: "Reset User Password", desc: "Trigger or execute administrative password resets", module: "users", action: "manage" },
      { slug: "users.revoke_sessions", name: "Revoke User Sessions", desc: "Terminate all active browser sessions for a user", module: "users", action: "manage" },
      { slug: "users.assign_roles", name: "Assign Roles", desc: "Assign system roles to team members", module: "users", action: "assign" },
      { slug: "users.manage_permissions", name: "Manage Permission Overrides", desc: "Grant or deny explicit user-level permission overrides", module: "users", action: "manage_permissions" },

      // Departments
      { slug: "departments.view", name: "View Departments", desc: "View company departments, heads, and members", module: "departments", action: "view" },
      { slug: "departments.create", name: "Create Department", desc: "Establish new organizational departments", module: "departments", action: "create" },
      { slug: "departments.edit", name: "Edit Department", desc: "Modify department descriptions, scopes, and details", module: "departments", action: "edit" },
      { slug: "departments.manage_members", name: "Manage Department Members", desc: "Add or remove team members from departments", module: "departments", action: "manage" },
      { slug: "departments.assign_head", name: "Assign Department Head", desc: "Designate or reassign the head of a department", module: "departments", action: "assign" },

      // Tasks
      { slug: "tasks.view", name: "View Tasks", desc: "View operational workflow tasks", module: "tasks", action: "view" },
      { slug: "tasks.create", name: "Create Task", desc: "Create new operational tasks and deliverables", module: "tasks", action: "create" },
      { slug: "tasks.edit", name: "Edit Task", desc: "Update task status, priority, blocker notes, and comments", module: "tasks", action: "edit" },
      { slug: "tasks.delete", name: "Delete Task", desc: "Permanently delete operational tasks", module: "tasks", action: "delete" },
      { slug: "tasks.assign", name: "Assign Task", desc: "Assign tasks to specific team members", module: "tasks", action: "assign" },
      { slug: "tasks.approve", name: "Approve Task", desc: "Approve completed tasks and deliverables", module: "tasks", action: "approve" },
      { slug: "tasks.export", name: "Export Tasks", desc: "Export task workflows to CSV/JSON", module: "tasks", action: "export" },

      // Clients
      { slug: "clients.view", name: "View Clients", desc: "View client profiles, stage progress, and onboarding checklists", module: "clients", action: "view" },
      { slug: "clients.create", name: "Create Client", desc: "Register a new client company into the platform", module: "clients", action: "create" },
      { slug: "clients.edit", name: "Edit Client", desc: "Update client details, contact info, and onboarding stages", module: "clients", action: "edit" },
      { slug: "clients.delete", name: "Delete Client", desc: "Remove client records from active system", module: "clients", action: "delete" },
      { slug: "clients.assign", name: "Assign Client Owner", desc: "Assign an internal relationship owner to a client", module: "clients", action: "assign" },
      { slug: "clients.export", name: "Export Clients", desc: "Export client registry data", module: "clients", action: "export" },

      // Vendors
      { slug: "vendors.view", name: "View Vendors", desc: "View creative vendor and partner directory", module: "vendors", action: "view" },
      { slug: "vendors.create", name: "Create Vendor", desc: "Register new creative agency or service partner", module: "vendors", action: "create" },
      { slug: "vendors.edit", name: "Edit Vendor", desc: "Update vendor information and compliance documents", module: "vendors", action: "edit" },
      { slug: "vendors.delete", name: "Delete Vendor", desc: "Remove vendor partner records", module: "vendors", action: "delete" },
      { slug: "vendors.approve", name: "Approve & Verify Vendor", desc: "Officially verify vendor credentials and documents", module: "vendors", action: "approve" },
      { slug: "vendors.export", name: "Export Vendors", desc: "Export vendor partner records", module: "vendors", action: "export" },

      // Support
      { slug: "support.view", name: "View Support Tickets", desc: "View customer complaints and helpdesk tickets", module: "support", action: "view" },
      { slug: "support.create", name: "Create Support Ticket", desc: "Open support or dispute resolution ticket", module: "support", action: "create" },
      { slug: "support.edit", name: "Edit Support Ticket", desc: "Add ticket responses, internal notes, and update priority", module: "support", action: "edit" },
      { slug: "support.assign", name: "Assign Support Ticket", desc: "Assign support ticket to a customer specialist", module: "support", action: "assign" },
      { slug: "support.resolve", name: "Resolve Support Ticket", desc: "Mark ticket as resolved with closing remarks", module: "support", action: "manage" },
      { slug: "support.export", name: "Export Support Tickets", desc: "Export support ticket metrics and history", module: "support", action: "export" },

      // SOPs
      { slug: "sops.view", name: "View SOPs", desc: "Access company standard operating procedures and docs", module: "sops", action: "view" },
      { slug: "sops.create", name: "Create SOP", desc: "Draft a new SOP or knowledge base document", module: "sops", action: "create" },
      { slug: "sops.edit", name: "Edit SOP", desc: "Update existing SOP content, markdown, or version", module: "sops", action: "edit" },
      { slug: "sops.delete", name: "Delete SOP", desc: "Archive or delete standard operating procedures", module: "sops", action: "delete" },
      { slug: "sops.approve", name: "Approve SOP", desc: "Approve draft SOPs for department publication", module: "sops", action: "approve" },
      { slug: "sops.publish", name: "Publish SOP", desc: "Publish SOPs to active company-wide status", module: "sops", action: "manage" },

      // Reports
      { slug: "reports.view", name: "View Reports", desc: "View cross-department performance analytics", module: "reports", action: "view" },
      { slug: "reports.export", name: "Export Reports", desc: "Export detailed KPI reports and summaries", module: "reports", action: "export" },
      { slug: "reports.view_financial", name: "View Financial Reports", desc: "Access platform revenue, invoice status, and escrow data", module: "reports", action: "view" },

      // Notifications
      { slug: "notifications.view", name: "View Notifications", desc: "View personal and system alerts", module: "notifications", action: "view" },
      { slug: "notifications.create", name: "Create Notification", desc: "Broadcast notifications to team members", module: "notifications", action: "create" },
      { slug: "notifications.manage", name: "Manage Notifications", desc: "Dismiss and manage notification queues", module: "notifications", action: "manage" },

      // Audit Logs
      { slug: "audit_logs.view", name: "View Audit Logs", desc: "Review security audit logs and privileged activity", module: "audit_logs", action: "view" },
      { slug: "audit_logs.export", name: "Export Audit Logs", desc: "Export audit trails for regulatory compliance", module: "audit_logs", action: "export" },

      // Website Content
      { slug: "website_content.view", name: "View Website Content", desc: "Review public marketing and landing page configurations", module: "website_content", action: "view" },
      { slug: "website_content.create", name: "Create Website Content", desc: "Draft public website articles and showcases", module: "website_content", action: "create" },
      { slug: "website_content.edit", name: "Edit Website Content", desc: "Edit editorial showcases, FAQs, and testimonials", module: "website_content", action: "edit" },
      { slug: "website_content.publish", name: "Publish Website Content", desc: "Deploy content updates to public website", module: "website_content", action: "manage" },

      // Talent
      { slug: "talent.view", name: "View Talent Directory", desc: "Browse full roster of creative professionals", module: "talent", action: "view" },
      { slug: "talent.create", name: "Create Talent Profile", desc: "Add new creative talent profile into directory", module: "talent", action: "create" },
      { slug: "talent.edit", name: "Edit Talent Profile", desc: "Update portfolio, bio, skills, and day rates", module: "talent", action: "edit" },
      { slug: "talent.approve", name: "Approve Talent", desc: "Approve talent verification and showcase status", module: "talent", action: "approve" },
      { slug: "talent.archive", name: "Archive Talent", desc: "Archive or hide talent profile from public search", module: "talent", action: "manage" },

      // AI Matcher
      { slug: "ai_matcher.view", name: "View AI Match Benchmarks", desc: "Inspect AI matching evaluations and taxonomy maps", module: "ai_matcher", action: "view" },
      { slug: "ai_matcher.manage", name: "Manage AI Matcher", desc: "Configure AI matching engine rules and thresholds", module: "ai_matcher", action: "manage" },
    ];

    const insertPermStmt = db.prepare(`
      INSERT INTO admin_permissions (id, name, slug, description, module, action, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM admin_permissions WHERE slug = ?)
    `);

    for (const p of permissions) {
      const permId = `prm-${p.slug.replace(/[^a-z0-9]/g, "-")}`;
      insertPermStmt.run(permId, p.name, p.slug, p.desc, p.module, p.action, now, p.slug);
    }

    // 6. Map Roles to Permissions
    // Helper to query all permission slugs and map IDs
    const allDbPerms = db.prepare("SELECT id, slug FROM admin_permissions").all() as Array<{ id: string; slug: string }>;
    const permMap = new Map<string, string>();
    for (const p of allDbPerms) {
      permMap.set(p.slug, p.id);
    }

    const allDbRoles = db.prepare("SELECT id, slug FROM admin_roles").all() as Array<{ id: string; slug: string }>;
    const roleMap = new Map<string, string>();
    for (const r of allDbRoles) {
      roleMap.set(r.slug, r.id);
    }

    const insertRolePermStmt = db.prepare(`
      INSERT INTO admin_role_permissions (id, role_id, permission_id, created_at)
      SELECT ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM admin_role_permissions WHERE role_id = ? AND permission_id = ?)
    `);

    // Define Role-to-Permission Matrix
    const rolePermAssignments: Record<string, string[]> = {
      // Super Admin: All permissions
      super_admin: permissions.map((p) => p.slug),

      // Executive Director: Executive oversight across all modules, metrics, reports, audit logs
      exec_director: [
        "dashboard.view", "dashboard.view_company_metrics",
        "users.view",
        "departments.view",
        "tasks.view", "tasks.approve", "tasks.export",
        "clients.view", "clients.export",
        "vendors.view", "vendors.export",
        "support.view", "support.export",
        "sops.view", "sops.approve",
        "reports.view", "reports.export", "reports.view_financial",
        "audit_logs.view", "audit_logs.export",
        "website_content.view",
        "talent.view",
        "ai_matcher.view",
        "notifications.view",
      ],

      // COO: Full operational command
      coo: [
        "dashboard.view", "dashboard.view_company_metrics",
        "users.view", "users.create", "users.edit", "users.assign_roles",
        "departments.view", "departments.manage_members", "departments.assign_head",
        "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.assign", "tasks.approve", "tasks.export",
        "clients.view", "clients.create", "clients.edit", "clients.assign", "clients.export",
        "vendors.view", "vendors.create", "vendors.edit", "vendors.approve", "vendors.export",
        "support.view", "support.create", "support.edit", "support.assign", "support.resolve", "support.export",
        "sops.view", "sops.create", "sops.edit", "sops.approve", "sops.publish",
        "reports.view", "reports.export", "reports.view_financial",
        "audit_logs.view",
        "website_content.view",
        "talent.view", "talent.approve",
        "ai_matcher.view",
        "notifications.view", "notifications.create", "notifications.manage",
      ],

      // Department Head: Lead of functional department
      dept_head: [
        "dashboard.view",
        "users.view",
        "departments.view", "departments.manage_members",
        "tasks.view", "tasks.create", "tasks.edit", "tasks.assign", "tasks.approve", "tasks.export",
        "clients.view", "clients.edit",
        "vendors.view", "vendors.edit",
        "support.view", "support.edit", "support.resolve",
        "sops.view", "sops.create", "sops.edit", "sops.approve", "sops.publish",
        "reports.view",
        "talent.view",
        "notifications.view", "notifications.manage",
      ],

      // Operations Manager
      ops_manager: [
        "dashboard.view",
        "users.view",
        "departments.view",
        "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.assign", "tasks.approve", "tasks.export",
        "clients.view", "clients.create", "clients.edit", "clients.assign",
        "vendors.view", "vendors.create", "vendors.edit", "vendors.approve", "vendors.export",
        "support.view", "support.create", "support.edit", "support.assign", "support.resolve",
        "sops.view", "sops.create", "sops.edit", "sops.approve",
        "reports.view", "reports.export",
        "audit_logs.view",
        "talent.view", "talent.approve",
        "notifications.view", "notifications.create", "notifications.manage",
      ],

      // Finance Manager: Invoicing, escrow, payouts, financial reporting
      finance_manager: [
        "dashboard.view", "dashboard.view_company_metrics",
        "departments.view",
        "tasks.view",
        "clients.view", "clients.export",
        "vendors.view", "vendors.export",
        "reports.view", "reports.export", "reports.view_financial",
        "sops.view",
        "notifications.view",
      ],

      // HR Manager: Team recruiting, capacity, department memberships
      hr_manager: [
        "dashboard.view",
        "users.view", "users.create", "users.edit", "users.activate", "users.assign_roles",
        "departments.view", "departments.manage_members",
        "tasks.view", "tasks.create", "tasks.edit",
        "sops.view", "sops.create", "sops.edit",
        "reports.view",
        "notifications.view", "notifications.create",
      ],

      // Sales Manager: Client onboarding, project mandates, CRM
      sales_manager: [
        "dashboard.view",
        "departments.view",
        "tasks.view", "tasks.create", "tasks.edit",
        "clients.view", "clients.create", "clients.edit", "clients.assign", "clients.export",
        "reports.view", "reports.export",
        "sops.view",
        "notifications.view",
      ],

      // Marketing Manager: Content, cases, brand
      marketing_manager: [
        "dashboard.view",
        "departments.view",
        "tasks.view", "tasks.create", "tasks.edit",
        "website_content.view", "website_content.create", "website_content.edit", "website_content.publish",
        "talent.view",
        "sops.view",
        "reports.view",
        "notifications.view",
      ],

      // Technology Manager: Systems, engineering, AI
      tech_manager: [
        "dashboard.view",
        "departments.view",
        "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.assign",
        "sops.view", "sops.create", "sops.edit",
        "audit_logs.view",
        "ai_matcher.view", "ai_matcher.manage",
        "reports.view",
        "notifications.view",
      ],

      // AI & Automation Manager
      ai_manager: [
        "dashboard.view",
        "departments.view",
        "tasks.view", "tasks.create", "tasks.edit",
        "ai_matcher.view", "ai_matcher.manage",
        "sops.view",
        "reports.view",
        "notifications.view",
      ],

      // QA Manager
      qa_manager: [
        "dashboard.view",
        "departments.view",
        "tasks.view", "tasks.edit", "tasks.approve",
        "vendors.view", "vendors.edit", "vendors.approve",
        "support.view", "support.edit",
        "sops.view",
        "reports.view",
        "notifications.view",
      ],

      // Team Member: Work on assigned deliverables and tickets
      team_member: [
        "dashboard.view",
        "departments.view",
        "tasks.view", "tasks.edit",
        "clients.view",
        "vendors.view",
        "support.view", "support.create", "support.edit",
        "sops.view",
        "notifications.view",
      ],

      // Auditor: Read-only access across all operational records
      auditor: [
        "dashboard.view",
        "users.view",
        "departments.view",
        "tasks.view", "tasks.export",
        "clients.view", "clients.export",
        "vendors.view", "vendors.export",
        "support.view", "support.export",
        "sops.view",
        "reports.view", "reports.export", "reports.view_financial",
        "audit_logs.view", "audit_logs.export",
        "website_content.view",
        "talent.view",
        "ai_matcher.view",
        "notifications.view",
      ],

      // Legacy Aliases
      ops_admin: [
        "dashboard.view",
        "users.view",
        "departments.view",
        "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.assign", "tasks.approve", "tasks.export",
        "clients.view", "clients.create", "clients.edit", "clients.assign",
        "vendors.view", "vendors.create", "vendors.edit", "vendors.approve", "vendors.export",
        "support.view", "support.create", "support.edit", "support.assign", "support.resolve",
        "sops.view", "sops.create", "sops.edit", "sops.approve",
        "reports.view", "reports.export",
        "audit_logs.view",
        "talent.view", "talent.approve",
        "notifications.view", "notifications.create", "notifications.manage",
      ],
      dept_manager: [
        "dashboard.view",
        "users.view",
        "departments.view", "departments.manage_members",
        "tasks.view", "tasks.create", "tasks.edit", "tasks.assign", "tasks.approve",
        "clients.view", "clients.edit",
        "vendors.view", "vendors.edit",
        "support.view", "support.edit",
        "sops.view", "sops.create", "sops.edit",
        "reports.view",
        "notifications.view",
      ],
    };

    for (const [roleSlug, permSlugs] of Object.entries(rolePermAssignments)) {
      const roleId = roleMap.get(roleSlug);
      if (!roleId) continue;

      for (const permSlug of permSlugs) {
        const permId = permMap.get(permSlug);
        if (!permId) continue;

        const rolePermId = `rp-${roleSlug}-${permSlug.replace(/[^a-z0-9]/g, "-")}`;
        insertRolePermStmt.run(rolePermId, roleId, permId, now, roleId, permId);
      }
    }

    // 7. Seed Department Memberships for Existing 7 Users
    const existingUsers = db.prepare("SELECT id, role, department_id FROM admin_users").all() as Array<{
      id: string;
      role: string;
      department_id: string | null;
    }>;

    const insertMemberStmt = db.prepare(`
      INSERT INTO admin_department_members (id, admin_user_id, department_id, membership_role, is_primary, created_at)
      SELECT ?, ?, ?, ?, 1, ?
      WHERE NOT EXISTS (SELECT 1 FROM admin_department_members WHERE admin_user_id = ? AND department_id = ?)
    `);

    for (const u of existingUsers) {
      if (!u.department_id) continue;
      const memberRole = (u.role === "dept_manager" || u.role === "ops_admin" || u.role === "super_admin") ? "head" : "member";
      const memberId = `dmem-${u.id}-${u.department_id}`;
      insertMemberStmt.run(memberId, u.id, u.department_id, memberRole, now, u.id, u.department_id);
    }
  },
};
