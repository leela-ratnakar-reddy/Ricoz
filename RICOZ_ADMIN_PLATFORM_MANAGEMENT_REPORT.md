# RICOZ — ADMIN PLATFORM MANAGEMENT SYSTEM
## Operations Architecture, Data Models, Mutation Layer & Governance Report

**Production Reference:** `https://ricoz-six.vercel.app`  
**Local Codebase:** `/Users/leela/Documents/Ricoz`  
**Database Backend:** InsForge PostgreSQL (`https://2cbr24z5.us-east.insforge.app`)  
**Deployment Runtime:** Next.js 15.5.27, React 19, TypeScript  
**Build Status:** Compiled 84/84 routes with 0 errors (`npm run build` PASS)

---

## 1. Executive Summary

The RICOZ Admin Operations suite has been expanded with a unified **Platform Management System** that allows operations directors and administrators to supervise, govern, and arbitrate every facet of the creative marketplace.

Unlike agency internal CRM systems, this platform management system connects directly to the marketplace tables in InsForge PostgreSQL:
- `user_profiles` (authenticated accounts)
- `talent_profiles` (creative specialists)
- `company_profiles` (corporate clients)
- `client_projects` (opportunities & mandates)
- `project_applications` (proposals & pitches)
- `user_shortlists` (client bookmarking)
- `support_tickets` & `ticket_responses` (customer service & disputes)
- `notifications` (real-time platform push notifications)
- `audit_logs` (tamper-evident administrative compliance trail)

All administrative actions execute atomic SQL mutations, trigger audit log entries, and automatically dispatch real-time notifications to users when appropriate.

---

## 2. Module Specifications & Operational Workflows

### 2.1 Platform Users Directory (`/admin/users`)

The primary registry for all authenticated marketplace accounts:

- **Frontend Interface:** `app/admin/users/page.tsx`
- **Backend Endpoints:**
  - `GET /api/admin/users`: Search (name, email, headline, company), filter by `accountType` (`talent`, `company`), `isVerified` (`true`, `false`), and `status` (`active`, `suspended`, `deactivated`), with pagination and high-level platform metrics.
  - `GET /api/admin/users/[id]`: Returns full user profile, specialized profile (`talent_profiles` or `company_profiles`), recent project mandates, and application history.
  - `PATCH /api/admin/users/[id]`: Updates user status or verification badge, records `PLATFORM_USER_MODIFIED` in `audit_logs`.

---

### 2.2 Creative Talent Specialists Roster (`/admin/talent`)

Dedicated management of creative directors, brand strategists, visual identity designers, and art directors:

- **Frontend Interface:** `app/admin/talent/page.tsx`
- **Backend Endpoints:**
  - `GET /api/admin/talent`: Queries `user_profiles` joined with `talent_profiles`. Filters by search, specific skill tag (`skills::text ILIKE ?`), location, minimum years of experience (`years_experience >= ?`), availability status, verification, and status.
  - `GET /api/admin/talent/[id]`: Comprehensive talent dossier, parsed skills array, portfolio URL, complete proposal submission history joined with project titles, and total bookmark count from `user_shortlists`.
  - `PATCH /api/admin/talent/[id]`:
    - Toggles verification badge (`is_verified`)
    - Transitions account status (`active`, `suspended`, `deactivated`)
    - Adjusts commercial parameters (`hourly_rate`, `availability`)
    - Records `PLATFORM_TALENT_MODIFIED` in `audit_logs`

---

### 2.3 Enterprise Client Accounts (`/admin/companies`)

Dedicated governance of corporate partners, brand procurement teams, and client accounts:

- **Frontend Interface:** `app/admin/companies/page.tsx`
- **Backend Endpoints:**
  - `GET /api/admin/companies`: Queries `user_profiles` joined with `company_profiles`. Filters by search, industry sector, company scale (`1-10`, `11-50`, `51-200`, `201+`), verification, and status. Returns live project counts and proposal receipt volume.
  - `GET /api/admin/companies/[id]`: Corporate profile details, billing country, verified corporate domain, list of posted mandates (`client_projects`) with status and applicant counts.
  - `PATCH /api/admin/companies/[id]`:
    - Grants or revokes corporate verified badge
    - Modifies account status (`active`, `suspended`, `deactivated`)
    - Corrects corporate attributes (`company_name`, `industry`, `company_size`, `website_url`)
    - Records `PLATFORM_COMPANY_MODIFIED` in `audit_logs`

---

### 2.4 Opportunities & Mandates Management (`/admin/opportunities`)

Lifecycle management of client project briefs, procurement scoping, and talent matching:

- **Frontend Interface:** `app/admin/opportunities/page.tsx`
- **Backend Endpoints:**
  - `GET /api/admin/opportunities`: Queries `client_projects` joined with company user profile and `company_profiles`. Filters by title/scope search, lifecycle phase (`Discovery`, `Matching`, `Active`, `Closed`), budget tier, and client ID.
  - `GET /api/admin/opportunities/[id]`: Full project brief, target audience, brand personality, rebranding objectives, and all received proposals with applicant details and proposed rates.
  - `PATCH /api/admin/opportunities/[id]`:
    - Transitions project lifecycle phase:
      - `Discovery` (initial brief intake and scoping)
      - `Matching` (open for talent proposals)
      - `Active` (contract awarded and in execution)
      - `Closed` (mandate fulfilled and archived)
    - Updates timeline or budget tier
    - Records `PLATFORM_OPPORTUNITY_MODIFIED` in `audit_logs`

---

### 2.5 Proposals & Applications Pipeline (`/admin/applications`)

Review, evaluation, and awarding of specialist pitches and commercial proposals:

- **Frontend Interface:** `app/admin/applications/page.tsx`
- **Backend Endpoints:**
  - `GET /api/admin/applications`: Queries `project_applications` joined with `client_projects` and `user_profiles` (talent). Filters by search, proposal status (`pending`, `reviewed`, `shortlisted`, `accepted`, `declined`), and project ID.
  - `GET /api/admin/applications/[id]`: Full pitch statement, commercial proposed rate, talent portfolio link, and project scope.
  - `PATCH /api/admin/applications/[id]`:
    - Modifies application status (`reviewed`, `shortlisted`, `accepted`, `declined`)
    - Records `PLATFORM_APPLICATION_MODIFIED` in `audit_logs`
    - **Real-Time Notification Dispatch:** Automatically inserts a notification into the `notifications` table for the applicant talent user with a tailored title, message, and link to `/talent/applications`.

---

## 3. Real-Time Notification & Audit Architecture

### 3.1 Automated Applicant Notification Dispatch

When an administrator reviews, shortlists, accepts, or declines an application in `/admin/applications`, the mutation transaction executes:

```ts
// Insert real-time notification for applicant
await db.prepare(`
  INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
  VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())
`).run(
  crypto.randomUUID(),
  existing.talent_user_id,
  statusTitle,
  statusMsg,
  "application_status",
  "/talent/applications"
);
```

When the talent specialist logs in or views their dashboard, their notification bell immediately displays the status update.

### 3.2 Audit Log Compliance

Every administrative mutation invokes `recordAuditLog`:

```ts
await recordAuditLog({
  actor: auth.user,
  action: "PLATFORM_APPLICATION_MODIFIED",
  entityType: "project_application",
  entityId: id,
  changeSummary: `Application for '${existing.project_title}' by '${existing.talent_name}' updated: ${changes.join("; ")}`,
  ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
});
```

All mutations are permanently recorded in `audit_logs` with timestamps, actor IDs, roles, and change summaries, visible in `/admin/audit-log`.

---

## 4. Role-Based Access Control (RBAC) Matrix

Administrative privileges are enforced across all new endpoints:

| Endpoint | Action | Required Permission | Allowed Roles |
|---|---|---|---|
| `GET /api/admin/analytics/overview` | View Analytics | `reports.view` | Super Admin, Ops Director, Dept Head |
| `GET /api/admin/users` | View Users | `users.view` | Super Admin, Ops Director, Coordinator |
| `PATCH /api/admin/users/[id]` | Update User Status | `users.manage` | Super Admin, Ops Director |
| `GET /api/admin/talent` | View Talent | `users.view` | Super Admin, Ops Director, Coordinator |
| `PATCH /api/admin/talent/[id]` | Verify/Suspend Talent | `users.manage` | Super Admin, Ops Director |
| `GET /api/admin/companies` | View Enterprises | `users.view` | Super Admin, Ops Director, Coordinator |
| `PATCH /api/admin/companies/[id]` | Verify/Suspend Client | `users.manage` | Super Admin, Ops Director |
| `GET /api/admin/opportunities` | View Mandates | `tasks.view` | Super Admin, Ops Director, Coordinator |
| `PATCH /api/admin/opportunities/[id]` | Transition Phase | `tasks.edit` | Super Admin, Ops Director |
| `GET /api/admin/applications` | View Proposals | `tasks.view` | Super Admin, Ops Director, Coordinator |
| `PATCH /api/admin/applications/[id]` | Award/Shortlist Pitch | `tasks.edit` | Super Admin, Ops Director |
| `GET /api/admin/reports/export` | CSV Export | `reports.export` | Super Admin, Ops Director |

---

## 5. Navigation Integration (`AdminSidebar.tsx`)

The administrative navigation sidebar has been updated to reflect the full operational hierarchy:

1. **Operations Dashboard** (`/admin`)
2. **Platform Analytics** (`/admin/analytics`)
3. **Platform Users** (`/admin/users`)
4. **Creative Talent** (`/admin/talent`)
5. **Enterprise Clients** (`/admin/companies`)
6. **Opportunities** (`/admin/opportunities`)
7. **Proposals Pipeline** (`/admin/applications`)
8. **Tasks & Workflows** (`/admin/tasks`)
9. **Client Management** (`/admin/clients`)
10. **Vendor Network** (`/admin/vendors`)
11. **Teams & Access** (`/admin/team`)
12. **Support & Complaints** (`/admin/support`)
13. **Website & Enquiries** (`/admin/website`)
14. **Reports & Exports** (`/admin/reports`)
15. **Security Audit Log** (`/admin/audit-log`)

---

## 6. Build Verification

```bash
$ npx tsc --noEmit
# Exit code 0 — 0 TypeScript compiler errors.

$ npm run build
# Exit code 0 — 84/84 pages compiled cleanly.
```
