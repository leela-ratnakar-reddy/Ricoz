/**
 * Automated Verification Suite for RICOZ Frontend Demo Services
 */

import assert from "node:assert";

// Mock localStorage and browser globals for Node testing
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockLS = new MockLocalStorage();
(global as any).window = {
  localStorage: mockLS,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};
(global as any).document = {
  cookie: "",
  createElement: () => ({ setAttribute: () => {}, click: () => {}, style: {} }),
  body: { appendChild: () => {}, removeChild: () => {} },
};
(global as any).CustomEvent = class CustomEvent {
  constructor(public type: string, public detail?: any) {}
};
(global as any).Blob = class Blob {
  constructor(public parts: any[], public options?: any) {}
};
(globalThis.URL as any).createObjectURL = () => "blob:mock-url";
(globalThis.URL as any).revokeObjectURL = () => {};

async function runTestSuite() {
  console.log("===============================================================");
  console.log("RICOZ FRONTEND DEMO ADMIN PANEL: VERIFICATION SUITE");
  console.log("===============================================================\n");

  const {
    ensureDemoInitialized,
    getDemoSession,
    demoLogin,
    demoLogout,
    resetAllDemoData,
    DEMO_PRESET_ACCOUNTS,
    getDashboardStats,
    getDashboardBadges,
    getUsers,
    createUser,
    updateUser,
    getRoles,
    getPermissions,
    getUserOverrides,
    addOverride,
    deleteOverride,
    getDepartments,
    createDepartment,
    updateDepartment,
    assignDepartmentHead,
    getDepartmentMembers,
    getClients,
    getClientById,
    createClient,
    updateClient,
    toggleClientChecklistItem,
    deleteClient,
    getVendors,
    getVendorById,
    createVendor,
    updateVendor,
    verifyVendorDocument,
    deleteVendor,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    addTaskComment,
    deleteTask,
    getTickets,
    getTicketById,
    createTicket,
    updateTicket,
    resolveTicket,
    addTicketResponse,
    getSOPs,
    getSOPById,
    createSOP,
    updateSOP,
    deleteSOP,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    addNotification,
    getReports,
    exportReportsToCsv,
    getAuditLogs,
    logAuditEvent,
  } = await import("../lib/demo/index");

  // 1. Initialization
  console.log(">>> [1/10] Storage Initialization & Data Seeding");
  ensureDemoInitialized();
  const initUsers = getUsers();
  assert(initUsers.length >= 6, "Seed users populated");
  console.log(`✅ [PASS] Found ${initUsers.length} initialized demo users`);

  const initDepts = getDepartments();
  assert(initDepts.length === 10, "10 departments populated");
  console.log(`✅ [PASS] Found 10 initialized departments`);

  // 2. Authentication & Session Persistence
  console.log("\n>>> [2/10] Authentication & Session Simulation");
  assert(getDemoSession() === null, "No session initially");

  const loginRes = demoLogin("aadinathachary@gmail.com", "Ricozhoo@123");
  assert(loginRes.success === true, "Demo login succeeds");
  assert(loginRes.user?.email === "aadinathachary@gmail.com", "User email matches");
  assert(loginRes.user?.role === "super_admin", "User role is super_admin");
  console.log("✅ [PASS] Logged in as Super Admin (aadinathachary@gmail.com)");

  const restoredSession = getDemoSession();
  assert(restoredSession !== null, "Session restored from localStorage");
  assert(restoredSession?.email === "aadinathachary@gmail.com", "Restored session email matches");
  console.log("✅ [PASS] Session properly restored from LocalStorage");

  demoLogout();
  assert(getDemoSession() === null, "Session cleared on logout");
  console.log("✅ [PASS] Logout successfully clears simulated session");

  // Re-login for remaining tests
  demoLogin("aadinathachary@gmail.com", "Ricozhoo@123");

  // 3. Dashboard KPIs & Badges
  console.log("\n>>> [3/10] Dashboard Stats & Badges");
  const stats = getDashboardStats();
  assert(stats.kpis.totalTasks >= 6, "Total tasks counted");
  assert(stats.kpis.activeClients >= 2, "Active clients counted");
  assert(stats.kpis.verifiedVendors >= 2, "Verified vendors counted");
  assert(stats.urgentTasks.length > 0, "Urgent tasks populated");
  assert(stats.deptWorkloads.length === 10, "All 10 dept workloads computed");
  console.log(`✅ [PASS] Dashboard KPIs: ${stats.kpis.totalTasks} tasks, ${stats.kpis.activeClients} active clients, ${stats.kpis.verifiedVendors} verified vendors`);

  const badges = getDashboardBadges();
  assert(typeof badges.overdueTasks === "number", "Overdue tasks count present");
  assert(typeof badges.openTickets === "number", "Open tickets count present");
  console.log(`✅ [PASS] Dashboard badges: ${badges.overdueTasks} overdue tasks, ${badges.openTickets} open tickets, ${badges.pendingVendors} pending vendors`);

  // 4. Team & Governance
  console.log("\n>>> [4/10] Team Management & Access Overrides");
  const newUser = createUser({
    fullName: "Test Engineer",
    email: "test.engineer@ricoz.io",
    role: "team_member",
    departmentId: "dept-tech",
  });
  assert(newUser.id.startsWith("usr-"), "New user created");
  console.log("✅ [PASS] Created new team member");

  const updatedUser = updateUser(newUser.id, { role: "tech_manager" });
  assert(updatedUser?.role === "tech_manager", "Updated user role");
  console.log("✅ [PASS] Updated user role");

  const newOverride = addOverride({
    userId: newUser.id,
    permissionId: "tasks.delete",
    effect: "allow",
    reason: "Temporary mandate for QA cleanup",
  });
  assert(newOverride.effect === "allow", "Applied allow override");
  console.log("✅ [PASS] Applied explicit permission override");

  deleteOverride(newOverride.id);
  const remainingOverrides = getUserOverrides();
  assert(!remainingOverrides.some((o) => o.id === newOverride.id), "Override deleted");
  console.log("✅ [PASS] Deleted permission override");

  // 5. Departments
  console.log("\n>>> [5/10] Departments & Membership");
  const newDept = createDepartment({
    name: "Special Projects Studio",
    description: "Confidential skunkworks initiatives",
  });
  assert(newDept.id.startsWith("dept-"), "New department created");
  console.log("✅ [PASS] Created new department");

  assignDepartmentHead(newDept.id, newUser.id);
  const reloadedDepts = getDepartments();
  const foundDept = reloadedDepts.find((d) => d.id === newDept.id);
  assert(foundDept?.headUserId === newUser.id, "Department head assigned");
  console.log("✅ [PASS] Assigned department head");

  // 6. Clients & Onboarding Checklists
  console.log("\n>>> [6/10] Clients & Onboarding Checklists");
  const newClient = createClient({
    name: "Starlight Aerospace",
    industry: "Defense & Space",
    contactName: "Commander Sarah Vance",
    onboardingStage: "contract_review",
  });
  assert(newClient.id.startsWith("cli-"), "New client created");
  console.log("✅ [PASS] Created new enterprise client");

  const clientDetail = getClientById(newClient.id);
  assert(clientDetail.checklist.length === 5, "Initial 5 checklist items seeded");
  console.log("✅ [PASS] Verified 5 default checklist items generated");

  const toggledItem = toggleClientChecklistItem(newClient.id, clientDetail.checklist[0].id, true);
  assert(toggledItem?.isCompleted === true, "Checklist item marked complete");
  console.log("✅ [PASS] Toggled checklist item to completed");

  deleteClient(newClient.id);
  const clientAfterDelete = getClientById(newClient.id);
  assert(clientAfterDelete.client === null, "Client successfully deleted");
  console.log("✅ [PASS] Client deleted successfully");

  // 7. Vendors & Document Verification
  console.log("\n>>> [7/10] Vendors & Compliance Verification");
  const newVendor = createVendor({
    name: "Kinetics Audio Atelier",
    serviceCategory: "Sound Design & Sonic Branding",
    contactName: "Marcus Bell",
  });
  assert(newVendor.id.startsWith("ven-"), "New vendor created");
  console.log("✅ [PASS] Created new vendor partner");

  const vendorDetail = getVendorById(newVendor.id);
  assert(vendorDetail.documents.length === 1, "Default MSA document attached");

  verifyVendorDocument(newVendor.id, vendorDetail.documents[0].id, true);
  const reloadedVendor = getVendorById(newVendor.id);
  assert(reloadedVendor.documents[0].isVerified === true, "Document verified");
  assert(reloadedVendor.vendor?.verificationStatus === "verified", "Vendor auto-promoted to verified");
  console.log("✅ [PASS] Document verified & vendor promoted to verified status");

  deleteVendor(newVendor.id);
  assert(getVendorById(newVendor.id).vendor === null, "Vendor deleted");
  console.log("✅ [PASS] Vendor deleted successfully");

  // 8. Tasks & Workflow Lifecycle
  console.log("\n>>> [8/10] Tasks, Prioritization & Comments");
  const newTask = createTask({
    title: "Verify WebGL Shader Frame Latency",
    priority: "urgent",
    status: "in_progress",
    departmentId: "dept-tech",
  });
  assert(newTask.id.startsWith("tsk-"), "New task created");
  console.log("✅ [PASS] Created new operational task");

  updateTask(newTask.id, { status: "blocked", blockerNote: "GPU shader buffer overflow" });
  const updatedTask = getTaskById(newTask.id);
  assert(updatedTask.task?.status === "blocked", "Task marked blocked");
  console.log("✅ [PASS] Updated task status to blocked with blocker note");

  addTaskComment(newTask.id, "Investigating shader precision on iOS WebKit", true);
  const withComments = getTaskById(newTask.id);
  assert(withComments.comments.length === 1, "Comment linked to task");
  console.log("✅ [PASS] Added comment to task");

  deleteTask(newTask.id);
  assert(getTaskById(newTask.id).task === null, "Task deleted");
  console.log("✅ [PASS] Task deleted successfully");

  // 9. Support, SOPs & Notifications
  console.log("\n>>> [9/10] Support Tickets, SOPs & Notifications");
  const newTicket = createTicket({
    subject: "Escrow release inquiry for milestone 2",
    priority: "high",
    category: "billing",
  });
  assert(newTicket.id.startsWith("tic-"), "Ticket created");
  console.log("✅ [PASS] Created support ticket");

  resolveTicket(newTicket.id, "Confirmed escrow funds cleared to talent account.");
  const resTicket = getTicketById(newTicket.id);
  assert(resTicket.ticket?.status === "resolved", "Ticket marked resolved");
  console.log("✅ [PASS] Resolved support ticket with resolution notes");

  const newSop = createSOP({
    title: "Milestone Dispute Mediation",
    category: "Client Success",
    summary: "Mediation workflow for milestone delivery disagreements",
  });
  assert(newSop.id.startsWith("sop-"), "SOP created");
  console.log("✅ [PASS] Authored new SOP");

  const newNotif = addNotification("Urgent Escrow Update", "Milestone released", "system");
  assert(newNotif.id.startsWith("notif-"), "Notification created");
  markNotificationAsRead(newNotif.id);
  const allNotifs = getNotifications();
  const readNotif = allNotifs.find((n) => n.id === newNotif.id);
  assert(readNotif?.isRead === true, "Notification marked read");
  console.log("✅ [PASS] Notification lifecycle verified");

  // 10. Reports, CSV Export & Reset Demo Data
  console.log("\n>>> [10/10] Reports, CSV Export & Factory Reset");
  const reportData = getReports();
  assert(typeof reportData.taskVelocity.velocityRate === "number", "Task velocity computed");
  assert(reportData.deptStats.length === 11, "Department velocity computed");
  console.log("✅ [PASS] Generated analytical operational reports");

  exportReportsToCsv("tasks");
  exportReportsToCsv("clients");
  console.log("✅ [PASS] Browser CSV export functions executed without error");

  const logs = getAuditLogs();
  assert(logs.length >= 10, "Simulated audit logs recorded throughout demo operations");
  console.log(`✅ [PASS] Recorded ${logs.length} simulated audit events`);

  resetAllDemoData();
  const resetDepts = getDepartments();
  assert(resetDepts.length === 10, "Reset restores exactly 10 factory departments");
  console.log("✅ [PASS] Factory Reset restores baseline demo data");

  console.log("\n===============================================================");
  console.log("🎉 ALL 20/20 FRONTEND DEMO TEST ASSERTIONS PASSED!");
  console.log("===============================================================");
}

runTestSuite().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
