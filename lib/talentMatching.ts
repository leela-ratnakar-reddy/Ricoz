import { TALENT_PROFILES } from "@/data/talentProfiles";
import { TalentProfile, ProjectAnalysisResult } from "@/types/talent";

// Preset Prompt Starters for the AI Match experience
export interface PromptStarter {
  category: string;
  title: string;
  subtitle: string;
  brief: string;
}

export const PROMPT_STARTERS: PromptStarter[] = [
  {
    category: "BRAND LAUNCH",
    title: "Brand Launch",
    subtitle: "Build a premium skincare brand for a digital-first audience.",
    brief: "We're launching a premium skincare brand focused on younger digital-first consumers. We need category-defining brand strategy, custom sustainable glass packaging, Swiss-inspired visual identity, a high-conversion e-commerce digital experience, and a kinetic 3D social launch campaign."
  },
  {
    category: "REBRAND",
    title: "Rebrand",
    subtitle: "Reposition an established fintech brand for a younger market.",
    brief: "Repositioning an established enterprise fintech platform for a younger market and high-growth retail investors. We need monolithic brand architecture, new verbal identity and naming frameworks, a high-density mobile wallet design system, and investor narrative."
  },
  {
    category: "DIGITAL EXPERIENCE",
    title: "Digital Experience",
    subtitle: "Create a new visual identity and website for a luxury hospitality brand.",
    brief: "Create a new visual identity, tactile physical collateral, and flagship digital experience for an ultra-luxury hospitality retreat. Requires custom typography, editorial photography direction, spatial signage, and an interactive reservation web platform."
  }
];

interface KeywordRule {
  keywords: string[];
  roles: string[];
  skills: string[];
  industry?: string;
  projectType?: string;
}

const KNOWLEDGE_RULES: KeywordRule[] = [
  {
    keywords: ["skincare", "beauty", "cosmetics", "botanical", "wellness", "gen z", "health", "ayurvedic", "sustainable", "zero-plastic"],
    roles: ["Creative Director", "Brand Identity Designer", "Packaging Designer", "UI/UX Designer", "Motion Designer", "Brand Strategist"],
    skills: ["Ayurvedic Cosmetic Packaging", "Sustainable Packaging Solutions", "Color Psychology for Beauty", "Lush Botanical Art", "Direct-to-Consumer UX", "Kinetic Typography"],
    industry: "Beauty & Lifestyle",
    projectType: "Full Brand Launch"
  },
  {
    keywords: ["fintech", "banking", "wallet", "payments", "crypto", "trading", "checkout", "investor", "retail", "saas"],
    roles: ["Creative Director", "Brand Strategist", "Brand Identity Designer", "UI/UX Designer", "Brand Guidelines & Design Systems Specialist"],
    skills: ["Brand Architecture", "High-Density Data UI", "Design Tokens Architecture", "Fintech Nomenclature", "Positioning Frameworks", "Mobile Wallet UX"],
    industry: "Fintech & Wealth",
    projectType: "Enterprise Rebrand"
  },
  {
    keywords: ["hospitality", "luxury", "hotel", "resort", "retreat", "boutique", "travel", "architecture", "signage", "dining", "spa"],
    roles: ["Creative Director", "Brand Identity Designer", "Web Designer", "Art Director", "Production & Print Specialist"],
    skills: ["Editorial Photoshoot Direction", "Bespoke Monogram Systems", "Interactive Booking UI", "Artisanal Letterpress Printing", "Spatial Wayfinding", "Custom Ligatures"],
    industry: "Luxury Hospitality",
    projectType: "Flagship Digital Experience"
  },
  {
    keywords: ["spirits", "liquor", "bottle", "wine", "gin", "whisky", "cocktail", "beverage", "drink", "can", "brew"],
    roles: ["Packaging Designer", "Art Director", "Brand Identity Designer", "Brand Photographer"],
    skills: ["Structural Packaging Engineering", "Luxury Spirits Decanter Design", "Still Life Curation", "Aluminum Can Wrap Design"],
    industry: "Beverage & FMCG",
    projectType: "Packaging Suite"
  },
  {
    keywords: ["ai", "deeptech", "machine learning", "neural", "algorithm", "quantum", "developer", "infrastructure", "api"],
    roles: ["Brand Strategist", "3D & Spatial Designer", "Web Designer", "Creative Director"],
    skills: ["Brand Architecture", "Procedural 3D Modeling", "AI Interaction Patterns", "Etymological Naming", "Futuristic Visual Worlds"],
    industry: "AI & DeepTech",
    projectType: "Category Definition"
  },
  {
    keywords: ["3d", "animation", "motion", "kinetic", "render", "hardware", "exploded", "video", "cgi", "broadcast"],
    roles: ["Motion Designer", "3D & Spatial Designer", "Creative Director"],
    skills: ["Photorealistic Hardware Rendering", "Kinetic Brand Systems", "Cinema 4D / Octane", "Hyper-Kinetic Motion"],
    industry: "Consumer Electronics",
    projectType: "3D Brand World"
  }
];

export function analyzeProjectBrief(brief: string): ProjectAnalysisResult {
  const normalized = brief.toLowerCase();

  const matchedRoles = new Set<string>();
  const matchedSkills = new Set<string>();
  const matchedIndustries = new Set<string>();
  const matchedProjectTypes = new Set<string>();

  for (const rule of KNOWLEDGE_RULES) {
    const hits = rule.keywords.filter((kw) => normalized.includes(kw));
    if (hits.length > 0) {
      rule.roles.forEach((r) => matchedRoles.add(r));
      rule.skills.forEach((s) => matchedSkills.add(s));
      if (rule.industry) matchedIndustries.add(rule.industry);
      if (rule.projectType) matchedProjectTypes.add(rule.projectType);
    }
  }

  // Sensible defaults
  if (matchedRoles.size === 0) {
    matchedRoles.add("Creative Director");
    matchedRoles.add("Brand Strategist");
    matchedRoles.add("Brand Identity Designer");
    matchedRoles.add("UI/UX Designer");
    matchedRoles.add("Motion Designer");
  }
  if (matchedIndustries.size === 0) {
    matchedIndustries.add("Creative & Consumer");
  }
  if (matchedProjectTypes.size === 0) {
    matchedProjectTypes.add("Full Brand Launch");
  }

  const detectedIndustry = Array.from(matchedIndustries)[0] || "Cross-Industry";
  const detectedProjectType = Array.from(matchedProjectTypes)[0] || "Full Brand Launch";
  const requiredRoles = Array.from(matchedRoles).slice(0, 6);
  const requiredSkills = Array.from(matchedSkills).slice(0, 8);

  // Deterministic Project Scale
  let projectScale = "Full Brand Launch";
  if (normalized.includes("rebrand") || normalized.includes("reposition")) {
    projectScale = "Enterprise Rebrand";
  } else if (normalized.includes("website") || normalized.includes("digital") || normalized.includes("platform")) {
    projectScale = "Digital Flagship Experience";
  } else if (normalized.includes("seed") || normalized.includes("early") || normalized.includes("mvp")) {
    projectScale = "Early Venture Foundation";
  }

  // Deterministic Project Understanding text
  let projectUnderstanding = `Targeted multidisciplinary engagement in ${detectedIndustry}. Scope encompasses ${detectedProjectType.toLowerCase()} with focus on end-to-end craft across physical, digital, and kinetic touchpoints.`;
  if (normalized.includes("skincare") || normalized.includes("beauty")) {
    projectUnderstanding = "Premium skincare brand launch focused on younger digital-first consumers requiring tactile sustainable packaging and cohesive digital commerce.";
  } else if (normalized.includes("fintech") || normalized.includes("banking") || normalized.includes("wallet")) {
    projectUnderstanding = "Modern fintech repositioning uniting enterprise institutional trust with frictionless digital consumer product UX and new market narrative.";
  } else if (normalized.includes("hospitality") || normalized.includes("luxury") || normalized.includes("hotel")) {
    projectUnderstanding = "Bespoke luxury hospitality identity blending artisanal physical materiality with an immersive, high-conversion reservation digital experience.";
  }

  // Requirement Tags
  const requirementTags = [
    "Brand Strategy & Positioning",
    "Visual Identity System",
    "Packaging & Physical Materials",
    "Digital Product & UX",
    "Launch Campaign & Motion"
  ];

  // Deterministic Match Scoring for all 57 profiles
  // Formula:
  // overallScore = skillsMatch * 0.30 + industryMatch * 0.25 + projectTypeMatch * 0.20 + specializationMatch * 0.15 + experienceMatch * 0.10
  const scoredTalent = TALENT_PROFILES.map((talent) => {
    // 1. Skills match (0 to 100)
    const skillHits = talent.skills.filter(
      (sk) =>
        requiredSkills.some((rs) => rs.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(rs.toLowerCase())) ||
        normalized.includes(sk.toLowerCase().slice(0, 6))
    );
    const skillsMatch = Math.min(100, 50 + skillHits.length * 15);

    // 2. Industry match (0 to 100)
    const indHits = talent.industries.filter(
      (ind) =>
        matchedIndustries.has(ind) ||
        ind.toLowerCase().includes(detectedIndustry.toLowerCase()) ||
        detectedIndustry.toLowerCase().includes(ind.toLowerCase())
    );
    const industryMatch = indHits.length > 0 ? 95 : 60;

    // 3. Project type match (0 to 100)
    const ptHits = talent.projectTypes.filter(
      (pt) =>
        matchedProjectTypes.has(pt) ||
        pt.toLowerCase().includes(detectedProjectType.toLowerCase()) ||
        detectedProjectType.toLowerCase().includes(pt.toLowerCase())
    );
    const projectTypeMatch = ptHits.length > 0 ? 95 : 65;

    // 4. Specialization match (0 to 100)
    const specHits = talent.specializations.filter((sp) =>
      normalized.includes(sp.toLowerCase().slice(0, 5))
    );
    const specializationMatch = specHits.length > 0 ? 95 : 70;

    // 5. Experience match (0 to 100)
    const experienceMatch = Math.min(100, 60 + talent.experience * 3);

    // Weighted overall score
    const weightedRaw =
      skillsMatch * 0.30 +
      industryMatch * 0.25 +
      projectTypeMatch * 0.20 +
      specializationMatch * 0.15 +
      experienceMatch * 0.10;

    // Deterministic role boost
    const roleBoost = requiredRoles.includes(talent.role) ? 6 : 0;
    const finalScore = Math.min(97, Math.max(78, Math.round(weightedRaw + roleBoost)));

    // Specific match reasons & recommendation bullet points
    const matchReasons: string[] = [];
    if (indHits.length > 0) {
      matchReasons.push(`Deep domain pedigree in ${indHits[0]}`);
    }
    if (skillHits.length > 0) {
      matchReasons.push(`Mastery in ${skillHits.slice(0, 2).join(" & ")}`);
    }
    if (talent.specializations.length > 0) {
      matchReasons.push(`Specialist in ${talent.specializations[0]}`);
    }
    if (matchReasons.length < 2) {
      matchReasons.push(`Multidisciplinary track record with ${talent.experience} years experience`);
    }

    return {
      talent,
      score: finalScore,
      matchReasons
    };
  });

  // Sort descending deterministically
  scoredTalent.sort((a, b) => b.score - a.score);

  // Assemble the 5-Role Recommended Team
  // Target roles for balanced multidisciplinary squad:
  // 01: Creative Director
  // 02: Brand Identity Designer / Brand Strategist
  // 03: Packaging Designer / 3D & Spatial Designer
  // 04: UI/UX Designer / Web Designer
  // 05: Motion Designer / Art Director
  const squadRoleTargets = [
    {
      roleTitle: "Creative Director",
      disciplineNeed: "Creative Direction & Overall Vision",
      requirementCovered: "Brand Strategy & Vision"
    },
    {
      roleTitle: "Brand Identity Designer",
      disciplineNeed: "Visual Identity & Design Systems",
      requirementCovered: "Visual Identity System"
    },
    {
      roleTitle: "Packaging Designer",
      disciplineNeed: "Packaging Engineering & Materiality",
      requirementCovered: "Packaging & Physical Materials"
    },
    {
      roleTitle: "UI/UX Designer",
      disciplineNeed: "Digital Product Architecture & UI",
      requirementCovered: "Digital Product & UX"
    },
    {
      roleTitle: "Motion Designer",
      disciplineNeed: "Kinetic Branding & Campaign Launch",
      requirementCovered: "Launch Campaign & Motion"
    }
  ];

  const recommendedTeam: ProjectAnalysisResult["recommendedTeam"] = [];
  const selectedTalentIds = new Set<string>();

  for (let i = 0; i < squadRoleTargets.length; i++) {
    const target = squadRoleTargets[i];
    // Find best scoring talent matching this role or related role
    let candidate = scoredTalent.find(
      (st) =>
        st.talent.role.toLowerCase() === target.roleTitle.toLowerCase() &&
        !selectedTalentIds.has(st.talent.id)
    );

    // Fallback if specific role not found in top pool
    if (!candidate) {
      candidate = scoredTalent.find((st) => !selectedTalentIds.has(st.talent.id));
    }

    if (candidate) {
      selectedTalentIds.add(candidate.talent.id);

      const whyRec = `Strong match because ${candidate.talent.name.split(" ")[0]} specializes in ${
        candidate.talent.specializations[0] || candidate.talent.role
      }, ${candidate.talent.industries[0] || 'category'} positioning, and multidisciplinary execution.`;

      const recPoints = [
        candidate.talent.skills[0] || "Strategic creative vision",
        candidate.talent.specializations[0] || "High-growth category pedigree",
        `${candidate.talent.experience} years leadership track record`,
        candidate.matchReasons[0] || "Direct industry alignment"
      ];

      recommendedTeam.push({
        roleTitle: target.roleTitle,
        talent: candidate.talent,
        score: candidate.score,
        reason: whyRec,
        recommendationPoints: recPoints,
        projectRequirementCovered: target.requirementCovered
      });
    }
  }

  // Summary statement
  const projectSummary = `RICOZ AI analyzed your brief for ${detectedProjectType} in the ${detectedIndustry} space. We mapped 5 essential creative disciplines to assemble this high-synergy team.`;

  return {
    projectSummary,
    projectUnderstanding,
    projectScale,
    detectedIndustry,
    detectedProjectType,
    requiredRoles,
    requiredSkills,
    requirementTags,
    industries: Array.from(matchedIndustries),
    projectTypes: Array.from(matchedProjectTypes),
    recommendedTalent: scoredTalent.slice(0, 12),
    recommendedTeam
  };
}
