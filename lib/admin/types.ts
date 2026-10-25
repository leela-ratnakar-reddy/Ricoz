export type AdminRole =
  | "super_admin"
  | "ops_admin"
  | "dept_manager"
  | "team_member"
  | "auditor";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  departmentId: string | null;
  departmentName?: string;
  status: "active" | "suspended";
  avatar: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  headUserId?: string | null;
  head_user_id?: string | null;
  headUserName?: string;
  head_user_name?: string;
  description: string;
  memberCount?: number;
  member_count?: number;
  activeTaskCount?: number;
  active_task_count?: number;
  overdueTaskCount?: number;
  overdue_task_count?: number;
  createdAt?: string;
  created_at?: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "in_review" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  departmentId?: string;
  department_id?: string;
  departmentName?: string;
  department_name?: string;
  assigneeId?: string | null;
  assignee_id?: string | null;
  assigneeName?: string;
  assignee_name?: string;
  creatorId?: string;
  creator_id?: string;
  creatorName?: string;
  creator_name?: string;
  priority: TaskPriority;
  status: TaskStatus;
  blockerNote?: string | null;
  blocker_note?: string | null;
  isEscalated?: boolean | number;
  is_escalated?: boolean | number;
  dueDate?: string;
  due_date?: string;
  completedAt?: string | null;
  completed_at?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  commentsCount?: number;
  comments_count?: number;
}

export interface TaskComment {
  id: string;
  taskId?: string;
  task_id?: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  userAvatar?: string;
  user_avatar?: string;
  userRole?: AdminRole;
  user_role?: AdminRole;
  comment: string;
  isBlockerUpdate?: boolean | number;
  is_blocker_update?: boolean | number;
  createdAt?: string;
  created_at?: string;
}

export type ClientOnboardingStage =
  | "inquiry"
  | "contract_review"
  | "kickoff"
  | "active"
  | "churned";

export interface Client {
  id: string;
  name: string;
  industry: string;
  contactName?: string;
  contact_name?: string;
  contactEmail?: string;
  contact_email?: string;
  phone: string;
  companySize?: string;
  company_size?: string;
  onboardingStage?: ClientOnboardingStage;
  onboarding_stage?: ClientOnboardingStage;
  assignedOwnerId?: string | null;
  assigned_owner_id?: string | null;
  assignedOwnerName?: string;
  assigned_owner_name?: string;
  notes: string;
  nextFollowUp?: string | null;
  next_follow_up?: string | null;
  completedChecklistCount?: number;
  completed_checklist_count?: number;
  totalChecklistCount?: number;
  total_checklist_count?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface ClientOnboardingItem {
  id: string;
  clientId?: string;
  client_id?: string;
  title: string;
  category: string;
  isCompleted?: boolean | number;
  is_completed?: boolean | number;
  completedAt?: string | null;
  completed_at?: string | null;
  completedByUserId?: string | null;
  completed_by_user_id?: string | null;
  completedByUserName?: string;
  completed_by_user_name?: string;
}

export type VendorOnboardingStage =
  | "application"
  | "document_review"
  | "vetting"
  | "approved"
  | "rejected";

export type VendorVerificationStatus =
  | "unverified"
  | "pending_review"
  | "verified";

export interface Vendor {
  id: string;
  name: string;
  serviceCategory?: string;
  service_category?: string;
  contactName?: string;
  contact_name?: string;
  contactEmail?: string;
  contact_email?: string;
  phone: string;
  onboardingStage?: VendorOnboardingStage;
  onboarding_stage?: VendorOnboardingStage;
  verificationStatus?: VendorVerificationStatus;
  verification_status?: VendorVerificationStatus;
  assignedCoordinatorId?: string | null;
  assigned_coordinator_id?: string | null;
  assignedCoordinatorName?: string;
  assigned_coordinator_name?: string;
  notes: string;
  verifiedDocsCount?: number;
  verified_docs_count?: number;
  totalDocsCount?: number;
  total_docs_count?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface VendorDocument {
  id: string;
  vendorId?: string;
  vendor_id?: string;
  documentType?: string;
  document_type?: string;
  fileName?: string;
  file_name?: string;
  fileUrl?: string;
  file_url?: string;
  isVerified?: boolean | number;
  is_verified?: boolean | number;
  verifiedByUserId?: string | null;
  verified_by_user_id?: string | null;
  verifiedByUserName?: string;
  verified_by_user_name?: string;
  verifiedAt?: string | null;
  verified_at?: string | null;
  createdAt?: string;
  created_at?: string;
}

export type TicketCategory =
  | "onboarding"
  | "billing"
  | "talent_matching"
  | "platform_bug"
  | "service_quality";

export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "pending" | "escalated" | "resolved";

export interface SupportTicket {
  id: string;
  ticketRef?: string;
  ticket_ref?: string;
  clientId?: string | null;
  client_id?: string | null;
  clientName?: string;
  client_name?: string;
  customerName?: string;
  customer_name?: string;
  customerEmail?: string;
  customer_email?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedUserId?: string | null;
  assigned_user_id?: string | null;
  assignedUserName?: string;
  assigned_user_name?: string;
  resolvedAt?: string | null;
  resolved_at?: string | null;
  resolutionNotes?: string | null;
  resolution_notes?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  responsesCount?: number;
  responses_count?: number;
}

export interface TicketResponse {
  id: string;
  ticketId?: string;
  ticket_id?: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  userRole?: AdminRole;
  user_role?: AdminRole;
  message: string;
  isInternalNote?: boolean | number;
  is_internal_note?: boolean | number;
  createdAt?: string;
  created_at?: string;
}

export interface SOP {
  id: string;
  title: string;
  slug: string;
  departmentId?: string;
  department_id?: string;
  departmentName?: string;
  department_name?: string;
  category: string;
  summary: string;
  contentMarkdown?: string;
  content_markdown?: string;
  version: string;
  status: "draft" | "active" | "archived";
  ownerId?: string | null;
  owner_id?: string | null;
  ownerName?: string;
  owner_name?: string;
  lastReviewedAt?: string | null;
  last_reviewed_at?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  userId?: string;
  user_id?: string;
  title: string;
  message: string;
  type: "task_assigned" | "task_overdue" | "ticket_escalated" | "vendor_pending" | "system";
  link: string | null;
  isRead?: boolean | number;
  is_read?: boolean | number;
  createdAt?: string;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  actor_id?: string | null;
  actorName?: string;
  actor_name?: string;
  actorRole?: string;
  actor_role?: string;
  action: string;
  entityType?: string;
  entity_type?: string;
  entityId?: string;
  entity_id?: string;
  changeSummary?: string;
  change_summary?: string;
  ipAddress?: string | null;
  ip_address?: string | null;
  createdAt?: string;
  created_at?: string;
}

export interface OperationsKPIs {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  activeClients: number;
  onboardingClients: number;
  verifiedVendors: number;
  pendingVendors: number;
  openTickets: number;
  criticalTickets: number;
  resolvedTicketsRate: number;
}
