# RICOZ — ADVANCED ADMIN ANALYTICS & PLATFORM MANAGEMENT SYSTEM
## Technical Architecture, Backend Query Layer & Implementation Report

**Production Reference:** `https://ricoz-six.vercel.app`  
**Local Codebase:** `/Users/leela/Documents/Ricoz`  
**Database Backend:** InsForge PostgreSQL (`https://2cbr24z5.us-east.insforge.app`)  
**Deployment Runtime:** Next.js 15.5.27, React 19, TypeScript  
**Build Status:** Compiled 84/84 routes with 0 errors (`npm run build` PASS)

---

## 1. Executive Summary

The RICOZ platform has been upgraded with a high-performance **Admin Analytics & Platform Management Engine** directly integrated with the live InsForge PostgreSQL database. Unlike static or mocked analytics dashboards, this architecture computes real-time business intelligence across the ecosystem:

1. **Direct PostgreSQL Aggregation:** All analytics cards, time-series growth curves, skill matrices, industry distributions, and conversion funnels query PostgreSQL directly using parameterized SQL queries through `getDb()`. No random, sample, or fabricated numbers are used.
2. **Flexible Time-Series Engine:** The backend dynamically slices registration and project data into `7d` (daily), `30d` (daily), `90d` (weekly), `6m` (monthly), `12m` (monthly), or custom date ranges using PostgreSQL `date_trunc`, `generate_series`, and `FILTER` clauses.
3. **Multi-Domain Intelligence:** Provides dedicated analytical views for **Creative Talent** (skills distribution, geography, experience tiers), **Enterprise Companies** (industries, company scale, top publishers), **Opportunities** (budget tiers, timelines, status), and **Application Conversion Funnel** (4-stage procurement funnel with drop-off tracking).
4. **Zero-Dependency Native SVG Visualizations:** Charts and graphs are rendered using native, responsive, dark-mode SVG components (`<svg>`, `<polyline>`, `<path>`, `<rect>`) tailored to RICOZ's luxury dark editorial design system (`#0E1118`, `#DC2626`), eliminating heavy chart library bundle overhead.
5. **Full Platform Governance:** Integrated alongside five operational management suites for **Platform Users**, **Talent Roster**, **Enterprises**, **Opportunities**, and **Proposals**, with audit logging and automated notification dispatch.

---

## 2. Real PostgreSQL Backend Query Layer

The analytics service endpoint (`GET /api/admin/analytics/overview`) executes optimized multi-aggregate queries against the live database:

```
[Admin Analytics Client]
         │ (Session Cookie + RBAC 'reports.view')
         ▼
[GET /api/admin/analytics/overview]
         │
 ┌───────┴───────────────────────────────────────────────┐
 │ Parameterized SQL Execution via getDb()               │
 ├───────────────────────────────────────────────────────┤
 │ 1. Platform KPIs (user_profiles, client_projects, pa) │
 │ 2. Time-Series Slices (generate_series + date_trunc)   │
 │ 3. Talent Competencies (jsonb_array_elements_text)     │
 │ 4. Corporate Demographics (company_profiles)          │
 │ 5. 4-Stage Conversion Funnel (Discovery -> Accepted)  │
 │ 6. Audit & Platform Event Activity Feed (audit_logs)  │
 └───────────────────────────────────────────────────────┘
         │
         ▼
[InsForge PostgreSQL Engine (2cbr24z5.us-east.insforge.app)]
```

### 2.1 16 Platform KPI Cards

The overview endpoint computes 16 authoritative platform metrics in a single transactional query:

| Metric Category | Field Name | SQL Aggregation Logic | Purpose |
|---|---|---|---|
| **Users** | `totalUsers` | `COUNT(*)` from `user_profiles` | Total registered accounts |
| **Users** | `talentUsers` | `COUNT(*) FILTER (WHERE account_type = 'talent')` | Registered creative specialists |
| **Users** | `companyUsers` | `COUNT(*) FILTER (WHERE account_type = 'company')` | Registered enterprise clients |
| **Growth** | `newToday` | `COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)` | Signups in last 24h |
| **Growth** | `newThisWeek` | `COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')` | Signups in last 7 days |
| **Growth** | `newThisMonth` | `COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')` | Signups in last 30 days |
| **Security** | `verifiedUsers` | `COUNT(*) FILTER (WHERE is_verified = TRUE)` | Vetted & authenticated entities |
| **Security** | `verifiedRate` | `ROUND(verifiedUsers * 100.0 / NULLIF(totalUsers, 0), 1)` | Percentage of verified roster |
| **Health** | `activeUsers` | `COUNT(*) FILTER (WHERE status = 'active')` | Active accounts in good standing |
| **Health** | `suspendedUsers`| `COUNT(*) FILTER (WHERE status = 'suspended')` | Accounts under security review |
| **Opportunities**| `totalOpportunities`| `COUNT(*)` from `client_projects` | Total mandates published |
| **Opportunities**| `activeOpportunities`| `COUNT(*) FILTER (WHERE status ILIKE 'active')` | Mandates currently in execution |
| **Opportunities**| `matchingOpportunities`| `COUNT(*) FILTER (WHERE status ILIKE 'matching')` | Open mandates receiving pitches |
| **Applications** | `totalApplications` | `COUNT(*)` from `project_applications` | Total specialist proposals |
| **Applications** | `acceptedApplications`| `COUNT(*) FILTER (WHERE status = 'accepted')` | Contracts awarded & closed |
| **Commercial** | `avgProposedRate` | `ROUND(AVG(proposed_rate), 2)` from `project_applications` | Ecosystem pricing benchmark |

---

### 2.2 Time-Series User Growth Engine

The growth engine handles flexible date ranges (`7d`, `30d`, `90d`, `6m`, `12m`, or custom ISO date boundaries) using PostgreSQL calendar bucketing:

```sql
WITH date_series AS (
  SELECT generate_series(
    $1::timestamptz,
    $2::timestamptz,
    $3::interval
  ) AS bucket
)
SELECT 
  to_char(ds.bucket, $4) as label,
  ds.bucket as date,
  COUNT(u.id) as total_signups,
  COUNT(u.id) FILTER (WHERE u.account_type = 'talent') as talent_signups,
  COUNT(u.id) FILTER (WHERE u.account_type = 'company') as company_signups
FROM date_series ds
LEFT JOIN user_profiles u 
  ON date_trunc($5, u.created_at) = ds.bucket
GROUP BY ds.bucket
ORDER BY ds.bucket ASC;
```

This ensures days or months with zero signups still render accurately on time-series charts without breaking SVG polyline coordinates.

---

### 2.3 4-Stage Mandate Conversion Funnel

The platform conversion funnel measures procurement progression from mandate publication to contract award:

```
[Stage 1: Mandates Published] ────────> 100% (Base volume: client_projects)
         │
         │ Drop-off: Mandates receiving no pitches
         ▼
[Stage 2: Proposals Received] ─────────> Stage 1 to 2 Conversion %
         │
         │ Drop-off: Unscreened or rejected pitches
         ▼
[Stage 3: Proposals Shortlisted] ──────> Stage 2 to 3 Conversion %
         │
         │ Drop-off: Commercial terms or negotiation
         ▼
[Stage 4: Contracts Awarded] ──────────> Overall End-to-End Conversion %
```

The endpoint computes:
- Total counts for each stage
- Conversion rate from each stage to the next
- Overall end-to-end conversion rate (`Awarded / Published`)
- Cumulative drop-off volume

---

## 3. Specialized Domain Analytics

### 3.1 Creative Talent Roster Intelligence
- **Skills Matrix:** Extracted using PostgreSQL `jsonb_array_elements_text(skills)` with frequency counts and percentage representation.
- **Geographic Footprint:** Extracted from `location` in `talent_profiles` grouped by metropolitan market or country.
- **Experience Distribution:** Segmented into 4 strategic tiers:
  - Emerging Talent (0 - 2 years)
  - Mid-Level Specialists (3 - 5 years)
  - Senior Creatives (6 - 9 years)
  - Creative Directors / Veterans (10+ years)
- **Availability Allocation:** Immediate full-time, part-time contract, or booked.

### 3.2 Enterprise Client Corporate Intelligence
- **Industry Breakdown:** Categorizes corporate accounts across Fashion, Luxury, FinTech, Consumer Goods, Media, and Enterprise Software.
- **Corporate Scale:** Classifies clients into Seed/Startup (1-10), Growth (11-50), Mid-Market (51-200), and Global Enterprise (201+).
- **Top Procurement Partners:** Ranks companies by published mandate volume and total proposals reviewed.

### 3.3 Live Platform Event Stream
Combines entries from `audit_logs`, recent `client_projects`, and recent `project_applications` into a unified real-time chronological event feed:
- Registration events (`USER_REGISTERED`, `USER_VERIFIED`)
- Mandate publications (`PROJECT_CREATED`, `STATUS_CHANGED`)
- Proposal submissions (`PROPOSAL_SUBMITTED`, `PROPOSAL_ACCEPTED`)
- Administrative interventions (`PLATFORM_USER_MODIFIED`, `PLATFORM_TALENT_MODIFIED`)

---

## 4. Frontend UI Implementation (`app/admin/analytics/page.tsx`)

The frontend delivers an interactive, editorial-grade command center:

### 4.1 Seven Specialized View Tabs
1. **Overview Dashboard:** Complete 16 KPI card grid, 30-day growth curve, and 4-stage funnel snapshot.
2. **User Growth Analysis:** Multi-series growth chart comparing total, talent, and enterprise signups with range selectors (`7d`, `30d`, `90d`, `6m`, `12m`).
3. **Talent Analytics:** Skills frequency bar chart, geographic distribution table, and experience distribution donut visualization.
4. **Company Analytics:** Industry distribution chart, enterprise scale breakdown, and top publishing client leaderboard.
5. **Opportunities & Mandates:** Project status breakdown, budget tier distribution bar chart, and average duration metrics.
6. **Applications & Funnel:** Visual 4-stage conversion funnel with step-by-step conversion percentages and average proposed rate metrics.
7. **Platform Activity Feed:** Live real-time event log with color-coded actor, action, and timestamp badges.

### 4.2 Native SVG Chart Visualizations
All charts are authored directly in React 19 JSX using SVG primitives:
- **Responsive Line Charts:** `<svg viewBox="0 0 800 240">` with smooth `<polyline>` and `<polygon>` gradient fill for time-series.
- **Distribution Bar Charts:** Horizontal progress bars styled with Tailwind CSS and precise percentages calculated from real query data.
- **Radial Donut Charts:** `<circle strokeDasharray="..." strokeDashoffset="..." />` rendering proportionate slices.
- **Conversion Funnel Visualizer:** Decreasing-width horizontal polygon containers visualizing stage retention and drop-off.

---

## 5. CSV Export Engine (`/api/admin/reports/export`)

The analytics system integrates with the CSV export endpoint, allowing administrators to export data directly to spreadsheets:

- `?type=analytics`: Comprehensive KPI summary report.
- `?type=users`: Full platform user directory with status, verification, and dates.
- `?type=talent`: Creative talent roster with skills, rates, experience, and proposal counts.
- `?type=companies`: Corporate clients with contact info, industry, scale, and posted mandates.
- `?type=opportunities`: Mandate briefs with budget tiers, status, and applicant counts.
- `?type=applications`: Proposal submissions with pitch text, proposed rate, and outcome status.

---

## 6. Verification and Build Output

```bash
$ npx tsc --noEmit
# Exit code 0 — 0 TypeScript compiler errors.

$ npm run build
# Exit code 0 — All 84 routes compiled successfully into optimized static and server-rendered bundles.
```

| Route | Type | JS Size | First Load JS |
|---|---|---|---|
| `/admin/analytics` | Static (○) | 7.65 kB | 117 kB |
| `/admin/talent` | Static (○) | 7.37 kB | 112 kB |
| `/admin/companies` | Static (○) | 6.98 kB | 112 kB |
| `/admin/opportunities` | Static (○) | 6.63 kB | 111 kB |
| `/admin/applications` | Static (○) | 6.91 kB | 112 kB |
| `/api/admin/analytics/overview` | Dynamic (ƒ) | 314 B | 103 kB |
| `/api/admin/talent` | Dynamic (ƒ) | 314 B | 103 kB |
| `/api/admin/companies` | Dynamic (ƒ) | 314 B | 103 kB |
| `/api/admin/opportunities` | Dynamic (ƒ) | 314 B | 103 kB |
| `/api/admin/applications` | Dynamic (ƒ) | 314 B | 103 kB |
