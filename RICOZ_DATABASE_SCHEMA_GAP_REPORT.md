# RICOZ — Database Schema Verification & Gap Analysis Report

**Date:** November 19, 2026  
**Backend:** InsForge PostgreSQL BaaS (`https://2cbr24z5.us-east.insforge.app`)  
**Schema Status:** **COMPATIBLE & VERIFIED (0 Blocking Schema Gaps)**

---

## 1. Schema Audit Findings

An exhaustive query of the PostgreSQL database was performed across all tables in the `public` schema. All required tables for platform identity, creative talent, enterprise companies, mandates, proposals, shortlists, messaging, notifications, CRM, and administrative audit logging were confirmed present and active.

No destructive schema alterations, table additions, or migrations were executed or required during this implementation.

---

## 2. Table-by-Table Verification Matrix

| Table Name | Schema Status | Verified Columns & Constraints | Connected Application Module |
|---|---|---|---|
| `public.user_profiles` | **ACTIVE** | `id`, `account_type`, `email`, `full_name`, `avatar_url`, `is_verified`, `status`, `created_at`, `updated_at` | Authentication, Profile Management, Admin Users |
| `public.talent_profiles` | **ACTIVE** | `id`, `user_id`, `headline`, `bio`, `location`, `years_experience`, `hourly_rate`, `portfolio_url`, `skills`, `availability` | Creative Talent Studio, Profile Editor |
| `public.company_profiles` | **ACTIVE** | `id`, `user_id`, `company_name`, `contact_name`, `business_email`, `industry`, `company_size`, `website_url`, `billing_country` | Enterprise Company Workspace |
| `public.client_projects` | **ACTIVE** | `id`, `company_user_id`, `title`, `company_name`, `industry`, `status`, `timeline`, `start_date`, `budget_range`, `budget_tier`, `rebranding_goals`, `target_audience`, `brand_personality`, `required_services`, `preferred_styles`, `availability_requirement`, `project_brief` | Company Projects, Start Project Wizard, Opportunities |
| `public.project_applications` | **ACTIVE** | `id`, `project_id`, `talent_user_id`, `pitch`, `proposed_rate`, `status`, `created_at`, `updated_at`<br/>*Constraints:* `uq_project_application (project_id, talent_user_id)`, `FK project_id -> client_projects(id) ON DELETE CASCADE` | Talent Opportunities, Pitch Proposals |
| `public.user_shortlists` | **ACTIVE** | `id`, `user_id`, `talent_profile_id`, `notes`, `created_at`<br/>*Constraints:* `FK talent_profile_id -> user_profiles(id)` | Homepage, Talent Directory, Company Shortlist |
| `public.conversations` | **ACTIVE** | `id`, `participant_a`, `participant_b`, `project_id`, `last_message_at`, `last_message_preview`, `created_at` | Direct Messaging across Talent & Company |
| `public.messages` | **ACTIVE** | `id`, `conversation_id`, `sender_id`, `content`, `is_read`, `created_at` | Conversation Thread View |
| `public.notifications` | **ACTIVE** | `id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at` | System Alerts & In-App Activity |
| `public.website_enquiries` | **ACTIVE** | `id`, `full_name`, `email`, `company`, `mandate_type`, `timeline`, `project_brief`, `budget_range`, `status` | `/start-project`, Concierge Briefing Intake |
| `public.admin_users` | **ACTIVE** | `id`, `email`, `password_hash`, `full_name`, `role`, `department_id`, `status` | Operations Access, Granular RBAC |
| `public.admin_roles` | **ACTIVE** | `id`, `name`, `slug`, `hierarchy_level`, `is_system_role`, `is_active` | Admin Role Definitions |
| `public.admin_permissions` | **ACTIVE** | `id`, `name`, `slug`, `module`, `action` (60 distinct system permissions) | Admin Permission Matrix |
| `public.admin_sessions` | **ACTIVE** | `id`, `user_id`, `token_hash`, `expires_at`, `last_activity_at` | Authoritative Admin Sessions |
| `public.audit_logs` | **ACTIVE** | `id`, `actor_id`, `actor_name`, `actor_role`, `action`, `entity_type`, `entity_id`, `change_summary`, `ip_address`, `created_at` | Regulatory Compliance & Audit Trail |
| `public.tasks` | **ACTIVE** | `id`, `title`, `description`, `department_id`, `assignee_id`, `priority`, `status`, `due_date`, `is_escalated`, `blocker_note` | Operations Workflow Management |
| `public.clients` | **ACTIVE** | `id`, `name`, `industry`, `contact_name`, `contact_email`, `onboarding_stage` | CRM Client Management |
| `public.vendors` | **ACTIVE** | `id`, `name`, `service_category`, `onboarding_stage`, `verification_status` | Creative Vendor Network |
| `public.support_tickets` | **ACTIVE** | `id`, `title`, `department_id`, `priority`, `status`, `created_at` | Support & Complaints SLA Management |
| `public.sops` | **ACTIVE** | `id`, `title`, `department_id`, `category`, `status`, `version` | SOPs & Knowledge Base |
| `public.website_settings` | **ACTIVE** | `key`, `value`, `updated_at` | CMS Platform Settings |
| `public.website_testimonials`| **ACTIVE** | `id`, `client_name`, `company`, `role`, `quote`, `rating`, `is_featured`, `is_published` | Homepage Editorial Endorsements |
| `public.website_faqs` | **ACTIVE** | `id`, `question`, `answer`, `category`, `is_published` | Platform FAQs |

---

## 3. Discrepancies Resolved via Application-Level Normalization

Rather than running hazardous database alter-table scripts against production, all property naming variations were normalized through typed application transformation layers:

1. **Snake_Case vs CamelCase Harmonization:**
   - Database tables use PostgreSQL standard snake_case (`full_name`, `account_type`, `is_verified`, `years_experience`, `hourly_rate`).
   - Frontend UI components frequently read camelCase properties (`fullName`, `accountType`, `isVerified`, `yearsExperience`, `hourlyRate`).
   - **Resolution:** `app/api/user/profile/route.ts`, `app/api/user/profile/[id]/route.ts`, and `app/api/auth/me/route.ts` implement `formatProfileResponse()`, returning unified JSON objects containing both conventions as well as specialized `talentProfile` and `companyProfile` sub-objects.
2. **Missing Specialized Profile Recovery:**
   - In instances where a historic user existed in `auth.users` and `public.user_profiles` but lacked a specialized row in `talent_profiles` or `company_profiles`, `getFullUserProfile(userId, { allowSelfHealing: true })` automatically provisions the specialized profile using safe, idempotent `INSERT ... ON CONFLICT (id) DO NOTHING` logic.
3. **Foreign Key Integrity Safeguards in Applications:**
   - `project_applications` enforces `FOREIGN KEY (project_id) REFERENCES client_projects(id)`.
   - Before inserting a proposal, `app/api/user/applications/route.ts` explicitly validates project existence, returning a user-friendly `404 Not Found` if the mandate was archived, and enforces duplicate protection returning `409 Conflict`.

---

## 4. Conclusion

**Zero database schema gaps remain.** The InsForge PostgreSQL backend is fully capable of supporting all current platform capabilities across user management, project mandates, messaging, proposals, CRM, and administrative governance.
