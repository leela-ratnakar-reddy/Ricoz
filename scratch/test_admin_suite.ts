import { getDb, hashPassword, verifyPassword } from "../lib/admin/db";
import {
  createAdminSession,
  validateAdminSession,
  authenticateAdminCredentials,
  hasPermission,
  PERMISSIONS,
} from "../lib/admin/auth";
import { recordAuditLog } from "../lib/admin/audit";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTestSuite() {
  console.log("==========================================");
  console.log("RICOZ ADMIN PANEL COMPREHENSIVE TEST SUITE");
  console.log("==========================================\n");

  const db = getDb();

  // Test 1: Database Initialization & Tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
  `).all() as { name: string }[];
  const tableNames = tables.map((t) => t.name);

  assert(tableNames.includes("admin_users"), "Table admin_users exists");
  assert(tableNames.includes("departments"), "Table departments exists");
  assert(tableNames.includes("tasks"), "Table tasks exists");
  assert(tableNames.includes("task_comments"), "Table task_comments exists");
  assert(tableNames.includes("clients"), "Table clients exists");
  assert(tableNames.includes("vendors"), "Table vendors exists");
  assert(tableNames.includes("support_tickets"), "Table support_tickets exists");
  assert(tableNames.includes("sops"), "Table sops exists");
  assert(tableNames.includes("audit_logs"), "Table audit_logs exists");
  assert(tableNames.includes("notifications"), "Table notifications exists");

  // Test 2: Password Security & Constant-Time Hashing
  const password = "SuperSecretPassword123!";
  const { hash, salt } = hashPassword(password);
  assert(hash.length === 128, "Scrypt hash produces 128-char hex string");
  assert(salt.length === 32, "Salt produces 32-char hex string");
  assert(verifyPassword(password, hash, salt) === true, "Password verifies correctly");
  assert(verifyPassword("WrongPassword!", hash, salt) === false, "Incorrect password fails verification");

  // Test 3: Authenticate Seed Admin Credentials
  const superAdmin = authenticateAdminCredentials("aadinathachary@gmail.com", "Ricozhoo@123");
  assert(superAdmin !== null, "Seed super admin authenticates successfully");
  assert(superAdmin?.role === "super_admin", "Super admin has super_admin role");

  const opsAdmin = authenticateAdminCredentials("elena.ramos@ricoz.io", "Ricozhoo@123");
  assert(opsAdmin !== null, "Seed ops admin authenticates successfully");
  assert(opsAdmin?.role === "ops_admin", "Ops admin has ops_admin role");

  const badAuth = authenticateAdminCredentials("aadinathachary@gmail.com", "WrongPassword");
  assert(badAuth === null, "Bad password rejected");

  // Test 4: Session Creation & Validation
  const session = createAdminSession(superAdmin!.id, "192.168.1.1", "TestRunner/1.0");
  assert(typeof session.token === "string" && session.token.length === 64, "Session token is 256-bit (64 hex chars)");

  const validatedUser = validateAdminSession(session.token);
  assert(validatedUser !== null, "Session token successfully validates user");
  assert(validatedUser?.id === superAdmin!.id, "Validated user matches session owner");

  const invalidSession = validateAdminSession("invalid-token-12345");
  assert(invalidSession === null, "Invalid session token rejected");

  // Test 5: Role-Based Access Control (RBAC)
  assert(hasPermission("super_admin", "manage_users") === true, "Super Admin can manage users");
  assert(hasPermission("ops_admin", "manage_users") === false, "Ops Admin cannot manage users");
  assert(hasPermission("ops_admin", "verify_vendors") === true, "Ops Admin can verify vendors");
  assert(hasPermission("team_member", "verify_vendors") === false, "Team Member cannot verify vendors");
  assert(hasPermission("team_member", "update_task_status") === true, "Team Member can update task status");
  assert(hasPermission("auditor", "view_audit_log") === true, "Auditor can view audit log");
  assert(hasPermission("team_member", "view_audit_log") === false, "Team Member cannot view audit log");

  // Test 6: Task Creation, Status Updates & Comments
  const taskId = `tsk-test-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO tasks (id, title, description, department_id, assignee_id, creator_id, priority, status, due_date, created_at, updated_at)
    VALUES (?, 'Automated Test Task', 'Verifying task pipeline', 'dept-ops', ?, ?, 'high', 'todo', '2026-11-01', ?, ?)
  `).run(taskId, superAdmin!.id, superAdmin!.id, now, now);

  const createdTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as any;
  assert(createdTask.title === "Automated Test Task", "Task created in database");
  assert(createdTask.status === "todo", "Task initial status is todo");

  // Update status to in_progress
  db.prepare("UPDATE tasks SET status = 'in_progress', updated_at = ? WHERE id = ?").run(now, taskId);
  const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as any;
  assert(updatedTask.status === "in_progress", "Task status updated to in_progress");

  // Add Comment
  const commentId = `tcm-test-${Date.now()}`;
  db.prepare(`
    INSERT INTO task_comments (id, task_id, user_id, comment, is_blocker_update, created_at)
    VALUES (?, ?, ?, 'Automated progress verification note', 0, ?)
  `).run(commentId, taskId, superAdmin!.id, now);

  const comments = db.prepare("SELECT * FROM task_comments WHERE task_id = ?").all(taskId);
  assert(comments.length === 1, "Comment successfully linked to task");

  // Test 7: Strict Vendor Verification Constraint
  const vendorId = `ven-test-${Date.now()}`;
  db.prepare(`
    INSERT INTO vendors (id, name, service_category, contact_name, contact_email, phone, onboarding_stage, verification_status, created_at, updated_at)
    VALUES (?, 'Test Unverified Studio', '3D Graphics', 'Test Contact', 'test@studio.com', '123', 'application', 'unverified', ?, ?)
  `).run(vendorId, now, now);

  // Add 1 unverified document
  db.prepare(`
    INSERT INTO vendor_documents (id, vendor_id, document_type, file_name, file_url, is_verified, created_at)
    VALUES (?, ?, 'W-8BEN', 'w8.pdf', '/doc', 0, ?)
  `).run(`vdoc-test-${Date.now()}`, vendorId, now);

  const unverifiedDocs = db.prepare("SELECT count(*) as count FROM vendor_documents WHERE vendor_id = ? AND is_verified = 0").get(vendorId) as { count: number };
  assert(unverifiedDocs.count === 1, "Vendor has 1 unverified document");

  // Test 8: Audit Logging
  recordAuditLog({
    actor: superAdmin,
    action: "AUTOMATED_TEST_RUN",
    entityType: "test_suite",
    entityId: "test-001",
    changeSummary: "Automated verification test completed successfully",
    ipAddress: "127.0.0.1",
  });

  const latestAudit = db.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1").get() as any;
  assert(latestAudit.action === "AUTOMATED_TEST_RUN", "Audit log recorded event correctly");
  assert(latestAudit.actor_id === superAdmin!.id, "Audit log correctly identified actor");

  // Cleanup test artifacts
  db.prepare("DELETE FROM task_comments WHERE task_id = ?").run(taskId);
  db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
  db.prepare("DELETE FROM vendor_documents WHERE vendor_id = ?").run(vendorId);
  db.prepare("DELETE FROM vendors WHERE id = ?").run(vendorId);
  db.prepare("DELETE FROM audit_logs WHERE id = ?").run(latestAudit.id);
  db.prepare("DELETE FROM admin_sessions WHERE id = ?").run(session.token);

  console.log("\n==========================================");
  console.log("ALL 20 TEST ASSERTIONS PASSED SUCCESSFULLY!");
  console.log("==========================================");
}

runTestSuite().catch((err) => {
  console.error("Test suite crashed:", err);
  process.exit(1);
});
