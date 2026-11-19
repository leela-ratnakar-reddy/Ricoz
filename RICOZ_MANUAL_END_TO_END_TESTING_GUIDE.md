# RICOZ — Manual End-to-End Verification Guide

**Date:** November 19, 2026  
**Audience:** QA Engineers, Product Managers, Platform Operators  
**Prerequisites:** RICOZ web application running locally (`npm run dev` or production build `npm start`) or deployed on Vercel preview.

---

## Overview

This guide provides explicit, step-by-step procedures to manually verify that the RICOZ platform operates cohesively against the InsForge PostgreSQL database across all user roles: anonymous visitors, creative talent, enterprise companies, and system administrators.

---

## Workflow 1 — Public Website & Inbound Mandate Intake

### Objective
Verify that public visitors can discover talent, submit concierge project briefs, and that submissions are registered in PostgreSQL.

### Test Steps
1. Navigate to `/`.
2. Verify the hero section loads with the 3D-styled RICOZ wordmark, interactive editorial cards, and navigation links.
3. Click **"Explore Talent"** (`/talent`).
4. Apply filters (e.g., select role `"Creative Director"` and industry `"Technology"`).
   - *Expected Result:* The talent directory filters cards responsively.
5. Click the heart icon on any talent card.
   - *Expected Result:* The heart highlights, and the item is saved to `public.user_shortlists` in PostgreSQL.
6. Click **"Start Project"** (`/start-project`).
7. Complete all steps in the mandate creation wizard:
   - Step 1: Select project title / mandate type.
   - Step 2: Choose industry and timeline (e.g., `8-10 weeks`).
   - Step 3: Choose budget tier (e.g., `$$$$`).
   - Step 4: Select rebranding goals and required services.
   - Step 5: Enter contact information and click **"Complete Brief & Match"**.
8. *Database Verification:*
   - Verify that an entry is created in PostgreSQL table `public.website_enquiries` with `status = 'new'`.
   - Log into the Admin panel at `/admin/website?tab=enquiries` to confirm the submission appears in the admin concierge intake queue.

---

## Workflow 2 — Talent Onboarding, Profile Customization & Opportunities

### Objective
Verify creative talent registration, self-healing specialized profile provisioning, profile updates, and proposal submissions.

### Test Steps
1. Navigate to `/signup`.
2. Choose **"Creative Talent"** account type.
3. Enter a valid name, email, and password (at least 8 characters) and submit.
4. Complete the OTP email verification step.
5. Log in at `/login`.
   - *Expected Result:* Upon first login, `getFullUserProfile` ensures base `user_profiles` and specialized `talent_profiles` rows exist.
   - You are redirected to `/dashboard/designer`.
6. Inspect the Sidebar and Studio Overview:
   - *Expected Result:* The header and sidebar display your registered name and initials.
7. Navigate to **"Profile"** (`/dashboard/designer/profile`).
8. Update your headline (e.g., `"Executive Brand Strategist"`), location (e.g., `"London, UK"`), hourly rate (`"$200/hr"`), and bio. Click **"Save Changes"**.
9. Refresh the page or inspect the database:
   - *Expected Result:* The updated headline and rate persist from `public.talent_profiles`.
10. Navigate to **"Opportunities"** (`/dashboard/designer/opportunities`).
11. View open mandates loaded from PostgreSQL. Click **"Apply"** on a project brief.
12. Enter a pitch proposal (at least 10 characters) and submit.
    - *Expected Result:* Proposal is created in `public.project_applications` with `status = 'pending'`. Submitting a second proposal to the same brief returns a friendly `"already submitted"` notice.

---

## Workflow 3 — Enterprise Company Mandate Publishing & Shortlisting

### Objective
Verify enterprise company registration, project brief creation in PostgreSQL, and candidate shortlisting.

### Test Steps
1. Navigate to `/signup` and choose **"Enterprise Company"**.
2. Complete registration and log in.
   - *Expected Result:* You are redirected to `/dashboard/company`.
3. Navigate to **"Projects"** (`/dashboard/company/projects`).
   - *Expected Result:* If no projects have been created yet, the empty state displays: *"No active rebranding briefs found"*.
4. Click **"New Project Brief"** (`/dashboard/company/projects/new`).
5. Complete all 6 steps of the project wizard:
   - Company Name, Title, Industry, Brand Personality, Services, Budget, and Timeline.
   - Click **"Launch Brief"**.
6. *Expected Result:*
   - The brief is persisted via `POST /api/user/projects` into `public.client_projects`.
   - The wizard redirects to `/dashboard/company/projects/[id]`, displaying the generated PostgreSQL UUID.
   - The project details page loads live data from PostgreSQL.
7. Navigate to `/talent` or `/dashboard/company/recommendations`.
8. Click the heart icon on any talent profile to add them to your shortlist.
9. Navigate to **"Shortlist"** (`/dashboard/company/shortlist`).
   - *Expected Result:* The saved talent appears in your shortlist drawer. Clicking "Remove" removes them from `public.user_shortlists`.

---

## Workflow 4 — Cross-User Messaging & In-App Alerts

### Objective
Verify direct communication between companies and creative talent.

### Test Steps
1. As an authenticated company, navigate to any talent profile page (`/designers/[id]`).
2. Click **"Contact Talent"**.
3. Type an introductory message: `"We would like to discuss our rebranding project with you."` and send.
   - *Expected Result:* A row is created in `public.conversations` and `public.messages`.
   - You are redirected to `/dashboard/company/messages` with the active conversation thread.
4. Log out and log in as the targeted Talent user.
5. Navigate to `/dashboard/designer/messages`.
   - *Expected Result:* The incoming message thread from the enterprise client appears with the unread badge.
6. Reply to the message from the talent studio.
   - *Expected Result:* Outbound message is saved to PostgreSQL and thread updates in real time.

---

## Workflow 5 — Admin Operations Suite & Platform User Governance

### Objective
Verify operations command center KPIs, platform user management, status suspensions, and audit trail logging.

### Test Steps
1. Navigate to `/admin/login`.
2. Authenticate with an administrator account having `users.view`, `users.edit`, and `dashboard.view` permissions.
3. Inspect `/admin` (Operations Command Center):
   - *Expected Result:*
     - KPI cards display live tasks, clients, vendors, tickets, and user counts (`totalUsers`, `talentUsers`, `companyUsers`, `activeUsers`).
     - **"Platform User Community"** displays total registered accounts with a direct **"Manage"** link.
     - **"Recent Platform Registrations"** panel displays the 5 newest registered platform users.
4. Click **"Platform Users"** in the sidebar or navigate to `/admin/users`.
5. Verify the User Management Table:
   - Search by user name or email.
   - Filter by Account Type (`Creative Talent` / `Enterprise Companies`).
   - Filter by Status (`Active` / `Suspended` / `Deactivated`).
   - Filter by Verification (`Verified` / `Unverified`).
6. Click **"Details"** on any user row.
   - *Expected Result:* Modal opens displaying specialized profile attributes (headline, location, rate, bio for talent; company name, size, industry for company; project briefs or applications).
7. Toggle **"Verification"** on a user.
   - *Expected Result:* Status changes to Verified with an emerald badge; change is saved to `public.user_profiles.is_verified`.
8. Click **"Suspend Account"**.
   - *Expected Result:* User status updates to `suspended`.
9. Navigate to `/admin/audit-log`.
   - *Expected Result:* An audit log entry is recorded with action `PLATFORM_USER_MODIFIED`, documenting the status/verification change and actor details in `public.audit_logs`.
10. Verify that a suspended user attempting to access protected dashboards receives an authentication rejection, confirming fail-closed security.
