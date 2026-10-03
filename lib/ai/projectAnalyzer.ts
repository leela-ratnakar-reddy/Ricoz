import {
  ProjectRequirements,
  RefinementChangeSummary,
  InferredRequirementWithConfidence
} from "@/types/talent";
import { extractProjectRequirements } from "@/lib/talentMatching";
import { RICOZ_19_ROLES, buildBriefAnalysisPrompt } from "./prompts";
import { callGeminiAPI } from "./aiClient";
import {
  PROJECT_INTENTS,
  BRAND_MATURITY_LEVELS,
  classifyIndustryFromBrief
} from "./creativeKnowledge";

export interface AnalysisResponse {
  requirements: ProjectRequirements;
  source: "ai" | "fallback";
  error?: string;
}

/**
 * Runtime sanitizer and validator for AI-generated project requirements (V3.1).
 * Ensures strict adherence to 19 RICOZ roles, dynamic team sizing,
 * primary vs talent matching taxonomy separation, and inferred requirement confidence.
 */
function validateAndNormalizeAIRequirements(
  raw: any,
  originalBrief: string
): ProjectRequirements {
  const validRolesSet = new Set<string>(RICOZ_19_ROLES);
  const domainClass = classifyIndustryFromBrief(originalBrief);

  // 1. Determine Complexity & Dynamic Sizing
  let complexity: "Simple" | "Moderate" | "Complex" | "Enterprise" = "Moderate";
  const rawComplexity = typeof raw.complexity === "string" ? raw.complexity.trim() : "";
  if (["Simple", "Focused"].includes(rawComplexity)) {
    complexity = "Simple";
  } else if (["Moderate", "Medium"].includes(rawComplexity)) {
    complexity = "Moderate";
  } else if (["Complex", "High"].includes(rawComplexity)) {
    complexity = "Complex";
  } else if (rawComplexity === "Enterprise") {
    complexity = "Enterprise";
  } else {
    // Infer complexity from brief scope if not specified
    const wordCount = originalBrief.split(/\s+/).length;
    if (
      (originalBrief.toLowerCase().includes("logo") || originalBrief.toLowerCase().includes("wordmark")) &&
      !originalBrief.toLowerCase().includes("packaging") &&
      !originalBrief.toLowerCase().includes("website") &&
      !originalBrief.toLowerCase().includes("campaign") &&
      wordCount < 20
    ) {
      complexity = "Simple";
    } else if (originalBrief.toLowerCase().includes("enterprise") || originalBrief.toLowerCase().includes("global")) {
      complexity = "Enterprise";
    } else if (originalBrief.toLowerCase().includes("rebrand") || originalBrief.toLowerCase().includes("campaign")) {
      complexity = "Complex";
    }
  }

  const maxRolesForComplexity =
    complexity === "Simple" ? 2 : complexity === "Moderate" ? 3 : 5;
  const minRolesForComplexity = complexity === "Simple" ? 1 : 2;

  // 2. Roles Whitelist Validation
  const rawRoles: string[] = Array.isArray(raw.requiredRoles) ? raw.requiredRoles : [];
  const sanitizedRoles = rawRoles.filter((r) => typeof r === "string" && validRolesSet.has(r.trim()));

  // Dynamic complement up to complexity max
  const fallbackComplementary = [
    "Creative Director",
    "Brand Identity Designer",
    "Brand Strategist",
    "UI/UX Designer",
    "Motion Designer",
    "Art Director",
    "Packaging Designer",
    "Web Designer"
  ];

  if (sanitizedRoles.length < minRolesForComplexity) {
    for (const comp of fallbackComplementary) {
      if (sanitizedRoles.length >= minRolesForComplexity) break;
      if (!sanitizedRoles.includes(comp)) {
        sanitizedRoles.push(comp);
      }
    }
  }

  // Cap roles according to complexity target
  const requiredRoles = sanitizedRoles.slice(0, maxRolesForComplexity);

  // Optional roles
  const rawOptional: string[] = Array.isArray(raw.optionalRoles) ? raw.optionalRoles : [];
  const sanitizedOptional = rawOptional
    .filter((r) => typeof r === "string" && validRolesSet.has(r.trim()) && !requiredRoles.includes(r.trim()))
    .slice(0, complexity === "Enterprise" ? 3 : 2);

  // 3. Validate Industry Separation (Actual Business vs Talent Matching)
  let primaryIndustry = domainClass.primaryIndustry;
  if (typeof raw.primaryIndustry === "string" && raw.primaryIndustry.trim().length > 0) {
    primaryIndustry = raw.primaryIndustry.trim();
  } else if (typeof raw.industry === "string" && raw.industry.trim().length > 0 && raw.industry !== "Creative & Consumer") {
    primaryIndustry = raw.industry.trim();
  } else if (Array.isArray(raw.industry) && raw.industry.length > 0 && raw.industry[0] !== "Creative & Consumer") {
    primaryIndustry = raw.industry[0];
  }

  const subIndustry = typeof raw.subIndustry === "string" && raw.subIndustry.trim().length > 0
    ? raw.subIndustry.trim()
    : domainClass.subIndustry;

  let secondaryIndustries: string[] = domainClass.secondaryIndustries;
  if (Array.isArray(raw.secondaryIndustries) && raw.secondaryIndustries.length > 0) {
    secondaryIndustries = raw.secondaryIndustries.filter((i: any) => typeof i === "string" && i.trim().length > 0);
  }

  let talentMatchingCategories: string[] = domainClass.talentMatchingCategories;
  if (Array.isArray(raw.talentMatchingCategories) && raw.talentMatchingCategories.length > 0) {
    talentMatchingCategories = raw.talentMatchingCategories.filter((c: any) => typeof c === "string" && c.trim().length > 0);
  }

  const industryCategoryType =
    raw.industryCategoryType === "specialized" || raw.industryCategoryType === "cross-domain" || raw.industryCategoryType === "domain"
      ? raw.industryCategoryType
      : domainClass.industryCategoryType;

  const industryConfidence =
    typeof raw.industryConfidence === "number" && raw.industryConfidence > 0
      ? Math.min(100, Math.max(10, Math.round(raw.industryConfidence)))
      : domainClass.industryConfidence;

  const industryEvidence = Array.isArray(raw.industryEvidence) && raw.industryEvidence.length > 0
    ? raw.industryEvidence.filter((e: any) => typeof e === "string")
    : domainClass.industryEvidence;

  // 4. Project Types & Intent
  let projectTypesList: string[] = ["Full Brand Identity"];
  if (Array.isArray(raw.projectTypes) && raw.projectTypes.length > 0) {
    projectTypesList = raw.projectTypes.filter((pt: any) => typeof pt === "string" && pt.trim().length > 0);
  }

  let projectIntent: string | undefined = undefined;
  if (typeof raw.projectIntent === "string" && raw.projectIntent.trim().length > 0) {
    const matchedIntent = PROJECT_INTENTS.find((i) => i.toLowerCase() === raw.projectIntent.trim().toLowerCase());
    projectIntent = matchedIntent || raw.projectIntent.trim();
  }

  let brandMaturity: string | undefined = undefined;
  if (typeof raw.brandMaturity === "string" && raw.brandMaturity.trim().length > 0) {
    const matchedMaturity = BRAND_MATURITY_LEVELS.find((m) => m.toLowerCase() === raw.brandMaturity.trim().toLowerCase());
    brandMaturity = matchedMaturity || raw.brandMaturity.trim();
  }

  // 4. Goals & Narratives
  const businessGoal = typeof raw.businessGoal === "string" ? raw.businessGoal.trim() : undefined;
  const creativeGoal = typeof raw.creativeGoal === "string" ? raw.creativeGoal.trim() : undefined;
  const currentBrandState = typeof raw.currentBrandState === "string" ? raw.currentBrandState.trim() : undefined;
  const desiredBrandState = typeof raw.desiredBrandState === "string" ? raw.desiredBrandState.trim() : undefined;

  // 5. Skills & Deliverables
  const requiredSkills: string[] = Array.isArray(raw.requiredSkills)
    ? raw.requiredSkills.filter((s: any) => typeof s === "string")
    : ["Visual Identity Systems", "Strategic Creative Direction"];

  const requiredSpecializations: string[] = Array.isArray(raw.requiredSpecializations)
    ? raw.requiredSpecializations.filter((sp: any) => typeof sp === "string")
    : [];

  const deliverables: string[] = Array.isArray(raw.deliverables)
    ? raw.deliverables.filter((d: any) => typeof d === "string")
    : ["Visual Identity System", "Digital Platform Experience", "Launch Assets"];

  // 6. Audience & Psychographics
  let audience: string | undefined;
  if (Array.isArray(raw.audience) && raw.audience.length > 0) {
    audience = raw.audience.join(", ");
  } else if (typeof raw.audience === "string") {
    audience = raw.audience;
  } else if (typeof raw.targetAudience === "string") {
    audience = raw.targetAudience;
  }

  const audienceCharacteristics: string[] = Array.isArray(raw.audienceCharacteristics)
    ? raw.audienceCharacteristics.filter((a: any) => typeof a === "string")
    : [];

  // 7. Explicit vs Inferred Requirements
  const explicitRequirements: string[] = Array.isArray(raw.explicitRequirements)
    ? raw.explicitRequirements.filter((r: any) => typeof r === "string")
    : [];

  const inferredRequirements: string[] = Array.isArray(raw.inferredRequirements)
    ? raw.inferredRequirements.filter((r: any) => typeof r === "string")
    : [];

  // Inferred Requirements with Confidence
  const inferredRequirementsWithConfidence: InferredRequirementWithConfidence[] = [];
  if (Array.isArray(raw.inferredRequirementsWithConfidence) && raw.inferredRequirementsWithConfidence.length > 0) {
    for (const item of raw.inferredRequirementsWithConfidence) {
      if (item && typeof item === "object" && typeof item.requirement === "string") {
        inferredRequirementsWithConfidence.push({
          requirement: item.requirement.trim(),
          confidence: typeof item.confidence === "number" ? Math.min(100, Math.max(10, Math.round(item.confidence))) : 88,
          reason: typeof item.reason === "string" ? item.reason.trim() : "Strategically inferred to achieve client business goals."
        });
      }
    }
  } else if (inferredRequirements.length > 0) {
    for (const req of inferredRequirements) {
      inferredRequirementsWithConfidence.push({
        requirement: req,
        confidence: 85,
        reason: `Strategically necessary for ${primaryIndustry} initiatives to ensure market differentiation.`
      });
    }
  }

  // 8. Missing Information & Clarification
  const missingInformation: string[] = Array.isArray(raw.missingInformation)
    ? raw.missingInformation.filter((m: any) => typeof m === "string").slice(0, 3)
    : [];

  const clarificationQuestions: string[] = Array.isArray(raw.clarificationQuestions)
    ? raw.clarificationQuestions.filter((q: any) => typeof q === "string").slice(0, 3)
    : [];

  // 9. Confidence Model
  const isVague = Boolean(raw.isVague) || missingInformation.length >= 2;
  let analysisConfidence = 90;
  if (typeof raw.analysisConfidence === "number") {
    analysisConfidence = Math.min(100, Math.max(15, Math.round(raw.analysisConfidence)));
  } else if (isVague) {
    analysisConfidence = 45;
  }

  // 10. Summary & Understanding
  const projectSummary =
    typeof raw.projectSummary === "string" && raw.projectSummary.trim().length > 0
      ? raw.projectSummary.trim()
      : `RICOZ AI project analysis for ${projectTypesList[0]} in the ${primaryIndustry} space.`;

  const projectUnderstanding =
    typeof raw.projectUnderstanding === "string" && raw.projectUnderstanding.trim().length > 0
      ? raw.projectUnderstanding.trim()
      : `Strategic engagement focused on ${businessGoal || projectTypesList[0]} within ${primaryIndustry}.`;

  const projectScale =
    typeof raw.projectScale === "string" && raw.projectScale.trim().length > 0
      ? raw.projectScale.trim()
      : "Full Brand Launch";

  const clarificationMessage =
    typeof raw.clarificationMessage === "string"
      ? raw.clarificationMessage
      : clarificationQuestions.length > 0
      ? clarificationQuestions.join(" ")
      : undefined;

  const refinementNotes =
    typeof raw.refinementNotes === "string" ? raw.refinementNotes : undefined;

  let changeSummary: RefinementChangeSummary | undefined = undefined;
  if (raw.changeSummary && typeof raw.changeSummary === "object") {
    changeSummary = {
      added: Array.isArray(raw.changeSummary.added) ? raw.changeSummary.added : [],
      prioritized: Array.isArray(raw.changeSummary.prioritized) ? raw.changeSummary.prioritized : [],
      reduced: Array.isArray(raw.changeSummary.reduced) ? raw.changeSummary.reduced : [],
      talentMatchesChanged: typeof raw.changeSummary.talentMatchesChanged === "number" ? raw.changeSummary.talentMatchesChanged : 2,
      summaryText: typeof raw.changeSummary.summaryText === "string" ? raw.changeSummary.summaryText : "Applied refinement adjustments to project scope."
    };
  }

  return {
    projectSummary,
    projectUnderstanding,
    businessGoal,
    creativeGoal,
    projectIntent,
    brandMaturity,
    industry: primaryIndustry,
    primaryIndustry,
    subIndustry,
    secondaryIndustries,
    industryCategoryType,
    industryConfidence,
    industryEvidence,
    talentMatchingCategories,
    industries: [primaryIndustry, ...secondaryIndustries],
    projectTypes: projectTypesList,
    requiredSkills,
    requiredSpecializations,
    requiredRoles,
    optionalRoles: sanitizedOptional,
    deliverables,
    audience,
    audienceCharacteristics,
    currentBrandState,
    desiredBrandState,
    brandAttributes: Array.isArray(raw.brandAttributes) ? raw.brandAttributes : undefined,
    creativeDirection: Array.isArray(raw.creativeDirection) ? raw.creativeDirection : undefined,
    digitalRequirements: Array.isArray(raw.digitalRequirements) ? raw.digitalRequirements : undefined,
    campaignRequirements: Array.isArray(raw.campaignRequirements) ? raw.campaignRequirements : undefined,
    researchRequirements: Array.isArray(raw.researchRequirements) ? raw.researchRequirements : undefined,
    productionRequirements: Array.isArray(raw.productionRequirements) ? raw.productionRequirements : undefined,
    projectScale,
    complexity,
    timeline: typeof raw.timeline === "string" ? raw.timeline : undefined,
    budgetSignals: typeof raw.budgetSignals === "string" ? raw.budgetSignals : undefined,
    constraints: Array.isArray(raw.constraints) ? raw.constraints : undefined,
    explicitRequirements,
    inferredRequirements,
    inferredRequirementsWithConfidence,
    missingInformation,
    clarificationQuestions,
    confidence: analysisConfidence / 100,
    analysisConfidence,
    isVague,
    clarificationMessage,
    refinementNotes,
    changeSummary
  };
}

/**
 * Main AI Project Analyzer V3.0
 * Calls Gemini if configured, otherwise falls back gracefully to the deterministic engine.
 */
export async function analyzeProjectWithAI(
  brief: string,
  refinementContext?: string,
  previousRequirements?: ProjectRequirements
): Promise<AnalysisResponse> {
  const prompt = buildBriefAnalysisPrompt(
    brief,
    previousRequirements as Record<string, unknown> | undefined,
    refinementContext
  );

  const aiResult = await callGeminiAPI(prompt);

  if (aiResult.ok && aiResult.data) {
    try {
      const parsed = JSON.parse(aiResult.data);
      const validated = validateAndNormalizeAIRequirements(parsed, brief);
      return {
        requirements: validated,
        source: "ai"
      };
    } catch (parseError) {
      console.warn("Failed to parse AI JSON response, switching to deterministic fallback:", parseError);
    }
  }

  // Graceful Fallback to V3 Enhanced Deterministic Engine
  const fallbackReq = extractProjectRequirements(brief);

  // If refinement context was provided in fallback mode, apply deterministic refinement adjustment
  if (refinementContext) {
    const refLower = refinementContext.toLowerCase();
    const updatedRoles = [...fallbackReq.requiredRoles];
    const addedList: string[] = [];
    const prioritizedList: string[] = [];
    const reducedList: string[] = [];

    if (refLower.includes("luxury") || refLower.includes("premium")) {
      fallbackReq.industry = "Luxury & Fashion";
      fallbackReq.creativeDirection = ["Luxury", "Refined", "High-End"];
      if (!updatedRoles.includes("Art Director")) {
        updatedRoles.unshift("Art Director");
      }
      prioritizedList.push("↑ Art Direction & Editorial Craft");
      addedList.push("+ Luxury & Fashion domain positioning");
    }

    if (refLower.includes("packaging")) {
      if (!updatedRoles.includes("Packaging Designer")) {
        updatedRoles.splice(2, 0, "Packaging Designer");
      }
      if (!fallbackReq.projectTypes.includes("Packaging Suite")) {
        fallbackReq.projectTypes.unshift("Packaging Suite");
      }
      addedList.push("+ Structural Packaging Suite");
      prioritizedList.push("↑ Packaging Designer");
    }

    if (refLower.includes("remove motion") || refLower.includes("no motion")) {
      const mIdx = updatedRoles.indexOf("Motion Designer");
      if (mIdx !== -1) {
        updatedRoles.splice(mIdx, 1);
        reducedList.push("↓ Motion Designer removed");
      }
    }

    if (refLower.includes("digital") || refLower.includes("ux") || refLower.includes("ecommerce")) {
      if (!updatedRoles.includes("UI/UX Designer")) {
        updatedRoles.splice(2, 0, "UI/UX Designer");
      }
      prioritizedList.push("↑ Digital Product & Funnel UX");
    }

    if (refLower.includes("smaller team") || refLower.includes("lean")) {
      fallbackReq.complexity = "Focused";
      fallbackReq.projectScale = "Focused Early Venture Foundation";
      reducedList.push("↓ Lean squad structure (consolidated scope)");
    }

    // Deduplicate and constrain to max 5
    fallbackReq.requiredRoles = Array.from(new Set(updatedRoles)).slice(0, 5);

    const changeSummary: RefinementChangeSummary = {
      added: addedList.length > 0 ? addedList : [`+ Refinement focus on ${refinementContext}`],
      prioritized: prioritizedList.length > 0 ? prioritizedList : ["↑ Targeted specialty disciplines"],
      reduced: reducedList.length > 0 ? reducedList : ["↓ Deprioritized non-essential scope"],
      talentMatchesChanged: 3,
      summaryText: `Applied refinement: "${refinementContext}". Recalibrated project intent, disciplines, and candidate rankings.`
    };

    fallbackReq.changeSummary = changeSummary;
    fallbackReq.refinementNotes = changeSummary.summaryText;
  }

  return {
    requirements: fallbackReq,
    source: "fallback",
    error: aiResult.error
  };
}
