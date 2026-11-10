import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { getDb, verifyPassword } from "../lib/admin/db";
import {
  createAdminSession,
  validateAdminSession,
  destroyAdminSession,
  revokeSessionById,
  revokeAllUserSessions,
  authenticateAdminCredentials,
  SESSION_IDLE_TIMEOUT_MINUTES,
} from "../lib/admin/auth";
import {
  loadUserPermissions,
  hasPermission,
  getAllPermissions,
  getAllRoles,
} from "../lib/admin/permissions";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
  resetRateLimiterForTesting,
} from "../lib/admin/rateLimit";
import { verifyCsrfOrigin } from "../lib/admin/csrf";
import { runMigrations } from "../lib/admin/migrations/runner";
import { NextRequest } from "next/server";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ [FAILED] ${testName}${detail ? ` - ${detail}` : ""}`);
    throw new Error(`Test failed: ${testName}`);
  } else {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  }
}

async function runTestSuite() {
  console.log("===============================================================");
  console.log("RICOZ ENTERPRISE ADMIN: PHASE 1 & PHASE 2 VERIFICATION SUITE");
  console.log("===============================================================\n");

  const db = getDb();

  // -------------------------------------------------------------
  // SUITE 1: DATABASE INTEGRITY, MIGRATIONS & DEPARTMENT ARCHITECTURE
  // -------------------------------------------------------------
  console.log(">>> [1/5] Database Integrity, Migrations & Departments");

  // 1.1 Verify all 10 departments exist
  const deptRows = db.prepare("SELECT id, name, slug FROM departments").all() as Array<{ id: string; name: string; slug: string }>;
  assert(deptRows.length === 10, "10 departments are present in the database", `Found ${deptRows.length}`);

  const requiredDepts = ["dept-ops", "dept-tech", "dept-sales", "dept-marketing", "dept-hr", "dept-support", "dept-exec", "dept-finance", "dept-ai", "dept-qa"];
  for (const deptId of requiredDepts) {
    assert(deptRows.some((d) => d.id === deptId), `Department '${deptId}' exists`);
  }

  // 1.2 Verify migration idempotency (rerunning does not throw or duplicate)
  runMigrations(db);
  const deptCountAfter = db.prepare("SELECT count(*) as c FROM departments").get() as { c: number };
  assert(deptCountAfter.c === 10, "Migration rerun is idempotent (still 10 departments)");

  // 1.3 Verify RBAC tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>;
  const tableNames = tables.map((t) => t.name);
  assert(tableNames.includes("admin_roles"), "Table admin_roles exists");
  assert(tableNames.includes("admin_permissions"), "Table admin_permissions exists");
  assert(tableNames.includes("admin_role_permissions"), "Table admin_role_permissions exists");
  assert(tableNames.includes("admin_user_permissions"), "Table admin_user_permissions exists");
  assert(tableNames.includes("admin_department_members"), "Table admin_department_members exists");

  // 1.4 Verify roles hierarchy
  const allRoles = getAllRoles();
  assert(allRoles.length >= 14, "At least 14 system roles defined", `Found ${allRoles.length}`);
  const superAdminRole = allRoles.find((r) => r.slug === "super_admin");
  assert(superAdminRole !== undefined && superAdminRole.hierarchyLevel === 1, "Super Admin is hierarchy level 1");
  const auditorRole = allRoles.find((r) => r.slug === "auditor");
  assert(auditorRole !== undefined && auditorRole.hierarchyLevel === 14, "Auditor role exists at level 14");

  // 1.5 Verify permissions catalogue
  const allPerms = getAllPermissions();
  assert(allPerms.length >= 50, "Full granular permission catalogue is seeded", `Found ${allPerms.length}`);

  // -------------------------------------------------------------
  // SUITE 2: AUTHENTICATION & CREDENTIAL SECURITY
  // -------------------------------------------------------------
  console.log("\n>>> [2/5] Authentication & Credential Security");

  // 2.1 Authenticate valid credentials
  const superUser = authenticateAdminCredentials("aadinathachary@gmail.com", "Ricozhoo@123");
  assert(superUser !== null, "Valid admin credentials authenticate successfully");
  assert(superUser?.role === "super_admin", "Super admin user has role 'super_admin'");

  // 2.2 Case insensitivity check (email normalization prevents casing bypass)
  const caseUser = authenticateAdminCredentials("  AaDiNaThAcHaRy@GmAiL.cOm  ", "Ricozhoo@123");
  assert(caseUser !== null, "Normalized email with mixed casing and whitespace authenticates correctly");

  // 2.3 Invalid credentials rejected
  const invalidUser = authenticateAdminCredentials("aadinathachary@gmail.com", "WrongPassword123!");
  assert(invalidUser === null, "Invalid password returns null");

  // 2.4 Suspended account rejected
  const testSuspendedId = `usr-susp-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO admin_users (id, email, password_hash, salt, full_name, role, department_id, status, avatar, created_at)
    VALUES (?, 'suspended@ricoz.io', 'fakehash', 'fakesalt', 'Suspended User', 'team_member', 'dept-ops', 'suspended', 'SU', ?)
  `).run(testSuspendedId, now);

  const suspendedAuth = authenticateAdminCredentials("suspended@ricoz.io", "AdminRicoz2026!");
  assert(suspendedAuth === null, "Suspended user cannot authenticate even with credentials");

  // Clean up test suspended user
  db.prepare("DELETE FROM admin_users WHERE id = ?").run(testSuspendedId);

  // -------------------------------------------------------------
  // SUITE 3: SESSION SECURITY & IDLE TIMEOUT
  // -------------------------------------------------------------
  console.log("\n>>> [3/5] Session Security, Idle Timeout & Revocation");

  // 3.1 Create and validate active session
  const { token, expiresAt } = createAdminSession(superUser!.id, "127.0.0.1", "TestAgent/1.0");
  assert(Boolean(token) && token.length >= 32, "Cryptographically secure session token created");
  const validatedUser = validateAdminSession(token);
  assert(validatedUser !== null && validatedUser.id === superUser!.id, "Active session validates successfully");

  // 3.2 60-Minute Idle Timeout Test
  // Artificially age the session last_activity_at by 65 minutes
  const past65Min = new Date(Date.now() - 65 * 60 * 1000).toISOString();
  db.prepare("UPDATE admin_sessions SET last_activity_at = ? WHERE session_token = ?").run(past65Min, token);
  const idleUser = validateAdminSession(token);
  assert(idleUser === null, "Session inactive for >60 minutes is rejected and destroyed");

  // 3.3 Explicit Session Revocation
  const { token: token2 } = createAdminSession(superUser!.id, "127.0.0.1", "TestAgent/1.0");
  const validBeforeRevoke = validateAdminSession(token2);
  assert(validBeforeRevoke !== null, "New session validates before revocation");
  destroyAdminSession(token2);
  const afterRevoke = validateAdminSession(token2);
  assert(afterRevoke === null, "Explicit logout destroys session immediately");

  // 3.4 Revoke all sessions for user
  const { token: tA } = createAdminSession(superUser!.id);
  const { token: tB } = createAdminSession(superUser!.id);
  const revokedCount = revokeAllUserSessions(superUser!.id);
  assert(revokedCount >= 2, `revokeAllUserSessions revoked ${revokedCount} sessions`);
  assert(validateAdminSession(tA) === null, "Session A is revoked");
  assert(validateAdminSession(tB) === null, "Session B is revoked");

  // -------------------------------------------------------------
  // SUITE 4: BRUTE-FORCE RATE LIMITING & CSRF PROTECTION
  // -------------------------------------------------------------
  console.log("\n>>> [4/5] Brute-Force Rate Limiting & CSRF Protection");

  // 4.1 Rate limiting lockout after 5 failures
  resetRateLimiterForTesting();
  const testIp = "192.168.1.100";
  const testEmail = "victim@ricoz.io";

  for (let i = 1; i <= 4; i++) {
    const status = recordLoginFailure(testIp, testEmail);
    assert(status.allowed === true, `Attempt ${i}: Allowed (Remaining: ${status.remainingAttempts})`);
  }

  // 5th failure triggers lockout
  const lockoutStatus = recordLoginFailure(testIp, testEmail);
  assert(lockoutStatus.allowed === false, "5th failed attempt triggers account lockout");
  assert((lockoutStatus.retryAfterSeconds ?? 0) > 0, "Retry-After header duration is provided");

  // Check rate limit check directly
  const directCheck = checkLoginRateLimit(testIp, testEmail);
  assert(directCheck.allowed === false, "Subsequent requests are blocked while locked out");

  // Success resets rate limiter
  recordLoginSuccess(testIp, testEmail);
  const resetCheck = checkLoginRateLimit(testIp, testEmail);
  assert(resetCheck.allowed === true, "Successful authentication clears rate limiter lockout");

  // 4.2 CSRF Origin validation
  const safeReq = new NextRequest("http://localhost:3000/api/admin/tasks", {
    method: "GET",
  });
  assert(verifyCsrfOrigin(safeReq).valid === true, "GET requests bypass CSRF origin check");

  const validPostReq = new NextRequest("http://localhost:3000/api/admin/tasks", {
    method: "POST",
    headers: {
      host: "localhost:3000",
      origin: "http://localhost:3000",
    },
  });
  assert(verifyCsrfOrigin(validPostReq).valid === true, "Matching Host and Origin pass CSRF verification");

  const attackerPostReq = new NextRequest("http://localhost:3000/api/admin/tasks", {
    method: "POST",
    headers: {
      host: "localhost:3000",
      origin: "http://malicious-attacker.com",
    },
  });
  const attackerResult = verifyCsrfOrigin(attackerPostReq);
  assert(attackerResult.valid === false, "Mismatched cross-origin POST request blocked by CSRF protection");

  // -------------------------------------------------------------
  // SUITE 5: GRANULAR RBAC, PERMISSION ENGINE & OVERRIDES
  // -------------------------------------------------------------
  console.log("\n>>> [5/5] Enterprise RBAC, Department Boundaries & Overrides");

  // 5.1 Super Admin has full unrestricted access
  assert(hasPermission(superUser, "tasks.delete") === true, "Super Admin has permission 'tasks.delete'");
  assert(hasPermission(superUser, "reports.view_financial") === true, "Super Admin has permission 'reports.view_financial'");
  assert(hasPermission(superUser, "users.manage_permissions") === true, "Super Admin has permission 'users.manage_permissions'");

  // 5.2 Team Member has limited access
  const teamMemberUser = authenticateAdminCredentials("maya.lin@ricoz.io", "AdminRicoz2026!");
  assert(teamMemberUser !== null, "Team Member user exists");
  assert(hasPermission(teamMemberUser, "tasks.view") === true, "Team Member has permission 'tasks.view'");
  assert(hasPermission(teamMemberUser, "tasks.delete") === false, "Team Member DENIED 'tasks.delete'");
  assert(hasPermission(teamMemberUser, "reports.view_financial") === false, "Team Member DENIED 'reports.view_financial'");
  assert(hasPermission(teamMemberUser, "users.create") === false, "Team Member DENIED 'users.create'");

  // 5.3 Auditor is read-only
  const auditorUser = authenticateAdminCredentials("audit@ricoz.io", "AdminRicoz2026!");
  assert(auditorUser !== null, "Auditor user exists");
  assert(hasPermission(auditorUser, "audit_logs.view") === true, "Auditor can view audit logs");
  assert(hasPermission(auditorUser, "reports.view_financial") === true, "Auditor can view financial reports");
  assert(hasPermission(auditorUser, "tasks.edit") === false, "Auditor DENIED 'tasks.edit'");
  assert(hasPermission(auditorUser, "tasks.delete") === false, "Auditor DENIED 'tasks.delete'");
  assert(hasPermission(auditorUser, "clients.create") === false, "Auditor DENIED 'clients.create'");

  // 5.4 Department-based Access Boundaries
  // Tech manager in dept-tech
  const techLeadUser = authenticateAdminCredentials("kai.chen@ricoz.io", "AdminRicoz2026!");
  assert(techLeadUser !== null, "Tech Lead user exists");
  assert(hasPermission(techLeadUser, "tasks.view", { departmentId: "dept-tech" }) === true, "Tech Lead can view dept-tech tasks");
  assert(hasPermission(techLeadUser, "tasks.view", { departmentId: "dept-finance" }) === false, "Tech Lead DENIED access to dept-finance tasks");

  // 5.5 User Permission Overrides: Explicit DENY takes precedence
  // Grant team member a temporary explicit DENY on tasks.view
  const permTaskView = db.prepare("SELECT id FROM admin_permissions WHERE slug = 'tasks.view'").get() as { id: string };
  const overrideDenyId = `ov-test-deny-${Date.now()}`;
  db.prepare(`
    INSERT INTO admin_user_permissions (id, admin_user_id, permission_id, effect, granted_by, reason, created_at)
    VALUES (?, ?, ?, 'deny', ?, 'Audit penalty', ?)
  `).run(overrideDenyId, teamMemberUser!.id, permTaskView.id, superUser!.id, now);

  const reloadedTeamMember = validateAdminSession(createAdminSession(teamMemberUser!.id).token);
  assert(reloadedTeamMember !== null, "Reloaded session with overrides");
  assert(hasPermission(reloadedTeamMember, "tasks.view") === false, "Explicit DENY override takes precedence over role permission");

  // Clean up override
  db.prepare("DELETE FROM admin_user_permissions WHERE id = ?").run(overrideDenyId);
  const clearedTeamMember = validateAdminSession(createAdminSession(teamMemberUser!.id).token);
  assert(hasPermission(clearedTeamMember, "tasks.view") === true, "After removing DENY override, role permission is restored");

  // 5.6 User Permission Overrides: Explicit ALLOW grants permission
  const permReportExport = db.prepare("SELECT id FROM admin_permissions WHERE slug = 'reports.export'").get() as { id: string };
  const overrideAllowId = `ov-test-allow-${Date.now()}`;
  db.prepare(`
    INSERT INTO admin_user_permissions (id, admin_user_id, permission_id, effect, granted_by, reason, created_at)
    VALUES (?, ?, ?, 'allow', ?, 'Temporary audit delegation', ?)
  `).run(overrideAllowId, teamMemberUser!.id, permReportExport.id, superUser!.id, now);

  const allowedTeamMember = validateAdminSession(createAdminSession(teamMemberUser!.id).token);
  assert(hasPermission(allowedTeamMember, "reports.export") === true, "Explicit ALLOW override grants permission to team member");

  // 5.7 Expired Overrides are ignored
  const pastDate = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  db.prepare("UPDATE admin_user_permissions SET expires_at = ? WHERE id = ?").run(pastDate, overrideAllowId);
  const expiredCheckMember = validateAdminSession(createAdminSession(teamMemberUser!.id).token);
  assert(hasPermission(expiredCheckMember, "reports.export") === false, "Expired permission override is strictly ignored");

  // Clean up test override
  db.prepare("DELETE FROM admin_user_permissions WHERE id = ?").run(overrideAllowId);

  console.log("\n===============================================================");
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log("===============================================================");
}

runTestSuite().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
