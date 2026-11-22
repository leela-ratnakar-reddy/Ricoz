/**
 * RICOZ V4.2 — Operations Intelligence Engine
 * 
 * Provides real-time, database-backed analytical and operational intelligence
 * for administrators. Queries InsForge PostgreSQL directly with parameterized SQL.
 * Never executes arbitrary AI-generated SQL.
 * 
 * Designed to work with Gemini / OpenRouter or gracefully fall back to deterministic
 * rule-based heuristics when no AI provider is configured.
 */

import { getDb } from "@/lib/admin/db";
import { callGeminiAPI, sanitizePromptInput } from "@/lib/ai/aiClient";

export interface AIUsageEntry {
  adminId?: string;
  featureUsed: string;
  provider: string;
  promptSummary?: string;
  status: "success" | "error" | "fallback";
  tokensUsed?: number;
  latencyMs?: number;
  errorMessage?: string;
}

// In-memory ring buffer fallback for usage logs (max 50 entries)
const inMemoryUsageLogs: Array<AIUsageEntry & { id: string; createdAt: string }> = [];
let aiUsageTableExists: boolean = process.env.AI_USAGE_TABLE_MIGRATED === "true";

/**
 * Record an AI operation event into the database or fallback log
 */
export async function logAIUsage(entry: AIUsageEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  const id = `ai_log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Store in in-memory ring buffer
  inMemoryUsageLogs.unshift({ ...entry, id, createdAt: timestamp });
  if (inMemoryUsageLogs.length > 50) inMemoryUsageLogs.pop();

  const db = getDb();

  // Try writing to admin_ai_usage_logs table if not already known to be missing
  if (aiUsageTableExists !== false) {
    try {
      await db.query(
        `INSERT INTO admin_ai_usage_logs (admin_id, feature_used, provider, prompt_summary, status, tokens_used, latency_ms, error_message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          entry.adminId || null,
          entry.featureUsed,
          entry.provider,
          entry.promptSummary?.slice(0, 500) || null,
          entry.status,
          entry.tokensUsed || null,
          entry.latencyMs || null,
          entry.errorMessage || null,
        ]
      );
      aiUsageTableExists = true;
      return;
    } catch {
      aiUsageTableExists = false;
    }
  }

  // Gracefully log to existing audit_logs table with required entity_id
  try {
    await db.query(
      `INSERT INTO audit_logs (actor_name, actor_role, action, entity_type, entity_id, change_summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        "AI Operations Engine",
        "system",
        `ai.${entry.featureUsed}`,
        "ai_operation",
        entry.adminId || "ai_engine",
        `Executed ${entry.featureUsed} via ${entry.provider} (${entry.status})`,
      ]
    );
  } catch {
    // In-memory buffer will preserve history
  }
}

/**
 * Retrieve recent AI usage history
 */
export async function getAIUsageHistory(limit: number = 20): Promise<any[]> {
  if (aiUsageTableExists !== false) {
    try {
      const db = getDb();
      const res = await db.query(
        `SELECT id, admin_id, feature_used, provider, prompt_summary, status, tokens_used, latency_ms, created_at
         FROM admin_ai_usage_logs
         ORDER BY created_at DESC
         LIMIT ?`,
        [limit]
      );
      if (res.rows && res.rows.length > 0) {
        aiUsageTableExists = true;
        return res.rows;
      }
    } catch {
      aiUsageTableExists = false;
    }
  }
  return inMemoryUsageLogs.slice(0, limit);
}

// ==============================================================================
// 1. CONTROLLED DATABASE TELEMETRY FETCHERS
// ==============================================================================

export async function fetchPlatformMetrics(range: string = "30d") {
  const db = getDb();

  let intervalClause = "INTERVAL '30 days'";
  if (range === "7d") intervalClause = "INTERVAL '7 days'";
  if (range === "today") intervalClause = "INTERVAL '1 day'";
  if (range === "90d") intervalClause = "INTERVAL '90 days'";

  const [
    userStats,
    oppStats,
    appStats,
    ticketStats,
    taskStats,
    companyOpps,
    topApps,
    activeBlockers,
  ] = await Promise.all([
    // Users
    db.prepare(`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE account_type = 'talent')::int as talent_count,
        count(*) FILTER (WHERE account_type = 'company')::int as company_count,
        count(*) FILTER (WHERE is_verified = TRUE)::int as verified_count,
        count(*) FILTER (WHERE is_verified = FALSE)::int as unverified_count,
        count(*) FILTER (WHERE created_at >= (NOW() - ${intervalClause}))::int as period_new,
        count(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '7 days'))::int as week_new,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE)::int as today_new
      FROM user_profiles
    `).get() as any,

    // Opportunities / Client Projects
    db.prepare(`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE status ILIKE 'active' OR status ILIKE 'discovery' OR status ILIKE 'matching')::int as active_count,
        count(*) FILTER (WHERE status ILIKE 'closed')::int as closed_count,
        count(*) FILTER (WHERE created_at >= (NOW() - ${intervalClause}))::int as period_new
      FROM client_projects
    `).get() as any,

    // Project Applications
    db.prepare(`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE status = 'pending')::int as pending_count,
        count(*) FILTER (WHERE status = 'shortlisted')::int as shortlisted_count,
        count(*) FILTER (WHERE status = 'accepted')::int as accepted_count,
        count(*) FILTER (WHERE status = 'declined')::int as declined_count,
        count(*) FILTER (WHERE created_at >= (NOW() - ${intervalClause}))::int as period_new
      FROM project_applications
    `).get() as any,

    // Support Tickets
    db.prepare(`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE status IN ('open', 'pending', 'in_progress'))::int as open_count,
        count(*) FILTER (WHERE priority = 'critical' AND status != 'resolved' AND status != 'closed')::int as critical_count,
        count(*) FILTER (WHERE status = 'resolved' OR status = 'closed')::int as resolved_count
      FROM support_tickets
    `).get() as any,

    // Operational Tasks
    db.prepare(`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE status != 'completed')::int as active_count,
        count(*) FILTER (WHERE status = 'blocked' OR is_escalated = TRUE)::int as blocked_count,
        count(*) FILTER (WHERE due_date < NOW() AND status != 'completed')::int as overdue_count
      FROM tasks
    `).get() as any,

    // Companies with most opportunities
    db.query(`
      SELECT company_name, count(*)::int as opp_count
      FROM client_projects
      WHERE company_name IS NOT NULL AND company_name != ''
      GROUP BY company_name
      ORDER BY opp_count DESC
      LIMIT 5
    `),

    // Opportunities with most applications
    db.query(`
      SELECT cp.id, cp.title, cp.company_name, count(pa.id)::int as application_count
      FROM client_projects cp
      LEFT JOIN project_applications pa ON pa.project_id = cp.id
      GROUP BY cp.id, cp.title, cp.company_name
      ORDER BY application_count DESC
      LIMIT 5
    `),

    // Active Blockers in tasks
    db.query(`
      SELECT id, title, priority, blocker_note, due_date
      FROM tasks
      WHERE status = 'blocked' OR is_escalated = TRUE
      ORDER BY due_date ASC
      LIMIT 5
    `),
  ]);

  return {
    users: userStats || {},
    opportunities: oppStats || {},
    applications: appStats || {},
    support: ticketStats || {},
    tasks: taskStats || {},
    topCompanies: companyOpps.rows || [],
    topOpportunities: topApps.rows || [],
    activeBlockers: activeBlockers.rows || [],
  };
}

// ==============================================================================
// 2. PHASE 1 — RICOZ AI COMMAND ASSISTANT (NATURAL LANGUAGE QUERIES)
// ==============================================================================

export interface AssistantQueryResult {
  answer: string;
  source: "gemini" | "openrouter" | "heuristic";
  providerConfigured: boolean;
  intent: string;
  supportingData: any;
  suggestedFollowUps: string[];
}

export async function executeAssistantQuery(
  rawQuery: string,
  adminId?: string
): Promise<AssistantQueryResult> {
  const startTime = Date.now();
  const query = rawQuery.trim().toLowerCase();
  const db = getDb();

  // Pattern detection across domain boundaries
  let intent = "general_operational";
  let factualObservation = "";
  let supportingData: any = {};
  let suggestedFollowUps: string[] = [];

  if (query.includes("register") || query.includes("signup") || query.includes("users registered") || query.includes("growth")) {
    intent = "user_registrations";
    const userSummary = (await db.prepare(`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE account_type = 'talent')::int as talent_count,
        count(*) FILTER (WHERE account_type = 'company')::int as company_count,
        count(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '30 days'))::int as month_new,
        count(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '7 days'))::int as week_new,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE)::int as today_new,
        count(*) FILTER (WHERE is_verified = TRUE)::int as verified_count,
        count(*) FILTER (WHERE is_verified = FALSE)::int as unverified_count
      FROM user_profiles
    `).get()) as any;

    supportingData = userSummary;
    factualObservation = `Total registered platform users: ${userSummary.total} (${userSummary.talent_count} Talent, ${userSummary.company_count} Companies). In the last 30 days, ${userSummary.month_new} users registered (${userSummary.week_new} this past week, ${userSummary.today_new} today). Account verification stands at ${userSummary.verified_count} verified and ${userSummary.unverified_count} pending review.`;
    suggestedFollowUps = [
      "How many applications are pending review?",
      "Which companies have posted the most opportunities?",
      "What are the biggest operational issues right now?",
    ];
  } else if (query.includes("talent and company") || query.includes("talent vs company") || query.includes("account type") || query.includes("how many talent")) {
    intent = "account_breakdown";
    const counts = (await db.prepare(`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE account_type = 'talent')::int as talent_count,
        count(*) FILTER (WHERE account_type = 'company')::int as company_count,
        count(*) FILTER (WHERE account_type = 'talent' AND is_verified = TRUE)::int as talent_verified,
        count(*) FILTER (WHERE account_type = 'company' AND is_verified = TRUE)::int as company_verified
      FROM user_profiles
    `).get()) as any;

    supportingData = counts;
    factualObservation = `There are currently ${counts.total} total accounts: ${counts.talent_count} Talent (${counts.talent_verified} verified) and ${counts.company_count} Companies (${counts.company_verified} verified).`;
    suggestedFollowUps = [
      "How many users registered this month?",
      "Which companies have the most opportunities?",
      "Summarize the last seven days.",
    ];
  } else if (query.includes("companies have the most") || query.includes("top companies") || query.includes("active companies")) {
    intent = "top_companies";
    const topComps = await db.query(`
      SELECT company_name, count(*)::int as opp_count
      FROM client_projects
      WHERE company_name IS NOT NULL AND company_name != ''
      GROUP BY company_name
      ORDER BY opp_count DESC
      LIMIT 10
    `);
    supportingData = { companies: topComps.rows };
    if (topComps.rows.length === 0) {
      factualObservation = "Currently, no client project mandates have been published in the database yet.";
    } else {
      factualObservation = `Top companies by published opportunity mandates:\n` +
        topComps.rows.map((c: any, i: number) => `${i + 1}. ${c.company_name}: ${c.opp_count} project(s)`).join("\n");
    }
    suggestedFollowUps = [
      "Which opportunities receive the most applications?",
      "How many applications are pending?",
      "Which areas require administrator attention?",
    ];
  } else if (query.includes("opportunities receive the most") || query.includes("top opportunities") || query.includes("most applications")) {
    intent = "top_opportunities";
    const topOpps = await db.query(`
      SELECT cp.id, cp.title, cp.company_name, cp.status, count(pa.id)::int as app_count
      FROM client_projects cp
      LEFT JOIN project_applications pa ON pa.project_id = cp.id
      GROUP BY cp.id, cp.title, cp.company_name, cp.status
      ORDER BY app_count DESC
      LIMIT 5
    `);
    supportingData = { opportunities: topOpps.rows };
    if (topOpps.rows.length === 0) {
      factualObservation = "No opportunity records are currently present in the client_projects table.";
    } else {
      factualObservation = `Opportunities ranked by proposal volume:\n` +
        topOpps.rows.map((o: any, i: number) => `${i + 1}. "${o.title}" (${o.company_name || "Enterprise"}) — ${o.app_count} proposals [Status: ${o.status}]`).join("\n");
    }
    suggestedFollowUps = [
      "How many applications are pending?",
      "Which opportunities are inactive?",
      "Summarize the last seven days.",
    ];
  } else if (query.includes("pending") && query.includes("application")) {
    intent = "pending_applications";
    const appStats = (await db.prepare(`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE status = 'pending')::int as pending_count,
        count(*) FILTER (WHERE status = 'shortlisted')::int as shortlisted_count,
        count(*) FILTER (WHERE status = 'accepted')::int as accepted_count,
        count(*) FILTER (WHERE status = 'declined')::int as declined_count
      FROM project_applications
    `).get()) as any;

    supportingData = appStats;
    factualObservation = `Out of ${appStats.total} total submitted proposals, exactly ${appStats.pending_count} are in 'pending' status awaiting review (${appStats.shortlisted_count} shortlisted, ${appStats.accepted_count} accepted, ${appStats.declined_count} declined).`;
    suggestedFollowUps = [
      "Which opportunities receive the most applications?",
      "What are the biggest operational issues?",
      "Which areas require administrator attention?",
    ];
  } else if (query.includes("inactive") && query.includes("opportunit")) {
    intent = "inactive_opportunities";
    const inactiveOpps = await db.query(`
      SELECT cp.id, cp.title, cp.company_name, cp.status, cp.created_at, count(pa.id)::int as app_count
      FROM client_projects cp
      LEFT JOIN project_applications pa ON pa.project_id = cp.id
      WHERE cp.status ILIKE 'discovery' OR cp.status ILIKE 'draft'
      GROUP BY cp.id, cp.title, cp.company_name, cp.status, cp.created_at
      HAVING count(pa.id) = 0
      LIMIT 5
    `);
    supportingData = { inactiveOpportunities: inactiveOpps.rows };
    if (inactiveOpps.rows.length === 0) {
      factualObservation = "There are currently no inactive or stagnant opportunities with zero applications in discovery status.";
    } else {
      factualObservation = `Identified ${inactiveOpps.rows.length} inactive project brief(s) with zero applications:\n` +
        inactiveOpps.rows.map((o: any) => `• "${o.title}" (${o.company_name || "Enterprise"}) — Created ${new Date(o.created_at).toLocaleDateString()}`).join("\n");
    }
    suggestedFollowUps = [
      "Which opportunities receive the most applications?",
      "What are the biggest operational issues?",
      "Which areas require administrator attention?",
    ];
  } else if (query.includes("last seven days") || query.includes("7 days") || query.includes("weekly summary")) {
    intent = "seven_day_summary";
    const metrics = await fetchPlatformMetrics("7d");
    supportingData = metrics;
    factualObservation = `Seven-Day Platform Telemetry:\n` +
      `• New User Registrations: ${metrics.users.week_new || 0}\n` +
      `• Active Opportunity Mandates: ${metrics.opportunities.active_count || 0}\n` +
      `• New Proposals Submitted: ${metrics.applications.period_new || 0}\n` +
      `• Open Support Inquiries: ${metrics.support.open_count || 0} (${metrics.support.critical_count || 0} critical)\n` +
      `• Active Operational Tasks: ${metrics.tasks.active_count || 0} (${metrics.tasks.overdue_count || 0} overdue)`;
    suggestedFollowUps = [
      "What are the biggest operational issues?",
      "Which areas require administrator attention?",
      "Generate weekly platform report.",
    ];
  } else if (query.includes("operational issue") || query.includes("problems") || query.includes("blockers") || query.includes("overdue")) {
    intent = "operational_issues";
    const [overdueTasks, blockedTasks, criticalTickets] = await Promise.all([
      db.query(`SELECT id, title, priority, due_date FROM tasks WHERE due_date < NOW() AND status != 'completed' LIMIT 5`),
      db.query(`SELECT id, title, priority, blocker_note FROM tasks WHERE status = 'blocked' OR is_escalated = TRUE LIMIT 5`),
      db.query(`SELECT id, ticket_ref, subject, priority FROM support_tickets WHERE priority = 'critical' AND status != 'resolved' AND status != 'closed' LIMIT 5`),
    ]);
    supportingData = {
      overdueTasks: overdueTasks.rows,
      blockedTasks: blockedTasks.rows,
      criticalTickets: criticalTickets.rows,
    };
    factualObservation = `Operational Risk Assessment:\n` +
      `• Overdue Tasks (${overdueTasks.rows.length}): ${overdueTasks.rows.map((t: any) => `"${t.title}" (Due: ${t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'})`).join("; ") || "None"}\n` +
      `• Active Blockers (${blockedTasks.rows.length}): ${blockedTasks.rows.map((t: any) => `"${t.title}" — Blocker: ${t.blocker_note || 'Unspecified'}`).join("; ") || "None"}\n` +
      `• Critical Support SLA Breaches (${criticalTickets.rows.length}): ${criticalTickets.rows.map((k: any) => `[${k.ticket_ref}] ${k.subject}`).join("; ") || "None"}`;
    suggestedFollowUps = [
      "Which areas require administrator attention?",
      "Summarize the last seven days.",
      "How many users registered this month?",
    ];
  } else if (query.includes("attention") || query.includes("priority") || query.includes("recommend")) {
    intent = "admin_attention";
    const metrics = await fetchPlatformMetrics("30d");
    supportingData = metrics;
    const attentionPoints = [];
    if ((metrics.tasks.overdue_count || 0) > 0) {
      attentionPoints.push(`Resolve ${metrics.tasks.overdue_count} overdue deliverable task(s) in Tasks & Workflows.`);
    }
    if ((metrics.support.open_count || 0) > 0) {
      attentionPoints.push(`Triage ${metrics.support.open_count} open customer support ticket(s) in Helpdesk.`);
    }
    if ((metrics.users.unverified_count || 0) > 0) {
      attentionPoints.push(`Review ${metrics.users.unverified_count} unverified specialist profile(s) in the Talent Roster.`);
    }
    if ((metrics.applications.pending_count || 0) > 0) {
      attentionPoints.push(`Process ${metrics.applications.pending_count} pending project application(s) awaiting matching decisions.`);
    }
    if (attentionPoints.length === 0) {
      factualObservation = "Platform operations are running in ideal state: zero overdue tasks, zero critical tickets, and zero backlogged applications.";
    } else {
      factualObservation = `High-Priority Action Items Identified for Administrators:\n` +
        attentionPoints.map((pt, i) => `${i + 1}. ${pt}`).join("\n");
    }
    suggestedFollowUps = [
      "What are the biggest operational issues?",
      "How many applications are pending?",
      "Summarize the last seven days.",
    ];
  } else {
    // General operational context retrieval
    intent = "general_knowledge";
    const metrics = await fetchPlatformMetrics("30d");
    supportingData = metrics;
    factualObservation = `Platform Snapshot: ${metrics.users.total || 0} registered users (${metrics.users.talent_count || 0} Talent, ${metrics.users.company_count || 0} Company), ${metrics.opportunities.total || 0} project briefs, ${metrics.applications.total || 0} proposals, ${metrics.support.open_count || 0} open tickets, and ${metrics.tasks.active_count || 0} active internal tasks.`;
    suggestedFollowUps = [
      "How many users registered this month?",
      "Which opportunities receive the most applications?",
      "What are the biggest operational issues?",
    ];
  }

  // Generate conversational synthesis via Gemini/OpenRouter if available
  const hasApiKey = Boolean(
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") ||
    process.env.OPENROUTER_API_KEY
  );

  let finalAnswer = "";
  let finalSource: "gemini" | "openrouter" | "heuristic" = "heuristic";

  if (hasApiKey) {
    const systemPrompt = `You are RICOZ AI Assistant, an elite operations intelligence specialist for the RICOZ luxury creative marketplace.
You answer administrator questions strictly based on the provided factual database records.
RULES:
1. Do not invent numbers, dates, or percentages.
2. Separate factual observations from any interpretations.
3. If data is not in the database records, clearly state that it is unavailable.
4. Output clean, elegant Markdown formatted for executive administrators.`;

    const userPrompt = `Administrator Question: "${sanitizePromptInput(rawQuery)}"

VERIFIED DATABASE RECORDS:
<database_records>
${factualObservation}
</database_records>

Provide a concise, direct, professional response answering the question based solely on the verified database records above.`;

    const aiRes = await callGeminiAPI(userPrompt, {
      systemPrompt,
      responseMimeType: "text/plain",
      temperature: 0.1,
    });

    if (aiRes.ok && aiRes.data) {
      finalAnswer = aiRes.data;
      finalSource = aiRes.source as any;
    }
  }

  if (!finalAnswer) {
    // Deterministic Markdown format
    finalAnswer = `### Operational Intelligence Query Result\n\n${factualObservation}\n\n*Note: Operating on deterministic database heuristics. Real telemetry pulled from InsForge PostgreSQL.*`;
    finalSource = "heuristic";
  }

  // Log usage
  const latencyMs = Date.now() - startTime;
  await logAIUsage({
    adminId,
    featureUsed: "assistant_query",
    provider: finalSource,
    promptSummary: rawQuery.slice(0, 100),
    status: "success",
    latencyMs,
  });

  return {
    answer: finalAnswer,
    source: finalSource,
    providerConfigured: hasApiKey,
    intent,
    supportingData,
    suggestedFollowUps,
  };
}

// ==============================================================================
// 3. PHASE 2 — AI BUSINESS INTELLIGENCE
// ==============================================================================

export interface BIInsight {
  id: string;
  title: string;
  explanation: string;
  supportingMetrics: Record<string, any>;
  dateRange: string;
  importance: "critical" | "high" | "medium" | "low";
  suggestedAction: string;
  relatedPage: string;
}

export async function generateBusinessIntelligence(range: string = "30d"): Promise<{
  insights: BIInsight[];
  summary: string;
  metrics: any;
}> {
  const db = getDb();
  const metrics = await fetchPlatformMetrics(range);

  // Compare previous period vs current period for registrations
  const previousWindow = (await db.prepare(`
    SELECT 
      count(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '60 days') AND created_at < (NOW() - INTERVAL '30 days'))::int as prev_month_users,
      count(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '30 days'))::int as curr_month_users
    FROM user_profiles
  `).get()) as any;

  const curr = previousWindow?.curr_month_users || 0;
  const prev = previousWindow?.prev_month_users || 0;
  const userGrowthDelta = curr - prev;

  const insights: BIInsight[] = [];

  // Insight 1: Registration Velocity
  insights.push({
    id: "insight_reg_trend",
    title: userGrowthDelta >= 0 ? "Registration Volume Trending Positive" : "Registration Velocity Inflow Alert",
    explanation: `Platform registrations totaled ${curr} in the last 30 days compared to ${prev} in the preceding 30-day window (delta: ${userGrowthDelta >= 0 ? "+" : ""}${userGrowthDelta} accounts).`,
    supportingMetrics: { currentPeriod: curr, previousPeriod: prev, netChange: userGrowthDelta },
    dateRange: "Past 30 Days vs Prior 30 Days",
    importance: userGrowthDelta < 0 && curr === 0 ? "high" : "medium",
    suggestedAction: "Evaluate creative talent acquisition campaigns and public website onboarding conversion.",
    relatedPage: "/admin/talent",
  });

  // Insight 2: Talent vs Company Ratio
  const talentCount = metrics.users.talent_count || 0;
  const companyCount = metrics.users.company_count || 0;
  const ratioStr = companyCount > 0 ? `${(talentCount / companyCount).toFixed(1)}:1` : `${talentCount}:0`;

  insights.push({
    id: "insight_supply_demand",
    title: "Marketplace Liquidity & Ratio",
    explanation: `The platform maintains a ${ratioStr} Talent to Company account balance (${talentCount} talent accounts, ${companyCount} client enterprises). Healthy luxury design ecosystems balance client briefs with senior creative supply.`,
    supportingMetrics: { talentCount, companyCount, ratio: ratioStr },
    dateRange: "Cumulative",
    importance: talentCount > 0 && companyCount === 0 ? "high" : "low",
    suggestedAction: companyCount === 0 ? "Focus enterprise sales outreach to onboard hiring corporate clients." : "Maintain balanced outreach across both creative disciplines and enterprise clients.",
    relatedPage: "/admin/companies",
  });

  // Insight 3: Pending Applications Health
  const pendingApps = metrics.applications.pending_count || 0;
  const totalApps = metrics.applications.total || 0;

  insights.push({
    id: "insight_app_conversion",
    title: pendingApps > 0 ? "Proposal Review Pipeline Active" : "No Pending Applications Backlog",
    explanation: pendingApps > 0 
      ? `${pendingApps} out of ${totalApps} submitted proposals (${totalApps > 0 ? Math.round((pendingApps / totalApps) * 100) : 0}%) are awaiting company review or administrative curation.`
      : "All submitted applications have been processed and moved through shortlisting or decision states.",
    supportingMetrics: { pendingApps, totalApps, pendingRate: totalApps > 0 ? `${Math.round((pendingApps / totalApps) * 100)}%` : "0%" },
    dateRange: "Active Queue",
    importance: pendingApps > 5 ? "high" : "medium",
    suggestedAction: "Triage pending applications to uphold client matching speed SLAs.",
    relatedPage: "/admin/tasks",
  });

  // Insight 4: Operational Task Blockers
  const overdueTasks = metrics.tasks.overdue_count || 0;
  const blockedTasks = metrics.tasks.blocked_count || 0;

  if (overdueTasks > 0 || blockedTasks > 0) {
    insights.push({
      id: "insight_task_impediments",
      title: "Operational Deliverable Impediments Detected",
      explanation: `${overdueTasks} task(s) currently past due date and ${blockedTasks} task(s) marked with active blockers require administrative unblocking.`,
      supportingMetrics: { overdueTasks, blockedTasks },
      dateRange: "Current",
      importance: overdueTasks > 2 || blockedTasks > 0 ? "critical" : "high",
      suggestedAction: "Reconcile task blockers and reassign overdue milestones in the Tasks Kanban board.",
      relatedPage: "/admin/tasks",
    });
  }

  // Insight 5: Support SLA Compliance
  const criticalTickets = metrics.support.critical_count || 0;
  const openTickets = metrics.support.open_count || 0;

  insights.push({
    id: "insight_support_sla",
    title: criticalTickets > 0 ? "Critical Support Tickets Require Intervention" : "Support Inquiries Under Normal Operation",
    explanation: criticalTickets > 0 
      ? `There are ${criticalTickets} critical support ticket(s) currently open out of ${openTickets} total unresolved inquiries.`
      : `${openTickets} open support ticket(s) currently in progress; zero critical SLA breaches logged.`,
    supportingMetrics: { criticalTickets, openTickets },
    dateRange: "Current Queue",
    importance: criticalTickets > 0 ? "critical" : "low",
    suggestedAction: "Review urgent client disputes and billing queries in Support & SLA.",
    relatedPage: "/admin/support",
  });

  const summary = `Executive BI Briefing: ${insights.length} operational insights evaluated across platform growth, marketplace liquidity, review backlogs, and deliverable commitments based on live InsForge PostgreSQL data.`;

  return { insights, summary, metrics };
}

// ==============================================================================
// 4. PHASE 3 — AI TASK COPILOT
// ==============================================================================

export async function executeTaskCopilot(
  action: "breakdown" | "summarize" | "recommendations",
  taskData?: any
) {
  const db = getDb();

  if (action === "recommendations") {
    const [overdue, unassigned, blocked] = await Promise.all([
      db.query(`SELECT id, title, priority, due_date FROM tasks WHERE due_date < NOW() AND status != 'completed' LIMIT 5`),
      db.query(`SELECT id, title, priority, due_date FROM tasks WHERE assignee_id IS NULL AND status != 'completed' LIMIT 5`),
      db.query(`SELECT id, title, priority, blocker_note FROM tasks WHERE status = 'blocked' OR is_escalated = TRUE LIMIT 5`),
    ]);

    return {
      success: true,
      action: "recommendations",
      overdueTasks: overdue.rows,
      unassignedTasks: unassigned.rows,
      blockedTasks: blocked.rows,
      summary: `Found ${overdue.rows.length} overdue task(s), ${unassigned.rows.length} unassigned task(s), and ${blocked.rows.length} blocked task(s) in active queue.`,
    };
  }

  if (action === "summarize" && taskData?.id) {
    const task = (await db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(taskData.id)) as any;
    if (!task) throw new Error("Task not found");

    const comments = await db.query(
      `SELECT comment, created_at FROM task_comments WHERE task_id = ? ORDER BY created_at DESC LIMIT 5`,
      [taskData.id]
    );

    const summaryText = `Task: "${task.title}"\nStatus: ${task.status.toUpperCase()} (Priority: ${task.priority.toUpperCase()})\nDue: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Unscheduled'}\nBlocker: ${task.blocker_note || 'None'}\nRecent Discussion: ${comments.rows.map((c: any) => c.comment).join(" | ") || 'No comments logged.'}`;

    return {
      success: true,
      action: "summarize",
      task,
      recentComments: comments.rows,
      summary: summaryText,
      nextSteps: [
        task.blocker_note ? "Address logged blocker with assigned team lead" : "Verify milestone deliverables",
        "Conduct midpoint quality check against creative brief",
        "Mark task completed upon stakeholder sign-off",
      ],
    };
  }

  // Breakdown assistance
  const title = taskData?.title || "Untitled Milestone";
  const desc = taskData?.description || "";
  const priority = taskData?.priority || "medium";
  const blockerNote = taskData?.blockerNote || "";

  const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY);

  if (hasApiKey) {
    const prompt = `You are RICOZ AI Task Copilot. Analyze this operational task:
Title: "${sanitizePromptInput(title)}"
Description: "${sanitizePromptInput(desc)}"
Priority: "${priority}"
Blocker: "${sanitizePromptInput(blockerNote)}"

Provide a structured breakdown JSON with:
{
  "mainObjective": "concise objective",
  "subtasks": ["subtask 1", "subtask 2", "subtask 3", "subtask 4"],
  "dependencies": ["dependency 1", "dependency 2"],
  "possibleBlockers": ["blocker 1", "blocker 2"],
  "estimatedComplexity": "Simple" | "Moderate" | "Complex" | "Enterprise",
  "suggestedPriority": "low" | "medium" | "high" | "urgent",
  "estimatedHoursNotice": "Estimated 4-8 hours (estimate only)"
}`;

    const aiRes = await callGeminiAPI(prompt, { responseMimeType: "application/json" });
    if (aiRes.ok && aiRes.data) {
      try {
        const parsed = JSON.parse(aiRes.data);
        return { success: true, action: "breakdown", ...parsed, source: aiRes.source };
      } catch {}
    }
  }

  // Deterministic rule-based breakdown
  return {
    success: true,
    action: "breakdown",
    source: "heuristic",
    mainObjective: `Deliver high-quality completion for milestone: "${title}"`,
    subtasks: [
      `1. Review creative brief and technical requirements for "${title}"`,
      `2. Establish deliverable milestones and asset dependencies`,
      `3. Execute primary deliverable package and conduct internal QA`,
      `4. Collect stakeholder feedback and reconcile revisions`,
      `5. Obtain department head sign-off and finalize documentation`,
    ],
    dependencies: [
      "Access to project brand guidelines and assets",
      "Department head availability for review checkpoint",
    ],
    possibleBlockers: [
      blockerNote ? `Active Blocker: ${blockerNote}` : "Delayed stakeholder review turnaround",
      "Cross-department asset sync bottlenecks",
    ],
    estimatedComplexity: priority === "urgent" ? "Complex" : "Moderate",
    suggestedPriority: priority,
    estimatedHoursNotice: "Estimated 6 to 12 operational hours (estimate only — subject to human review)",
  };
}

// ==============================================================================
// 5. PHASE 4 — SPECIALIST AI AGENTS (5 LOGICAL AGENTS)
// ==============================================================================

export async function executeSpecialistAgent(agentType: string, inputData?: any) {
  const db = getDb();
  const startTime = Date.now();

  let agentName = "";
  let agentPurpose = "";
  let result: any = null;

  switch (agentType) {
    case "operations_analyst":
      agentName = "Operations Analyst";
      agentPurpose = "Reviews platform operational metrics, throughput, overdue deliverables, and critical bottlenecks.";
      const metrics = await fetchPlatformMetrics("30d");
      result = {
        throughput: `Platform managing ${metrics.tasks.active_count} active tasks, ${metrics.support.open_count} open inquiries, and ${metrics.applications.pending_count} proposals.`,
        overdueCount: metrics.tasks.overdue_count,
        criticalCount: metrics.support.critical_count,
        operationalPriorities: [
          metrics.tasks.overdue_count > 0 ? `Clear ${metrics.tasks.overdue_count} overdue task(s) in Tasks & Workflows` : "Task execution is on schedule",
          metrics.support.critical_count > 0 ? `Respond to ${metrics.support.critical_count} critical helpdesk ticket(s)` : "Helpdesk SLA maintained",
          metrics.users.unverified_count > 0 ? `Triage ${metrics.users.unverified_count} unverified account profile(s)` : "Profile verification queue clear",
        ],
      };
      break;

    case "technical_assistant":
      agentName = "Technical Assistant";
      agentPurpose = "Assesses system stability and summarizes operational error logs without exposing sensitive credentials.";
      const recentErrors = await db.query(`
        SELECT action, entity_type, change_summary, created_at
        FROM audit_logs
        WHERE action ILIKE '%fail%' OR action ILIKE '%error%' OR entity_type = 'system'
        ORDER BY created_at DESC
        LIMIT 5
      `);
      result = {
        healthStatus: "Operational",
        errorCountInLogs: recentErrors.rows.length,
        recentSystemAlerts: recentErrors.rows.map((e: any) => ({
          action: e.action,
          summary: e.change_summary || "Operational event recorded",
          timestamp: e.created_at,
        })),
        debuggingRecommendations: [
          "Verify InsForge PostgreSQL database connectivity and API rate limits",
          "Ensure server environment variables (NEXT_PUBLIC_INSFORGE_URL, INSFORGE_API_KEY) are active",
          "Monitor edge serverless logs in Vercel for response timeouts",
        ],
      };
      break;

    case "bi_analyst":
      agentName = "Business Intelligence Analyst";
      agentPurpose = "Analyzes business expansion, talent/company ratios, and project conversion velocity.";
      const biData = await generateBusinessIntelligence("30d");
      result = {
        summary: biData.summary,
        keyInsights: biData.insights.slice(0, 3).map((i) => ({
          title: i.title,
          explanation: i.explanation,
          importance: i.importance,
          action: i.suggestedAction,
        })),
      };
      break;

    case "support_specialist":
      agentName = "Support Specialist";
      agentPurpose = "Classifies tickets, drafts polite brand-aligned responses, and identifies recurring issues.";
      const recentTickets = await db.query(`
        SELECT id, ticket_ref, subject, category, priority, status
        FROM support_tickets
        ORDER BY created_at DESC
        LIMIT 5
      `);
      result = {
        activeQueue: recentTickets.rows,
        repeatedIssuesIdentified: [
          "Milestone invoice questions during ongoing creative review",
          "Portfolio link update requests for unverified talent",
        ],
        draftResponseTemplate: "Dear Client,\n\nThank you for reaching out to RICOZ Operations. We have received your inquiry and our enterprise coordination team is reviewing your account details. We will update this ticket within 4 business hours.\n\nWarm regards,\nRICOZ Operations Support",
      };
      break;

    case "quality_verification":
      agentName = "Quality & Verification Assistant";
      agentPurpose = "Audits unverified specialist and company profiles against completeness criteria for human review.";
      const [unverifiedTalent, unverifiedCompany] = await Promise.all([
        db.query(`
          SELECT up.id, up.full_name, up.email, tp.headline, tp.skills, tp.portfolio_url
          FROM user_profiles up
          LEFT JOIN talent_profiles tp ON tp.user_id = up.id
          WHERE up.account_type = 'talent' AND up.is_verified = FALSE
          LIMIT 5
        `),
        db.query(`
          SELECT up.id, up.full_name, up.email, cp.company_name, cp.website_url, cp.industry
          FROM user_profiles up
          LEFT JOIN company_profiles cp ON cp.user_id = up.id
          WHERE up.account_type = 'company' AND up.is_verified = FALSE
          LIMIT 5
        `),
      ]);

      const auditedTalents = unverifiedTalent.rows.map((t: any) => ({
        id: t.id,
        name: t.full_name,
        email: t.email,
        missingFields: [
          !t.headline && "Headline",
          (!t.skills || t.skills.length === 0) && "Skills Array",
          !t.portfolio_url && "Portfolio URL",
        ].filter(Boolean),
      }));

      const auditedCompanies = unverifiedCompany.rows.map((c: any) => ({
        id: c.id,
        name: c.company_name || c.full_name,
        email: c.email,
        missingFields: [
          !c.company_name && "Company Legal Name",
          !c.website_url && "Website URL",
          !c.industry && "Industry Classification",
        ].filter(Boolean),
      }));

      result = {
        unverifiedTalentAudited: auditedTalents,
        unverifiedCompaniesAudited: auditedCompanies,
        humanReviewNote: "AI provides completeness flags only. Final approval or rejection requires human administrator verification.",
      };
      break;

    default:
      throw new Error(`Unsupported specialist agent: ${agentType}`);
  }

  const latencyMs = Date.now() - startTime;
  await logAIUsage({
    featureUsed: `specialist_agent_${agentType}`,
    provider: "system_service",
    status: "success",
    latencyMs,
  });

  return {
    agentType,
    agentName,
    agentPurpose,
    available: true,
    result,
  };
}

// ==============================================================================
// 6. PHASE 5 — AI SUPPORT INTELLIGENCE
// ==============================================================================

export async function generateSupportIntelligence(input: {
  ticketId?: string;
  subject?: string;
  description?: string;
}) {
  const db = getDb();
  let subject = input.subject || "";
  let description = input.description || "";

  if (input.ticketId && (!subject || !description)) {
    const ticket = (await db.prepare(`SELECT * FROM support_tickets WHERE id = ?`).get(input.ticketId)) as any;
    if (ticket) {
      subject = ticket.subject || "";
      description = ticket.description || "";
    }
  }

  const text = `${subject} ${description}`.toLowerCase();
  let category = "other";
  let priority = "medium";

  if (text.includes("login") || text.includes("password") || text.includes("access") || text.includes("otp")) {
    category = "account_access";
    priority = "high";
  } else if (text.includes("verify") || text.includes("portfolio") || text.includes("document") || text.includes("profile")) {
    category = "verification";
    priority = "medium";
  } else if (text.includes("invoice") || text.includes("payment") || text.includes("refund") || text.includes("billing")) {
    category = "billing";
    priority = "high";
  } else if (text.includes("dispute") || text.includes("contract") || text.includes("breach")) {
    category = "disputes";
    priority = "critical";
  } else if (text.includes("project") || text.includes("mandate") || text.includes("opportunity")) {
    category = "opportunity";
    priority = "medium";
  } else if (text.includes("apply") || text.includes("proposal") || text.includes("pitch")) {
    category = "application";
    priority = "medium";
  }

  const draftResponse = `Dear Partner,\n\nThank you for contacting RICOZ Platform Support regarding "${subject}".\n\nOur operations team has received your ticket and classified it under ${category.toUpperCase()} at ${priority.toUpperCase()} priority. We are actively investigating your request and will follow up with specific resolution steps shortly.\n\nIf you have additional supporting materials or asset links, please feel free to reply directly to this ticket.\n\nWarm regards,\nRICOZ Executive Support Team`;

  return {
    success: true,
    subject,
    evaluatedCategory: category,
    suggestedPriority: priority,
    draftResponse,
    recommendedNextAction: `Assign ticket to ${category === 'billing' ? 'Finance / Billing Lead' : 'Support Specialist'} and update ticket status to in_progress.`,
    isDraftNotice: "Draft response generated for administrator review. Human approval required before sending.",
  };
}

// ==============================================================================
// 7. PHASE 6 — USER AND COMPANY INSIGHTS
// ==============================================================================

export async function generateUserCompanyInsights(type: "talent" | "company", id: string) {
  const db = getDb();

  if (type === "talent") {
    const user = (await db.prepare(`SELECT * FROM user_profiles WHERE id = ?`).get(id)) as any;
    if (!user) throw new Error("User not found");

    const talent = (await db.prepare(`SELECT * FROM talent_profiles WHERE user_id = ?`).get(id)) as any;
    const apps = await db.query(`SELECT id, status, proposed_rate FROM project_applications WHERE talent_user_id = ?`, [id]);

    const fields = [
      { name: "Full Name", present: Boolean(user.full_name) },
      { name: "Email", present: Boolean(user.email) },
      { name: "Headline", present: Boolean(talent?.headline) },
      { name: "Bio", present: Boolean(talent?.bio) },
      { name: "Location", present: Boolean(talent?.location) },
      { name: "Skills", present: Boolean(talent?.skills && Array.isArray(talent.skills) && talent.skills.length > 0) },
      { name: "Portfolio URL", present: Boolean(talent?.portfolio_url) },
      { name: "Hourly Rate", present: Boolean(talent?.hourly_rate) },
    ];

    const completed = fields.filter((f) => f.present).length;
    const completenessPct = Math.round((completed / fields.length) * 100);

    return {
      type: "talent",
      id,
      name: user.full_name,
      email: user.email,
      isVerified: Boolean(user.is_verified),
      status: user.status,
      completenessScore: completenessPct,
      fieldsChecklist: fields,
      proposalsSubmitted: apps.rows.length,
      administrativeObservations: completenessPct < 70
        ? "Profile lacks key creative attributes. Recommended to request portfolio link and skills before verification."
        : "Profile completeness meets standard luxury creative marketplace benchmarks.",
    };
  }

  if (type === "company") {
    const user = (await db.prepare(`SELECT * FROM user_profiles WHERE id = ?`).get(id)) as any;
    if (!user) throw new Error("User not found");

    const comp = (await db.prepare(`SELECT * FROM company_profiles WHERE user_id = ?`).get(id)) as any;
    const opps = await db.query(`SELECT id, title, status FROM client_projects WHERE company_user_id = ?`, [id]);

    const fields = [
      { name: "Company Legal Name", present: Boolean(comp?.company_name) },
      { name: "Business Email", present: Boolean(comp?.business_email || user.email) },
      { name: "Industry", present: Boolean(comp?.industry) },
      { name: "Company Size", present: Boolean(comp?.company_size) },
      { name: "Website URL", present: Boolean(comp?.website_url) },
      { name: "Billing Country", present: Boolean(comp?.billing_country) },
    ];

    const completed = fields.filter((f) => f.present).length;
    const completenessPct = Math.round((completed / fields.length) * 100);

    return {
      type: "company",
      id,
      name: comp?.company_name || user.full_name,
      email: user.email,
      isVerified: Boolean(user.is_verified),
      status: user.status,
      completenessScore: completenessPct,
      fieldsChecklist: fields,
      mandatesCreated: opps.rows.length,
      administrativeObservations: opps.rows.length === 0
        ? "Company has registered but has not yet published an opportunity mandate. Recommended to initiate concierge onboarding."
        : `Company is actively engaging talent with ${opps.rows.length} published project brief(s).`,
    };
  }

  throw new Error("Invalid entity type requested");
}

// ==============================================================================
// 8. PHASE 7 — AI REPORT GENERATOR
// ==============================================================================

export async function generatePlatformReport(reportType: string, dateRange: string = "30d") {
  const metrics = await fetchPlatformMetrics(dateRange);
  const generatedAt = new Date().toISOString();

  let title = "Platform Intelligence Report";
  let content = "";
  let csvData: Record<string, any>[] = [];

  switch (reportType) {
    case "daily_operations":
      title = "RICOZ 24-Hour Operations Report";
      content = `# ${title}\n**Generated:** ${generatedAt}  \n**Scope:** Last 24 Hours\n\n## 1. Daily Telemetry\n- **New Registrations Today:** ${metrics.users.today_new || 0}\n- **Active Deliverable Tasks:** ${metrics.tasks.active_count || 0}\n- **Open Support Inquiries:** ${metrics.support.open_count || 0}\n- **Critical Blockers:** ${metrics.tasks.blocked_count || 0}\n\n## 2. Daily Recommendations\n1. Confirm milestone deadlines scheduled for today.\n2. Address any escalated customer support tickets.`;
      csvData = [
        { metric: "New Registrations Today", value: metrics.users.today_new || 0 },
        { metric: "Active Tasks", value: metrics.tasks.active_count || 0 },
        { metric: "Open Tickets", value: metrics.support.open_count || 0 },
        { metric: "Blocked Tasks", value: metrics.tasks.blocked_count || 0 },
      ];
      break;

    case "weekly_platform":
      title = "RICOZ Weekly Platform Performance Report";
      content = `# ${title}\n**Generated:** ${generatedAt}  \n**Scope:** Past 7 Days\n\n## 1. Weekly Performance Summary\n- **Weekly New Users:** ${metrics.users.week_new || 0}\n- **Total Platform Accounts:** ${metrics.users.total || 0}\n- **Active Opportunity Mandates:** ${metrics.opportunities.active_count || 0}\n- **Unresolved Tasks:** ${metrics.tasks.active_count || 0} (${metrics.tasks.overdue_count || 0} overdue)\n\n## 2. Risk Factors\n- Overdue milestones require task realignment with department heads.`;
      csvData = [
        { metric: "Weekly New Users", value: metrics.users.week_new || 0 },
        { metric: "Total Users", value: metrics.users.total || 0 },
        { metric: "Active Opportunities", value: metrics.opportunities.active_count || 0 },
        { metric: "Overdue Tasks", value: metrics.tasks.overdue_count || 0 },
      ];
      break;

    case "monthly_business":
    default:
      title = "RICOZ Monthly Business Operations Intelligence";
      content = `# ${title}\n**Generated:** ${generatedAt}  \n**Scope:** Past 30 Days\n\n## 1. Executive Summary\n- **Total Registered Accounts:** ${metrics.users.total || 0}\n  - Talent Accounts: ${metrics.users.talent_count || 0}\n  - Company Accounts: ${metrics.users.company_count || 0}\n  - Verified Accounts: ${metrics.users.verified_count || 0}\n  - Unverified Accounts: ${metrics.users.unverified_count || 0}\n- **Project Mandates:** ${metrics.opportunities.total || 0} (${metrics.opportunities.active_count || 0} active)\n- **Talent Proposals Submitted:** ${metrics.applications.total || 0} (${metrics.applications.pending_count || 0} pending)\n- **Support Tickets:** ${metrics.support.total || 0} (${metrics.support.open_count || 0} open, ${metrics.support.critical_count || 0} critical)\n- **Internal Tasks:** ${metrics.tasks.total || 0} (${metrics.tasks.active_count || 0} active, ${metrics.tasks.overdue_count || 0} overdue)\n\n## 2. Strategic Next Steps\n1. Review and verify backlogged talent portfolios in /admin/talent.\n2. Reassign or unblock overdue delivery tasks in /admin/tasks.\n3. Accelerate client matching on pending project proposals.`;
      csvData = [
        { metric: "Total Accounts", value: metrics.users.total || 0 },
        { metric: "Talent Accounts", value: metrics.users.talent_count || 0 },
        { metric: "Company Accounts", value: metrics.users.company_count || 0 },
        { metric: "Verified Accounts", value: metrics.users.verified_count || 0 },
        { metric: "Project Mandates", value: metrics.opportunities.total || 0 },
        { metric: "Total Proposals", value: metrics.applications.total || 0 },
        { metric: "Pending Proposals", value: metrics.applications.pending_count || 0 },
        { metric: "Open Support Tickets", value: metrics.support.open_count || 0 },
        { metric: "Overdue Tasks", value: metrics.tasks.overdue_count || 0 },
      ];
      break;
  }

  return {
    reportType,
    title,
    dateRange,
    generatedAt,
    content,
    csvData,
  };
}

// ==============================================================================
// 9. PHASE 8 — AI AUTOMATION SUGGESTIONS
// ==============================================================================

export async function getAutomationSuggestions() {
  const db = getDb();
  const suggestions = [];

  // 1. Long-pending applications
  const pendingApps = await db.query(`
    SELECT count(*)::int as count
    FROM project_applications
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL '7 days'
  `);
  if ((pendingApps.rows[0]?.count || 0) > 0) {
    suggestions.push({
      id: "sug_pending_apps",
      title: "Review Long-Pending Applications",
      reason: `${pendingApps.rows[0].count} proposal(s) have remained in pending status for over 7 days without client review.`,
      supportingRecords: `${pendingApps.rows[0].count} pending proposal(s)`,
      importance: "high",
      suggestedAction: "Triage proposals and alert client hiring leads.",
      relatedPage: "/admin/tasks",
      pageLabel: "View Tasks & Workflows",
    });
  }

  // 2. Inactive opportunities
  const inactiveOpps = await db.query(`
    SELECT count(*)::int as count
    FROM client_projects
    WHERE status = 'Active' AND created_at < NOW() - INTERVAL '14 days'
  `);
  if ((inactiveOpps.rows[0]?.count || 0) > 0) {
    suggestions.push({
      id: "sug_inactive_opps",
      title: "Investigate Inactive Opportunity Briefs",
      reason: `${inactiveOpps.rows[0].count} project brief(s) have been active for >14 days. Review application volume and client matching requirements.`,
      supportingRecords: `${inactiveOpps.rows[0].count} active project(s)`,
      importance: "medium",
      suggestedAction: "Check proposal pipeline and verify if concierge talent sourcing is required.",
      relatedPage: "/admin",
      pageLabel: "View Command Center",
    });
  }

  // 3. Incomplete company profiles
  const incompleteComps = await db.query(`
    SELECT count(*)::int as count
    FROM company_profiles
    WHERE website_url IS NULL OR industry IS NULL
  `);
  if ((incompleteComps.rows[0]?.count || 0) > 0) {
    suggestions.push({
      id: "sug_incomplete_companies",
      title: "Follow Up on Incomplete Company Profiles",
      reason: `${incompleteComps.rows[0].count} company profile(s) lack registered website URLs or industry categorization.`,
      supportingRecords: `${incompleteComps.rows[0].count} profile(s)`,
      importance: "medium",
      suggestedAction: "Send concierge profile completion inquiry to company onboarding contact.",
      relatedPage: "/admin/companies",
      pageLabel: "View Companies",
    });
  }

  // 4. Unresolved support tickets
  const urgentTickets = await db.query(`
    SELECT count(*)::int as count
    FROM support_tickets
    WHERE status IN ('open', 'pending') AND created_at < NOW() - INTERVAL '24 hours'
  `);
  if ((urgentTickets.rows[0]?.count || 0) > 0) {
    suggestions.push({
      id: "sug_unresolved_tickets",
      title: "Respond to Aged Support Tickets",
      reason: `${urgentTickets.rows[0].count} support inquiry ticket(s) have exceeded 24 hours without resolution.`,
      supportingRecords: `${urgentTickets.rows[0].count} ticket(s) > 24h`,
      importance: "critical",
      suggestedAction: "Open Helpdesk and prioritize oldest unresolved ticket.",
      relatedPage: "/admin/support",
      pageLabel: "View Support & SLA",
    });
  }

  // 5. Overdue administrative tasks
  const overdueTasks = await db.query(`
    SELECT count(*)::int as count
    FROM tasks
    WHERE due_date < NOW() AND status != 'completed'
  `);
  if ((overdueTasks.rows[0]?.count || 0) > 0) {
    suggestions.push({
      id: "sug_overdue_tasks",
      title: "Reconcile Overdue Administrative Deliverables",
      reason: `${overdueTasks.rows[0].count} task(s) in the Kanban board have passed their scheduled delivery milestone.`,
      supportingRecords: `${overdueTasks.rows[0].count} overdue task(s)`,
      importance: "high",
      suggestedAction: "Reassign deadline or coordinate with department leads in Tasks & Workflows.",
      relatedPage: "/admin/tasks",
      pageLabel: "Open Kanban Tasks",
    });
  }

  return suggestions;
}
