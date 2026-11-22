import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";
import {
  executeAssistantQuery,
  generateBusinessIntelligence,
  executeSpecialistAgent,
  executeTaskCopilot,
  generateSupportIntelligence,
  generateUserCompanyInsights,
  generatePlatformReport,
  getAutomationSuggestions,
  getAIUsageHistory,
} from "@/lib/ai/operationsIntelligence";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/ai-studio
 * Unified backend endpoint for the RICOZ V4.2 AI Operations Intelligence System.
 * Connects directly to InsForge PostgreSQL and Gemini / OpenRouter if configured.
 * Strictly enforces administrative authorization, origin checks, and rate limiting.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authorize administrator session
    const auth = await requirePermission("dashboard.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    // 2. Rate limit protection (30 requests per minute per client IP)
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit("admin_ai_ops", clientIp, 30, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `AI operation rate limit exceeded. Please wait ${rateCheck.resetInSeconds} seconds.`,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await req.json();
    const { tool, inputData } = body;

    const hasApiKey = Boolean(
      (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") ||
      process.env.OPENROUTER_API_KEY
    );

    // --------------------------------------------------------------------------
    // TOOL 1: Conversational Assistant Query (Phase 1)
    // --------------------------------------------------------------------------
    if (tool === "assistant_query") {
      const query = inputData?.query || "";
      if (!query || typeof query !== "string") {
        return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
      }
      const result = await executeAssistantQuery(query, auth.user.id);
      return NextResponse.json({ success: true, ...result });
    }

    // --------------------------------------------------------------------------
    // TOOL 2: Business Intelligence Insights (Phase 2)
    // --------------------------------------------------------------------------
    if (tool === "business_intelligence") {
      const range = inputData?.range || "30d";
      const result = await generateBusinessIntelligence(range);
      return NextResponse.json({
        success: true,
        ...result,
        providerConfigured: hasApiKey,
      });
    }

    // --------------------------------------------------------------------------
    // TOOL 3: Specialist AI Agents (Phase 4)
    // --------------------------------------------------------------------------
    if (tool === "specialist_agent") {
      const agentType = inputData?.agentType;
      if (!agentType) {
        return NextResponse.json({ success: false, error: "agentType is required" }, { status: 400 });
      }
      const result = await executeSpecialistAgent(agentType, inputData);
      return NextResponse.json({
        success: true,
        ...result,
        providerConfigured: hasApiKey,
      });
    }

    // --------------------------------------------------------------------------
    // TOOL 4: Task Copilot (Phase 3)
    // --------------------------------------------------------------------------
    if (tool === "task_copilot") {
      const action = inputData?.action || "breakdown";
      const result = await executeTaskCopilot(action, inputData);
      return NextResponse.json({
        success: true,
        ...result,
        providerConfigured: hasApiKey,
      });
    }

    // --------------------------------------------------------------------------
    // TOOL 5: Support Intelligence (Phase 5)
    // --------------------------------------------------------------------------
    if (tool === "support_intelligence" || tool === "classify_ticket") {
      const result = await generateSupportIntelligence({
        ticketId: inputData?.ticketId,
        subject: inputData?.subject,
        description: inputData?.description,
      });
      return NextResponse.json({
        ...result,
        output: {
          category: result.evaluatedCategory,
          priority: result.suggestedPriority,
          summary: `Ticket evaluated at ${result.suggestedPriority.toUpperCase()} priority under ${result.evaluatedCategory.toUpperCase()}.`,
          resolutionSteps: [
            "Confirm client account status and verify project mandate links",
            "Review relevant billing or account audit logs for recent errors",
            "Draft structured response and update ticket status to in_progress",
          ],
          draftResponse: result.draftResponse,
        },
        providerConfigured: hasApiKey,
      });
    }

    // --------------------------------------------------------------------------
    // TOOL 6: User & Company Insights (Phase 6)
    // --------------------------------------------------------------------------
    if (tool === "user_company_insights") {
      const entityType = inputData?.type || "talent";
      const entityId = inputData?.id;
      if (!entityId) {
        return NextResponse.json({ success: false, error: "entityId is required" }, { status: 400 });
      }
      const result = await generateUserCompanyInsights(entityType, entityId);
      return NextResponse.json({ success: true, ...result, providerConfigured: hasApiKey });
    }

    // --------------------------------------------------------------------------
    // TOOL 7: Report Generator (Phase 7)
    // --------------------------------------------------------------------------
    if (tool === "generate_report") {
      const reportType = inputData?.reportType || "monthly_business";
      const dateRange = inputData?.dateRange || "30d";
      const report = await generatePlatformReport(reportType, dateRange);
      return NextResponse.json({
        success: true,
        output: report.content,
        report,
        source: hasApiKey ? "gemini" : "heuristic",
        providerConfigured: hasApiKey,
      });
    }

    // --------------------------------------------------------------------------
    // TOOL 8: Automation Suggestions (Phase 8)
    // --------------------------------------------------------------------------
    if (tool === "recommendations") {
      const suggestions = await getAutomationSuggestions();
      return NextResponse.json({
        success: true,
        suggestions,
        providerConfigured: hasApiKey,
      });
    }

    // --------------------------------------------------------------------------
    // TOOL 9: Usage & Activity History (Phase 9)
    // --------------------------------------------------------------------------
    if (tool === "usage_history") {
      const history = await getAIUsageHistory(inputData?.limit || 20);
      return NextResponse.json({
        success: true,
        history,
        providerConfigured: hasApiKey,
      });
    }

    // --------------------------------------------------------------------------
    // Backward Compatibility: summarize_tasks
    // --------------------------------------------------------------------------
    if (tool === "summarize_tasks") {
      const result = await executeTaskCopilot("recommendations");
      const summaryText = `# Active Tasks & Blocker Digest\n\n${result.summary}\n\n### High Priority Tasks:\n` +
        result.overdueTasks.map((t: any) => `• [OVERDUE] ${t.title} (${t.priority})`).join("\n");
      return NextResponse.json({
        success: true,
        output: summaryText,
        source: hasApiKey ? "gemini" : "heuristic",
        providerConfigured: hasApiKey,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported tool requested: ${tool}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/ai-studio error:", error);
    return NextResponse.json(
      { success: false, error: "AI Studio request processing failed" },
      { status: 500 }
    );
  }
}
