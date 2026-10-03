/**
 * RICOZ AI V3 - Creative Intelligence Prompts & Domain Knowledge
 * Upgraded from simple keyword matching to deep business goal, creative intent,
 * brand maturity, explicit vs inferred requirements, and discipline orchestration.
 */

import {
  RICOZ_19_ROLES,
  PROJECT_INTENTS,
  BRAND_MATURITY_LEVELS,
  RICOZ_AI_VERSION,
  PROMPT_VERSION
} from "./creativeKnowledge";

export { RICOZ_19_ROLES, type RicozRole } from "./creativeKnowledge";

export const RICOZ_SYSTEM_PROMPT = `You are RICOZ AI (Version ${RICOZ_AI_VERSION}), an elite creative director and agency partner intelligence system.
Your job is not merely keyword extraction; you perform DEEP PROJECT UNDERSTANDING.
You understand what a business is fundamentally trying to achieve and determine the exact creative strategy, deliverables, and practitioner disciplines required to succeed.

CRITICAL DISTINCTIONS & REASONING RULES (V3.1):

1. ACTUAL BUSINESS INDUSTRY vs TARGET AUDIENCE vs TALENT MATCHING CATEGORIES:
   - "primaryIndustry": The actual commercial sector the company belongs to (e.g., "Cybersecurity", "Education Technology", "Manufacturing", "Consumer Electronics", "Non-profit & Conservation", "Fintech", "Luxury Hospitality").
   - "secondaryIndustries": Adjacent sectors or target client industries (e.g. if a cybersecurity firm protects banks, "primaryIndustry" is "Cybersecurity" and "secondaryIndustries" contains "Financial Services").
   - "talentMatchingCategories": The closest matching categories from the 17 talent pool disciplines (e.g. ["Enterprise SaaS", "Developer Infrastructure"]).
   - NEVER classify a B2B service or security firm as "Fintech" simply because its clients are banks or financial institutions!
   - NEVER classify a luxury hotel as pure "Technology" or "SaaS" simply because it needs a booking web platform!
   - NEVER classify a fashion brand as generic "E-commerce" simply because it sells on Shopify!
   - NEVER classify an EdTech, Consumer Electronics, Manufacturing, or Non-profit project as generic "Creative & Consumer"!

2. DYNAMIC SQUAD SIZING & COMPLEXITY:
   - "complexity": "Simple" | "Moderate" | "Complex" | "Enterprise"
   - Simple (1-2 roles): For tightly scoped single tasks (e.g. logo only, single icon design, simple landing page tweak). NEVER assign a 5-person agency squad to a simple logo design!
   - Moderate (2-4 roles): Single deliverable focus (e.g. website redesign, packaging refresh, standalone visual identity).
   - Complex (4-5 roles): Multi-touchpoint initiatives (e.g. brand launch, multi-channel campaign, rebrand with digital platform).
   - Enterprise (4-5 roles + optional): Global rebrands, multi-market enterprise systems, legacy corporate transformations.

3. FACT vs INFERENCE SEPARATION:
   - "explicitRequirements": Items directly requested by the client in the text.
   - "inferredRequirementsWithConfidence": Array of objects: { "requirement": string, "confidence": number (0-100), "reason": string }.
     - "reason" must explicitly link the client's business goal and market context to the creative necessity.
   - DO NOT hallucinate unsupported facts (do not invent client names, revenues, or exact years unless explicitly mentioned).

4. BUSINESS GOAL vs CREATIVE DELIVERABLE:
   - Business Goal: The commercial outcome (e.g., "Attract younger consumers without losing legacy trust", "Increase demo conversion rate").
   - Creative Goal: The aesthetic & brand strategy solution.
   - Deliverables: Tangible design assets.

5. PROJECT INTENT:
   Classify intent into one of: ${PROJECT_INTENTS.join(", ")}.

6. BRAND MATURITY:
   Classify maturity into one of: ${BRAND_MATURITY_LEVELS.join(", ")}.

7. DISCIPLINE ORCHESTRATION (19 Canonical RICOZ Disciplines):
   Whitelist:
   1. Brand Strategist
   2. Creative Director
   3. Brand Identity Designer
   4. Naming & Verbal Identity Specialist
   5. Logo Designer
   6. Visual Designer
   7. Art Director
   8. UI/UX Designer
   9. Web Designer
   10. Motion Designer
   11. 3D & Spatial Designer
   12. Illustrator
   13. Packaging Designer
   14. Brand Photographer
   15. Copywriter
   16. Content Strategist
   17. Consumer Research Specialist
   18. Production & Print Specialist
   19. Brand Guidelines & Design Systems Specialist

8. MISSING INFORMATION & CLARIFICATION:
   - If brief is vague (< 5 words or lacks clarity), set "isVague": true, "analysisConfidence": 35-50%, and provide targeted clarification questions.
   - If brief is clear, "missingInformation" and "clarificationQuestions" should be empty, with confidence 85-98%.

OUTPUT FORMAT:
Return pure, valid JSON matching the exact schema requested without code block ticks outside JSON.`;

export function buildBriefAnalysisPrompt(
  brief: string,
  previousRequirements?: Record<string, unknown>,
  refinementContext?: string
): string {
  if (refinementContext && previousRequirements) {
    return `You are refining an existing creative project in RICOZ AI (${RICOZ_AI_VERSION}).

PREVIOUS PROJECT CONTEXT:
${JSON.stringify(previousRequirements, null, 2)}

USER REFINEMENT INSTRUCTION:
"${refinementContext}"

ORIGINAL BRIEF:
"${brief}"

REFINEMENT PROTOCOL:
- Understand whether the user wants to ADD (e.g. "+ packaging"), REMOVE ("remove 3D"), PRIORITIZE ("focus more on UX"), DE-EMPHASIZE, or CHANGE direction.
- Merge previous context with new instruction. DO NOT discard unrelated aspects of the original project.
- Provide factual "refinementNotes" summary.
- Compute "changeSummary" with lists of "added", "prioritized", "reduced", and estimated match changes.

OUTPUT JSON SCHEMA:
{
  "projectSummary": "Updated 1-2 sentence executive overview",
  "projectUnderstanding": "Detailed updated strategic understanding paragraph",
  "businessGoal": "Refined commercial objective",
  "creativeGoal": "Refined creative ambition",
  "projectIntent": "New Brand | Rebrand | Brand Refresh | Product Launch | Campaign | Digital Transformation | Website Redesign | E-commerce Launch | Market Expansion | Brand Positioning | Packaging Launch | Product Identity | Content System | Visual Campaign | Employer Branding | Brand System Development",
  "brandMaturity": "New / Startup | Early-stage | Growing | Established | Enterprise | Legacy Brand",
  "primaryIndustry": "Real primary business industry",
  "secondaryIndustries": ["Target client or adjacent vertical, e.g. Financial Services"],
  "industryConfidence": 95,
  "industryCategoryType": "domain | specialized | cross-domain",
  "industryEvidence": ["Specific quote or signal from brief"],
  "talentMatchingCategories": ["Closest talent pool category"],
  "subIndustry": "Specific niche sub-industry",
  "projectTypes": ["Primary Project Type"],
  "targetAudience": "Audience demographic description",
  "audienceCharacteristics": ["Characteristic 1", "Characteristic 2"],
  "currentBrandState": "Current brand perception",
  "desiredBrandState": "Target brand perception",
  "requiredRoles": ["Role 1", "Role 2"],
  "optionalRoles": ["Role 3"],
  "requiredSkills": ["Skill 1", "Skill 2"],
  "requiredSpecializations": ["Specialization 1"],
  "deliverables": ["Deliverable 1", "Deliverable 2"],
  "projectScale": "Full Brand Launch | Enterprise Rebrand | High-Impact Launch Campaign | Flagship Digital Experience | Focused Initiative",
  "complexity": "Simple | Moderate | Complex | Enterprise",
  "explicitRequirements": ["Stated directly in brief"],
  "inferredRequirements": ["Inferred requirement string"],
  "inferredRequirementsWithConfidence": [
    {
      "requirement": "Requirement name",
      "confidence": 88,
      "reason": "Strategic explanation"
    }
  ],
  "missingInformation": [],
  "clarificationQuestions": [],
  "analysisConfidence": 95,
  "isVague": false,
  "refinementNotes": "Summary of changes made",
  "changeSummary": {
    "added": ["+ Specific added item"],
    "prioritized": ["↑ Specific prioritized discipline or area"],
    "reduced": ["↓ Specific reduced discipline or area"],
    "talentMatchesChanged": 3,
    "summaryText": "Applied refinement: ..."
  }
}`;
  }

  return `Analyze this creative project brief and extract deep structured intelligence (RICOZ AI V3.1):

PROJECT BRIEF:
"${brief}"

OUTPUT JSON SCHEMA:
{
  "projectSummary": "1-2 sentence executive overview of the project",
  "projectUnderstanding": "Detailed paragraph explaining business context, strategic positioning, and creative goals",
  "businessGoal": "Clear business objective (e.g. Market expansion, Digital conversion improvement, Rejuvenating legacy brand)",
  "creativeGoal": "Creative ambition (e.g. Create a contemporary identity while preserving legacy brand equity)",
  "projectIntent": "New Brand | Rebrand | Brand Refresh | Product Launch | Campaign | Digital Transformation | Website Redesign | E-commerce Launch | Market Expansion | Brand Positioning | Packaging Launch | Product Identity | Content System | Visual Campaign | Employer Branding | Brand System Development",
  "brandMaturity": "New / Startup | Early-stage | Growing | Established | Enterprise | Legacy Brand",
  "primaryIndustry": "Real primary business industry (e.g. Cybersecurity, Education Technology, Manufacturing, Non-profit & Conservation, Fintech, Luxury Hospitality)",
  "secondaryIndustries": ["Target audience or adjacent industry, e.g. Financial Services"],
  "industryConfidence": 95,
  "industryCategoryType": "domain | specialized | cross-domain",
  "industryEvidence": ["Specific clue or phrase from brief"],
  "talentMatchingCategories": ["Closest talent pool category, e.g. Enterprise SaaS, AI & DeepTech"],
  "subIndustry": "Specific niche sub-industry",
  "projectTypes": ["Primary Project Type", "Secondary Project Type"],
  "targetAudience": "Audience demographic and psychographic description",
  "audienceCharacteristics": ["Characteristic 1", "Characteristic 2"],
  "currentBrandState": "Current brand perception or state",
  "desiredBrandState": "Target brand perception or state",
  "requiredRoles": ["Exact role 1", "Exact role 2"],
  "optionalRoles": ["Optional role 1"],
  "requiredSkills": ["Skill 1", "Skill 2"],
  "requiredSpecializations": ["Specialization 1"],
  "deliverables": ["Deliverable 1", "Deliverable 2"],
  "brandAttributes": ["Attribute 1", "Attribute 2"],
  "creativeDirection": ["Style keyword 1", "Style keyword 2"],
  "digitalRequirements": ["Requirement 1"],
  "campaignRequirements": ["Requirement 1"],
  "researchRequirements": ["Requirement 1"],
  "productionRequirements": ["Requirement 1"],
  "projectScale": "Full Brand Launch | Enterprise Rebrand | High-Impact Launch Campaign | Flagship Digital Experience | Focused Initiative",
  "complexity": "Simple | Moderate | Complex | Enterprise",
  "constraints": ["Constraint 1"],
  "explicitRequirements": ["Directly stated requirements from brief"],
  "inferredRequirements": ["Requirements inferred from business goal and creative strategy"],
  "inferredRequirementsWithConfidence": [
    {
      "requirement": "Requirement name",
      "confidence": 88,
      "reason": "Strategic cause-and-effect reason"
    }
  ],
  "missingInformation": ["List of missing critical inputs if incomplete, or empty array if clear"],
  "clarificationQuestions": ["Max 3 targeted clarification questions if incomplete, or empty array if clear"],
  "analysisConfidence": 95,
  "isVague": false,
  "refinementNotes": null,
  "changeSummary": null
}`;
}
