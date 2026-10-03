import { TALENT_PROFILES } from "@/data/talentProfiles";
import {
  TalentProfile,
  ProjectAnalysisResult,
  ProjectRequirements,
  ScoredCandidate,
  RecommendedSquadMember,
  PortfolioEvidence,
  MatchFeedback,
  RefinementChangeSummary
} from "@/types/talent";
import {
  RICOZ_19_ROLES,
  PROJECT_INTENTS,
  BRAND_MATURITY_LEVELS,
  RICOZ_AI_VERSION,
  PROMPT_VERSION,
  RicozRole,
  classifyIndustryFromBrief,
  DOMAIN_TAXONOMY
} from "@/lib/ai/creativeKnowledge";
import { InferredRequirementWithConfidence } from "@/types/talent";

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

// Semantic Taxonomy: Industries & Synonyms
const INDUSTRY_TAXONOMY: Record<string, string[]> = {
  "Health & Wellness": [
    "skincare", "skin", "beauty", "cosmetics", "personal care", "wellness",
    "botanical", "ayurvedic", "dermatological", "fragrance", "serum", "clean beauty",
    "haircare", "health", "healthcare", "supplement", "bodycare"
  ],
  "Fintech": [
    "fintech", "banking", "finance", "financial", "wallet", "payments", "crypto",
    "trading", "investor", "investment", "wealth", "defi", "blockchain", "neobank",
    "money", "lend", "equity", "accounting"
  ],
  "Hospitality": [
    "hospitality", "hotel", "resort", "retreat", "boutique hotel", "travel",
    "spa", "dining", "culinary", "restaurant", "concierge", "guest", "lodging"
  ],
  "Automotive & Mobility": [
    "ev", "electric vehicle", "mobility", "automotive", "car", "autonomous",
    "fleet", "charging", "vehicles", "transport", "aviation", "aerospace"
  ],
  "Beverage & FMCG": [
    "dairy", "milk", "spirits", "liquor", "beverage", "drink", "wine", "distillers", "whisky",
    "gin", "beer", "craft beer", "fmcg", "packaged goods", "cpg", "food", "snack", "confectionery"
  ],
  "Luxury & Fashion": [
    "luxury", "fashion", "couture", "apparel", "jewelry", "atelier", "timepieces",
    "high-end", "bespoke", "accessories", "leather goods", "haute"
  ],
  "AI & DeepTech": [
    "ai", "deeptech", "artificial intelligence", "machine learning", "neural",
    "algorithm", "llm", "genai", "data infrastructure", "quantum", "agentic", "robotics"
  ],
  "Enterprise SaaS": [
    "saas", "enterprise", "b2b", "cloud", "developer", "infrastructure", "software",
    "api", "platform", "cybersecurity", "analytics"
  ],
  "E-commerce": [
    "ecommerce", "e-commerce", "d2c", "direct-to-consumer", "storefront", "shopify",
    "retail", "online store", "merchandising"
  ],
  "Entertainment & Media": [
    "entertainment", "media", "gaming", "streaming", "music", "film", "cinema",
    "cinematic", "broadcast", "esports", "culture"
  ],
  "Real Estate & Architecture": [
    "real estate", "architecture", "spatial", "property", "residential", "commercial",
    "interior", "wayfinding"
  ]
};

// Semantic Taxonomy: Project Types
const PROJECT_TYPE_TAXONOMY: Record<string, string[]> = {
  "Full Brand Identity": [
    "complete visual identity", "visual identity", "new identity", "brand identity",
    "branding", "identity", "logo", "symbol", "wordmark", "brand system"
  ],
  "Rebrand & Positioning": [
    "rebrand", "rebranding", "reposition", "repositioning", "modernize", "refresh",
    "rejuvenation", "pivot"
  ],
  "Packaging Suite": [
    "packaging", "package", "bottle", "box", "unboxing", "label", "sustainable packaging",
    "cans", "structural packaging"
  ],
  "E-commerce Experience": [
    "ecommerce", "e-commerce", "ecommerce website", "online store", "checkout", "storefront"
  ],
  "Digital Product UI": [
    "ui/ux", "ux", "ui", "app", "mobile app", "product design", "interface", "wallet"
  ],
  "Campaign Visuals": [
    "campaign", "launch campaign", "social media launch campaign", "social media",
    "advertising", "digital advertising", "commercial"
  ],
  "3D Brand World": [
    "3d", "spatial", "cgi", "render", "hardware", "exploded view", "environment"
  ],
  "Category Definition": [
    "category", "category definition", "manifesto", "brand architecture", "market narrative"
  ],
  "Design System": [
    "design system", "guidelines", "tokens", "component library", "brand guidelines"
  ],
  "Hospitality Concept": [
    "hotel brand", "hospitality concept", "guest touchpoint", "retreat"
  ]
};

function hasKeyword(text: string, kw: string): boolean {
  if (kw.length <= 3) {
    return new RegExp(`(^|\\W)${kw}(\\W|$)`, "i").test(text);
  }
  return text.includes(kw);
}

/**
 * 1. Analyze Project Brief (V3 Deterministic Engine)
 * Upgraded to extract deep business goals, creative ambitions, intent,
 * brand maturity, explicit vs inferred requirements, and confidence.
 */
export function extractProjectRequirements(brief: string): ProjectRequirements {
  const normalized = brief.toLowerCase().trim();
  const words = normalized.split(/\s+/).filter(Boolean);

  // Check for vague input (< 5 words or very short string lacking any domain context or deliverables)
  const isVague =
    words.length < 5 ||
    (words.length < 8 &&
      !hasKeyword(normalized, "brand") &&
      !hasKeyword(normalized, "design") &&
      !hasKeyword(normalized, "identity") &&
      !hasKeyword(normalized, "campaign") &&
      !hasKeyword(normalized, "website") &&
      !hasKeyword(normalized, "app") &&
      !hasKeyword(normalized, "packaging") &&
      !hasKeyword(normalized, "store") &&
      !hasKeyword(normalized, "rebrand") &&
      !hasKeyword(normalized, "logo") &&
      !hasKeyword(normalized, "platform"));

  // Detect Industries & Taxonomy Separation (V3.1)
  const domainClassification = classifyIndustryFromBrief(brief);
  const primaryIndustry = domainClassification.primaryIndustry;
  const subIndustry = domainClassification.subIndustry;
  const secondaryIndustries = domainClassification.secondaryIndustries;
  const industryCategoryType = domainClassification.industryCategoryType;
  const industryConfidence = domainClassification.industryConfidence;
  const industryEvidence = domainClassification.industryEvidence;
  const talentMatchingCategories = domainClassification.talentMatchingCategories;
  const matchedIndustries: string[] = [primaryIndustry, ...secondaryIndustries];

  // Detect Project Types & Intent
  const matchedProjectTypes: string[] = [];
  for (const [projectType, keywords] of Object.entries(PROJECT_TYPE_TAXONOMY)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      matchedProjectTypes.push(projectType);
    }
  }
  if (matchedProjectTypes.length === 0) {
    matchedProjectTypes.push("Full Brand Identity");
  }

  // Detect Intent
  let projectIntent = "New Brand";
  if (normalized.includes("rebrand") || normalized.includes("reposition")) {
    projectIntent = "Rebrand";
  } else if (normalized.includes("refresh") || normalized.includes("moderniz") || normalized.includes("traditional")) {
    projectIntent = "Brand Refresh";
  } else if (normalized.includes("packaging") && !normalized.includes("website")) {
    projectIntent = "Packaging Launch";
  } else if (normalized.includes("website") || normalized.includes("redesign")) {
    projectIntent = "Website Redesign";
  } else if (normalized.includes("campaign") || normalized.includes("advertising")) {
    projectIntent = "Campaign";
  } else if (normalized.includes("ecommerce") || normalized.includes("store")) {
    projectIntent = "E-commerce Launch";
  } else if (normalized.includes("launch") || normalized.includes("launching")) {
    projectIntent = "Product Launch";
  }

  // Detect Brand Maturity
  let brandMaturity = "New / Startup";
  if (
    normalized.includes("year-old") ||
    normalized.includes("years old") ||
    normalized.includes("traditional") ||
    normalized.includes("legacy") ||
    normalized.includes("heritage") ||
    normalized.includes("established brand")
  ) {
    brandMaturity = "Legacy Brand";
  } else if (normalized.includes("enterprise") || normalized.includes("multinational") || normalized.includes("corporate")) {
    brandMaturity = "Enterprise";
  } else if (normalized.includes("established") || normalized.includes("repositioning an established")) {
    brandMaturity = "Established";
  } else if (normalized.includes("scaling") || normalized.includes("series a") || normalized.includes("growing")) {
    brandMaturity = "Growing";
  }

  // Detect Audience
  let audience = "General Consumer";
  const audienceCharacteristics: string[] = [];
  if (normalized.includes("gen z") || normalized.includes("younger")) {
    audience = "Next-Generation / Young Professionals";
    audienceCharacteristics.push("Digital-First", "High Aesthetic Bar", "Values Transparency");
  } else if (normalized.includes("luxury") || normalized.includes("hnw") || normalized.includes("high-net-worth")) {
    audience = "High-Net-Worth / Luxury Connoisseurs";
    audienceCharacteristics.push("Discerning", "Experience-Driven", "High Purchasing Power");
  } else if (normalized.includes("enterprise") || normalized.includes("b2b") || normalized.includes("cto")) {
    audience = "Enterprise Technology Decision Makers";
    audienceCharacteristics.push("Risk-Averse", "ROI-Oriented", "Requires High Trust");
  } else if (normalized.includes("investor")) {
    audience = "Retail & Institutional Investors";
    audienceCharacteristics.push("Data-Driven", "Market-Focused");
  }

  // Detect Business Goal
  let businessGoal = "Establish market leadership and brand recognition through differentiated creative execution.";
  if (brandMaturity === "Legacy Brand" || normalized.includes("traditional") || normalized.includes("trust")) {
    businessGoal = "Modernize market presence and capture younger demographic without diluting generational consumer trust.";
  } else if (normalized.includes("conversion") || normalized.includes("ecommerce") || normalized.includes("store")) {
    businessGoal = "Accelerate digital direct-to-consumer sales and conversion through seamless commerce experience.";
  } else if (normalized.includes("fintech") || normalized.includes("investor")) {
    businessGoal = "Unify enterprise institutional credibility with frictionless digital consumer trust to accelerate retail investor adoption.";
  } else if (normalized.includes("hospitality") || normalized.includes("hotel") || normalized.includes("retreat")) {
    businessGoal = "Position destination at the pinnacle of luxury hospitality to maximize direct high-margin reservations.";
  } else if (normalized.includes("ev") || normalized.includes("vehicle") || normalized.includes("mobility")) {
    businessGoal = "Accelerate pre-orders and global market buzz for breakthrough electric vehicle platform.";
  }

  // Detect Creative Goal
  let creativeGoal = "Create a cohesive, high-impact brand identity and digital presence across primary touchpoints.";
  if (brandMaturity === "Legacy Brand" || normalized.includes("traditional")) {
    creativeGoal = "Develop a contemporary, culturally resonant visual identity while retaining recognizable heraldic brand equity.";
  } else if (normalized.includes("fintech")) {
    creativeGoal = "Craft a monolithic identity system and high-density, trust-anchored mobile wallet interface.";
  } else if (normalized.includes("hospitality")) {
    creativeGoal = "Deliver an ultra-luxury editorial visual identity, bespoke typography, and an immersive reservation platform.";
  } else if (normalized.includes("skincare") || normalized.includes("beauty")) {
    creativeGoal = "Establish a category-defining visual and tactile identity system with Swiss-inspired precision and sustainable packaging.";
  }

  // Current vs Desired Brand State
  let currentBrandState = "Nascent or unarticulated market presence.";
  let desiredBrandState = "Recognized, highly differentiated category leader.";
  if (brandMaturity === "Legacy Brand" || normalized.includes("traditional")) {
    currentBrandState = "Respected and trusted, but perceived as legacy or dated by younger consumers.";
    desiredBrandState = "Dynamic, culturally contemporary leader with timeless heritage credibility.";
  } else if (normalized.includes("fintech")) {
    currentBrandState = "Complex institutional technology platform.";
    desiredBrandState = "Frictionless, consumer-friendly financial power tool with institutional security.";
  }

  // Explicit vs Inferred Requirements
  const explicitRequirements: string[] = [];
  const inferredRequirements: string[] = [];

  if (normalized.includes("packaging")) explicitRequirements.push("Custom structural packaging design");
  if (normalized.includes("ecommerce") || normalized.includes("website") || normalized.includes("platform")) {
    explicitRequirements.push("Flagship digital web/e-commerce experience");
  }
  if (normalized.includes("visual identity") || normalized.includes("identity") || normalized.includes("branding")) {
    explicitRequirements.push("Comprehensive visual identity & brand system");
  }
  if (normalized.includes("campaign") || normalized.includes("advertising")) {
    explicitRequirements.push("Multi-channel kinetic launch campaign");
  }
  if (normalized.includes("strategy") || normalized.includes("positioning")) {
    explicitRequirements.push("Category-defining brand strategy");
  }
  if (explicitRequirements.length === 0) {
    explicitRequirements.push("Primary brand creative execution");
  }

  // Inferred Requirements based on business context with confidence and reason (V3.1)
  const inferredRequirementsWithConfidence: InferredRequirementWithConfidence[] = [];

  if (brandMaturity === "Legacy Brand" || normalized.includes("traditional") || normalized.includes("younger")) {
    inferredRequirements.push("Generational Consumer Perception Study");
    inferredRequirementsWithConfidence.push({
      requirement: "Generational Consumer Perception Study",
      confidence: 94,
      reason: "Empirical validation required when modernizing a legacy brand to avoid alienating generational customer trust."
    });
    inferredRequirements.push("Heritage Asset Preservation Audit");
    inferredRequirementsWithConfidence.push({
      requirement: "Heritage Asset Preservation Audit",
      confidence: 89,
      reason: "Systematic cataloging of existing heraldic and visual assets to identify high-equity elements worth preserving."
    });
    inferredRequirements.push("Verbal Identity & Generational Tone of Voice");
    inferredRequirementsWithConfidence.push({
      requirement: "Verbal Identity & Generational Tone of Voice",
      confidence: 88,
      reason: "Contemporary communication frameworks to bridge traditional brand heritage with digital-first youth culture."
    });
  }
  if (normalized.includes("ecommerce") || normalized.includes("store") || normalized.includes("shopify")) {
    inferredRequirements.push("Conversion Funnel & Mobile Checkout Optimization");
    inferredRequirementsWithConfidence.push({
      requirement: "Conversion Funnel & Mobile Checkout Optimization",
      confidence: 92,
      reason: "Direct-to-consumer digital commerce requires friction-free transaction architecture to maximize ROI."
    });
    inferredRequirements.push("Design System Token Architecture");
    inferredRequirementsWithConfidence.push({
      requirement: "Design System Token Architecture",
      confidence: 86,
      reason: "Unified design tokens ensure consistent interaction states across product pages, cart, and checkout."
    });
  }
  if (normalized.includes("luxury") || normalized.includes("hospitality")) {
    inferredRequirements.push("Bespoke Typography Licensing & Monogram System");
    inferredRequirementsWithConfidence.push({
      requirement: "Bespoke Typography Licensing & Monogram System",
      confidence: 91,
      reason: "High-end luxury positioning requires proprietary typography and bespoke monograms for exclusivity."
    });
    inferredRequirements.push("Tactile Material Sourcing & Press Specifications");
    inferredRequirementsWithConfidence.push({
      requirement: "Tactile Material Sourcing & Press Specifications",
      confidence: 87,
      reason: "Physical collateral and packaging require bespoke paper stocks and artisanal print finishes."
    });
  }
  if (primaryIndustry === "Cybersecurity") {
    inferredRequirements.push("Institutional Trust & Technical Credibility Visual Architecture");
    inferredRequirementsWithConfidence.push({
      requirement: "Institutional Trust & Technical Credibility Visual Architecture",
      confidence: 95,
      reason: "Enterprise cybersecurity buyers (CISOs) require rigorous, high-density visual proof of security efficacy."
    });
  }
  if (primaryIndustry === "Education Technology") {
    inferredRequirements.push("Student Engagement & Intuitive Learning Hierarchy UX");
    inferredRequirementsWithConfidence.push({
      requirement: "Student Engagement & Intuitive Learning Hierarchy UX",
      confidence: 90,
      reason: "Educational platforms require high cognitive clarity and accessibility standards for learners."
    });
  }
  if (primaryIndustry === "Manufacturing") {
    inferredRequirements.push("Industrial Capabilities Collateral & Technical Presentation");
    inferredRequirementsWithConfidence.push({
      requirement: "Industrial Capabilities Collateral & Technical Presentation",
      confidence: 88,
      reason: "B2B procurement and engineering buyers demand precise capability data sheets and industrial schematics."
    });
  }
  if (primaryIndustry === "Non-profit & Conservation") {
    inferredRequirements.push("Donor Impact Storytelling & Frictionless Giving Flow");
    inferredRequirementsWithConfidence.push({
      requirement: "Donor Impact Storytelling & Frictionless Giving Flow",
      confidence: 93,
      reason: "Mission-driven organizations rely on emotional resonance and seamless donation pipelines to sustain operations."
    });
  }
  if (inferredRequirements.length === 0) {
    inferredRequirements.push("Brand Guidelines & Multi-Platform Component Library");
    inferredRequirementsWithConfidence.push({
      requirement: "Brand Guidelines & Multi-Platform Component Library",
      confidence: 85,
      reason: "Multi-platform brand consistency requires foundational component rules and styling guides."
    });
    inferredRequirements.push("Art Direction Guidelines for Content Production");
    inferredRequirementsWithConfidence.push({
      requirement: "Art Direction Guidelines for Content Production",
      confidence: 82,
      reason: "Clear photography and motion guidelines enable internal marketing teams to produce on-brand content."
    });
  }

  // Special Simple Case: Logo only
  const isSimpleLogoOnly =
    (normalized.includes("logo") || normalized.includes("wordmark") || normalized.includes("symbol")) &&
    !normalized.includes("packaging") &&
    !normalized.includes("website") &&
    !normalized.includes("campaign") &&
    !normalized.includes("ecommerce") &&
    words.length < 18;

  // Detect Scale & Complexity (V3.1)
  let projectScale = "Full Brand Launch";
  let complexity: "Simple" | "Moderate" | "Complex" | "Enterprise" = "Moderate";

  if (isVague || isSimpleLogoOnly) {
    projectScale = isSimpleLogoOnly ? "Focused Logo Initiative" : "Exploratory Initiative";
    complexity = "Simple";
  } else if (
    brandMaturity === "Legacy Brand" ||
    normalized.includes("conglomerate") ||
    normalized.includes("multinational") ||
    normalized.includes("governance") ||
    normalized.includes("multi-brand") ||
    normalized.includes("40 subsidiary") ||
    normalized.includes("sovereign") ||
    normalized.includes("35 years") ||
    normalized.includes("40-year") ||
    (normalized.includes("enterprise") &&
      (normalized.includes("rebrand") ||
        normalized.includes("global") ||
        normalized.includes("architecture") ||
        normalized.includes("corporate")))
  ) {
    projectScale = "Enterprise Rebrand";
    complexity = "Enterprise";
  } else if (
    normalized.includes("rebrand") ||
    normalized.includes("campaign") ||
    normalized.includes("advertising") ||
    normalized.includes("packaging") ||
    normalized.includes("launching") ||
    normalized.includes("launch") ||
    normalized.includes("ecosystem") ||
    normalized.includes("unboxing") ||
    normalized.includes("hypercar") ||
    normalized.includes("couture") ||
    normalized.includes("robotics") ||
    normalized.includes("biotechnology") ||
    normalized.includes("resort") ||
    normalized.includes("fellowship") ||
    normalized.includes("neobank") ||
    normalized.includes("game studio") ||
    normalized.includes("direct air capture") ||
    normalized.includes("climate tech") ||
    normalized.includes("rpg") ||
    normalized.includes("safari")
  ) {
    projectScale = "High-Impact Launch Initiative";
    complexity = "Complex";
  } else {
    projectScale = "Focused Deliverable Initiative";
    complexity = "Moderate";
  }

  // Detect Roles with intelligent scope differentiation
  const roleWeights: Record<RicozRole, number> = {
    "Brand Strategist": 0,
    "Creative Director": 0,
    "Brand Identity Designer": 0,
    "Packaging Designer": 0,
    "UI/UX Designer": 0,
    "Web Designer": 0,
    "Motion Designer": 0,
    "Art Director": 0,
    "Visual Designer": 0,
    "Brand Photographer": 0,
    "Copywriter": 0,
    "Brand Guidelines & Design Systems Specialist": 0,
    "3D & Spatial Designer": 0,
    "Consumer Research Specialist": 0,
    "Naming & Verbal Identity Specialist": 0,
    "Production & Print Specialist": 0,
    "Illustrator": 0,
    "Logo Designer": 0,
    "Content Strategist": 0
  };

  if (isSimpleLogoOnly) {
    roleWeights["Logo Designer"] = 30;
    roleWeights["Brand Identity Designer"] = 25;
  } else {
    // Brand Strategist
    if (
      normalized.includes("rebrand") ||
      normalized.includes("reposition") ||
      normalized.includes("traditional") ||
      normalized.includes("strategy") ||
      normalized.includes("architecture") ||
      brandMaturity === "Legacy Brand"
    ) {
      roleWeights["Brand Strategist"] += 24;
    }

    // Consumer Research Specialist
    if (brandMaturity === "Legacy Brand" || (normalized.includes("traditional") && normalized.includes("younger"))) {
      roleWeights["Consumer Research Specialist"] += 22;
    }

    // Creative Director
    if (
      normalized.includes("launching") ||
      normalized.includes("launch") ||
      normalized.includes("campaign") ||
      normalized.includes("premium") ||
      normalized.includes("brand")
    ) {
      roleWeights["Creative Director"] += 18;
    }

    // Brand Identity Designer
    if (
      normalized.includes("identity") ||
      normalized.includes("branding") ||
      normalized.includes("visual identity") ||
      normalized.includes("rebrand") ||
      normalized.includes("refresh")
    ) {
      roleWeights["Brand Identity Designer"] += 22;
    }

    // Packaging Designer
    if (
      normalized.includes("packaging") ||
      normalized.includes("package") ||
      normalized.includes("bottle") ||
      normalized.includes("box") ||
      normalized.includes("unboxing") ||
      normalized.includes("cans")
    ) {
      roleWeights["Packaging Designer"] += 25;
    }

    // UI/UX Designer
    if (
      hasKeyword(normalized, "ecommerce") ||
      hasKeyword(normalized, "e-commerce") ||
      hasKeyword(normalized, "app") ||
      hasKeyword(normalized, "wallet") ||
      hasKeyword(normalized, "ux") ||
      hasKeyword(normalized, "ui/ux")
    ) {
      roleWeights["UI/UX Designer"] += 22;
    }

    // Web Designer
    if (
      normalized.includes("website") ||
      normalized.includes("web platform") ||
      normalized.includes("booking") ||
      normalized.includes("reservation web")
    ) {
      roleWeights["Web Designer"] += 18;
    }

    // Art Director
    if (
      normalized.includes("editorial") ||
      normalized.includes("cinematic") ||
      normalized.includes("luxury") ||
      normalized.includes("art direction") ||
      normalized.includes("campaign")
    ) {
      roleWeights["Art Director"] += 20;
    }

    // Motion Designer
    if (
      normalized.includes("kinetic") ||
      normalized.includes("motion") ||
      normalized.includes("animation") ||
      normalized.includes("3d social")
    ) {
      roleWeights["Motion Designer"] += 22;
    }

    // Brand Photographer
    if (normalized.includes("photography") || normalized.includes("photoshoot") || normalized.includes("stills")) {
      roleWeights["Brand Photographer"] += 20;
    }

    // 3D & Spatial Designer
    if (normalized.includes("3d") || normalized.includes("spatial") || normalized.includes("signage")) {
      roleWeights["3D & Spatial Designer"] += 20;
    }

    // Copywriter
    if (normalized.includes("copy") || normalized.includes("storytelling") || normalized.includes("narrative")) {
      roleWeights["Copywriter"] += 18;
    }

    // Brand Guidelines Specialist
    if (normalized.includes("system") || normalized.includes("tokens") || normalized.includes("guidelines")) {
      roleWeights["Brand Guidelines & Design Systems Specialist"] += 18;
    }
  }

  // Sort detected roles
  const sortedRoles = (Object.entries(roleWeights) as [RicozRole, number][])
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([role]) => role);

  const minRoles = complexity === "Simple" ? 1 : complexity === "Moderate" ? 2 : 4;
  const maxRoles = complexity === "Simple" ? 2 : complexity === "Moderate" ? 3 : 5;

  // Fallback complement if roles are fewer than minRoles
  const standardComplements: RicozRole[] = [
    "Creative Director",
    "Brand Identity Designer",
    "Brand Strategist",
    "UI/UX Designer",
    "Motion Designer",
    "Art Director",
    "Packaging Designer",
    "Web Designer"
  ];

  for (const comp of standardComplements) {
    if (sortedRoles.length >= minRoles) break;
    if (!sortedRoles.includes(comp)) {
      sortedRoles.push(comp);
    }
  }

  const requiredRoles = sortedRoles.slice(0, maxRoles);
  const optionalRoles = sortedRoles.slice(requiredRoles.length, requiredRoles.length + (complexity === "Enterprise" ? 3 : 2));

  // Missing Information & Clarification Questions
  const missingInformation: string[] = [];
  const clarificationQuestions: string[] = [];

  if (isVague) {
    missingInformation.push("Operating Industry & Market Sector");
    missingInformation.push("Target Customer Demographics");
    missingInformation.push("Specific Creative Deliverables (e.g. Identity, Packaging, Website)");

    clarificationQuestions.push("What specific industry or category is your business in?");
    clarificationQuestions.push("Who is your primary target audience or customer persona?");
    clarificationQuestions.push("What concrete creative deliverables do you need (e.g. brand identity, packaging, website, campaign)?");
  }

  const analysisConfidence = isVague ? 40 : 94;

  // Deliverables
  const deliverables: string[] = [];
  if (requiredRoles.includes("Brand Strategist")) deliverables.push("Brand Positioning & Narrative Architecture");
  if (requiredRoles.includes("Creative Director")) deliverables.push("Creative Direction & Campaign Vision");
  if (requiredRoles.includes("Brand Identity Designer")) deliverables.push("Complete Visual Identity & Logo System");
  if (requiredRoles.includes("Packaging Designer")) deliverables.push("Structural Packaging & Material Specifications");
  if (requiredRoles.includes("UI/UX Designer")) deliverables.push("E-Commerce Digital Experience & UX");
  if (requiredRoles.includes("Web Designer")) deliverables.push("Flagship Responsive Web Platform");
  if (requiredRoles.includes("Art Director")) deliverables.push("Cinematic Campaign Art Direction");
  if (requiredRoles.includes("Motion Designer")) deliverables.push("Kinetic Launch Motion & Social Assets");
  if (requiredRoles.includes("Consumer Research Specialist")) deliverables.push("Consumer Ethnography & Insights");
  if (requiredRoles.includes("Logo Designer")) deliverables.push("Iconic Symbol & Wordmark System");

  if (deliverables.length === 0) {
    deliverables.push("Strategic Brand Direction", "Visual Identity System", "Digital Platform Experience");
  }

  // Required skills
  const requiredSkills: string[] = [];
  if (primaryIndustry === "Health & Wellness") {
    requiredSkills.push("Sustainable Packaging Solutions", "Color Psychology for Beauty", "Direct-to-Consumer UX", "Kinetic Typography");
  } else if (primaryIndustry === "Fintech") {
    requiredSkills.push("Brand Architecture", "High-Density Data UI", "Design Tokens Architecture", "Positioning Frameworks");
  } else if (primaryIndustry === "Hospitality") {
    requiredSkills.push("Editorial Photoshoot Direction", "Bespoke Monogram Systems", "Interactive Booking UI", "Spatial Wayfinding");
  } else if (primaryIndustry === "Beverage & FMCG") {
    requiredSkills.push("FMCG Packaging Systems", "Heritage Brand Asset Preservation", "Direct-to-Consumer E-Commerce", "Consumer Perception Studies");
  } else {
    requiredSkills.push("Visual Identity Systems", "Strategic Brand Direction", "Digital Product Design", "Motion Brand Graphics");
  }

  const requiredSpecializations: string[] = [];
  if (subIndustry) requiredSpecializations.push(subIndustry);
  if (normalized.includes("packaging")) requiredSpecializations.push("Sustainable Packaging");
  if (normalized.includes("luxury")) requiredSpecializations.push("Luxury Hospitality");
  if (normalized.includes("fintech")) requiredSpecializations.push("Fintech & Wealth");

  const projectSummary = `RICOZ AI analyzed your brief for ${matchedProjectTypes[0] || "Brand Initiative"} in the ${primaryIndustry} space. We mapped ${requiredRoles.length} essential disciplines to address your ${businessGoal.toLowerCase()}`;

  const projectUnderstanding = `Strategic initiative in ${primaryIndustry} targeting ${audience}. Business objective focuses on: ${businessGoal}. Creative execution aims to ${creativeGoal.toLowerCase()}`;

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
    industries: matchedIndustries.length > 0 ? matchedIndustries : [primaryIndustry],
    projectTypes: matchedProjectTypes,
    requiredSkills,
    requiredSpecializations,
    requiredRoles,
    optionalRoles,
    deliverables,
    audience,
    audienceCharacteristics,
    currentBrandState,
    desiredBrandState,
    projectScale,
    complexity,
    explicitRequirements,
    inferredRequirements,
    inferredRequirementsWithConfidence,
    missingInformation,
    clarificationQuestions,
    confidence: analysisConfidence / 100,
    analysisConfidence,
    isVague,
    clarificationMessage: clarificationQuestions.join(" ")
  };
}

/**
 * 2. Calculate Match Score with Semantic Portfolio Evidence (V3.1)
 * Evaluates candidate profile data against requirements, including deep
 * semantic scoring of portfolio projects to extract concrete evidence.
 */
export function matchTalent(
  requirements: ProjectRequirements,
  profiles: TalentProfile[] = TALENT_PROFILES
): ScoredCandidate[] {
  const targetIndustries = [
    requirements.primaryIndustry || requirements.industry,
    ...(requirements.secondaryIndustries || []),
    ...(requirements.industries || []),
    ...(requirements.talentMatchingCategories || [])
  ].filter(Boolean);

  const targetProjectTypes = requirements.projectTypes || [];
  const targetSpecializations = requirements.requiredSpecializations || [];
  const targetSkills = requirements.requiredSkills || [];

  const scored: ScoredCandidate[] = profiles.map((talent) => {
    // 1. Skills Match (25%)
    const matchedSkills = talent.skills.filter((sk) =>
      targetSkills.some(
        (rs) =>
          rs.toLowerCase().includes(sk.toLowerCase()) ||
          sk.toLowerCase().includes(rs.toLowerCase())
      )
    );
    const missingSkills = targetSkills.filter(
      (rs) =>
        !talent.skills.some(
          (sk) =>
            sk.toLowerCase().includes(rs.toLowerCase()) ||
            rs.toLowerCase().includes(sk.toLowerCase())
        )
    );

    let skillsScore = 25;
    if (matchedSkills.length === 1) skillsScore = 65;
    else if (matchedSkills.length === 2) skillsScore = 80;
    else if (matchedSkills.length >= 3) skillsScore = 96;

    // 2. Industry Match (25%)
    const matchedIndustries = talent.industries.filter((ind) =>
      targetIndustries.some(
        (ti) =>
          ind.toLowerCase().includes(ti.toLowerCase()) ||
          ti.toLowerCase().includes(ind.toLowerCase())
      )
    );
    const industryScore = matchedIndustries.length > 0 ? 96 : 35;

    // 3. Project Type Match (15%)
    const matchedProjectTypes = talent.projectTypes.filter((pt) =>
      targetProjectTypes.some(
        (rpt) =>
          rpt.toLowerCase().includes(pt.toLowerCase()) ||
          pt.toLowerCase().includes(rpt.toLowerCase())
      )
    );
    const projectTypeScore = matchedProjectTypes.length > 0 ? 94 : 35;

    // 4. Specialization Match (15%)
    const matchedSpecializations = talent.specializations.filter((sp) =>
      targetSpecializations.some(
        (rsp) =>
          rsp.toLowerCase().includes(sp.toLowerCase()) ||
          sp.toLowerCase().includes(rsp.toLowerCase())
      )
    );
    const specializationScore = matchedSpecializations.length > 0 ? 95 : 35;

    // 5. Semantic Portfolio Matching & Evidence (10%)
    let bestPortfolioProject = talent.portfolio?.[0];
    let highestPortfolioScore = 0;

    if (talent.portfolio && talent.portfolio.length > 0) {
      for (const project of talent.portfolio) {
        let pScore = 0;
        // Industry overlap
        if (targetIndustries.some((ti) => project.industry.toLowerCase().includes(ti.toLowerCase()) || ti.toLowerCase().includes(project.industry.toLowerCase()))) {
          pScore += 45;
        }
        // Project type overlap
        if (targetProjectTypes.some((tpt) => project.projectType.toLowerCase().includes(tpt.toLowerCase()) || tpt.toLowerCase().includes(project.projectType.toLowerCase()))) {
          pScore += 30;
        }
        // Skill / Service overlap
        const serviceHits = (project.services || []).filter((s) =>
          targetSkills.some((ts) => ts.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ts.toLowerCase()))
        );
        pScore += Math.min(serviceHits.length * 10, 20);

        if (pScore > highestPortfolioScore) {
          highestPortfolioScore = pScore;
          bestPortfolioProject = project;
        }
      }
    }

    const portfolioScore = highestPortfolioScore > 0 ? Math.min(98, 50 + highestPortfolioScore * 0.5) : 35;

    // Construct concrete portfolio evidence
    let portfolioEvidence: PortfolioEvidence | undefined = undefined;
    if (bestPortfolioProject) {
      const isDirectMatch = highestPortfolioScore >= 30;
      portfolioEvidence = {
        projectTitle: bestPortfolioProject.title,
        client: bestPortfolioProject.client,
        projectType: bestPortfolioProject.projectType,
        industry: bestPortfolioProject.industry,
        reason: isDirectMatch
          ? `Delivered "${bestPortfolioProject.title}" for ${bestPortfolioProject.client || bestPortfolioProject.industry} directly covering ${bestPortfolioProject.services?.slice(0, 2).join(", ") || bestPortfolioProject.projectType}.`
          : `Delivered "${bestPortfolioProject.title}" (${bestPortfolioProject.projectType}) demonstrating core craft in ${bestPortfolioProject.services?.[0] || talent.skills[0]}.`,
        matchedServices: bestPortfolioProject.services
      };
    }

    // 6. Experience Score (10%) - calibrated between 4 and 16 years
    const experienceScore = Math.min(
      100,
      Math.round(40 + (Math.min(talent.experience, 16) / 16) * 60)
    );

    // 7. Role Alignment & Multiplier
    const isRequiredRole = requirements.requiredRoles.includes(talent.role);
    const isOptionalRole = requirements.optionalRoles?.includes(talent.role) ?? false;
    const roleMultiplier = isRequiredRole ? 1.0 : isOptionalRole ? 0.82 : 0.60;

    // Deterministic Weighted Formula V3:
    // Skills (25%) + Industry (25%) + ProjectType (15%) + Specialization (15%) + Portfolio Evidence (10%) + Experience (10%)
    const weightedBase =
      skillsScore * 0.25 +
      industryScore * 0.25 +
      projectTypeScore * 0.15 +
      specializationScore * 0.15 +
      portfolioScore * 0.10 +
      experienceScore * 0.10;

    const finalScore = Math.min(
      98,
      Math.max(20, Math.round(weightedBase * roleMultiplier))
    );

    // Generate specific, fact-based match reasons from profile data
    const matchReasons: string[] = [];
    if (matchedIndustries.length > 0) {
      matchReasons.push(`Deep domain pedigree in ${matchedIndustries[0]}`);
    } else {
      matchReasons.push(`Cross-category experience in ${talent.industries[0]}`);
    }

    if (matchedSpecializations.length > 0) {
      matchReasons.push(`Direct specialist in ${matchedSpecializations[0]}`);
    } else if (talent.specializations.length > 0) {
      matchReasons.push(`Specialist in ${talent.specializations[0]}`);
    }

    if (portfolioEvidence && highestPortfolioScore >= 30) {
      matchReasons.push(`Portfolio proof: "${portfolioEvidence.projectTitle}" (${portfolioEvidence.projectType})`);
    } else if (matchedSkills.length > 0) {
      matchReasons.push(`Mastery in ${matchedSkills[0]}`);
    } else {
      matchReasons.push(`Core expertise in ${talent.skills[0]}`);
    }

    matchReasons.push(`${talent.experience} years track record (${talent.hourlyRate})`);

    // Match Signals Breakdown
    const matchSignals = [
      {
        label: "Required Role",
        matched: isRequiredRole,
        detail: isRequiredRole
          ? `Matches priority role: ${talent.role}`
          : isOptionalRole
          ? `Optional discipline: ${talent.role}`
          : `Secondary discipline: ${talent.role}`
      },
      {
        label: "Industry Pedigree",
        matched: matchedIndustries.length > 0,
        detail:
          matchedIndustries.length > 0
            ? `Direct experience in ${matchedIndustries[0]}`
            : `Cross-category background in ${talent.industries[0]}`
      },
      {
        label: "Required Skills",
        matched: matchedSkills.length > 0,
        detail:
          matchedSkills.length > 0
            ? `Matched: ${matchedSkills.slice(0, 2).join(", ")}`
            : `Generalist skill base: ${talent.skills[0]}`
      },
      {
        label: "Domain Specialization",
        matched: matchedSpecializations.length > 0,
        detail:
          matchedSpecializations.length > 0
            ? `Specialist: ${matchedSpecializations[0]}`
            : `Specializes in ${talent.specializations[0] || "creative execution"}`
      },
      {
        label: "Portfolio Evidence",
        matched: highestPortfolioScore >= 30,
        detail: portfolioEvidence
          ? `Delivered: "${portfolioEvidence.projectTitle}"`
          : "Standard portfolio profile"
      }
    ];

    return {
      talent,
      score: finalScore,
      matchReasons,
      matchedSkills,
      missingSkills,
      matchedIndustries,
      matchedProjectTypes,
      matchedSpecializations,
      matchSignals,
      portfolioEvidence,
      skillsScore,
      industryScore,
      projectTypeScore,
      specializationScore,
      portfolioScore,
      experienceScore
    };
  });

  // Sort deterministically descending by score, tie-break by experience
  return scored.sort(
    (a, b) => b.score - a.score || b.talent.experience - a.talent.experience
  );
}

/**
 * 3. Build Recommended Team
 * Selects the single strongest candidate for each of the required roles.
 * Ensures complementary composition with no duplicate individuals.
 */
export function buildRecommendedTeam(
  requirements: ProjectRequirements,
  scoredTalent: ScoredCandidate[]
): RecommendedSquadMember[] {
  const selectedTalentIds = new Set<string>();
  const squad: RecommendedSquadMember[] = [];

  const roleDeliverableMap: Record<string, string> = {
    "Creative Director": "Creative Direction & Overall Vision",
    "Brand Strategist": "Brand Positioning & Narrative Architecture",
    "Brand Identity Designer": "Visual Identity System & Guidelines",
    "Packaging Designer": "Packaging Engineering & Materiality",
    "UI/UX Designer": "Digital Product Architecture & UI",
    "Web Designer": "Interactive Web Experience",
    "Art Director": "Cinematic Art Direction & Styling",
    "Visual Designer": "Campaign Graphics & Digital Ads",
    "Motion Designer": "Kinetic Branding & Launch Campaign",
    "Brand Photographer": "Commercial Photography & Production",
    "Copywriter": "Verbal Identity & Editorial Copy",
    "Brand Guidelines & Design Systems Specialist": "Design Systems & Token Architecture",
    "3D & Spatial Designer": "3D Spatial Visualization & Rendering",
    "Consumer Research Specialist": "Consumer Ethnography & Insights",
    "Naming & Verbal Identity Specialist": "Nomenclature & Verbal Identity",
    "Production & Print Specialist": "Print Production & Material Sourcing",
    "Logo Designer": "Iconic Symbol & Wordmark System",
    "Illustrator": "Bespoke Editorial Illustration System",
    "Content Strategist": "Multi-Channel Editorial Content Plan"
  };

  for (const role of requirements.requiredRoles) {
    if (squad.length >= 5) break;

    const candidate = scoredTalent.find(
      (c) => c.talent.role === role && !selectedTalentIds.has(c.talent.id)
    );

    if (candidate) {
      selectedTalentIds.add(candidate.talent.id);

      const matchedIndustry =
        candidate.talent.industries.find((ind) =>
          ind.toLowerCase().includes(requirements.industry.toLowerCase())
        ) || candidate.talent.industries[0];

      const whyRec = `Recommended because their specialization in ${
        candidate.talent.specializations[0]
      } and proven background in ${matchedIndustry} directly aligns with your ${
        requirements.projectTypes[0] || "project"
      } requirements.`;

      const recommendationPoints = [
        `Specialization: ${candidate.talent.specializations[0] || candidate.talent.role}`,
        `Direct industry experience in ${matchedIndustry}`,
        `${candidate.talent.experience} years leadership experience (${candidate.talent.hourlyRate})`,
        candidate.portfolioEvidence
          ? `Portfolio evidence: "${candidate.portfolioEvidence.projectTitle}" (${candidate.portfolioEvidence.projectType})`
          : `Core mastery: ${candidate.talent.skills[0]}`
      ];

      squad.push({
        roleTitle: role,
        talent: candidate.talent,
        score: candidate.score,
        reason: whyRec,
        recommendationPoints,
        projectRequirementCovered: roleDeliverableMap[role] || "Strategic Creative Execution",
        matchSignals: candidate.matchSignals,
        matchedSkills: candidate.matchedSkills,
        matchedIndustries: candidate.matchedIndustries,
        portfolioEvidence: candidate.portfolioEvidence
      });
    }
  }

  // Canonical workflow order (01 to 05)
  const roleWorkflowOrder: Record<string, number> = {
    "Brand Strategist": 1,
    "Consumer Research Specialist": 2,
    "Naming & Verbal Identity Specialist": 3,
    "Creative Director": 4,
    "Brand Identity Designer": 5,
    "Logo Designer": 6,
    "Art Director": 7,
    "Packaging Designer": 8,
    "Production & Print Specialist": 9,
    "3D & Spatial Designer": 10,
    "Illustrator": 11,
    "Visual Designer": 12,
    "UI/UX Designer": 13,
    "Web Designer": 14,
    "Motion Designer": 15,
    "Brand Photographer": 16,
    "Copywriter": 17,
    "Content Strategist": 18,
    "Brand Guidelines & Design Systems Specialist": 19
  };

  squad.sort(
    (a, b) =>
      (roleWorkflowOrder[a.roleTitle] || 99) - (roleWorkflowOrder[b.roleTitle] || 99)
  );

  return squad;
}

/**
 * Main AI Match Orchestrator (V3.1)
 * Integrates extraction, semantic scoring with portfolio evidence, and team assembly.
 */
export function analyzeProjectBrief(
  brief: string,
  customRequirements?: ProjectRequirements
): ProjectAnalysisResult {
  const requirements = customRequirements || extractProjectRequirements(brief);
  const scoredTalent = matchTalent(requirements, TALENT_PROFILES);
  const recommendedTeam = buildRecommendedTeam(requirements, scoredTalent);

  const selectedTalentIds = new Set(recommendedTeam.map((m) => m.talent.id));
  const candidatePool = scoredTalent
    .filter((c) => !selectedTalentIds.has(c.talent.id))
    .slice(0, 10);

  const requirementTags = requirements.deliverables.slice(0, 6);

  return {
    projectSummary: requirements.projectSummary,
    projectUnderstanding: requirements.projectUnderstanding,
    businessGoal: requirements.businessGoal,
    creativeGoal: requirements.creativeGoal,
    projectIntent: requirements.projectIntent,
    brandMaturity: requirements.brandMaturity,
    projectScale: requirements.projectScale,
    detectedIndustry: requirements.industry,
    primaryIndustry: requirements.primaryIndustry || requirements.industry,
    subIndustry: requirements.subIndustry,
    secondaryIndustries: requirements.secondaryIndustries,
    industryCategoryType: requirements.industryCategoryType,
    industryConfidence: requirements.industryConfidence,
    industryEvidence: requirements.industryEvidence,
    talentMatchingCategories: requirements.talentMatchingCategories,
    detectedProjectType: requirements.projectTypes[0] || "Full Brand Launch",
    requiredRoles: requirements.requiredRoles,
    optionalRoles: requirements.optionalRoles,
    requiredSkills: requirements.requiredSkills,
    requirementTags,
    industries: requirements.industries || [requirements.industry],
    projectTypes: requirements.projectTypes,
    deliverables: requirements.deliverables,
    audience: requirements.audience,
    audienceCharacteristics: requirements.audienceCharacteristics,
    currentBrandState: requirements.currentBrandState,
    desiredBrandState: requirements.desiredBrandState,
    creativeDirection: requirements.creativeDirection,
    brandAttributes: requirements.brandAttributes,
    digitalRequirements: requirements.digitalRequirements,
    campaignRequirements: requirements.campaignRequirements,
    researchRequirements: requirements.researchRequirements,
    productionRequirements: requirements.productionRequirements,
    complexity: requirements.complexity,
    constraints: requirements.constraints,
    explicitRequirements: requirements.explicitRequirements,
    inferredRequirements: requirements.inferredRequirements,
    inferredRequirementsWithConfidence: requirements.inferredRequirementsWithConfidence,
    missingInformation: requirements.missingInformation,
    clarificationQuestions: requirements.clarificationQuestions,
    analysisConfidence: requirements.analysisConfidence ?? 90,
    isVague: requirements.isVague,
    clarificationMessage: requirements.clarificationMessage,
    source: customRequirements ? "ai" : "fallback",
    refinementNotes: requirements.refinementNotes,
    changeSummary: requirements.changeSummary,
    recommendedTalent: candidatePool,
    recommendedTeam
  };
}
