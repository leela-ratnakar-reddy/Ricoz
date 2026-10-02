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

export interface ProjectAnalysisResult {
  projectSummary: string;
  projectUnderstanding?: string;
  projectScale?: string;
  detectedIndustry: string;
  detectedProjectType: string;
  requiredRoles: string[];
  requiredSkills: string[];
  requirementTags?: string[];
  industries: string[];
  projectTypes: string[];
  recommendedTalent: {
    talent: TalentProfile;
    score: number;
    matchReasons: string[];
  }[];
  recommendedTeam: {
    roleTitle: string;
    talent: TalentProfile;
    reason: string;
    score?: number;
    recommendationPoints?: string[];
    projectRequirementCovered?: string;
  }[];
}
