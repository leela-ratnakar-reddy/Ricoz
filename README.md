# BRANDROOM — Creative Directors for Rebranding Projects (Enterprise Frontend MVP)

Brandroom is a premium enterprise creative talent platform connecting venture-backed scaleups, corporate conglomerates, and institutional organizations with experienced Creative Directors, Brand Identity Designers, and Typography Specialists for high-stakes rebranding mandates.

---

## Visual Design Language
- **Minimal Enterprise Aesthetic**: Inspired by high-end technology leaders and editorial design systems.
- **Palette**: Monochromatic core (#0E0E10 text, #FBFBF9 / #F4F4F2 surfaces, #E8E8E5 thin borders) accented with modern deep red (`#D92D20`) for focused CTAs, active highlights, and geometric nodes.
- **Hero & Portfolio Visuals**: Abstract geometric radar/network SVG compositions with concentric rings, coordinate tick marks, and optical typography—without relying on fragile external stock photos.

---

## Key Features & Architecture

1. **Deterministic Multi-Factor Matching Algorithm (`lib/matching.ts`)**:
   Calculates compatibility across 7 weighted dimensions:
   - **Skills & Specialization**: 25%
   - **Industry Sector Fit**: 20%
   - **Seniority & Experience**: 15%
   - **Aesthetic Synergy**: 15%
   - **Budget Tier**: 10%
   - **Availability**: 10%
   - **Location / Fit**: 5%
   Provides granular percentages and key strength factors.

2. **Talent Discovery & Filtering (`/designers`)**:
   - Multi-criteria sidebar and mobile drawer filtering by Role, Experience, Sector, Availability, Aesthetic Style, and Budget Tier.
   - Real-time search across names, skills, and sectors.
   - Sorting by Recommended Match, Seniority, and Availability.

3. **Portfolio-First Profiles (`/designers/[id]`)**:
   - Monogram avatars, career trajectory timeline, skill pills, verified senior badge.
   - Interactive portfolio case studies modal with enterprise challenge, solution, and commercial impact metrics.
   - Direct Contact modal and Shortlist toggle.

4. **6-Step Project Creation Wizard (`/dashboard/company/projects/new`)**:
   - Project Basics → Rebranding Goals → Audience & Brand Personality → Creative Disciplines → Budget & Timeline → Review & Launch.
   - Persists to `localStorage` and redirects to the dynamic project overview.

5. **Enterprise Project Details & Recommendations (`/dashboard/company/projects/[id]`)**:
   - Full brief parameters alongside real-time compatibility ranking of creative talent.

6. **Interactive Messaging System (`/dashboard/company/messages` & `/dashboard/designer/messages`)**:
   - Persistent client-designer conversations, multi-thread selection, message history, and real-time response persistence.

7. **Shortlist Roster (`/dashboard/company/shortlist`)**:
   - Bookmark candidates across the app with instant persistence.

8. **Designer Studio Workspace (`/dashboard/designer`)**:
   - Profile completion progress tracker, portfolio view metrics, opportunities board (`/dashboard/designer/opportunities`), and portfolio case study CRUD editor (`/dashboard/designer/portfolio`).

---

## Route Overview

### Public Routes
- `/` — Enterprise Landing Page (Hero, Stats, Disciplines, 4-stage How It Works, Featured Roster, Value Props, CTAs)
- `/designers` — Talent Discovery Directory with multi-criteria filters & search
- `/designers/[id]` — Detailed Designer Profile with case studies & contact modal
- `/how-it-works` — Rebranding methodology, timelines, and vetting standards
- `/companies` — Enterprise client benefits and comparison matrix
- `/creatives` — Network admission criteria for Creative Directors
- `/login` — Demo sign-in with 1-click role switcher
- `/register` — Account registration with Company vs Designer selection

### Company Workspace
- `/dashboard/company` — Enterprise command overview & metrics
- `/dashboard/company/projects` — Project brief portfolio
- `/dashboard/company/projects/new` — 6-step project creation wizard
- `/dashboard/company/projects/[id]` — Project details with deterministic matching
- `/dashboard/company/recommendations` — Candidate ranking engine
- `/dashboard/company/shortlist` — Saved candidate comparison
- `/dashboard/company/messages` — Direct client communication thread
- `/dashboard/company/profile` — Organization settings

### Designer Workspace
- `/dashboard/designer` — Studio metrics & profile completion bar
- `/dashboard/designer/profile` — Studio credentials and day rate editor
- `/dashboard/designer/portfolio` — Case study CRUD manager
- `/dashboard/designer/opportunities` — Rebranding briefs board & proposals
- `/dashboard/designer/messages` — Studio inbox

---

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict types, zero `any`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State & Persistence**: SSR-safe LocalStorage sync

---

## Running the Application

### 1. Install dependencies
```bash
npm install
```

### 2. Run local development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Typecheck
```bash
npm run build
npx tsc --noEmit
```
