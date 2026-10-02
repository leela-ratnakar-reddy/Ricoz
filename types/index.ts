export type Role =
  | "Creative Director"
  | "Brand Identity Designer"
  | "Brand Strategist"
  | "Typography Specialist"
  | "Art Director"
  | "Visual Identity Designer"
  | "Packaging Designer"
  | "Logo Designer";

export type Industry =
  | "Technology"
  | "Finance"
  | "Healthcare"
  | "Consumer"
  | "Retail"
  | "Agriculture"
  | "Hospitality"
  | "Media & Entertainment"
  | "Energy & Industrial";

export type DesignStyle =
  | "Minimal"
  | "Bold"
  | "Editorial"
  | "Corporate"
  | "Experimental"
  | "Timeless"
  | "Expressive";

export type BudgetTier = "$$$" | "$$$$" | "$$$$$";

export type AvailabilityStatus = "Available now" | "Available soon" | "Booked";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "company" | "designer";
  avatar: string;
  title?: string;
  companyName?: string;
}

export interface PortfolioProject {
  id: string;
  designerId: string;
  title: string;
  client: string;
  industry: Industry;
  year: string;
  services: string[];
  description: string;
  challenge?: string;
  solution?: string;
  impact?: string;
  palette: string[]; // hex codes for visual abstract styling
  aspectRatio?: string;
  featured?: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  companyOrStudio: string;
  period: string;
  description: string;
}

export interface Designer {
  id: string;
  name: string;
  role: Role;
  title: string;
  location: string;
  avatar: string;
  initials: string;
  yearsExperience: number;
  bio: string;
  skills: string[];
  specializations: string[];
  industries: Industry[];
  styles: DesignStyle[];
  budgetTier: BudgetTier;
  dayRate: string;
  availability: AvailabilityStatus;
  matchPercentage?: number; // Base match percentage for default view
  verified: boolean;
  featured: boolean;
  previousClients: string[];
  experience: ExperienceItem[];
  portfolio: PortfolioProject[];
  rating: number;
  completedProjectsCount: number;
}

export interface Company {
  id: string;
  name: string;
  industry: Industry;
  logo: string;
  size: string;
  location: string;
  description: string;
  activeProjectsCount: number;
}

export type ProjectStatus = "Draft" | "Discovery" | "Matching" | "In Progress" | "Completed";

export interface Project {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  industry: Industry;
  status: ProjectStatus;
  timeline: string;
  startDate: string;
  budgetRange: string;
  budgetTier: BudgetTier;
  rebrandingGoals: string[];
  targetAudience: string;
  brandPersonality: string[];
  requiredServices: Role[];
  preferredStyles: DesignStyle[];
  availabilityRequirement: string;
  createdAt: string;
  recommendedCount?: number;
}

export interface MatchBreakdown {
  skills: number;
  industry: number;
  experience: number;
  style: number;
  budget: number;
  availability: number;
  location: number;
}

export interface MatchResult {
  designerId: string;
  designer: Designer;
  score: number;
  breakdown: MatchBreakdown;
  keyStrengths: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  projectId?: string;
  projectName?: string;
}

export interface ShortlistItem {
  id: string;
  designerId: string;
  addedAt: string;
  notes?: string;
}
