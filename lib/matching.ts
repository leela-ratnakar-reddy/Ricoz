import { Designer, Project, MatchResult, MatchBreakdown } from "@/types";

/**
 * Deterministically calculates a match score between a rebranding project brief
 * and a senior creative designer based on weighted dimensions:
 * - Skills: 25%
 * - Industry: 20%
 * - Experience: 15%
 * - Style: 15%
 * - Budget: 10%
 * - Availability: 10%
 * - Location/fit: 5%
 */
export function calculateMatch(project: Project, designer: Designer): MatchResult {
  // 1. Skills match (25%)
  // Check overlap between project required services and designer's role/skills
  const requiredRoles = project.requiredServices || [];
  let roleMatch = requiredRoles.includes(designer.role) ? 1.0 : 0.6;
  
  // Count matching skills
  const designerSkillsLower = (designer.skills || []).map((s) => s.toLowerCase());
  const projectGoals = (project.rebrandingGoals || []).map((g) => g.toLowerCase());
  
  let skillBonus = 0;
  if (designerSkillsLower.some((s) => s.includes("rebrand") || s.includes("brand strategy") || s.includes("identity"))) {
    skillBonus += 0.2;
  }
  if (designerSkillsLower.some((s) => s.includes("direction") || s.includes("system"))) {
    skillBonus += 0.15;
  }
  const skillsScore = Math.min(100, Math.round((roleMatch * 0.7 + skillBonus) * 100));

  // 2. Industry match (20%)
  const hasIndustry = designer.industries.includes(project.industry);
  const industryScore = hasIndustry ? 96 : 68;

  // 3. Experience match (15%)
  // Rebranding enterprises demand senior talent (8+ to 12+ years)
  let experienceScore = 75;
  if (designer.yearsExperience >= 12) {
    experienceScore = 98;
  } else if (designer.yearsExperience >= 9) {
    experienceScore = 92;
  } else if (designer.yearsExperience >= 6) {
    experienceScore = 84;
  }

  // 4. Style match (15%)
  const preferredStyles = project.preferredStyles || [];
  let styleMatches = 0;
  preferredStyles.forEach((style) => {
    if (designer.styles.includes(style)) {
      styleMatches++;
    }
  });
  const styleScore = preferredStyles.length > 0
    ? Math.min(100, Math.round(65 + (styleMatches / preferredStyles.length) * 35))
    : 88;

  // 5. Budget match (10%)
  // Tier alignment: $$$ vs $$$$ vs $$$$$
  const budgetScores: Record<string, Record<string, number>> = {
    "$$$": { "$$$": 98, "$$$$": 82, "$$$$$": 65 },
    "$$$$": { "$$$": 90, "$$$$": 96, "$$$$$": 84 },
    "$$$$$": { "$$$": 85, "$$$$": 92, "$$$$$": 98 },
  };
  const budgetScore = budgetScores[project.budgetTier]?.[designer.budgetTier] ?? 88;

  // 6. Availability match (10%)
  let availabilityScore = 70;
  if (designer.availability === "Available now") {
    availabilityScore = 98;
  } else if (designer.availability === "Available soon") {
    availabilityScore = 86;
  } else {
    availabilityScore = 55;
  }

  // 7. Location/Language match (5%)
  const locationScore = 92;

  // Weighted overall calculation
  const weightedTotal =
    skillsScore * 0.25 +
    industryScore * 0.2 +
    experienceScore * 0.15 +
    styleScore * 0.15 +
    budgetScore * 0.1 +
    availabilityScore * 0.1 +
    locationScore * 0.05;

  const finalScore = Math.min(99, Math.max(65, Math.round(weightedTotal)));

  const breakdown: MatchBreakdown = {
    skills: skillsScore,
    industry: industryScore,
    experience: experienceScore,
    style: styleScore,
    budget: budgetScore,
    availability: availabilityScore,
    location: locationScore,
  };

  const keyStrengths: string[] = [];
  if (hasIndustry) keyStrengths.push(`${project.industry} Sector Track Record`);
  if (designer.yearsExperience >= 10) keyStrengths.push(`${designer.yearsExperience}+ Years Senior Mastery`);
  if (requiredRoles.includes(designer.role)) keyStrengths.push(`Direct ${designer.role} Specialization`);
  if (designer.availability === "Available now") keyStrengths.push("Immediate Bandwidth");
  if (styleMatches > 0) keyStrengths.push("Aesthetic Synergy");

  return {
    designerId: designer.id,
    designer,
    score: finalScore,
    breakdown,
    keyStrengths: keyStrengths.slice(0, 3),
  };
}

/**
 * Returns designers sorted by descending match score for a given project
 */
export function rankDesignersForProject(project: Project, designers: Designer[]): MatchResult[] {
  return designers
    .map((d) => calculateMatch(project, d))
    .sort((a, b) => b.score - a.score);
}
