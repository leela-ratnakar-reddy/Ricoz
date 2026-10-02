"use client";

import React, { useState, useRef } from "react";
import { Sparkles, Cpu } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShortlistDrawer } from "@/components/talent/ShortlistDrawer";
import { analyzeProjectBrief, PROMPT_STARTERS } from "@/lib/talentMatching";
import { ProjectAnalysisResult } from "@/types/talent";
import { HeroPipeline } from "@/components/ai/HeroPipeline";
import { AIProjectInput } from "@/components/ai/AIProjectInput";
import { ProjectAnalysis } from "@/components/ai/ProjectAnalysis";
import { TeamWorkflow } from "@/components/ai/TeamWorkflow";
import { RecommendedTeam } from "@/components/ai/RecommendedTeam";
import { RecommendedTalent } from "@/components/ai/RecommendedTalent";

export default function AIMatchPage() {
  const [brief, setBrief] = useState(PROMPT_STARTERS[0].brief);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProjectAnalysisResult | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = () => {
    if (!brief.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Smooth simulated semantic parsing delay
    setTimeout(() => {
      const result = analyzeProjectBrief(brief);
      setAnalysisResult(result);
      setIsAnalyzing(false);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 700);
  };

  const handleRefineProject = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                <span>AI-POWERED CREATIVE TALENT MATCHING</span>
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
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#141418] border border-accent/30 flex items-center justify-center mx-auto text-accent shadow-[0_0_30px_rgba(184,255,0,0.15)]">
                <Cpu className="w-8 h-8 animate-pulse text-accent" />
              </div>
              <h3 className="text-lg font-bold text-white">
                RICOZ is understanding your project...
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Decomposing scope across 19 creative disciplines & 57 vetted practitioners
              </p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="space-y-16 pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 1. Project Understanding & Structured Requirements */}
              <ProjectAnalysis analysis={analysisResult} />

              {/* 2. Team Architecture Workflow: Why this team? */}
              <TeamWorkflow team={analysisResult.recommendedTeam} />

              {/* 3. The 5-Role Recommended Squad */}
              <RecommendedTeam
                team={analysisResult.recommendedTeam}
                onRefineProject={handleRefineProject}
              />

              {/* 4. Ranked Candidate Pool */}
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
