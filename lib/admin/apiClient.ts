/**
 * RICOZ Admin Operations — Typed Frontend API Client
 * 
 * Provides centralized, authenticated communication with the Next.js serverless backend
 * and InsForge PostgreSQL database across all 11 admin operational modules.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  [key: string]: unknown;
}

export type ApiResult<T> = T & { error?: string; message?: string };

async function request<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Include credentials for session cookie
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  const contentType = res.headers.get("content-type") || "";
  let data: any;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg =
      (typeof data === "object" && data !== null && (data.error || data.message)) ||
      `Request failed with status ${res.status}`;

    // Handle unauthorized session expiration
    if (res.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/admin/login")) {
        const from = encodeURIComponent(window.location.pathname);
        window.location.href = `/admin/login?from=${from}`;
      }
    }

    const error = new Error(errorMsg);
    (error as any).status = res.status;
    (error as any).data = data;
    throw error;
  }

  return data as ApiResult<T>;
}

export const adminApi = {
  // 1. Authentication & Session
  auth: {
    async me() {
      return request<{ success: boolean; user: any }>("/api/admin/auth/me");
    },
    async login(emailOrObj: string | { email: string; password: string }, password?: string) {
      const email = typeof emailOrObj === "string" ? emailOrObj : emailOrObj.email;
      const pwd = typeof emailOrObj === "string" ? password! : emailOrObj.password;
      return request<{ success: boolean; user: any; sessionToken: string }>("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pwd }),
      });
    },
    async logout() {
      return request<{ success: boolean; message: string }>("/api/admin/auth/logout", {
        method: "POST",
      });
    },
  },

  // 2. Operations Dashboard & Badges
  dashboard: {
    async getStats(departmentId?: string, range = "30d") {
      const query = new URLSearchParams();
      if (departmentId) query.set("departmentId", departmentId);
      if (range) query.set("range", range);
      return request<{ success: boolean; data: any }>(`/api/admin/dashboard?${query.toString()}`);
    },
    async getBadges() {
      return request<{ success: boolean; counts: any }>("/api/admin/dashboard/badges");
    },
  },

  // 3. Tasks & Workflows
  tasks: {
    async list(filters?: {
      departmentId?: string;
      status?: string;
      priority?: string;
      assigneeId?: string;
      search?: string;
    }) {
      const query = new URLSearchParams();
      if (filters?.departmentId) query.set("departmentId", filters.departmentId);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.priority) query.set("priority", filters.priority);
      if (filters?.assigneeId) query.set("assigneeId", filters.assigneeId);
      if (filters?.search) query.set("search", filters.search);
      return request<{ success: boolean; tasks: any[] }>(`/api/admin/tasks?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; task: any; comments: any[] }>(`/api/admin/tasks/${id}`);
    },
    async create(data: {
      title: string;
      description?: string;
      departmentId: string;
      assigneeId?: string | null;
      priority?: string;
      dueDate?: string;
      blockerNote?: string | null;
      isEscalated?: boolean;
    }) {
      return request<{ success: boolean; taskId: string; task: any }>("/api/admin/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Record<string, unknown>) {
      return request<{ success: boolean; task: any }>(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/tasks/${id}`, {
        method: "DELETE",
      });
    },
    async addComment(taskId: string, comment: string, isBlockerUpdate = false) {
      return request<{ success: boolean; comment: any }>(`/api/admin/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ comment, isBlockerUpdate }),
      });
    },
  },

  // 4. Clients Management
  clients: {
    async list(filters?: { stage?: string; industry?: string; search?: string }) {
      const query = new URLSearchParams();
      if (filters?.stage) query.set("stage", filters.stage);
      if (filters?.industry) query.set("industry", filters.industry);
      if (filters?.search) query.set("search", filters.search);
      return request<{ success: boolean; clients: any[] }>(`/api/admin/clients?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; client: any; checklist: any[] }>(`/api/admin/clients/${id}`);
    },
    async create(data: {
      name: string;
      industry: string;
      contactName?: string;
      contactEmail?: string;
      phone?: string;
      companySize?: string;
      onboardingStage?: string;
      assignedOwnerId?: string | null;
      notes?: string;
      nextFollowUp?: string | null;
    }) {
      return request<{ success: boolean; clientId: string; client: any }>("/api/admin/clients", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Record<string, unknown>) {
      return request<{ success: boolean; client: any }>(`/api/admin/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/clients/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 5. Vendors & Compliance
  vendors: {
    async list(filters?: { status?: string; stage?: string; category?: string; search?: string }) {
      const query = new URLSearchParams();
      if (filters?.status) query.set("status", filters.status);
      if (filters?.stage) query.set("stage", filters.stage);
      if (filters?.category) query.set("category", filters.category);
      if (filters?.search) query.set("search", filters.search);
      return request<{ success: boolean; vendors: any[] }>(`/api/admin/vendors?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; vendor: any; documents: any[] }>(`/api/admin/vendors/${id}`);
    },
    async create(data: {
      name: string;
      serviceCategory: string;
      contactName?: string;
      contactEmail?: string;
      phone?: string;
      assignedCoordinatorId?: string | null;
      notes?: string;
    }) {
      return request<{ success: boolean; vendorId: string; vendor: any }>("/api/admin/vendors", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Record<string, unknown>) {
      return request<{ success: boolean; vendor: any }>(`/api/admin/vendors/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/vendors/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 6. Support Tickets
  support: {
    async list(filters?: { status?: string; priority?: string; category?: string; search?: string }) {
      const query = new URLSearchParams();
      if (filters?.status) query.set("status", filters.status);
      if (filters?.priority) query.set("priority", filters.priority);
      if (filters?.category) query.set("category", filters.category);
      if (filters?.search) query.set("search", filters.search);
      return request<{ success: boolean; tickets: any[] }>(`/api/admin/support?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; ticket: any; responses: any[] }>(`/api/admin/support/${id}`);
    },
    async create(data: {
      clientId?: string | null;
      customerName: string;
      customerEmail: string;
      category: string;
      priority: string;
      subject: string;
      description: string;
      assignedUserId?: string | null;
    }) {
      return request<{ success: boolean; ticketId: string; ticket: any }>("/api/admin/support", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Record<string, unknown>) {
      return request<{ success: boolean; ticket: any }>(`/api/admin/support/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    async addResponse(ticketId: string, message: string, isInternalNote = false) {
      return request<{ success: boolean; response: any }>(`/api/admin/support/${ticketId}/responses`, {
        method: "POST",
        body: JSON.stringify({ message, isInternalNote }),
      });
    },
  },

  // 7. SOPs & Knowledge Base
  sops: {
    async list(filters?: { departmentId?: string; category?: string; status?: string; search?: string }) {
      const query = new URLSearchParams();
      if (filters?.departmentId) query.set("departmentId", filters.departmentId);
      if (filters?.category) query.set("category", filters.category);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.search) query.set("search", filters.search);
      return request<{ success: boolean; sops: any[] }>(`/api/admin/sops?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; sop: any }>(`/api/admin/sops/${id}`);
    },
    async create(data: {
      title: string;
      departmentId: string;
      category: string;
      version?: string;
      summary?: string;
      contentMarkdown?: string;
    }) {
      return request<{ success: boolean; sopId: string; sop: any }>("/api/admin/sops", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Record<string, unknown>) {
      return request<{ success: boolean; sop: any }>(`/api/admin/sops/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/sops/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 8. Departments & Members
  departments: {
    async list() {
      return request<{ success: boolean; departments: any[] }>("/api/admin/departments");
    },
    async create(data: { name: string; slug: string; description?: string; headUserId?: string | null }) {
      return request<{ success: boolean; departmentId: string; department: any }>("/api/admin/departments", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async assignHead(id: string, headUserId: string | null) {
      return request<{ success: boolean; department: any }>(`/api/admin/departments/${id}/head`, {
        method: "PATCH",
        body: JSON.stringify({ headUserId }),
      });
    },
    async addMember(data: {
      departmentId: string;
      adminUserId: string;
      membershipRole?: string;
      isPrimary?: boolean;
    }) {
      return request<{ success: boolean; memberId: string; member: any }>("/api/admin/departments/members", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async removeMember(departmentId: string, adminUserId: string) {
      return request<{ success: boolean; message: string }>("/api/admin/departments/members", {
        method: "DELETE",
        body: JSON.stringify({ departmentId, adminUserId }),
      });
    },
  },

  // 9. Team, Roles, Permissions & Overrides
  team: {
    async listUsers(filters?: { departmentId?: string; role?: string; status?: string; search?: string }) {
      const query = new URLSearchParams();
      if (filters?.departmentId) query.set("departmentId", filters.departmentId);
      if (filters?.role) query.set("role", filters.role);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.search) query.set("search", filters.search);
      return request<{ success: boolean; users: any[] }>(`/api/admin/team/users?${query.toString()}`);
    },
    async getUser(id: string) {
      return request<{ success: boolean; user: any }>(`/api/admin/team/users/${id}`);
    },
    async createUser(data: {
      email: string;
      fullName: string;
      role: string;
      departmentId?: string | null;
      password?: string;
    }) {
      return request<{ success: boolean; user: any }>("/api/admin/team/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async updateUser(id: string, data: { fullName?: string; role?: string; departmentId?: string | null; status?: string }) {
      return request<{ success: boolean; message: string }>(`/api/admin/team/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    async revokeSessions(userId: string, action: "revoke_all" | "revoke_one" = "revoke_all", sessionId?: string) {
      return request<{ success: boolean; revokedCount: number }>(`/api/admin/team/users/${userId}/sessions`, {
        method: "POST",
        body: JSON.stringify({ action, sessionId }),
      });
    },
    async listRoles() {
      return request<{ success: boolean; roles: any[] }>("/api/admin/team/roles");
    },
    async listPermissions() {
      return request<{ success: boolean; permissions: any[] }>("/api/admin/team/permissions");
    },
    async listOverrides() {
      return request<{ success: boolean; overrides: any[] }>("/api/admin/team/overrides");
    },
    async createOverride(data: {
      adminUserId: string;
      permissionSlug: string;
      effect: "allow" | "deny";
      reason: string;
      expiresAt?: string | null;
    }) {
      return request<{ success: boolean; override: any }>("/api/admin/team/overrides", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async deleteOverride(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/team/overrides?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  },

  // 9b. Platform Registered Users (Talent & Company Accounts)
  platformUsers: {
    async list(filters?: {
      search?: string;
      accountType?: string;
      isVerified?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) {
      const query = new URLSearchParams();
      if (filters?.search) query.set("search", filters.search);
      if (filters?.accountType) query.set("accountType", filters.accountType);
      if (filters?.isVerified) query.set("isVerified", filters.isVerified);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.page) query.set("page", String(filters.page));
      if (filters?.limit) query.set("limit", String(filters.limit));
      return request<{
        success: boolean;
        users: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        metrics: {
          total: number;
          talent: number;
          company: number;
          verified: number;
          pendingVerification: number;
          active: number;
          suspended: number;
          deactivated: number;
        };
      }>(`/api/admin/users?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; user: any }>(`/api/admin/users/${encodeURIComponent(id)}`);
    },
    async update(
      id: string,
      data: {
        status?: "active" | "suspended" | "deactivated";
        isVerified?: boolean;
        reason?: string;
      }
    ) {
      return request<{ success: boolean; message: string; user: any }>(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
  },

  // 9c. Creative Talent Specialists
  talent: {
    async list(filters?: {
      search?: string;
      skill?: string;
      location?: string;
      isVerified?: string;
      status?: string;
      availability?: string;
      minExp?: number;
      page?: number;
      limit?: number;
    }) {
      const query = new URLSearchParams();
      if (filters?.search) query.set("search", filters.search);
      if (filters?.skill) query.set("skill", filters.skill);
      if (filters?.location) query.set("location", filters.location);
      if (filters?.isVerified) query.set("isVerified", filters.isVerified);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.availability) query.set("availability", filters.availability);
      if (filters?.minExp) query.set("minExp", String(filters.minExp));
      if (filters?.page) query.set("page", String(filters.page));
      if (filters?.limit) query.set("limit", String(filters.limit));
      return request<{
        success: boolean;
        talent: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        metrics: {
          total: number;
          verified: number;
          active: number;
          suspended: number;
          completedProfiles: number;
        };
      }>(`/api/admin/talent?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; talent: any }>(`/api/admin/talent/${encodeURIComponent(id)}`);
    },
    async update(
      id: string,
      data: {
        status?: "active" | "suspended" | "deactivated";
        is_verified?: boolean;
        hourly_rate?: number;
        availability?: string;
      }
    ) {
      return request<{ success: boolean; message: string; changes: string[] }>(`/api/admin/talent/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
  },

  // 9d. Enterprise Company Clients
  companies: {
    async list(filters?: {
      search?: string;
      industry?: string;
      companySize?: string;
      isVerified?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) {
      const query = new URLSearchParams();
      if (filters?.search) query.set("search", filters.search);
      if (filters?.industry) query.set("industry", filters.industry);
      if (filters?.companySize) query.set("companySize", filters.companySize);
      if (filters?.isVerified) query.set("isVerified", filters.isVerified);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.page) query.set("page", String(filters.page));
      if (filters?.limit) query.set("limit", String(filters.limit));
      return request<{
        success: boolean;
        companies: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        metrics: {
          total: number;
          verified: number;
          active: number;
          suspended: number;
          companiesWithProjects: number;
        };
      }>(`/api/admin/companies?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; company: any }>(`/api/admin/companies/${encodeURIComponent(id)}`);
    },
    async update(
      id: string,
      data: {
        status?: "active" | "suspended" | "deactivated";
        is_verified?: boolean;
        company_name?: string;
        industry?: string;
        company_size?: string;
        website_url?: string;
      }
    ) {
      return request<{ success: boolean; message: string; changes: string[] }>(`/api/admin/companies/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
  },

  // 9e. Platform Opportunities & Mandates
  opportunities: {
    async list(filters?: {
      search?: string;
      status?: string;
      budgetTier?: string;
      companyId?: string;
      page?: number;
      limit?: number;
    }) {
      const query = new URLSearchParams();
      if (filters?.search) query.set("search", filters.search);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.budgetTier) query.set("budgetTier", filters.budgetTier);
      if (filters?.companyId) query.set("companyId", filters.companyId);
      if (filters?.page) query.set("page", String(filters.page));
      if (filters?.limit) query.set("limit", String(filters.limit));
      return request<{
        success: boolean;
        opportunities: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        metrics: {
          total: number;
          discovery: number;
          matching: number;
          active: number;
          closed: number;
          totalApplications: number;
        };
      }>(`/api/admin/opportunities?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; opportunity: any }>(`/api/admin/opportunities/${encodeURIComponent(id)}`);
    },
    async update(
      id: string,
      data: {
        status?: string;
        budget_tier?: string;
        timeline?: string;
      }
    ) {
      return request<{ success: boolean; message: string; changes: string[] }>(`/api/admin/opportunities/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
  },

  // 9f. Project Proposals & Applications
  applications: {
    async list(filters?: {
      search?: string;
      status?: string;
      projectId?: string;
      talentUserId?: string;
      page?: number;
      limit?: number;
    }) {
      const query = new URLSearchParams();
      if (filters?.search) query.set("search", filters.search);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.projectId) query.set("projectId", filters.projectId);
      if (filters?.talentUserId) query.set("talentUserId", filters.talentUserId);
      if (filters?.page) query.set("page", String(filters.page));
      if (filters?.limit) query.set("limit", String(filters.limit));
      return request<{
        success: boolean;
        applications: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        metrics: {
          total: number;
          pending: number;
          reviewed: number;
          shortlisted: number;
          accepted: number;
          declined: number;
          avgProposedRate: number;
        };
      }>(`/api/admin/applications?${query.toString()}`);
    },
    async get(id: string) {
      return request<{ success: boolean; application: any }>(`/api/admin/applications/${encodeURIComponent(id)}`);
    },
    async update(
      id: string,
      data: {
        status?: "pending" | "reviewed" | "shortlisted" | "accepted" | "declined";
        proposed_rate?: number;
      }
    ) {
      return request<{ success: boolean; message: string; changes: string[] }>(`/api/admin/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
  },

  // 10. Notifications
  notifications: {
    async list() {
      return request<{ success: boolean; notifications: any[] }>("/api/admin/notifications");
    },
    async markRead(notificationId?: string) {
      return request<{ success: boolean; message: string }>("/api/admin/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId }),
      });
    },
    async markAllRead() {
      return request<{ success: boolean; message: string }>("/api/admin/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  },

  // 11. Security Audit Logs
  audit: {
    async list(filters?: { entityType?: string; search?: string; limit?: number }) {
      const query = new URLSearchParams();
      if (filters?.entityType) query.set("entityType", filters.entityType);
      if (filters?.search) query.set("search", filters.search);
      if (filters?.limit) query.set("limit", String(filters.limit));
      return request<{ success: boolean; logs: any[] }>(`/api/admin/audit-log?${query.toString()}`);
    },
  },

  // 12. Reports & Analytics
  reports: {
    async get(departmentId?: string, range = "30d") {
      const query = new URLSearchParams();
      if (departmentId) query.set("departmentId", departmentId);
      if (range) query.set("range", range);
      return request<{ success: boolean; reports: any }>(`/api/admin/reports?${query.toString()}`);
    },
    exportUrl(type = "tasks") {
      return `/api/admin/reports/export?type=${encodeURIComponent(type)}`;
    },
  },

  // 12b. Advanced Platform Analytics
  analytics: {
    async getOverview(params?: { range?: string; startDate?: string; endDate?: string }) {
      const query = new URLSearchParams();
      if (params?.range) query.set("range", params.range);
      if (params?.startDate) query.set("startDate", params.startDate);
      if (params?.endDate) query.set("endDate", params.endDate);
      return request<{
        success: boolean;
        range: string;
        startDate: string;
        endDate: string;
        overview: any;
        userGrowth: any[];
        talentAnalytics: any;
        companyAnalytics: any;
        opportunityAnalytics: any;
        applicationAnalytics: any;
        recentActivity: any[];
      }>(`/api/admin/analytics/overview?${query.toString()}`);
    },
    exportUrl(type = "analytics") {
      return `/api/admin/reports/export?type=${encodeURIComponent(type)}`;
    },
  },

  // 13. Public Website CMS & Inquiries Management
  website: {
    async getEnquiries(filters?: { status?: string; search?: string }) {
      const query = new URLSearchParams();
      if (filters?.status) query.set("status", filters.status);
      if (filters?.search) query.set("search", filters.search);
      return request<{ success: boolean; enquiries: any[] }>(`/api/admin/website/enquiries?${query.toString()}`);
    },
    async updateEnquiry(id: string, status: string) {
      return request<{ success: boolean; message: string }>("/api/admin/website/enquiries", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
    },
    async deleteEnquiry(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/website/enquiries?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
    async getSections() {
      return request<{ success: boolean; sections: any[] }>("/api/admin/website/sections");
    },
    async updateSection(id: string, data: { title?: string; subtitle?: string | null; isPublished?: boolean; contentPayload?: any }) {
      return request<{ success: boolean; message: string }>("/api/admin/website/sections", {
        method: "PATCH",
        body: JSON.stringify({ id, ...data }),
      });
    },
    async getFaqs() {
      return request<{ success: boolean; faqs: any[] }>("/api/admin/website/faqs");
    },
    async createFaq(data: { question: string; answer: string; category?: string; isPublished?: boolean }) {
      return request<{ success: boolean; faqId: string; message: string }>("/api/admin/website/faqs", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async updateFaq(id: string, data: { question?: string; answer?: string; category?: string; isPublished?: boolean; displayOrder?: number }) {
      return request<{ success: boolean; message: string }>("/api/admin/website/faqs", {
        method: "PATCH",
        body: JSON.stringify({ id, ...data }),
      });
    },
    async deleteFaq(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/website/faqs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
    async getTestimonials() {
      return request<{ success: boolean; testimonials: any[] }>("/api/admin/website/testimonials");
    },
    async createTestimonial(data: { clientName: string; company: string; role: string; quote: string; rating?: number; isFeatured?: boolean; isPublished?: boolean }) {
      return request<{ success: boolean; testimonialId: string; message: string }>("/api/admin/website/testimonials", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async updateTestimonial(id: string, data: { clientName?: string; company?: string; role?: string; quote?: string; rating?: number; isFeatured?: boolean; isPublished?: boolean; displayOrder?: number }) {
      return request<{ success: boolean; message: string }>("/api/admin/website/testimonials", {
        method: "PATCH",
        body: JSON.stringify({ id, ...data }),
      });
    },
    async deleteTestimonial(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/website/testimonials?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
    async getSettings() {
      return request<{ success: boolean; settings: Record<string, any> }>("/api/admin/website/settings");
    },
    async updateSetting(key: string, value: any) {
      return request<{ success: boolean; message: string }>("/api/admin/website/settings", {
        method: "PATCH",
        body: JSON.stringify({ key, value }),
      });
    },
  },

  // 14. Public Unauthenticated APIs
  public: {
    async getContent() {
      return request<{ success: boolean; sections: Record<string, any>; settings: Record<string, any>; testimonials: any[] }>("/api/public/content");
    },
    async getFaqs(category?: string) {
      const query = category ? `?category=${encodeURIComponent(category)}` : "";
      return request<{ success: boolean; faqs: any[] }>(`/api/public/faqs${query}`);
    },
    async submitEnquiry(data: {
      fullName: string;
      email: string;
      company: string;
      mandateType?: string;
      timeline?: string;
      projectBrief: string;
      budgetRange?: string;
      website_url?: string;
      hp_field?: string;
    }) {
      return request<{ success: boolean; enquiryId: string; message: string }>("/api/public/enquiry", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  // 15. AI Operations Intelligence System (V4.2)
  aiStudio: {
    async queryAssistant(query: string) {
      return request<{
        success: boolean;
        answer: string;
        source: "gemini" | "openrouter" | "heuristic";
        providerConfigured: boolean;
        intent: string;
        supportingData: any;
        suggestedFollowUps: string[];
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "assistant_query", inputData: { query } }),
      });
    },
    async getBusinessIntelligence(range: string = "30d") {
      return request<{
        success: boolean;
        insights: any[];
        summary: string;
        metrics: any;
        providerConfigured: boolean;
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "business_intelligence", inputData: { range } }),
      });
    },
    async runSpecialistAgent(agentType: string, inputData?: any) {
      return request<{
        success: boolean;
        agentType: string;
        agentName: string;
        agentPurpose: string;
        available: boolean;
        result: any;
        providerConfigured: boolean;
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "specialist_agent", inputData: { agentType, ...inputData } }),
      });
    },
    async runTaskCopilot(action: "breakdown" | "summarize" | "recommendations", taskData?: any) {
      return request<{
        success: boolean;
        action: string;
        [key: string]: any;
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "task_copilot", inputData: { action, ...taskData } }),
      });
    },
    async getSupportIntelligence(data: { ticketId?: string; subject?: string; description?: string }) {
      return request<{
        success: boolean;
        output: any;
        evaluatedCategory: string;
        suggestedPriority: string;
        draftResponse: string;
        recommendedNextAction: string;
        providerConfigured: boolean;
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "support_intelligence", inputData: data }),
      });
    },
    async getUserCompanyInsights(type: "talent" | "company", id: string) {
      return request<{
        success: boolean;
        type: string;
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
        completenessScore: number;
        fieldsChecklist: Array<{ name: string; present: boolean }>;
        administrativeObservations: string;
        [key: string]: any;
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "user_company_insights", inputData: { type, id } }),
      });
    },
    async generateReport(reportType: string, dateRange: string = "30d") {
      return request<{
        success: boolean;
        output: string;
        report: {
          reportType: string;
          title: string;
          dateRange: string;
          generatedAt: string;
          content: string;
          csvData: any[];
        };
        source: string;
        providerConfigured: boolean;
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "generate_report", inputData: { reportType, dateRange } }),
      });
    },
    async getRecommendations() {
      return request<{
        success: boolean;
        suggestions: any[];
        providerConfigured: boolean;
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "recommendations" }),
      });
    },
    async getUsageHistory(limit: number = 20) {
      return request<{
        success: boolean;
        history: any[];
        providerConfigured: boolean;
      }>("/api/admin/ai-studio", {
        method: "POST",
        body: JSON.stringify({ tool: "usage_history", inputData: { limit } }),
      });
    },
  },
};
