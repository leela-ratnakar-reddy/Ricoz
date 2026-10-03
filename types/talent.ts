export type Availability = "Available" | "Limited Availability" | "Busy";

export interface PortfolioProject {
  id: string;
  title: string;
  industry: string;
  projectType: string;
  description: string;
  services: string[];
  skills: string[];
  client?: string;
  year?: string;
  deliverables?: string[];
  impact?: string;
  image?: string;
}

export interface TalentProfile {
  id: string;
  name: string;
  role: string;
  experience: number;
  location: string;
  availability: Availability;
  skills: string[];
  specializations: string[];
  industries: string[];
  projectTypes: string[];
  tools: string[];
  workMode: string[];
  languages: string[];
  portfolioTags: string[];
  bio: string;
  hourlyRate: string;
  portfolio: PortfolioProject[];
  initials?: string;
  featured?: boolean;
  profileImage?: string;
}

export interface TalentFilterState {
  search: string;
  role: string;
  industry: string;
  experience: string;
  availability: string;
  location: string;
  workMode: string;
  projectType: string;
  skill: string;
  sortBy: "recommended" | "experience" | "availability" | "name";
}

export interface MatchSignal {
  label: string;
  matched: boolean;
  detail?: string;
}

export interface PortfolioEvidence {
  projectTitle: string;
  client?: string;
  projectType: string;
  industry: string;
  reason: string;
  matchedServices?: string[];
}

export interface MatchFeedback {
  projectId?: string;
  briefSnippet?: string;
  talentId: string;
  action: "shortlisted" | "rejected" | "viewed" | "contacted";
  timestamp: number;
  reason?: string;
}

export interface RefinementChangeSummary {
  added: string[];
  prioritized: string[];
  reduced: string[];
  talentMatchesChanged: number;
  summaryText: string;
}

export interface InferredRequirementWithConfidence {
  requirement: string;
  confidence: number; // 0 to 100
  reason: string;
}

export interface ProjectRequirements {
  // Core Narrative
  projectSummary: string;
  projectUnderstanding?: string;
  businessGoal?: string;
  creativeGoal?: string;
  projectIntent?: string;
  brandMaturity?: string;

  // Domain & Audience (V3.1 Taxonomy Separation)
  industry: string;
  primaryIndustry?: string;
  subIndustry?: string;
  secondaryIndustries?: string[];
  industries?: string[];
  industryCategoryType?: "domain" | "specialized" | "cross-domain";
  industryConfidence?: number;
  industryEvidence?: string[];
  talentMatchingCategories?: string[]; // Closest talent categories used for matching

  projectTypes: string[];
  audience?: string | string[];
  audienceCharacteristics?: string[];
  currentBrandState?: string;
  desiredBrandState?: string;

  // Disciplines & Capabilities
  requiredRoles: string[];
  optionalRoles?: string[];
  requiredSkills: string[];
  requiredSpecializations: string[];
  deliverables: string[];

  // Strategic & Functional Specifications
  creativeDirection?: string[];
  brandAttributes?: string[];
  digitalRequirements?: string[];
  campaignRequirements?: string[];
  researchRequirements?: string[];
  productionRequirements?: string[];

  // Scale, Complexity & Constraints
  projectScale: string;
  complexity?: "Simple" | "Moderate" | "Complex" | "Enterprise" | "Focused" | "Medium" | "High";
  timeline?: string;
  budgetSignals?: string;
  constraints?: string[];

  // Explicit vs Inferred Reasoning
  explicitRequirements?: string[];
  inferredRequirements?: string[];
  inferredRequirementsWithConfidence?: InferredRequirementWithConfidence[];
  missingInformation?: string[];
  clarificationQuestions?: string[];

  // Confidence & System State
  confidence?: number;
  analysisConfidence?: number;
  isVague?: boolean;
  clarificationMessage?: string;
  refinementNotes?: string;
  changeSummary?: RefinementChangeSummary;
}

export interface ScoredCandidate {
  talent: TalentProfile;
  score: number;
  matchReasons: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  matchedIndustries?: string[];
  matchedProjectTypes?: string[];
  matchedSpecializations?: string[];
  matchSignals?: MatchSignal[];
  portfolioEvidence?: PortfolioEvidence;
  skillsScore?: number;
  industryScore?: number;
  projectTypeScore?: number;
  specializationScore?: number;
  portfolioScore?: number;
  experienceScore?: number;
}

export interface RecommendedSquadMember {
  roleTitle: string;
  talent: TalentProfile;
  reason: string;
  score: number;
  recommendationPoints: string[];
  projectRequirementCovered: string;
  matchSignals?: MatchSignal[];
  matchedSkills?: string[];
  matchedIndustries?: string[];
  portfolioEvidence?: PortfolioEvidence;
}

export interface ProjectAnalysisResult {
  projectSummary: string;
  projectUnderstanding?: string;
  businessGoal?: string;
  creativeGoal?: string;
  projectIntent?: string;
  brandMaturity?: string;
  projectScale?: string;
  detectedIndustry: string;
  primaryIndustry?: string;
  subIndustry?: string;
  secondaryIndustries?: string[];
  industryCategoryType?: "domain" | "specialized" | "cross-domain";
  industryConfidence?: number;
  industryEvidence?: string[];
  talentMatchingCategories?: string[]; // Closest talent categories used for matching
  detectedProjectType: string;
  requiredRoles: string[];
  optionalRoles?: string[];
  requiredSkills: string[];
  requirementTags?: string[];
  industries: string[];
  projectTypes: string[];
  deliverables?: string[];
  audience?: string | string[];
  audienceCharacteristics?: string[];
  currentBrandState?: string;
  desiredBrandState?: string;
  creativeDirection?: string[];
  brandAttributes?: string[];
  digitalRequirements?: string[];
  campaignRequirements?: string[];
  researchRequirements?: string[];
  productionRequirements?: string[];
  complexity?: "Simple" | "Moderate" | "Complex" | "Enterprise" | "Focused" | "Medium" | "High";
  constraints?: string[];
  explicitRequirements?: string[];
  inferredRequirements?: string[];
  inferredRequirementsWithConfidence?: InferredRequirementWithConfidence[];
  missingInformation?: string[];
  clarificationQuestions?: string[];
  analysisConfidence?: number;
  isVague?: boolean;
  clarificationMessage?: string;
  source?: "ai" | "fallback";
  refinementNotes?: string;
  changeSummary?: RefinementChangeSummary;
  recommendedTalent: ScoredCandidate[];
  recommendedTeam: RecommendedSquadMember[];
}
