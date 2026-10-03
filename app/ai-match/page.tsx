"use client";

import React, { useState, useRef } from "react";
import { Sparkles, Cpu } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShortlistDrawer } from "@/components/talent/ShortlistDrawer";
import { analyzeProjectBrief, PROMPT_STARTERS } from "@/lib/talentMatching";
import { ProjectAnalysisResult, ProjectRequirements } from "@/types/talent";
import { HeroPipeline } from "@/components/ai/HeroPipeline";
import { AIProjectInput } from "@/components/ai/AIProjectInput";
import { ProjectAnalysis } from "@/components/ai/ProjectAnalysis";
import { TeamWorkflow } from "@/components/ai/TeamWorkflow";
import { RecommendedTeam } from "@/components/ai/RecommendedTeam";
import { RecommendedTalent } from "@/components/ai/RecommendedTalent";
import { MultiStageLoader } from "@/components/ai/MultiStageLoader";
import { ProjectRefinement } from "@/components/ai/ProjectRefinement";

export default function AIMatchPage() {
  const [brief, setBrief] = useState(PROMPT_STARTERS[0].brief);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<ProjectAnalysisResult | null>(null);
  const [refinementInput, setRefinementInput] = useState("");

  // In-Memory Session Cache (Requirement 35)
  const sessionCacheRef = useRef<Map<string, ProjectAnalysisResult>>(new Map());

  const resultsRef = useRef<HTMLDivElement>(null);
  const refinementRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    const trimmedBrief = brief.trim();
    if (!trimmedBrief) return;

    // Check lightweight session cache
    if (sessionCacheRef.current.has(trimmedBrief)) {
      setIsAnalyzing(true);
      setCurrentStage(1);
      setTimeout(() => setCurrentStage(2), 150);
      setTimeout(() => setCurrentStage(3), 300);
      setTimeout(() => setCurrentStage(4), 450);

      setTimeout(() => {
        const cached = sessionCacheRef.current.get(trimmedBrief)!;
        setAnalysisResult(cached);
        setIsAnalyzing(false);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }, 600);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setCurrentStage(1);

    // Staged visual progression timers
    const timerStage2 = setTimeout(() => setCurrentStage(2), 350);
    const timerStage3 = setTimeout(() => setCurrentStage(3), 750);
    const timerStage4 = setTimeout(() => setCurrentStage(4), 1150);

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      // Call server-side AI API route
      const fetchPromise = fetch("/api/ai/analyze-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmedBrief })
      }).then(async (res) => {
        if (!res.ok) throw new Error("API returned status " + res.status);
        return res.json();
      });

      // Wait for both minimum animation time and API response
      const [, data] = await Promise.all([minDelayPromise, fetchPromise]);

      if (data && data.success && data.requirements) {
        const result = analyzeProjectBrief(trimmedBrief, data.requirements as ProjectRequirements);
        result.source = data.source || "ai";
        sessionCacheRef.current.set(trimmedBrief, result);
        setAnalysisResult(result);
      } else {
        // Fallback to local deterministic matcher
        const fallbackResult = analyzeProjectBrief(trimmedBrief);
        fallbackResult.source = "fallback";
        sessionCacheRef.current.set(trimmedBrief, fallbackResult);
        setAnalysisResult(fallbackResult);
      }
    } catch (err) {
      console.warn("AI Match API failed, utilizing local deterministic matcher:", err);
      await minDelayPromise;
      const fallbackResult = analyzeProjectBrief(trimmedBrief);
      fallbackResult.source = "fallback";
      sessionCacheRef.current.set(trimmedBrief, fallbackResult);
      setAnalysisResult(fallbackResult);
    } finally {
      clearTimeout(timerStage2);
      clearTimeout(timerStage3);
      clearTimeout(timerStage4);
      setIsAnalyzing(false);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleRefine = async (refinementText: string) => {
    if (!refinementText.trim() || isRefining) return;

    setIsRefining(true);

    try {
      const response = await fetch("/api/ai/analyze-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: brief.trim(),
          refinementContext: refinementText.trim(),
          previousRequirements: analysisResult ? {
            projectSummary: analysisResult.projectSummary,
            businessGoal: analysisResult.businessGoal,
            creativeGoal: analysisResult.creativeGoal,
            projectIntent: analysisResult.projectIntent,
            brandMaturity: analysisResult.brandMaturity,
            industry: analysisResult.detectedIndustry,
            subIndustry: analysisResult.subIndustry,
            projectTypes: analysisResult.projectTypes,
            requiredSkills: analysisResult.requiredSkills,
            requiredRoles: analysisResult.requiredRoles,
            optionalRoles: analysisResult.optionalRoles,
            projectScale: analysisResult.projectScale || "Multidisciplinary",
            deliverables: analysisResult.deliverables || [],
            audience: analysisResult.audience,
            creativeDirection: analysisResult.creativeDirection
          } : undefined
        })
      });

      const data = await response.json();

      if (data && data.success && data.requirements) {
        const updated = analyzeProjectBrief(brief, data.requirements as ProjectRequirements);
        updated.source = data.source || "ai";
        updated.refinementNotes = data.requirements.refinementNotes || `Applied refinement: "${refinementText}". Recalibrated disciplines and candidate rankings.`;
        setAnalysisResult(updated);
      } else {
        // Fallback refinement
        const combinedBrief = `${brief}. Special focus for squad: ${refinementText}`;
        const updated = analyzeProjectBrief(combinedBrief);
        updated.source = "fallback";
        updated.refinementNotes = `Applied refinement: "${refinementText}". Re-evaluated candidate alignment.`;
        setAnalysisResult(updated);
      }
    } catch (err) {
      console.warn("Refinement API failed, applying fallback:", err);
      const combinedBrief = `${brief}. Special focus: ${refinementText}`;
      const updated = analyzeProjectBrief(combinedBrief);
      updated.source = "fallback";
      updated.refinementNotes = `Applied adjustment: "${refinementText}". Updated squad recommendations.`;
      setAnalysisResult(updated);
    } finally {
      setIsRefining(false);
      // Smooth scroll back to analysis result
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleRefineProject = () => {
    if (refinementRef.current) {
      refinementRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectClarification = (question: string) => {
    setRefinementInput(`In regards to ${question.toLowerCase().replace(/\?$/, "")}: `);
    if (refinementRef.current) {
      refinementRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand selection:bg-accent selection:text-background">
      {/* Clean Global Navigation */}
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Editorial AI Hero Header */}
        <section className="relative pt-12 pb-8 border-b border-white/5 overflow-hidden bg-background">
          {/* Subtle ambient back glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-gradient-to-b from-accent/10 via-accent/5 to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-accent/15 text-accent border border-accent/25">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RICOZ AI • CREATIVE TALENT MATCHING</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Tell us what you&apos;re <span className="text-accent">building.</span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto font-normal">
                Describe your project, goals and creative needs. RICOZ will identify the right specialists and build a recommended creative team.
              </p>
            </div>

            {/* Visual Process Representation */}
            <HeroPipeline />

            {/* Conversational Input & Prompt Starters */}
            <div className="pt-2">
              <AIProjectInput
                brief={brief}
                onChangeBrief={setBrief}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                hasAnalyzed={Boolean(analysisResult)}
              />
            </div>
          </div>
        </section>

        {/* AI Analysis & Matching Results */}
        <div ref={resultsRef}>
          {isAnalyzing && (
            <div className="px-4">
              <MultiStageLoader currentStage={currentStage} />
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="space-y-16 pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 1. Deep Project Understanding & Structured Requirements */}
              <ProjectAnalysis
                analysis={analysisResult}
                onSelectClarification={handleSelectClarification}
              />

              {/* 2. Interactive Refinement Section */}
              <div ref={refinementRef}>
                <ProjectRefinement
                  onRefine={handleRefine}
                  isRefining={isRefining}
                  initialText={refinementInput}
                />
              </div>

              {/* 3. Team Architecture Workflow: Why this team? */}
              <TeamWorkflow team={analysisResult.recommendedTeam} />

              {/* 4. The 5-Role Recommended Squad */}
              <RecommendedTeam
                team={analysisResult.recommendedTeam}
                onRefineProject={handleRefineProject}
              />

              {/* 5. Ranked Candidate Pool with Evidence */}
              <RecommendedTalent candidates={analysisResult.recommendedTalent} />
            </div>
          )}
        </div>
      </main>

      {/* Floating Shortlist Drawer */}
      <ShortlistDrawer />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
