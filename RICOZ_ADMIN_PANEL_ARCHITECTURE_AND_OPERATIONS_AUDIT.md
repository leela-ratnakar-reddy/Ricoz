# RICOZ — Admin Panel Architecture & Internal Company Operations Audit
## Phase 1: Existing Architecture, Team Access, Permissions and Operations Assessment

> [!IMPORTANT]
> **Audit Classification & Methodology**
> This report represents an exhaustive, code-verified technical and operational audit of the RICOZ platform (`ricozdev/connect`) conducted on November 9, 2026. Every finding is classified under one of four strict operational statuses based on direct repository code inspection:
> - `IMPLEMENTED` — Verified in actual executable code and database queries.
> - `PARTIALLY IMPLEMENTED` — Foundational code exists but lacks completeness, full API wiring, or edge handling.
> - `NOT IMPLEMENTED` — Concept documented or implied, but zero application code or database schema exists.
> - `NEEDS VERIFICATION` — Code is ambiguous, external service dependency is unverified, or configuration is absent.

---

## 1. Executive Summary

The RICOZ platform currently possesses a functional, high-density, server-side Admin Panel located at `/admin`. Built with **Next.js 15.5.27**, **React 19**, **TypeScript 5.7**, **Tailwind CSS**, and **Node.js 26 `node:sqlite`** (`DatabaseSync`), the Admin Panel serves as an internal operational hub primarily oriented around operations management, task coordination, client onboarding checklists, vendor compliance vetting, customer support ticketing, SOP management, reporting, and immutable security audit logs.

### Primary Audit Highlights

```
┌────────────────────────────────────────────────────────────────────────┐
│                      RICOZ SYSTEM ARCHITECTURE DUALITY                 │
├────────────────────────────────┬───────────────────────────────────────┤
│ PUBLIC WEBSITE DATA LAYER      │ ADMIN OPERATIONS DATA LAYER           │
│ • Client-side LocalStorage     │ • Server-side SQLite (WAL Mode)       │
│ • Static TS (57 Talent Profiles)│ • 14 Relational Tables (ACID)        │
│ • Ephemeral browser projects   │ • Scrypt Passwords + 256-bit Sessions │
│ • No server sync for bookings  │ • Server API RBAC (5 Roles)           │
└────────────────────────────────┴───────────────────────────────────────┘
```

1. **System Duality & Data Disconnection (`CRITICAL ARCHITECTURAL GAP`)**: 
   A fundamental architectural divide exists between the public website and the internal Admin Panel. The public customer and designer experiences (`/`, `/talent`, `/designers`, `/start-project`, `/dashboard/company`, `/dashboard/designer`) persist data either as immutable static code (`data/talentProfiles.ts`) or client-side browser `localStorage` (`lib/storage.ts`). Conversely, the Admin Panel (`/admin/*`) reads and writes to a separate server-side SQLite database (`data/ricoz_admin.db`). There is currently **zero bidirectional synchronization**: public project inquiries, designer registrations, and brief submissions do not flow into the Admin SQLite database, and administrative actions on talent or content cannot modify public website displays.

2. **Security & Session Boundary**:
   The admin authentication engine implements industry-standard **scrypt password hashing with unique 16-byte cryptographic salts**, constant-time timing-safe hash comparison (`crypto.timingSafeEqual`), and 256-bit random session tokens stored in `admin_sessions`. However, **no edge middleware (`middleware.ts`) exists**. Admin page routes rely on client-side React shell checks (`AdminLayoutShell.tsx`) which redirect unauthenticated visitors after hydration, rather than blocking the HTTP page response at the server edge. All API endpoints (`/api/admin/*`) enforce strict server-side authentication and role-based access control.

3. **Operational Core Completeness**:
   The internal task engine, vendor compliance gating (requiring 100% verified documents before vendor activation), ticket escalation system, SOP documentation manager, and CSV reporting exports are **production-grade and functional**. 

---

## 2. Existing Architecture

```
                                    ┌───────────────────────┐
                                    │    Client Browser     │
                                    └───────────┬───────────┘
                                                │
                                    HTTP Requests (Cookie Auth)
                                                │
                                                ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ NEXT.JS 15 APP ROUTER LAYER                                                           │
│                                                                                       │
│  ┌─────────────────────────────┐                  ┌────────────────────────────────┐  │
│  │ UI Routes (/admin/*)        │                  │ REST API (/api/admin/*)        │  │
│  │ • AdminLayoutShell (Client) │                  │ • getAdminUserFromRequest()    │  │
│  │ • 11 Interactive Pages      │                  │ • hasPermission() RBAC Guard   │  │
│  │ • Server Component Shells   │                  │ • 22 Modular Endpoints         │  │
│  └──────────────┬──────────────┘                  └───────────────┬────────────────┘  │
│                 │                                                 │                   │
└─────────────────┼─────────────────────────────────────────────────┼───────────────────┘
                  │                                                 │
                  ▼                                                 ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ LIB / ADMIN SERVICE LAYER                                                             │
│                                                                                       │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │ lib/admin/auth.ts     │  │ lib/admin/audit.ts   │  │ lib/admin/db.ts            │  │
│  │ • scrypt / salt       │  │ • Immutable Logging  │  │ • node:sqlite DatabaseSync │  │
│  │ • Session Token Mgmt  │  │ • Structured Actions │  │ • WAL Mode + PRAGMA FKs    │  │
│  │ • 16 Defined Perms    │  │ • IP & Actor Capture │  │ • Schema DDL & Auto-Seed   │  │
│  └───────────────────────┘  └──────────────────────┘  └─────────────┬──────────────┘  │
└─────────────────────────────────────────────────────────────────────┼─────────────────┘
                                                                      │
                                                                      ▼
                                                        ┌───────────────────────────┐
                                                        │ SQLite Database (WAL)     │
                                                        │ data/ricoz_admin.db       │
                                                        │ 14 Relational Tables      │
                                                        └───────────────────────────┘
```

### 2.1 Technology Stack
- **Framework**: Next.js 15.5.27 (App Router architecture).
- **Runtime Environment**: Node.js v26.9.0 with native `node:sqlite` module support.
- **Database Engine**: SQLite 3 embedded database located at `data/ricoz_admin.db`.
- **Database Driver**: Native `node:sqlite` (`DatabaseSync` synchronous C-binding).
- **Concurrency & Journaling**: Configured with `PRAGMA journal_mode = WAL;` (Write-Ahead Logging) and `PRAGMA foreign_keys = ON;`.
- **Authentication**: Custom stateful session tokens stored in `admin_sessions`, linked to scrypt-hashed user records in `admin_users`.
- **Transport Security**: Cookies configured as `HttpOnly`, `SameSite=Lax`, and `Secure` in production environments.

### 2.2 Database Schema & Entity Relationships

The database schema defines **14 normalized relational tables**:

```
                       ┌────────────────┐
                       │  departments   │
                       └───────┬────────┘
                               │ 1:N
                               ▼
┌──────────────────────┐ 1:N   ┌────────────────┐ 1:N   ┌─────────────────────────┐
│    admin_sessions    │◄──────┤  admin_users   ├──────►│      notifications      │
└──────────────────────┘       └───┬───┬───┬────┘       └─────────────────────────┘
                                   │   │   │
        ┌──────────────────────────┘   │   └──────────────────────────┐
        │ 1:N                          │ 1:N                          │ 1:N
        ▼                              ▼                              ▼
┌───────────────┐ 1:N          ┌───────────────┐ 1:N          ┌───────────────────┐
│     tasks     ├─────┐        │    clients    ├─────┐        │      vendors      │
└───────────────┘     │        └───────────────┘     │        └─────────┬─────────┘
                      ▼                              ▼                  │ 1:N
               ┌──────────────┐               ┌──────────────┐          ▼
               │task_comments │               │client_items  │   ┌─────────────────┐
               └──────────────┘               └──────────────┘   │vendor_documents │
                                                                 └─────────────────┘
┌──────────────────────┐ 1:N   ┌────────────────┐
│   support_tickets    ├──────►│ticket_responses│
└──────────────────────┘       └────────────────┘

┌──────────────────────┐       ┌────────────────┐
│         sops         │       │   audit_logs   │ (Append-Only)
└──────────────────────┘       └────────────────┘
```

1. **`departments`**: Organizational units (`id`, `name`, `slug`, `head_user_id`, `description`, `created_at`).
2. **`admin_users`**: Internal staff credentials and profile (`id`, `email`, `password_hash`, `salt`, `full_name`, `role`, `department_id`, `status`, `avatar`, `last_login_at`, `created_at`).
3. **`admin_sessions`**: Active login sessions (`id`, `user_id`, `session_token`, `expires_at`, `ip_address`, `user_agent`, `created_at`).
4. **`tasks`**: Operational work items (`id`, `title`, `description`, `department_id`, `assignee_id`, `creator_id`, `priority`, `status`, `blocker_note`, `is_escalated`, `due_date`, `completed_at`, `created_at`, `updated_at`).
5. **`task_comments`**: Audit comments and blocker notes on tasks (`id`, `task_id`, `user_id`, `comment`, `is_blocker_update`, `created_at`).
6. **`clients`**: Commercial clients and enterprises (`id`, `name`, `industry`, `contact_name`, `contact_email`, `phone`, `company_size`, `onboarding_stage`, `assigned_owner_id`, `notes`, `next_follow_up`, `created_at`, `updated_at`).
7. **`client_onboarding_items`**: Stage-based onboarding checklists (`id`, `client_id`, `title`, `category`, `is_completed`, `completed_at`, `completed_by_user_id`).
8. **`vendors`**: External specialist studios, foundries, and lab partners (`id`, `name`, `service_category`, `contact_name`, `contact_email`, `phone`, `onboarding_stage`, `verification_status`, `assigned_coordinator_id`, `notes`, `created_at`, `updated_at`).
9. **`vendor_documents`**: Legal, tax, and compliance attachments (`id`, `vendor_id`, `document_type`, `file_name`, `file_url`, `is_verified`, `verified_by_user_id`, `verified_at`, `created_at`).
10. **`support_tickets`**: Escalations and client queries (`id`, `ticket_ref`, `client_id`, `customer_name`, `customer_email`, `category`, `subject`, `description`, `priority`, `status`, `assigned_user_id`, `resolved_at`, `resolution_notes`, `created_at`, `updated_at`).
11. **`ticket_responses`**: Internal and external ticket communications (`id`, `ticket_id`, `user_id`, `message`, `is_internal_note`, `created_at`).
12. **`sops`**: Standard Operating Procedures and guides (`id`, `title`, `slug`, `department_id`, `category`, `summary`, `content_markdown`, `version`, `status`, `owner_id`, `last_reviewed_at`, `created_at`, `updated_at`).
13. **`notifications`**: User-specific alerts and unread queues (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at`).
14. **`audit_logs`**: Tamper-evident ledger of administrative mutations (`id`, `actor_id`, `actor_name`, `actor_role`, `action`, `entity_type`, `entity_id`, `change_summary`, `ip_address`, `created_at`).

---

## 3. Existing Admin Modules

The table below provides a comprehensive verification of each existing admin module:

| Module Page | Primary Operation & Capabilities | Database Tables | Backing API Endpoints | Permitted Roles | Functional Status | Security / Implementation Concerns |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Command Center**<br>`/admin` | Real-time KPI aggregation, department workload summaries, urgent task list, unverified vendor list, and operational activity stream. | `tasks`, `clients`, `vendors`, `support_tickets`, `departments`, `admin_users`, `audit_logs` | `GET /api/admin/dashboard`<br>`GET /api/admin/departments` | `super_admin`<br>`ops_admin`<br>`dept_manager`<br>`team_member`<br>`auditor` | `IMPLEMENTED` | Read-only aggregation. Date filters (`7d`, `30d`, `90d`) and department dropdown recalculate metrics dynamically. |
| **Tasks & Workflows**<br>`/admin/tasks` | Drag-and-drop / select status change, Kanban board, table view, task creation modal, task detail slideover, blocker updates, priority escalations. | `tasks`, `task_comments`, `departments`, `admin_users`, `audit_logs` | `GET /api/admin/tasks`<br>`POST /api/admin/tasks`<br>`GET /api/admin/tasks/[id]`<br>`PATCH /api/admin/tasks/[id]`<br>`DELETE /api/admin/tasks/[id]`<br>`POST /api/admin/tasks/[id]/comments` | View: All<br>Create: Managers+<br>Update: Team Members (assigned only) or Managers+<br>Delete: Ops/Super Admin | `IMPLEMENTED` | Strict assignee authorization: Team members cannot modify tasks assigned to other users. Comments support blocker flagging. |
| **Client Management**<br>`/admin/clients` | Enterprise account management, stage progression (Inquiry → Contract Review → Kickoff → Active → Churned), onboarding checklist toggles, account lead assignment. | `clients`, `client_onboarding_items`, `admin_users`, `audit_logs` | `GET /api/admin/clients`<br>`POST /api/admin/clients`<br>`GET /api/admin/clients/[id]`<br>`PATCH /api/admin/clients/[id]`<br>`DELETE /api/admin/clients/[id]` | View: All<br>Create/Edit: Managers+<br>Delete: `super_admin` only | `IMPLEMENTED` | Checklist items automatically seed 5 standard milestones upon client creation. Disconnected from public user accounts. |
| **Vendor Network**<br>`/admin/vendors` | Creative partner onboarding, stage tracking, individual document verification toggles, and strict compliance verification gating. | `vendors`, `vendor_documents`, `admin_users`, `audit_logs` | `GET /api/admin/vendors`<br>`POST /api/admin/vendors`<br>`GET /api/admin/vendors/[id]`<br>`PATCH /api/admin/vendors/[id]`<br>`DELETE /api/admin/vendors/[id]` | View: All<br>Edit: Managers+<br>Verify: `ops_admin`, `super_admin`<br>Delete: `super_admin` | `IMPLEMENTED` | **Strict Verification Gate Verified**: API returns `400 Bad Request` if an admin attempts to verify a vendor with unverified compliance documents. |
| **Teams & Departments**<br>`/admin/departments` | Department breakdown, department head assignment, active/overdue task counters, and internal user provisioning modal. | `departments`, `admin_users`, `tasks`, `audit_logs` | `GET /api/admin/departments`<br>`GET /api/admin/departments/members`<br>`POST /api/admin/departments/members` | View: All<br>Provision Users: `super_admin` only | `IMPLEMENTED` | Super admin can provision new staff with temporary password, salt, and department assignment. |
| **Support & Complaints**<br>`/admin/support` | Client dispute handling, SLA tracking, priority escalation, internal private staff notes vs public responses, resolution recording. | `support_tickets`, `ticket_responses`, `clients`, `admin_users`, `audit_logs` | `GET /api/admin/support`<br>`POST /api/admin/support`<br>`GET /api/admin/support/[id]`<br>`PATCH /api/admin/support/[id]`<br>`POST /api/admin/support/[id]/responses` | View: All<br>Create/Respond: Team+<br>Resolve: Managers+ | `IMPLEMENTED` | Sequential reference generation (`REF-2026-XXX`). Supports internal private notes vs customer-visible updates. |
| **SOPs & Documentation**<br>`/admin/sops` | Standard Operating Procedures repository, categorized operational wiki, markdown document viewer, versioning, authoring modal. | `sops`, `departments`, `admin_users`, `audit_logs` | `GET /api/admin/sops`<br>`POST /api/admin/sops`<br>`GET /api/admin/sops/[id]`<br>`PATCH /api/admin/sops/[id]`<br>`DELETE /api/admin/sops/[id]` | View: All<br>Create/Edit: Managers+<br>Delete: `super_admin` only | `IMPLEMENTED` | Slugs generated automatically. Markdown viewer formats procedures into structured operational checklists. |
| **Reports & Analytics**<br>`/admin/reports` | Task velocity, completion rates, department performance matrices, client funnel stages, vendor compliance, and raw CSV stream exports. | `tasks`, `clients`, `vendors`, `support_tickets`, `departments`, `audit_logs` | `GET /api/admin/reports`<br>`GET /api/admin/reports/export?type=(tasks\|clients\|vendors)` | View: Managers+<br>Export: `ops_admin`, `super_admin`, `auditor` | `IMPLEMENTED` | CSV export generates proper RFC 4180 escaped CSV streams with dynamic file naming (`ricoz_export_tasks_2026-11-09.csv`). |
| **Notification Center**<br>`/admin/notifications` | User-specific alert stream (task assigned, milestone overdue, ticket escalated, vendor review), mark as read, mark all read. | `notifications` | `GET /api/admin/notifications`<br>`PATCH /api/admin/notifications`<br>`GET /api/admin/dashboard/badges` | View/Update: All authenticated users (scoped to own user ID) | `IMPLEMENTED` | Polled by sidebar and header for live badge counts across overdue tasks, open tickets, and pending vendors. |
| **Security Audit Log**<br>`/admin/audit-log` | Filterable, immutable ledger of all database mutations, actor role, actor ID, action name, IP address, and JSON change summary. | `audit_logs` | `GET /api/admin/audit-log` | `super_admin`<br>`ops_admin`<br>`auditor` | `IMPLEMENTED` | Append-only. There is intentionally no `DELETE` or `PATCH` endpoint for `audit_logs` to maintain evidentiary integrity. |
| **Admin Login**<br>`/admin/login` | Authentication gateway with scrypt password verification, session issuance, failed login audit logging, and demo 1-click helper. | `admin_users`, `admin_sessions`, `audit_logs` | `POST /api/admin/auth/login`<br>`POST /api/admin/auth/logout`<br>`GET /api/admin/auth/me` | Public (Unauthenticated) | `IMPLEMENTED` | Sets secure `ricoz_admin_session` cookie. Failed logins log actor `null` and email to `audit_logs`. |

---

## 4. Existing Roles and Permissions

### 4.1 Built-in Role Definitions
The codebase enforces 5 distinct roles declared in `lib/admin/types.ts`:
1. `super_admin`: Total system authority. Bypasses permission checks via `hasPermission(role, ...)` override.
2. `ops_admin`: Platform Operations Administrator. Manages cross-department tasks, vendor verifications, client workflows, reports, and audit logs.
3. `dept_manager`: Departmental Lead (e.g., Tech, Sales, Support). Can create tasks, edit clients/vendors, author SOPs, and view departmental metrics.
4. `team_member`: Individual contributor. Restricted to updating tasks assigned to them, responding to support tickets, and viewing assigned clients.
5. `auditor`: Compliance and regulatory officer. Strictly read-only access to all operational modules, reports, CSV exports, and the immutable security audit log.

### 4.2 Code-Verified Permission Mapping (`lib/admin/auth.ts`)

```typescript
export const PERMISSIONS: Record<string, AdminRole[]> = {
  // Global & Governance
  manage_users: ["super_admin"],
  view_audit_log: ["super_admin", "ops_admin", "auditor"],
  view_reports: ["super_admin", "ops_admin", "dept_manager", "auditor"],
  export_reports: ["super_admin", "ops_admin", "auditor"],

  // Tasks & Operations
  manage_all_tasks: ["super_admin", "ops_admin"],
  manage_dept_tasks: ["super_admin", "ops_admin", "dept_manager"],
  update_task_status: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  delete_tasks: ["super_admin", "ops_admin"],

  // Clients & CRM
  view_clients: ["super_admin", "ops_admin", "dept_manager", "auditor", "team_member"],
  edit_clients: ["super_admin", "ops_admin", "dept_manager"],
  delete_clients: ["super_admin"],

  // Vendors & Partners
  view_vendors: ["super_admin", "ops_admin", "dept_manager", "auditor", "team_member"],
  edit_vendors: ["super_admin", "ops_admin", "dept_manager"],
  verify_vendors: ["super_admin", "ops_admin"],
  delete_vendors: ["super_admin"],

  // Support & Complaints
  manage_tickets: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  escalate_tickets: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  resolve_tickets: ["super_admin", "ops_admin", "dept_manager"],

  // SOPs & Documents
  view_sops: ["super_admin", "ops_admin", "dept_manager", "team_member", "auditor"],
  manage_sops: ["super_admin", "ops_admin", "dept_manager"],
};
```

---

## 5. Department Structure Recommendation

Currently, only 6 departments exist in the database (`dept-ops`, `dept-tech`, `dept-sales`, `dept-marketing`, `dept-hr`, `dept-support`). The table below outlines the architecture required to support all **10 target departments**:

| Department | Primary Operational Responsibilities in RICOZ | Recommended Access Boundaries | Recommended Head Role |
| :--- | :--- | :--- | :--- |
| **1. Executive Management** | Strategic oversight, investor relations, board governance, high-level financial health, platform growth KPIs. | Full visibility across all modules, reports, financial ledger, and audit logs. Read/Approve authority on high-value contracts. | `Executive Admin` / `Super Admin` |
| **2. Operations** | Core platform workflows, creative vetting, squad assembly governance, milestone fulfillment, quality escalations. | Full access to Tasks, Clients, Vendors, Support, SOPs, Reports, and Vendor Verification gates. | `Operations Manager` |
| **3. HR & Talent Management** | Creative network recruiting, internal staff hiring, designer contract onboarding, background checks, capacity planning. | Management of internal team rosters, designer verification dossiers, vendor profiles, and HR SOPs. | `HR / Talent Manager` |
| **4. Sales & Business Dev** | Enterprise client acquisition, mandate scoping, lead qualification, pitch proposals, enterprise contract review. | Full access to Client CRM, project inquiry pipelines, pricing calculators, and sales velocity reports. No access to code/tech settings. | `Sales Manager` |
| **5. Marketing & Brand** | Editorial case study publishing, brand artifacts, public website CMS content, creative community showcases. | Full access to Website Content CMS, Portfolio Showcase, case study publishing, and campaign tasks. | `Marketing Manager` |
| **6. Finance & Accounts** | Escrow management, client invoicing, talent milestone disbursements, tax compliance, platform commission ledger. | Dedicated access to Financial Ledger, Escrow Contracts, Payout Approvals, and Invoicing. Strictly isolated from regular team members. | `Finance Manager` |
| **7. Customer Support** | Client after-sales service, dispute mediation, ticket triage, customer satisfaction tracking, SLA compliance. | Full access to Support & Complaints ticketing, client communication logs, and support SOPs. | `Support Manager` |
| **8. Technology & Development** | Next.js platform engineering, infrastructure, database maintenance, security patches, API integrations. | Access to technical tasks, error monitoring, database backup/recovery tools, and audit logs. | `Technical Administrator` |
| **9. AI & Automation** | AI Matcher engine tuning, taxonomy rules, brief extraction accuracy, prompt optimization, semantic scoring. | Access to AI matching logs, algorithm performance dashboards, taxonomy configuration, and matching exception queues. | `AI / Automation Manager` |
| **10. Quality Assurance** | Deliverable verification, code/design quality standards, milestone sign-off audits, compliance adherence. | Access to Task deliverables, milestone review gates, bug ticketing, and Quality SOPs. | `Quality Assurance Manager` |

---

## 6. Proposed Role Hierarchy

To support RICOZ's growth from a boutique matching MVP into an enterprise platform, the current 5-role system must expand into a **13-tier role hierarchy** with granular permission overrides:

```
                                 ┌────────────────────────────────┐
                                 │      Owner / Super Admin       │
                                 └───────────────┬────────────────┘
                                                 │
                                 ┌───────────────▼────────────────┐
                                 │        Executive Admin         │
                                 └───────────────┬────────────────┘
                                                 │
 ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
 │                   │                   │                   │                   │
 ▼                   ▼                   ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Operations   │   │  HR / Talent  │   │ Sales / BD    │   │  Marketing    │   │    Finance    │
│    Manager    │   │    Manager    │   │    Manager    │   │    Manager    │   │    Manager    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │                   │                   │
 ┌──────┴───────┬───────────┴───────┬───────────┴───────┬───────────┴───────┬───────────┴───────┐
 │              │                   │                   │                   │                   │
 ▼              ▼                   ▼                   ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Support     │   │   Technical   │   │ AI/Automation │   │      QA       │   │   Read-Only   │
│   Manager     │   │ Administrator │   │    Manager    │   │    Manager    │   │    Auditor    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘   └───────────────┘
        │                   │                   │                   │
        └───────────────────┴─────────┬─────────┴───────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │  Department Team Member   │
                        │    (Scoped Permissions)   │
                        └───────────────────────────┘
```

### Detailed Functional Scope by Role:

1. **Owner / Super Admin**:
   - *Pages*: Complete platform access including security, billing, user provisioning, database maintenance.
   - *Data*: Unrestricted access across all operational, financial, and personal data.
   - *Actions*: Create, Edit, Delete, Approve, Export, Manage Permissions, Revoke Sessions.

2. **Executive Admin**:
   - *Pages*: All dashboards, reports, financial summaries, talent reviews, client pipelines.
   - *Data*: High-level financial metrics, enterprise contracts, strategic KPIs.
   - *Actions*: Create, Edit, Approve contracts, Export reports. Cannot delete audit logs or drop tables.

3. **Operations Manager**:
   - *Pages*: Tasks, Clients, Vendors, Support, SOPs, Reports, Dashboard.
   - *Data*: All active mandate workflows, vendor compliance files, client onboarding progress.
   - *Actions*: Assign tasks, verify vendors, approve stage transitions, escalate blockers, manage SOPs.

4. **HR / Talent Manager**:
   - *Pages*: Talent Directory, Designer Applications, Vendor Network, Teams & Departments.
   - *Data*: Designer portfolios, tax documents, identity verification, rate negotiation notes.
   - *Actions*: Approve designer profiles, verify credentials, assign internal staff, manage talent SOPs.

5. **Sales Manager**:
   - *Pages*: Clients, Mandate Inquiries, Pricing Calculator, Reports.
   - *Data*: Enterprise client contacts, project briefs, estimated budgets, contract stages.
   - *Actions*: Create/Edit clients, assign account owners, progress client stages, export sales pipelines.

6. **Marketing Manager**:
   - *Pages*: Website Content CMS, Portfolio Showcase, Case Studies, Marketing Tasks.
   - *Data*: Public website copy, hero assets, case study artwork, client testimonials.
   - *Actions*: Create/Edit case studies, draft website updates, publish approved brand artifacts.

7. **Finance Manager**:
   - *Pages*: Finance Ledger, Milestone Escrow, Client Invoices, Vendor Payouts, Reports.
   - *Data*: Escrow balances, bank account details, payout schedules, platform commissions.
   - *Actions*: Approve milestone payouts, issue client invoices, process refunds, export financial audits.

8. **Support Manager**:
   - *Pages*: Support Tickets, Clients, Knowledge Base / SOPs, Team Performance.
   - *Data*: All customer support tickets, dispute logs, customer satisfaction ratings.
   - *Actions*: Assign tickets, escalate critical incidents, publish resolution notes, author support SOPs.

9. **Technical Administrator**:
   - *Pages*: System Settings, API Status, Database Backups, Error Logs, Security Audit Logs.
   - *Data*: Server telemetry, session logs, API request rates, system health indicators.
   - *Actions*: Trigger database backups, rotate encryption keys, manage third-party integrations.

10. **AI / Automation Manager**:
    - *Pages*: AI Matcher Monitoring, Recommendation Quality, Taxonomy Configuration, Reports.
    - *Data*: AI prompt logs, project analysis outputs, match score distributions, error rates.
    - *Actions*: Configure industry taxonomies, adjust scoring weights, audit algorithmic match accuracy.

11. **Quality Assurance Manager**:
    - *Pages*: Task Deliverables, Milestone QA Reviews, Bug Tickets, Platform SOPs.
    - *Data*: Code repositories, design token libraries, deliverable sign-off checklists.
    - *Actions*: Approve/Reject deliverable milestones, sign off on quality gates, flag QA blockers.

12. **Department Team Member**:
    - *Pages*: Tasks, Notifications, Support (if support dept), SOPs.
    - *Data*: Strictly scoped to tasks and tickets assigned to their user ID or department.
    - *Actions*: Update assigned task statuses, log comments, flag blockers, reply to assigned tickets.

13. **Read-Only Auditor**:
    - *Pages*: Security Audit Log, Reports, Read-only view of Tasks, Clients, Vendors, Support, SOPs.
    - *Data*: Full read-only visibility into operational and security records.
    - *Actions*: Export CSV audits, inspect change summaries. Zero create, edit, or delete permissions.

---

## 7. Permission Matrix

The matrix below maps granular operations against roles, explicitly highlighting **SENSITIVE** operations that require administrative separation of duties:

| Operation Category | Specific Permission | Super Admin | Exec Admin | Ops Mgr | HR Mgr | Sales Mgr | Mktg Mgr | Finance Mgr | Support Mgr | Tech Admin | AI Mgr | QA Mgr | Team Member | Auditor |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **System & Access** | `manage_users` *(SENSITIVE)* | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `manage_permissions` *(SENSITIVE)* | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `view_audit_log` *(SENSITIVE)* | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Tasks & Workflows** | `view_tasks` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Own/Dept) | ✅ |
| | `create_tasks` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | `edit_assigned_tasks` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| | `edit_all_tasks` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `delete_tasks` *(SENSITIVE)* | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Talent & Vendors** | `view_vendors` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| | `edit_vendors` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `verify_vendors` *(SENSITIVE)* | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `manage_designer_profiles` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Clients & CRM** | `view_clients` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (Own) | ✅ |
| | `create_edit_clients` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `delete_clients` *(SENSITIVE)* | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Finance & Escrow** | `view_financial_data` *(SENSITIVE)* | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `approve_payouts` *(SENSITIVE)* | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `issue_refunds` *(SENSITIVE)* | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Website & CMS** | `manage_website_content` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | `publish_case_studies` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Analytics & Export**| `view_reports` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| | `export_data` *(SENSITIVE)* | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 8. User Invitation and Access Management

### 8.1 Required Invitation Workflow vs Current Code Reality

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ TARGET INVITATION WORKFLOW (ENTERPRISE STANDARD)                                      │
├───────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Admin creates invite (Email, Dept, Role) ──► 2. Signed crypto invite token issued  │
│ 3. Automated transactional email dispatched ──► 4. User clicks secure token link      │
│ 5. User creates strong password + enrolls MFA ──► 6. Account activated & logged in   │
│ 7. Audit log records full provisioning chain ──► 8. Access revocable at any moment    │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Evaluation of Current Implementation (`lib/admin/db.ts` & `departments/members/route.ts`)
- **Direct Provisioning (`IMPLEMENTED`)**: Currently, a `super_admin` creates an account via `POST /api/admin/departments/members`. However, the administrator must manually enter a plain-text password for the user in the form (`newPassword = "TempPass2026!"`).
- **Cryptographic Hashing (`IMPLEMENTED`)**: Passwords are securely hashed with unique 16-byte salts using scrypt before saving to `admin_users`.
- **Invitation Token Generation (`NOT IMPLEMENTED`)**: There is no invitation token table or mechanism to email an activation link to the user.
- **Email Dispatch (`NOT IMPLEMENTED`)**: No email transport service (SendGrid, Postmark, AWS SES) is configured in the backend to send automated credentials or password reset emails.
- **Account Suspension (`PARTIALLY IMPLEMENTED`)**: The `admin_users` table includes a `status` column (`'active' | 'suspended'`), and `validateAdminSession` properly blocks suspended users. However, there is no UI button or dedicated endpoint to toggle suspension without direct DB manipulation.
- **Session Revocation (`PARTIALLY IMPLEMENTED`)**: `admin_sessions` can be deleted via `destroyAdminSession(token)`, but there is no administrative action to revoke all active sessions for a specific user ID upon termination.
- **Multi-Factor Authentication (MFA) (`NOT IMPLEMENTED`)**: No TOTP (Time-based One-Time Password) or WebAuthn integration exists.
- **Login History (`PARTIALLY IMPLEMENTED`)**: `last_login_at` is recorded on `admin_users`, and logins are written to `audit_logs`, but there is no dedicated login history page per user.

---

## 9. Website Management Operations

The table below audits the public website operations and assesses how they can be centralized into the Admin Panel:

| Website Capability | Public Site Reality | Admin Panel Reality | Status | Required Engineering Effort |
| :--- | :--- | :--- | :--- | :--- |
| **A. Talent Management** | 57 hardcoded TypeScript profiles in `data/talentProfiles.ts`. Fast but requires git commits to update. | No talent management module exists in `/admin`. Only external vendors (`vendors`) are tracked. | `NOT IMPLEMENTED` | High: Migrate talent profiles from static code into SQLite/Postgres. Create admin CRUD UI with photo uploads. |
| **B. Portfolio & Case Studies** | Stored in `data/talentProfiles.ts` and mock project lists. | No portfolio management or case study editing tools exist in `/admin`. | `NOT IMPLEMENTED` | High: Create `portfolio_case_studies` schema, image upload handler, and editorial markdown editor. |
| **C. Client Account Management** | Stored in browser `localStorage` on `/dashboard/company`. Disconnected from server. | `clients` table exists in SQLite with 5 stages and checklist tracking, but not linked to website users. | `PARTIALLY IMPLEMENTED` | Medium: Unify client authentication so enterprise registrations write directly to the backend database. |
| **D. Project Mandate Submissions** | Client project wizard (`/start-project`) saves to browser `localStorage`. | `tasks` table exists in Admin, but customer-submitted project briefs do not flow into it. | `PARTIALLY IMPLEMENTED` | Medium: Connect `/start-project` submission API directly to `tasks` and `clients` in the admin database. |
| **E. AI Matcher Monitoring** | Runs on `/api/ai/analyze-project` via Gemini with deterministic fallback in `lib/talentMatching.ts`. | No telemetry, prompt log viewer, or match score auditor exists inside the Admin Panel. | `NOT IMPLEMENTED` | Medium: Add request logging to `analyze-project` route and build an AI Matcher monitoring dashboard in Admin. |
| **F. Website Content CMS** | Hardcoded React components (`HeroSection.tsx`, `PlatformPreview.tsx`, `BrandArtifactsShowcase.tsx`). | No content editing interface exists in `/admin`. | `NOT IMPLEMENTED` | High: Build a headless CMS table for banner announcements, hero copy, and navigation links. |
| **G. Pricing & Rates Management** | Hardcoded hourly rates in `data/talentProfiles.ts` (e.g. Julian Mercer `$210/hr`). | No pricing management or rate history auditing exists in Admin. | `NOT IMPLEMENTED` | Medium: Add `hourly_rate` and `rate_history` columns to a unified talent schema with approval workflows. |

---

## 10. Finance and Business Operations

### 10.1 Existing Capabilities
Currently, financial operations in RICOZ are **completely unbuilt (`NOT IMPLEMENTED`)**.
- The database contains zero financial transaction tables (no `invoices`, `payments`, `escrow_accounts`, `payouts`, or `revenue_ledger`).
- The Admin Panel contains no financial tabs, payment processing hooks, or stripe integrations.
- *Factual Verification*: In `lib/admin/types.ts` and `db.ts`, tickets have a category `'billing'`, but this is strictly a support categorization, not an accounting system.

### 10.2 Recommended Finance Architecture
To manage enterprise rebranding mandates without exposing sensitive financial records to unauthorized personnel, RICOZ must introduce a dedicated **Financial Operations Domain**:

```
┌────────────────────────────────────────────────────────────────────────┐
│               FINANCIAL ISOLATION & ACCESS BOUNDARY                    │
├────────────────────────────────────────────────────────────────────────┤
│ RESTRICTED TO: Owner, Super Admin, Finance Manager (Strict Separation) │
│                                                                        │
│ 1. Client Invoicing: Milestone-based deposit and progress billings     │
│ 2. Escrow Ledger: Real-time balance tracking for mandate funds held    │
│ 3. Payout Approvals: Dual-authorization required for talent releases   │
│ 4. Refund Processing: Strict multi-person approval gate               │
│ 5. Audit Immutability: Every financial transaction creates an un-     │
│    alterable audit log entry with IP address and cryptographic hash    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Approval and Workflow Management

Enterprise platform governance requires formalized multi-person approval gates. Currently, only **Vendor Verification** has an enforced approval gate in the codebase.

The table below outlines the recommended approval workflow structure:

| Workflow Action | Approval Requirement | Required Approvers | Implemented in Code? | Enforcement Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Vendor Compliance Verification** | 100% Verified Documents Required | `ops_admin` or `super_admin` | `IMPLEMENTED` | Enforced in `app/api/admin/vendors/[id]/route.ts` via document check. |
| **New Designer Registration** | Identity & Portfolio Verification | `HR / Talent Manager` | `NOT IMPLEMENTED` | Public registration is currently client-side mock; needs admin approval queue. |
| **Designer Profile Publication** | Quality Gate & Portfolio Standard | `Operations Manager` | `NOT IMPLEMENTED` | Currently static files; needs a `draft` vs `published` status flag. |
| **Designer Rate Adjustments** | Contract & Market Alignment | `Talent Manager` + `Ops Manager` | `NOT IMPLEMENTED` | Rate adjustments should require secondary approval if exceeding 15%. |
| **Enterprise Client Onboarding** | Credit / KYC & Bilateral NDA Sign-off | `Sales Manager` | `PARTIALLY IMPLEMENTED` | Checklist exists in SQLite, but transition to "Active" is not locked. |
| **Mandate Kickoff Approval** | Escrow Deposit Confirmed | `Finance Manager` + `Ops Manager` | `NOT IMPLEMENTED` | Needs dual sign-off: funds received in escrow + squad capacity confirmed. |
| **Milestone Payment Release** | Deliverable Signed Off by Client | `Client` + `Finance Manager` | `NOT IMPLEMENTED` | Needs milestone escrow release trigger upon client deliverable acceptance. |
| **Refund Request (> $5,000)** | Separation of Duties Dual Sign-off | `Finance Manager` + `Super Admin` | `NOT IMPLEMENTED` | Two distinct individuals must authorize refunds over threshold. |
| **Website Content Publication** | Brand Integrity Review | `Marketing Manager` + `Exec Admin` | `NOT IMPLEMENTED` | Content draft approval workflow before production cache invalidation. |
| **Staff Access & Role Change** | Security Authorization Gate | `Owner / Super Admin` only | `IMPLEMENTED` | `POST /api/admin/departments/members` restricted strictly to `super_admin`. |

---

## 12. Security and Compliance Audit

An exhaustive code-level vulnerability assessment of the admin codebase was performed:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SECURITY VULNERABILITY ASSESSMENT                    │
├──────────┬─────────────────────────────────────────────────────────────┤
│ CRITICAL │ 0 Found                                                     │
│ HIGH     │ 1 Found (Missing Edge Middleware Route Protection)          │
│ MEDIUM   │ 3 Found (CSRF Token Absence, Missing Rate Limiter, S3 Auth) │
│ LOW      │ 2 Found (Session Rotation on Privilege Change, Log Size)    │
└──────────┴─────────────────────────────────────────────────────────────┘
```

### 12.1 Detailed Vulnerability Findings

#### [HIGH] Absence of Server Edge Middleware (`middleware.ts`)
- **Location**: Repository root.
- **Vulnerability**: The repository does not include a `middleware.ts` file. Protection for `/admin/*` pages is handled inside a client-side component (`components/admin/AdminLayoutShell.tsx`) using `useEffect` and `fetch('/api/admin/auth/me')`. 
- **Risk**: While raw API endpoints correctly return `401 Unauthorized`, an unauthenticated browser visiting `/admin/tasks` will receive the client HTML/JS bundle before the browser executes the redirect to `/admin/login`.
- **Remediation**: Implement a standard Next.js edge `middleware.ts` that intercepts `/admin/(.*)` and validates the session cookie before rendering server components.

#### [MEDIUM] Absence of Explicit CSRF Tokens on Mutating Endpoints
- **Location**: `app/api/admin/*`
- **Vulnerability**: Mutating endpoints (`POST`, `PATCH`, `DELETE`) rely solely on cookie presence with `SameSite=Lax`. While `SameSite=Lax` provides strong protection in modern browsers, enterprise compliance frameworks (SOC 2, ISO 27001) require explicit anti-CSRF token verification for state-modifying requests.
- **Remediation**: Implement double-submit cookie or origin-header validation on all admin mutations.

#### [MEDIUM] Lack of Rate Limiting on Admin Login (`/api/admin/auth/login`)
- **Location**: `app/api/admin/auth/login/route.ts`
- **Vulnerability**: While failed logins are logged to `audit_logs`, there is no in-memory or Redis-backed rate limiter (e.g. max 5 attempts per 15 minutes per IP). An attacker could attempt brute-force dictionary attacks against staff accounts.
- **Remediation**: Introduce sliding-window IP and email rate limiting on the login route.

#### [MEDIUM] Local File URL Storage for Compliance Documents
- **Location**: `vendor_documents` table (`file_url` column).
- **Vulnerability**: Document URLs are stored as arbitrary strings (`file_url`). There is no built-in virus scanning, MIME-type enforcement, or signed URL verification.
- **Remediation**: Integrate AWS S3 or Google Cloud Storage with private buckets and time-limited pre-signed URLs.

#### [LOW] Session Token Lifetime and Lack of Idle Expiration
- **Location**: `lib/admin/auth.ts` (`SESSION_DURATION_HOURS = 24 * 7`)
- **Vulnerability**: Sessions remain valid for a static 7 days regardless of activity. There is no idle session timeout (e.g., 30 minutes of inactivity) or session rotation upon privilege elevation.
- **Remediation**: Add a `last_active_at` timestamp to `admin_sessions` and enforce a 60-minute idle expiration.

---

## 13. Database and Scalability Assessment

### 13.1 SQLite Architecture Evaluation
The current implementation utilizes Node.js 26 native `node:sqlite` (`DatabaseSync`) located in a local file at `data/ricoz_admin.db`.

#### Strengths of the Current Architecture:
1. **Zero External Dependencies**: Embedded database requires no Docker containers, remote connection pools, or external network hops, delivering sub-millisecond query execution.
2. **ACID Transaction Safety**: Configured with `PRAGMA foreign_keys = ON;` and `PRAGMA journal_mode = WAL;`. Write-Ahead Logging allows concurrent readers without locking writers.
3. **Optimized Indexing**: The schema includes 10 dedicated indexes on high-frequency columns (`tasks(status)`, `tasks(department_id)`, `tasks(assignee_id)`, `tasks(due_date)`, `admin_sessions(session_token)`, etc.).

#### Limitations of SQLite for RICOZ's Future:
1. **Single Writer Concurrency**: SQLite serializes write operations. As the internal team grows beyond 25 simultaneous active staff logging comments, updating tasks, and processing tickets, write contention (`SQLITE_BUSY`) can occur.
2. **Ephemeral Cloud Containers**: On serverless or containerized deployment platforms (Vercel, AWS ECS, Google Cloud Run), the local filesystem is ephemeral. Re-deploying or scaling horizontally across multiple container instances will reset or corrupt local SQLite files unless mounted to a persistent volume (EFS / Cloud Storage).
3. **Data Isolation from Public Website**: Because public users run on client-side state while admins run on SQLite, cross-system joins are impossible.

#### Migration Triggers & Strategy:
- **Phase 1–2 (Current to 25 Staff)**: Retain SQLite in WAL mode. Implement automated daily backup snapshots using SQLite's online backup API to cloud storage.
- **Phase 3 (Website CMS & Talent Management)**: Migrate to **PostgreSQL** (AWS RDS, Supabase, or Neon) when public talent dossiers and customer briefs are unified with the admin operations database.

---

## 14. Proposed Admin Panel Information Architecture

To accommodate enterprise operations, the Admin Panel navigation should be restructured into **8 primary functional domains**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PROPOSED ADMIN NAVIGATION TAXONOMY                   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. EXECUTIVE                                                           │
│    ├── Command Center (Platform Overview & Velocity)                   │
│    └── Business Analytics & Executive Scorecard                        │
│                                                                        │
│ 2. PEOPLE & ACCESS                                                     │
│    ├── Team Members (Staff Directory & Invites)                        │
│    ├── Departments (Organizational Units & Heads)                      │
│    └── Roles & Permissions Matrix                                      │
│                                                                        │
│ 3. TALENT NETWORK                                                      │
│    ├── Verified Specialists (57 Master Dossiers)                       │
│    ├── Talent Applications & Review Queue                              │
│    ├── Portfolio & Case Study Approvals                                │
│    └── Vetting & Background Checks                                     │
│                                                                        │
│ 4. BUSINESS & CLIENTS                                                  │
│    ├── Client Directory & Accounts                                     │
│    ├── Project Mandates & Active Briefs                                │
│    ├── Vendor Network & Foundries                                      │
│    └── Rate Cards & Pricing Governance                                 │
│                                                                        │
│ 5. OPERATIONS & WORKFLOW                                               │
│    ├── Task & Workflow Board (Kanban / List)                           │
│    ├── Milestone Approval Gates                                        │
│    ├── Support & Client Complaints                                     │
│    ├── Operational Wiki & SOPs                                         │
│    └── Notification Hub                                                │
│                                                                        │
│ 6. WEBSITE CMS                                                         │
│    ├── Homepage & Hero Management                                      │
│    ├── Showcase Artifacts & Deliverables                               │
│    ├── Curated Showcase Selection                                      │
│    └── Navigation & Footer Configuration                               │
│                                                                        │
│ 7. INTELLIGENCE & AI                                                   │
│    ├── AI Matcher Telemetry & Logs                                     │
│    ├── Recommendation Quality Auditing                                 │
│    └── Taxonomy & Rule Configuration                                   │
│                                                                        │
│ 8. SYSTEM & GOVERNANCE                                                 │
│    ├── Security Audit Trail (Immutable)                                │
│    ├── Data Exports (CSV / JSON)                                       │
│    ├── Integrations (Email, Storage, AI)                               │
│    └── Database Health & Backups                                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Existing Features Versus Missing Features

The table below catalogs every capability required for a complete operations platform, classifying its exact state in the current repository:

| Functional Area | Specific Capability | Status | Code Evidence / Verification Notes |
| :--- | :--- | :--- | :--- |
| **Authentication** | Scrypt password hashing with unique salts | `IMPLEMENTED` | `lib/admin/db.ts:19-28` (`crypto.scryptSync`, 64 bytes) |
| | Constant-time timingSafeEqual verification | `IMPLEMENTED` | `lib/admin/db.ts:28` (`crypto.timingSafeEqual`) |
| | Session token management (256-bit entropy) | `IMPLEMENTED` | `lib/admin/auth.ts:16` (`crypto.randomBytes(32)`) |
| | HTTP-only session cookie issuance | `IMPLEMENTED` | `app/api/admin/auth/login/route.ts:54-62` |
| | Server edge middleware protection | `NOT IMPLEMENTED` | No `middleware.ts` file in repository. |
| | Multi-factor authentication (TOTP/WebAuthn)| `NOT IMPLEMENTED` | Zero MFA schema or libraries. |
| | Password reset email workflow | `NOT IMPLEMENTED` | No token tables or mailer service. |
| **RBAC & Authorization**| 5 Core Roles (`super_admin` to `auditor`) | `IMPLEMENTED` | `lib/admin/types.ts:1-6` |
| | 16 Fine-grained permission keys | `IMPLEMENTED` | `lib/admin/auth.ts:100-132` |
| | Assignee-only task edit enforcement | `IMPLEMENTED` | `app/api/admin/tasks/[id]/route.ts:77-80` |
| | Custom permission overrides per user | `NOT IMPLEMENTED` | Permissions are statically mapped to roles only. |
| **Task Management** | Kanban & Table views | `IMPLEMENTED` | `app/admin/tasks/page.tsx` |
| | Task creation with priority & due date | `IMPLEMENTED` | `app/api/admin/tasks/route.ts:86-160` |
| | Blocker flagging and escalation toggle | `IMPLEMENTED` | `tasks` table columns `blocker_note`, `is_escalated`. |
| | Task comments and blocker audit notes | `IMPLEMENTED` | `task_comments` table and API endpoint. |
| **Vendor Governance** | Vendor document verification toggle | `IMPLEMENTED` | `vendor_documents` table and API route. |
| | Strict 100% compliance verification gate | `IMPLEMENTED` | `app/api/admin/vendors/[id]/route.ts:111-128` |
| **Client Management** | Client onboarding stages (5 stages) | `IMPLEMENTED` | `clients` table column `onboarding_stage`. |
| | 5 Standard onboarding checklist milestones | `IMPLEMENTED` | Auto-seeded in `app/api/admin/clients/route.ts:100-120`. |
| | Synchronization with public client signups | `NOT IMPLEMENTED` | Public signups persist only to browser `localStorage`. |
| **Customer Support** | Sequential reference numbers (`REF-2026-X`)| `IMPLEMENTED` | `app/api/admin/support/route.ts:98-100` |
| | Private staff internal notes vs public replies| `IMPLEMENTED` | `ticket_responses` table column `is_internal_note`. |
| | Resolution notes and SLA timestamping | `IMPLEMENTED` | `support_tickets` table column `resolved_at`. |
| **SOPs & Wiki** | Categorized operational procedures | `IMPLEMENTED` | `sops` table and markdown viewer interface. |
| | Automated URL slug generation | `IMPLEMENTED` | `app/api/admin/sops/route.ts:78` |
| **Reports & Export** | Dynamic velocity and SLA calculations | `IMPLEMENTED` | `app/api/admin/reports/route.ts` |
| | RFC 4180 escaped CSV stream export | `IMPLEMENTED` | `app/api/admin/reports/export/route.ts:6-10` |
| **Audit Logging** | Immutable change logging with IP capture | `IMPLEMENTED` | `audit_logs` table and `recordAuditLog` helper. |
| | Deletion prevention on audit log | `IMPLEMENTED` | Zero `DELETE` or `PATCH` routes implemented for audit log. |
| **Website & Talent** | Talent profile CRUD management in Admin | `NOT IMPLEMENTED` | 57 profiles remain hardcoded in `data/talentProfiles.ts`. |
| | Public homepage CMS content editing | `NOT IMPLEMENTED` | Public homepage sections remain static components. |
| | AI Matcher telemetry & prompt audit queue | `NOT IMPLEMENTED` | `/api/ai/analyze-project` has no admin logging. |
| **Finance & Escrow** | Invoicing, payment status, escrow ledger | `NOT IMPLEMENTED` | Zero financial schema or payment gateways exist. |

---

## 16. Critical Problems & Architecture Blockers

1. **Disconnected Data Layers (`Severity: CRITICAL`)**:
   Public website bookings and registrations live in client browser `localStorage`. The Admin Panel operates on server-side SQLite. Neither system knows about the other.
2. **Missing Edge Route Protection (`Severity: HIGH`)**:
   Admin pages (`/admin/*`) render without server edge authentication. Client components handle redirects after hydration, exposing client bundle metadata.
3. **Absence of Transactional Email Transport (`Severity: HIGH`)**:
   Team members cannot be invited via secure email tokens, passwords cannot be self-reset, and ticket responses cannot notify external clients.
4. **Static Talent Profiles (`Severity: MEDIUM`)**:
   Updating a creative director's hourly rate or bio requires a developer to edit `data/talentProfiles.ts`, commit to git, and re-deploy the entire application.
5. **Single-Node SQLite Concurrency Barrier (`Severity: MEDIUM`)**:
   As the internal operations team scales, local SQLite file locking will become a bottleneck on serverless deployments.

---

## 17. Recommended Development Roadmap

```
PHASE 1 (Weeks 1-2)  ──► Security, Middleware & Access Hardening
PHASE 2 (Weeks 3-4)  ──► User Invitations, 10 Departments & Granular RBAC
PHASE 3 (Weeks 5-6)  ──► Unified Talent & Website Content CMS
PHASE 4 (Weeks 7-8)  ──► Client Brief Ingestion & Mandate Pipeline
PHASE 5 (Weeks 9-10) ──► Finance, Invoicing & Escrow Management
PHASE 6 (Weeks 11-12)──► AI Matcher Telemetry, PostgreSQL Migration & Scalability
```

### PHASE 1: Security & Access Management
- Implement standard Next.js edge `middleware.ts` protecting `/admin/(.*)`.
- Introduce sliding-window rate limiting on `/api/admin/auth/login`.
- Add origin/CSRF validation headers to all administrative API routes.
- Add idle session timeouts (60 minutes) and session revocation per user ID.

### PHASE 2: Departments, Team Members and Permissions
- Seed the 4 missing departments (`dept-exec`, `dept-finance`, `dept-ai`, `dept-qa`) to reach the full 10-department operational structure.
- Build the secure invitation workflow with cryptographic activation tokens and transactional email dispatch.
- Expand the 5 roles into the 13-tier role hierarchy with user-specific permission overrides.
- Implement account suspension, password reset, and role reassignment controls in the UI.

### PHASE 3: Website and Talent Management
- Migrate the 57 talent profiles and portfolio projects from static TypeScript files into database tables (`talent_profiles`, `portfolio_projects`).
- Build an administrative Talent Management module: add designers, upload portrait images, edit skills, adjust hourly rates, and toggle `isCurated` badges.
- Create an approval workflow for new designer applications and profile publications.
- Implement a headless Website CMS module for homepage hero copy, announcements, and footer links.

### PHASE 4: Client Brief Ingestion & Mandate Pipeline
- Refactor `/start-project` to post briefs directly to a server API endpoint (`POST /api/mandates`), writing to `clients` and `tasks` in the database.
- Connect client authentication (`/register`, `/login`) to the database, eliminating `localStorage` reliance.
- Build client milestone tracking allowing enterprise clients to review squads and approve deliverables.

### PHASE 5: Business, Financial Operations & Approvals
- Create financial tables: `invoices`, `milestone_escrow`, `payouts`, `financial_ledger`.
- Implement dual-authorization approval workflows for payouts over $5,000 and client refund requests.
- Build a dedicated, permission-isolated Financial Operations dashboard accessible strictly to Super Admin and Finance Managers.

### PHASE 6: Analytics, AI Telemetry and Scalability
- Add telemetry logging to `/api/ai/analyze-project` to track prompt latency, token costs, match score distributions, and extraction errors.
- Build an AI Matcher monitoring dashboard inside Admin to review and audit recommendation quality.
- Migrate from SQLite to **PostgreSQL** (AWS RDS, Supabase, or Neon) with automated connection pooling and point-in-time recovery.

---

## 18. Dependencies and Implementation Risks

| Implementation Risk | Potential Impact | Severity | Mitigation Strategy |
| :--- | :--- | :---: | :--- |
| **Data Migration Downtime** | Moving from `localStorage` / static files to SQLite/Postgres could disrupt existing public site matching. | High | Execute zero-downtime database seeding script reading `TALENT_PROFILES` directly into SQL tables before switching read paths. |
| **Cloud Deployment Ephemerality** | Deploying SQLite to serverless hosts (Vercel) resets the database on every cold start. | High | Either deploy to a stateful container host (AWS ECS / Fly.io / Railway) with persistent volume storage or migrate to PostgreSQL. |
| **Email Deliverability Failure** | Invite tokens and password reset emails blocked by corporate spam filters. | Medium | Use a reputable transactional email provider (Postmark / SendGrid) with strict SPF, DKIM, and DMARC record verification. |
| **Dual-Writer Contention in SQLite** | High concurrent administrative actions causing `SQLITE_BUSY` errors. | Medium | Ensure WAL mode remains active, set busy timeouts (`PRAGMA busy_timeout = 5000;`), and prioritize Phase 6 PostgreSQL migration. |
| **Scope Creep in Website CMS** | Building a full visual page builder instead of structured content fields. | Low | Keep CMS strictly focused on key structured fields (Hero headline, badge text, announcement bar, navigation labels). |

---

*Report authored by Senior Enterprise Software Architect & Operations Systems Review Team.*  
*Repository: `ricozdev/connect` • Date of Audit: November 9, 2026 • Verified against Commit HEAD.*
