# RICOZ — MANUAL ANALYTICS & PLATFORM MANAGEMENT TESTING GUIDE
## Step-by-Step Operator Verification Procedures (Tests A through G)

**Target Application:** RICOZ (`https://ricoz-six.vercel.app` or local development server `http://localhost:3000`)  
**Backend:** InsForge PostgreSQL BaaS (`https://2cbr24z5.us-east.insforge.app`)  
**Prerequisites:** An authenticated admin session with Super Admin or Operations Director role (`/admin/login`).

---

## TEST A: Admin Authentication & Advanced Analytics Dashboard

### Objective
Verify that `/admin/analytics` retrieves real platform data from InsForge PostgreSQL, calculates 16 KPI cards accurately, and renders interactive native SVG data visualizations without layout shifts or console errors.

### Procedure
1. Navigate to `/admin/login` and log in with your administrative credentials.
2. In the left navigation sidebar, click **Platform Analytics** or navigate directly to `/admin/analytics`.
3. Verify that the page loads without spinning infinitely.
4. Inspect the **16 KPI Overview Cards**:
   - Total Registered Users, Creative Talent Specialists, Enterprise Clients
   - New Today, New This Week, New This Month
   - Verified Users Count & Percentage
   - Active Users vs. Suspended Accounts
   - Total Opportunities, Active Mandates, Matching Stage Mandates
   - Total Applications, Accepted Proposals, Average Proposed Rate ($)
5. Test the **Time-Series Date Range Selector**:
   - Click `7D`. Confirm the user growth SVG curve updates to 7 daily data points.
   - Click `30D`. Confirm the curve shows 30 daily buckets.
   - Click `90D`. Confirm the curve switches to weekly aggregation.
   - Click `6M` and `12M`. Confirm monthly aggregation buckets.
   - Hover over chart data points to confirm tooltip display.
6. Click across all **7 Analytical View Tabs**:
   - Tab 1: **Overview** (KPI grid + growth chart + funnel preview)
   - Tab 2: **User Growth** (Total vs Talent vs Company curve)
   - Tab 3: **Talent Analytics** (Skills frequency + geographic distribution + experience donut)
   - Tab 4: **Company Analytics** (Industry distribution + company scale breakdown)
   - Tab 5: **Opportunities** (Mandate status breakdown + budget tiers)
   - Tab 6: **Applications & Funnel** (4-stage visual funnel with conversion rates)
   - Tab 7: **Activity Feed** (Live real-time platform event log)
7. Click the **Export CSV** button in the top right.
   - Confirm a file named `ricoz_export_analytics_<date>.csv` is downloaded.

### Expected Outcome
- All 16 cards display real numbers matching database rows.
- SVG polyline graphs render smooth vector paths with zero SVG coordinate NaN errors in the browser console.
- CSV download produces valid comma-separated metrics.

---

## TEST B: Platform Users Directory & Status Governance

### Objective
Verify that `/admin/users` queries all registered users, supports multi-criteria filtering, and allows safe status transitions that persist to PostgreSQL and write to `audit_logs`.

### Procedure
1. In the sidebar, click **Platform Users** or navigate to `/admin/users`.
2. In the search input, type a user name or partial email address. Confirm table filters immediately.
3. Test the dropdown filters:
   - Filter by Account Type: Select **Talent Only**, then **Companies Only**.
   - Filter by Verification: Select **Verified Only**, then **Unverified**.
   - Filter by Status: Select **Active**, **Suspended**, or **Deactivated**.
4. In the table, click **Manage** on any user row.
5. In the slideout modal, verify:
   - Full name, avatar, email, registration date, and account type are displayed.
   - Specialized profile details (bio and portfolio for talent; company name and website for company) load correctly.
6. Test **Verification Toggle**:
   - Click **Grant Verified Badge** (or Revoke).
   - Confirm the success message banner appears: *"User verification updated..."*.
7. Test **Status Transition**:
   - Click **Suspend User**. Confirm status changes to `suspended`.
   - Click **Activate User**. Confirm status reverts to `active`.
8. Refresh the browser page (`Cmd+R` / `F5`).
   - Confirm the updated verification badge and status persist after reload.
9. Navigate to `/admin/audit-log`.
   - Confirm a new audit entry exists: Action `PLATFORM_USER_MODIFIED`, documenting the exact changes and actor.

### Expected Outcome
- User mutations execute atomically in `public.user_profiles`.
- All changes persist permanently after refresh.
- Audit trail accurately logs the actor, timestamp, IP, and change summary.

---

## TEST C: Creative Talent Specialists Roster

### Objective
Verify that `/admin/talent` provides dedicated creative directory features, skills filtering, portfolio inspection, and commercial rate adjustments.

### Procedure
1. In the sidebar, click **Creative Talent** or navigate to `/admin/talent`.
2. Inspect the 5 talent KPI cards: Total Talent, Verified, Active, Completed Profiles, Suspended.
3. Search for a specialist by headline or location (e.g., *"Brand"* or *"New York"*).
4. Filter by Experience: Select **5+ Years**.
5. In the table, click **Manage** on a talent specialist.
6. Verify the detailed slideout:
   - Creative biography and core competencies (skills badges).
   - Click the **Portfolio / Showcase** link to verify it opens the portfolio URL in a new tab.
   - Check the **Recent Opportunity Proposals** list showing projects this talent applied to.
7. Test **Administrative Actions**:
   - Toggle verification badge with **Grant Verified Badge**.
   - Confirm the green verified shield appears next to the talent's name.
8. Check `/admin/audit-log` to confirm `PLATFORM_TALENT_MODIFIED` was recorded.

### Expected Outcome
- Skills JSON arrays from PostgreSQL parse and render as badges.
- Applications submitted by the talent appear in their profile history.
- Verification and status updates persist to the database.

---

## TEST D: Enterprise Client Accounts Management

### Objective
Verify that `/admin/companies` manages corporate client profiles, validates corporate domains, and lists published mandates.

### Procedure
1. In the sidebar, click **Enterprise Clients** or navigate to `/admin/companies`.
2. Inspect the corporate KPI cards: Total Enterprises, Verified Corporate, Active Clients, With Mandates, Suspended.
3. Filter by industry or search by company name.
4. Click **Manage** on any enterprise client row.
5. In the detail modal, verify:
   - Corporate name, lead contact, business email, and billing country.
   - Corporate website link.
   - List of **Posted Creative Mandates** (`client_projects`) showing title, budget tier, and applicant count.
6. Test corporate verification toggle with **Grant Corporate Badge**.
7. Refresh the page to verify the badge persists.
8. Check `/admin/audit-log` to confirm `PLATFORM_COMPANY_MODIFIED` was recorded.

### Expected Outcome
- Company mandates query and link directly to `client_projects`.
- Verification and status mutations write cleanly to PostgreSQL.

---

## TEST E: Opportunities & Mandates Lifecycle Governance

### Objective
Verify that `/admin/opportunities` displays project briefs, tracks procurement phases, and enables lifecycle transitions (`Discovery` -> `Matching` -> `Active` -> `Closed`).

### Procedure
1. In the sidebar, click **Opportunities** or navigate to `/admin/opportunities`.
2. Inspect the 5 opportunity KPI cards: Total Mandates, Discovery Phase, Matching Phase, Active Mandates, Total Proposals.
3. Filter by Lifecycle Phase: Click **Matching**, then **Active**.
4. Filter by Budget Tier: Select **Growth / Strategic**.
5. In the table, click **Inspect** on any opportunity row.
6. In the modal, verify:
   - Full mandate brief text, rebranding goals, target demographic, and brand voice.
   - Associated corporate client details.
   - List of all talent proposals submitted for this project with applicant name, rate, and pitch preview.
7. Test **Lifecycle Phase Transition**:
   - Under *Change Lifecycle Phase*, click **Active** (or **Matching**).
   - Confirm success feedback: *"Opportunity lifecycle transitioned to 'Active'"*.
8. Refresh the browser page. Confirm the new status persists in the table and modal.
9. Check `/admin/audit-log` to confirm `PLATFORM_OPPORTUNITY_MODIFIED` was recorded.

### Expected Outcome
- The opportunity brief is fully legible with goals and audience requirements.
- Phase changes update `client_projects.status` and persist on reload.

---

## TEST F: Proposals Pipeline & Real-Time Talent Notification

### Objective
Verify that `/admin/applications` enables proposal review, pitch evaluation, and status updates, and automatically sends a real-time notification to the applicant specialist.

### Procedure
1. In the sidebar, click **Proposals Pipeline** or navigate to `/admin/applications`.
2. Inspect the 6 proposal KPI cards: Total Proposals, Pending Review, Shortlisted, Accepted, Declined, Average Rate.
3. Use the pipeline tabs: Click **Pending**, then **Shortlisted**, then **All**.
4. In the table, click **Review** on any proposal row.
5. In the modal, inspect:
   - Specialist name, email, avatar, headline, and portfolio link.
   - Proposed commercial rate ($).
   - Full proposal pitch statement.
   - Mandate scope excerpt.
6. Test **Pipeline Actions**:
   - Click **Shortlist**. Confirm success feedback: *"Application status transitioned to 'shortlisted' and talent notified."*
   - Or click **Accept & Award**. Confirm status becomes `accepted`.
7. **Verify Real-Time Notification in PostgreSQL**:
   - Open a separate browser tab or incognito window.
   - Log in as the talent specialist who submitted the proposal.
   - Look at the top navigation notification bell.
   - Confirm an unread notification exists with title *"Proposal Shortlisted"* or *"Application Accepted!"* and a direct link to `/talent/applications`.
8. Check `/admin/audit-log` to confirm `PLATFORM_APPLICATION_MODIFIED` was recorded.

### Expected Outcome
- Application status updates in `project_applications`.
- A real row is inserted into `notifications` with `user_id = talent_user_id`.
- The talent user immediately sees the notification upon viewing their dashboard.

---

## TEST G: CSV Data Export Suite

### Objective
Verify that all data export endpoints stream valid, escaped CSV files from PostgreSQL.

### Procedure
1. Navigate to `/admin/reports` or click any **Export CSV** button across the admin panel.
2. Test each export type:
   - `/api/admin/reports/export?type=users`
   - `/api/admin/reports/export?type=talent`
   - `/api/admin/reports/export?type=companies`
   - `/api/admin/reports/export?type=opportunities`
   - `/api/admin/reports/export?type=applications`
   - `/api/admin/reports/export?type=analytics`
3. Open the downloaded CSV files in Microsoft Excel, Apple Numbers, or Google Sheets.
4. Verify:
   - Column headers match the schema definitions.
   - Values with commas or quotes are properly escaped with double quotes.
   - Dates are formatted in ISO-8601 standard.

### Expected Outcome
- All CSV endpoints respond with HTTP 200 and `Content-Type: text/csv`.
- Files open in spreadsheet applications without column alignment or delimiter errors.
