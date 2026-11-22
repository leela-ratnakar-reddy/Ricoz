"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Cpu,
  FileText,
  LifeBuoy,
  CheckSquare,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Send,
  Trash2,
  PlusCircle,
  Download,
  Clock,
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  Layers,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  Flame,
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: "gemini" | "openrouter" | "heuristic";
  suggestedFollowUps?: string[];
  intent?: string;
}

export default function AdminAIStudioPage() {
  const [activeTab, setActiveTab] = useState<
    "assistant" | "bi" | "agents" | "copilot" | "support" | "reports" | "recommendations" | "activity"
  >("assistant");

  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ----------------------------------------------------------------------------
  // TAB 1: AI ASSISTANT STATE
  // ----------------------------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome_msg",
      sender: "assistant",
      text: `Hello! I am **RICOZ AI Assistant**, your operational intelligence partner.\n\nI have direct read access to live database records in **InsForge PostgreSQL**. You can ask me natural language questions about user growth, client opportunities, application pipelines, deliverable bottlenecks, or platform health.\n\nHow can I assist your operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "heuristic",
      suggestedFollowUps: [
        "How many users registered this month?",
        "How many Talent and Company accounts exist?",
        "Which companies have the most opportunities?",
        "What are the biggest operational issues?",
      ],
    },
  ]);
  const [queryInput, setQueryInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------------------------
  // TAB 2: BUSINESS INTELLIGENCE STATE
  // ----------------------------------------------------------------------------
  const [biRange, setBiRange] = useState<"7d" | "30d" | "90d">("30d");
  const [biData, setBiData] = useState<any>(null);
  const [biLoading, setBiLoading] = useState(false);

  // ----------------------------------------------------------------------------
  // TAB 3: SPECIALIST AGENTS STATE
  // ----------------------------------------------------------------------------
  const [selectedAgent, setSelectedAgent] = useState<string>("operations_analyst");
  const [agentResult, setAgentResult] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // ----------------------------------------------------------------------------
  // TAB 4: TASK COPILOT STATE
  // ----------------------------------------------------------------------------
  const [copilotAction, setCopilotAction] = useState<"breakdown" | "recommendations">("breakdown");
  const [copilotTitle, setCopilotTitle] = useState("Brand Identity System & Style Guide for Sovereign Capital");
  const [copilotDesc, setCopilotDesc] = useState("Design comprehensive brand visual identity, typography system, digital palette, and 45-page brand guideline token document.");
  const [copilotPriority, setCopilotPriority] = useState("high");
  const [copilotBlocker, setCopilotBlocker] = useState("Awaiting client vector asset sign-off");
  const [copilotResult, setCopilotResult] = useState<any>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // ----------------------------------------------------------------------------
  // TAB 5: SUPPORT INTELLIGENCE STATE
  // ----------------------------------------------------------------------------
  const [supportSubject, setSupportSubject] = useState("Dispute regarding Milestone 2 deliverable sign-off");
  const [supportDesc, setSupportDesc] = useState("The client has paused invoice settlement claiming the typography assets were delivered 24 hours past the agreed deadline, but our team requested earlier brand assets that were delayed.");
  const [supportResult, setSupportResult] = useState<any>(null);
  const [supportLoading, setSupportLoading] = useState(false);

  // ----------------------------------------------------------------------------
  // TAB 6: AI REPORTS STATE
  // ----------------------------------------------------------------------------
  const [reportType, setReportType] = useState("monthly_business");
  const [reportRange, setReportRange] = useState("30d");
  const [reportResult, setReportResult] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // ----------------------------------------------------------------------------
  // TAB 7: RECOMMENDATIONS STATE
  // ----------------------------------------------------------------------------
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  // ----------------------------------------------------------------------------
  // TAB 8: USAGE ACTIVITY STATE
  // ----------------------------------------------------------------------------
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === "assistant") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // Load BI on tab switch
  const loadBI = useCallback(async (range: "7d" | "30d" | "90d") => {
    try {
      setBiLoading(true);
      const res = await adminApi.aiStudio.getBusinessIntelligence(range);
      if (res.success) {
        setBiData(res);
        setProviderConfigured(res.providerConfigured);
      }
    } catch (err) {
      console.error("Error loading BI:", err);
    } finally {
      setBiLoading(false);
    }
  }, []);

  // Load Recommendations on tab switch
  const loadRecommendations = useCallback(async () => {
    try {
      setRecLoading(true);
      const res = await adminApi.aiStudio.getRecommendations();
      if (res.success) {
        setRecommendations(res.suggestions || []);
        setProviderConfigured(res.providerConfigured);
      }
    } catch (err) {
      console.error("Error loading recommendations:", err);
    } finally {
      setRecLoading(false);
    }
  }, []);

  // Load Usage History on tab switch
  const loadUsageHistory = useCallback(async () => {
    try {
      setUsageLoading(true);
      const res = await adminApi.aiStudio.getUsageHistory(25);
      if (res.success) {
        setUsageHistory(res.history || []);
        setProviderConfigured(res.providerConfigured);
      }
    } catch (err) {
      console.error("Error loading usage history:", err);
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "bi" && !biData) loadBI(biRange);
    if (activeTab === "recommendations" && recommendations.length === 0) loadRecommendations();
    if (activeTab === "activity" && usageHistory.length === 0) loadUsageHistory();
  }, [activeTab, biData, biRange, loadBI, loadRecommendations, loadUsageHistory, recommendations.length, usageHistory.length]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ----------------------------------------------------------------------------
  // ASSISTANT SEND HANDLER
  // ----------------------------------------------------------------------------
  const handleSendQuery = async (queryText?: string) => {
    const q = (queryText || queryInput).trim();
    if (!q || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setQueryInput("");
    setChatLoading(true);

    try {
      const res = await adminApi.aiStudio.queryAssistant(q);
      if (res.success) {
        const assistantMsg: ChatMessage = {
          id: `ast_${Date.now()}`,
          sender: "assistant",
          text: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: res.source,
          suggestedFollowUps: res.suggestedFollowUps,
          intent: res.intent,
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
        setProviderConfigured(res.providerConfigured);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: "assistant",
            text: `⚠️ **Unable to process query:** ${res.error || "Please check backend connectivity."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            source: "heuristic",
          },
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "assistant",
          text: `⚠️ **Error communicating with operations backend:** ${err.message || "Request timed out"}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "heuristic",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // SPECIALIST AGENT RUNNER
  // ----------------------------------------------------------------------------
  const handleRunAgent = async (agentKey: string) => {
    try {
      setSelectedAgent(agentKey);
      setAgentLoading(true);
      setAgentResult(null);
      const res = await adminApi.aiStudio.runSpecialistAgent(agentKey);
      if (res.success) {
        setAgentResult(res.result);
        setProviderConfigured(res.providerConfigured);
      }
    } catch (err: any) {
      setAgentResult({ error: err.message || "Failed to execute specialist agent" });
    } finally {
      setAgentLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // TASK COPILOT RUNNER
  // ----------------------------------------------------------------------------
  const handleRunCopilot = async () => {
    try {
      setCopilotLoading(true);
      setCopilotResult(null);
      const res = await adminApi.aiStudio.runTaskCopilot(copilotAction, {
        title: copilotTitle,
        description: copilotDesc,
        priority: copilotPriority,
        blockerNote: copilotBlocker,
      });
      if (res.success) {
        setCopilotResult(res);
        setProviderConfigured(res.providerConfigured);
      }
    } catch (err: any) {
      setCopilotResult({ error: err.message || "Failed to execute Task Copilot" });
    } finally {
      setCopilotLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // SUPPORT INTELLIGENCE RUNNER
  // ----------------------------------------------------------------------------
  const handleRunSupport = async () => {
    try {
      setSupportLoading(true);
      setSupportResult(null);
      const res = await adminApi.aiStudio.getSupportIntelligence({
        subject: supportSubject,
        description: supportDesc,
      });
      if (res.success) {
        setSupportResult(res);
        setProviderConfigured(res.providerConfigured);
      }
    } catch (err: any) {
      setSupportResult({ error: err.message || "Failed to evaluate support ticket" });
    } finally {
      setSupportLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // REPORT GENERATOR RUNNER
  // ----------------------------------------------------------------------------
  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      setReportResult(null);
      const res = await adminApi.aiStudio.generateReport(reportType, reportRange);
      if (res.success) {
        setReportResult(res.report);
        setProviderConfigured(res.providerConfigured);
      }
    } catch (err: any) {
      setReportResult({ error: err.message || "Failed to generate report" });
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCsv = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) => Object.values(obj).map((v) => `"${v}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-800/40 text-purple-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>AI OPERATIONS INTELLIGENCE V4.2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Operations Intelligence & AI Studio
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time conversational assistant, business insights, specialist agents, and deliverable copilots connected to InsForge PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.04] transition-colors"
          >
            &larr; Command Center
          </Link>
          <Link
            href="/admin/tasks"
            className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.04] transition-colors"
          >
            Kanban Tasks &rarr;
          </Link>
        </div>
      </div>

      {/* 2. PROVIDER STATUS BANNER & HUMAN-IN-THE-LOOP SAFEGUARD */}
      <div className="p-4 rounded-2xl bg-[#0E1118] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
              <span>Operational AI Status:</span>
              <span
                className={`font-bold uppercase ${
                  providerConfigured ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {providerConfigured ? "Live LLM Provider Connected" : "Deterministic Heuristic Engine Active"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {providerConfigured
                ? "Multimodal model enabled. Real PostgreSQL telemetry synthesized with Gemini / OpenRouter."
                : "InsForge PostgreSQL verified telemetry active. Configure GEMINI_API_KEY for dynamic generative synthesis."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!providerConfigured && (
            <button
              onClick={() => setProviderModalOpen(true)}
              className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 border border-amber-800/40 transition-colors flex items-center gap-1.5"
            >
              <Info className="w-3 h-3" />
              <span>Setup Guide</span>
            </button>
          )}
          <span className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>HUMAN-IN-THE-LOOP ACTIVE</span>
          </span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS STRIP */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
        {[
          { key: "assistant", label: "AI Assistant", icon: Bot },
          { key: "bi", label: "Business Intelligence", icon: TrendingUp },
          { key: "agents", label: "Specialist Agents", icon: Users },
          { key: "copilot", label: "Task Copilot", icon: CheckSquare },
          { key: "support", label: "Support Intelligence", icon: LifeBuoy },
          { key: "reports", label: "AI Reports", icon: FileText },
          { key: "recommendations", label: "Recommendations", icon: Sparkles },
          { key: "activity", label: "AI Activity Log", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-900/30"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================
          TAB 1: AI COMMAND ASSISTANT (CONVERSATIONAL CHAT)
      ======================================================================== */}
      {activeTab === "assistant" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Chat Stream */}
          <div className="lg:col-span-8 bg-[#0E1118] border border-white/10 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-800/40 text-purple-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">RICOZ Command Assistant</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Grounded strictly in live PostgreSQL records</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setChatMessages([
                      {
                        id: `rst_${Date.now()}`,
                        sender: "assistant",
                        text: "Conversation reset. All context cleared. Ask me any operational or business question.",
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        source: "heuristic",
                        suggestedFollowUps: [
                          "How many users registered this month?",
                          "How many Talent and Company accounts exist?",
                          "What are the biggest operational issues?",
                        ],
                      },
                    ])
                  }
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>New Chat</span>
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-500">
                    <span>{msg.sender === "user" ? "Administrator" : "RICOZ Assistant"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-800/30 text-purple-400 text-[9px] uppercase font-bold">
                        {msg.source}
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs font-sans leading-relaxed shadow-sm relative group ${
                      msg.sender === "user"
                        ? "bg-purple-600 text-white font-medium rounded-tr-none"
                        : "bg-[#141824] border border-white/10 text-slate-200 rounded-tl-none whitespace-pre-wrap"
                    }`}
                  >
                    <div>{msg.text}</div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 transition-all"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Follow-up suggestion pills */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.suggestedFollowUps.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendQuery(prompt)}
                          className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-purple-900/30 border border-white/10 hover:border-purple-600 text-[10px] font-mono text-slate-300 hover:text-white transition-all text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#141824] border border-white/10 max-w-xs text-xs font-mono text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Querying InsForge database records...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-black/30 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Ask any business question (e.g., 'How many users registered this month?')..."
                  className="flex-1 bg-[#141824] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !queryInput.trim()}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Quick Queries & Telemetry Scope */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 shadow-lg space-y-3">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Suggested Business Queries</span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click any prompt to run pre-compiled controlled SQL analytics against live database tables:
              </p>

              <div className="space-y-1.5">
                {[
                  "How many users registered this month?",
                  "How many Talent and Company accounts exist?",
                  "Which companies have the most opportunities?",
                  "Which opportunities receive the most applications?",
                  "How many applications are pending?",
                  "Which opportunities are inactive?",
                  "Summarize the last seven days.",
                  "What are the biggest operational issues?",
                  "Which areas require administrator attention?",
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(q)}
                    className="w-full text-left p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/40 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-purple-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 shadow-lg space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-white font-bold">Query Safety Rules</span>
                <span className="text-emerald-400 text-[10px]">VERIFIED</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                • Zero arbitrary SQL generation. All queries execute through strictly parameterized backend controllers.
              </p>
              <p className="text-[11px] leading-relaxed">
                • Rate limit: 30 queries per minute per administrator session.
              </p>
              <p className="text-[11px] leading-relaxed">
                • Factual observations are isolated from interpretations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 2: AI BUSINESS INTELLIGENCE
      ======================================================================== */}
      {activeTab === "bi" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0E1118] border border-white/10">
            <div>
              <h2 className="text-base font-bold text-white font-sans">Platform Business Intelligence & Growth</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates registration trends, marketplace liquidity ratios, application funnel, and deliverable health.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs font-mono">
                {(["7d", "30d", "90d"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setBiRange(r);
                      loadBI(r);
                    }}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                      biRange === r ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={() => loadBI(biRange)}
                disabled={biLoading}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors"
                title="Refresh Intelligence"
              >
                <RefreshCw className={`w-4 h-4 ${biLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {biLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Computing real-time business insights from PostgreSQL...</p>
            </div>
          ) : biData?.insights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {biData.insights.map((insight: any) => (
                <div
                  key={insight.id}
                  className="p-5 rounded-2xl bg-[#0E1118] border border-white/10 hover:border-purple-500/30 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/5 uppercase">
                        {insight.dateRange}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                          insight.importance === "critical"
                            ? "bg-red-950/80 text-red-400 border-red-800/40"
                            : insight.importance === "high"
                            ? "bg-amber-950/80 text-amber-400 border-amber-800/40"
                            : "bg-purple-950/80 text-purple-400 border-purple-800/40"
                        }`}
                      >
                        {insight.importance} Priority
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-sans">{insight.title}</h3>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{insight.explanation}</p>

                    {/* Supporting Metrics */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      {Object.entries(insight.supportingMetrics).map(([k, v]: any) => (
                        <div key={k}>
                          <span className="text-[10px] text-slate-500 block capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                          <span className="text-white font-bold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-slate-400 truncate max-w-[220px]">
                      {insight.suggestedAction}
                    </span>
                    <Link
                      href={insight.relatedPage}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold shrink-0"
                    >
                      <span>Take Action &rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No business intelligence records computed yet. Click refresh to query database.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          TAB 3: SPECIALIST AI AGENTS (5 LOGICAL AGENTS)
      ======================================================================== */}
      {activeTab === "agents" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Agent Selection Cards */}
          <div className="lg:col-span-5 space-y-3">
            {[
              {
                id: "operations_analyst",
                name: "1. Operations Analyst",
                purpose: "Reviews operational throughput, overdue deliverables, and critical administrative priorities.",
                icon: Layers,
              },
              {
                id: "technical_assistant",
                name: "2. Technical Assistant",
                purpose: "Assesses system stability and summarizes error audit logs without exposing credentials.",
                icon: Cpu,
              },
              {
                id: "bi_analyst",
                name: "3. Business Intelligence Analyst",
                purpose: "Analyzes registration growth, talent/company ratios, and project conversion velocity.",
                icon: TrendingUp,
              },
              {
                id: "support_specialist",
                name: "4. Support Specialist",
                purpose: "Classifies tickets, drafts brand-aligned responses, and detects repeated inquiries.",
                icon: LifeBuoy,
              },
              {
                id: "quality_verification",
                name: "5. Quality & Verification Assistant",
                purpose: "Audits unverified specialist and company profiles against completeness criteria.",
                icon: ShieldCheck,
              },
            ].map((agent) => {
              const Icon = agent.icon;
              const isSelected = selectedAgent === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => handleRunAgent(agent.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-950/40 border-purple-600 shadow-lg shadow-purple-900/20"
                      : "bg-[#0E1118] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-purple-400" : "text-slate-400"}`} />
                      <h4 className="text-xs font-bold text-white font-mono">{agent.name}</h4>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-bold uppercase">
                      Configured
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{agent.purpose}</p>
                </div>
              );
            })}
          </div>

          {/* Agent Results Console */}
          <div className="lg:col-span-7 bg-[#0E1118] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase">
                  Specialist Execution Console
                </h3>
              </div>
              <button
                onClick={() => handleRunAgent(selectedAgent)}
                disabled={agentLoading}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${agentLoading ? "animate-spin" : ""}`} />
                <span>{agentLoading ? "Executing..." : "Run Agent"}</span>
              </button>
            </div>

            {agentLoading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Agent executing controlled analysis against live tables...</p>
              </div>
            ) : agentResult ? (
              <div className="space-y-4">
                <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto bg-black/40 p-4 rounded-xl border border-white/5">
                  {JSON.stringify(agentResult, null, 2)}
                </pre>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
                  <span>Zero Hallucination Guarantee</span>
                  <span>Human confirmation required for administrative actions</span>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center space-y-2">
                <Bot className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-500">
                  Select a specialist agent from the left and click Run Agent.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 4: TASK COPILOT
      ======================================================================== */}
      {activeTab === "copilot" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Input Parameters */}
          <div className="lg:col-span-5 bg-[#0E1118] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-white font-sans">Task Copilot Workspace</h3>
              <p className="text-xs text-slate-400 mt-1">
                Breaks down complex operational tasks into objectives, subtask checklists, and blocker mitigations.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={copilotTitle}
                  onChange={(e) => setCopilotTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Task Scope & Description</label>
                <textarea
                  rows={3}
                  value={copilotDesc}
                  onChange={(e) => setCopilotDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Priority</label>
                  <select
                    value={copilotPriority}
                    onChange={(e) => setCopilotPriority(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0A0D14] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Active Blocker (Optional)</label>
                  <input
                    type="text"
                    value={copilotBlocker}
                    onChange={(e) => setCopilotBlocker(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRunCopilot}
                  disabled={copilotLoading || !copilotTitle}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${copilotLoading ? "animate-spin" : ""}`} />
                  <span>{copilotLoading ? "Synthesizing..." : "Generate Task Breakdown"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown Output */}
          <div className="lg:col-span-7 bg-[#0E1118] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase">Copilot Output</h3>
              </div>
              {copilotResult && (
                <button
                  onClick={() => handleCopy(JSON.stringify(copilotResult, null, 2), "copilot_out")}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  {copiedId === "copilot_out" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "copilot_out" ? "Copied" : "Copy Breakdown"}</span>
                </button>
              )}
            </div>

            {copilotLoading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Synthesizing task breakdown and dependency map...</p>
              </div>
            ) : copilotResult ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Primary Objective</span>
                  <div className="text-white font-sans text-xs">{copilotResult.mainObjective}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase">Evaluated Complexity</span>
                    <div className="text-purple-400 font-bold uppercase mt-0.5">{copilotResult.estimatedComplexity || "Moderate"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase">Estimated Effort</span>
                    <div className="text-amber-400 font-bold mt-0.5">{copilotResult.estimatedHoursNotice || "Estimate only"}</div>
                  </div>
                </div>

                {copilotResult.subtasks && (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase">Actionable Subtasks Checklist</span>
                    <ul className="space-y-1.5">
                      {copilotResult.subtasks.map((st: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300 font-sans text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-white/5">
                  <span>AI suggestions require administrator approval before applying to database.</span>
                  <Link href="/admin/tasks" className="text-purple-400 hover:text-white font-bold">
                    Open Kanban &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center space-y-2">
                <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-500">
                  Configure task parameters on the left and click Generate Task Breakdown.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 5: SUPPORT INTELLIGENCE
      ======================================================================== */}
      {activeTab === "support" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#0E1118] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-white font-sans">Support Ticket Intelligence</h3>
              <p className="text-xs text-slate-400 mt-1">
                Classifies complaints, evaluates SLA urgency, drafts brand responses, and identifies repeated disputes.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Ticket Subject</label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Issue Details</label>
                <textarea
                  rows={4}
                  value={supportDesc}
                  onChange={(e) => setSupportDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleRunSupport}
                disabled={supportLoading || !supportSubject}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${supportLoading ? "animate-spin" : ""}`} />
                <span>{supportLoading ? "Evaluating..." : "Evaluate & Draft Response"}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0E1118] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase">Triage Assessment</h3>
              </div>
              {supportResult?.draftResponse && (
                <button
                  onClick={() => handleCopy(supportResult.draftResponse, "draft_resp")}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  {copiedId === "draft_resp" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "draft_resp" ? "Copied" : "Copy Draft Response"}</span>
                </button>
              )}
            </div>

            {supportLoading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Classifying ticket and composing professional response...</p>
              </div>
            ) : supportResult ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase">Suggested Category</span>
                    <div className="text-white font-bold uppercase mt-0.5">{supportResult.evaluatedCategory}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase">Suggested Priority</span>
                    <div className="text-amber-400 font-bold uppercase mt-0.5">{supportResult.suggestedPriority}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase">Recommended Next Action</span>
                  <p className="text-slate-300 font-sans text-xs">{supportResult.recommendedNextAction}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-purple-400 uppercase font-bold">Draft Response (Requires Human Review)</span>
                    <span className="text-[9px] text-slate-500">Never automatically sent to users</span>
                  </div>
                  <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                    {supportResult.draftResponse}
                  </pre>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-white/5">
                  <span>Draft response prepared for human administrator review</span>
                  <Link href="/admin/support" className="text-purple-400 hover:text-white font-bold">
                    Open Support & SLA &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center space-y-2">
                <LifeBuoy className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-500">
                  Enter ticket details on the left and click Evaluate & Draft Response.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================
          TAB 6: AI REPORTS GENERATOR
      ======================================================================== */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0E1118] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white font-sans">Automated Operational Intelligence Reports</h3>
              <p className="text-xs text-slate-400">
                Pulls live metrics across PostgreSQL tables. Exportable as Markdown or CSV underlying dataset.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0A0D14] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none"
              >
                <option value="daily_operations">1. Daily Operations (24h)</option>
                <option value="weekly_platform">2. Weekly Platform Performance</option>
                <option value="monthly_business">3. Monthly Business Intelligence</option>
              </select>

              <select
                value={reportRange}
                onChange={(e) => setReportRange(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0A0D14] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>

              <button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reportLoading ? "animate-spin" : ""}`} />
                <span>{reportLoading ? "Generating..." : "Generate Live Report"}</span>
              </button>
            </div>
          </div>

          {reportLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Compiling multi-table platform report from PostgreSQL...</p>
            </div>
          ) : reportResult ? (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white font-sans">{reportResult.title}</h2>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                    <span>Generated: {new Date(reportResult.generatedAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>Data Source: InsForge PostgreSQL</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(reportResult.content, "report_content")}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    {copiedId === "report_content" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "report_content" ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadMarkdown(reportResult.content, reportResult.reportType)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .md</span>
                  </button>

                  {reportResult.csvData && reportResult.csvData.length > 0 && (
                    <button
                      onClick={() => handleDownloadCsv(reportResult.csvData, `${reportResult.reportType}_data`)}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-xs font-mono text-purple-300 border border-purple-800/40 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-5 max-h-[500px] overflow-y-auto">
                <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {reportResult.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono text-xs border border-white/5 rounded-2xl bg-[#0E1118]">
              Select a report type above and click Generate Live Report to pull PostgreSQL data.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          TAB 7: AUTOMATION SUGGESTIONS
      ======================================================================== */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white font-sans">AI Automation & Triage Suggestions</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Surfaces actionable platform bottlenecks requiring administrative review. Zero automated destructive actions.
              </p>
            </div>
            <button
              onClick={loadRecommendations}
              disabled={recLoading}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors"
              title="Re-scan database"
            >
              <RefreshCw className={`w-4 h-4 ${recLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {recLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Scanning active tickets, tasks, and proposals...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-[#0E1118] border border-white/10 hover:border-purple-500/30 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {rec.supportingRecords}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                          rec.importance === "critical"
                            ? "bg-red-950/80 text-red-400 border-red-800/40"
                            : rec.importance === "high"
                            ? "bg-amber-950/80 text-amber-400 border-amber-800/40"
                            : "bg-purple-950/80 text-purple-400 border-purple-800/40"
                        }`}
                      >
                        {rec.importance}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-sans">{rec.title}</h3>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{rec.reason}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {rec.suggestedAction}
                    </span>
                    <Link
                      href={rec.relatedPage}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold shrink-0"
                    >
                      <span>{rec.pageLabel || "Resolve"} &rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-mono text-xs border border-white/5 rounded-2xl bg-[#0E1118]">
              No active bottlenecks detected. All operational queues are within standard SLA thresholds.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          TAB 8: AI USAGE & ACTIVITY HISTORY
      ======================================================================== */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white font-sans">AI Intelligence Usage & Execution History</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracks invocation timestamps, latency, feature category, and execution status.
              </p>
            </div>
            <button
              onClick={loadUsageHistory}
              disabled={usageLoading}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors"
              title="Refresh log"
            >
              <RefreshCw className={`w-4 h-4 ${usageLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {usageLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading AI usage log...</p>
            </div>
          ) : usageHistory.length > 0 ? (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black/30 border-b border-white/10 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Feature</th>
                      <th className="p-3.5">Provider</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Latency</th>
                      <th className="p-3.5">Query Snippet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {usageHistory.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 text-slate-400">
                          {new Date(item.created_at || item.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="p-3.5 font-bold text-white">{item.feature_used || item.featureUsed}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/30 text-purple-300 uppercase text-[10px]">
                            {item.provider}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-emerald-400 font-bold uppercase text-[10px]">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {item.latency_ms ? `${item.latency_ms}ms` : item.latencyMs ? `${item.latencyMs}ms` : "-"}
                        </td>
                        <td className="p-3.5 text-slate-400 max-w-xs truncate">
                          {item.prompt_summary || item.promptSummary || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono text-xs border border-white/5 rounded-2xl bg-[#0E1118]">
              No AI usage events logged yet. Ask questions in the Assistant tab to generate telemetry.
            </div>
          )}
        </div>
      )}

      {/* SETUP GUIDE MODAL */}
      {providerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-sans">Configuring Live Generative AI</h3>
              </div>
              <button
                onClick={() => setProviderModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
              <p>
                RICOZ currently runs on its built-in <strong>Deterministic Operations Intelligence Engine</strong>, which queries live records directly from InsForge PostgreSQL without hallucinations.
              </p>
              <p>
                To enable multimodal generative reasoning via Google Gemini, set this variable in your server environment:
              </p>
              <pre className="bg-black/50 p-3 rounded-xl border border-white/10 text-emerald-400 font-mono text-xs">
                GEMINI_API_KEY=your_gemini_api_key_here
              </pre>
              <p className="text-[11px] text-slate-400 font-mono">
                Alternatively, set <code className="text-purple-300">OPENROUTER_API_KEY</code> for InsForge OpenRouter model routing.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setProviderModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-bold"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
