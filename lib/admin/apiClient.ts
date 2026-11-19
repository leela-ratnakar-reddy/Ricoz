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
};
