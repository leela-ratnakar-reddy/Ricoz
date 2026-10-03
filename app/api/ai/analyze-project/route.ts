import { NextRequest, NextResponse } from "next/server";
import { analyzeProjectWithAI } from "@/lib/ai/projectAnalyzer";
import { extractProjectRequirements } from "@/lib/talentMatching";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brief, refinementContext, previousRequirements } = body;

    if (!brief || typeof brief !== "string" || brief.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid project brief string is required."
        },
        { status: 400 }
      );
    }

    const result = await analyzeProjectWithAI(
      brief.trim(),
      refinementContext?.trim(),
      previousRequirements
    );

    return NextResponse.json({
      success: true,
      source: result.source,
      requirements: result.requirements,
      error: result.error
    });
  } catch (error: unknown) {
    console.error("Error in /api/ai/analyze-project:", error);

    // Safe fallback so client never gets an unhandled crash
    const fallbackRequirements = extractProjectRequirements("Creative project");
    return NextResponse.json({
      success: true,
      source: "fallback",
      requirements: fallbackRequirements,
      error: error instanceof Error ? error.message : "Unexpected server error"
    });
  }
}
