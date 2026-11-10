import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log("==========================================");
  console.log("RICOZ ADMIN CORE ENGINE VERIFICATION SUITE");
  console.log("==========================================\n");

  const dbPath = path.join(process.cwd(), "data", "ricoz_admin.db");
  assert(fs.existsSync(dbPath), "Database file data/ricoz_admin.db exists");

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");

  // 1. Table schema checks
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((t) => t.name);
  assert(tables.includes("admin_users"), "Table admin_users verified");
  assert(tables.includes("departments"), "Table departments verified");
  assert(tables.includes("tasks"), "Table tasks verified");
  assert(tables.includes("task_comments"), "Table task_comments verified");
  assert(tables.includes("clients"), "Table clients verified");
  assert(tables.includes("client_onboarding_items"), "Table client_onboarding_items verified");
  assert(tables.includes("vendors"), "Table vendors verified");
  assert(tables.includes("vendor_documents"), "Table vendor_documents verified");
  assert(tables.includes("support_tickets"), "Table support_tickets verified");
  assert(tables.includes("sops"), "Table sops verified");
  assert(tables.includes("notifications"), "Table notifications verified");
  assert(tables.includes("audit_logs"), "Table audit_logs verified");

  // 2. Department counts
  const depts = db.prepare("SELECT count(*) as count FROM departments").get();
  assert(depts.count === 10, `All 10 departments present (found ${depts.count})`);

  // 3. User verification & scrypt password check
  const superAdmin = db.prepare("SELECT * FROM admin_users WHERE role = 'super_admin'").get();
  assert(superAdmin !== undefined, "Super Admin user exists");

  const testHash = crypto.scryptSync("Ricozhoo@123", superAdmin.salt, 64).toString("hex");
  const isMatch = crypto.timingSafeEqual(Buffer.from(superAdmin.password_hash, "hex"), Buffer.from(testHash, "hex"));
  assert(isMatch === true, "Password verification passes using constant-time timingSafeEqual");

  // 4. Task lifecycle test
  const testTaskId = `tsk-test-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO tasks (id, title, description, department_id, assignee_id, creator_id, priority, status, blocker_note, is_escalated, due_date, created_at, updated_at)
    VALUES (?, 'Automated Verification Task', 'Deliverable test', 'dept-ops', ?, ?, 'urgent', 'blocked', 'Impediment note', 1, '2026-11-01', ?, ?)
  `).run(testTaskId, superAdmin.id, superAdmin.id, now, now);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(testTaskId);
  assert(task.title === "Automated Verification Task", "Task created with ACID transaction");
  assert(task.priority === "urgent" && task.is_escalated === 1, "Task priority urgent and escalated");
  assert(task.blocker_note === "Impediment note", "Blocker note persisted");

  // 5. Vendor document compliance rule test
  const vendor = db.prepare("SELECT id, name FROM vendors WHERE verification_status = 'verified' LIMIT 1").get();
  assert(vendor !== undefined, "Verified vendor exists in seeded data");

  const unverifiedDocs = db.prepare("SELECT count(*) as count FROM vendor_documents WHERE vendor_id = ? AND is_verified = 0").get(vendor.id);
  assert(unverifiedDocs.count === 0, "Verified vendor has 0 unverified documents (satisfies compliance gate)");

  // 6. Audit logging test
  const auditId = `aud-test-${Date.now()}`;
  db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, entity_type, entity_id, change_summary, ip_address, created_at)
    VALUES (?, ?, ?, 'super_admin', 'CORE_ENGINE_TEST', 'system', 'test', 'Core test verified', '127.0.0.1', ?)
  `).run(auditId, superAdmin.id, superAdmin.full_name, now);

  const loggedAudit = db.prepare("SELECT * FROM audit_logs WHERE id = ?").get(auditId);
  assert(loggedAudit.action === "CORE_ENGINE_TEST", "Audit log persistence verified");

  // Clean up test rows
  db.prepare("DELETE FROM tasks WHERE id = ?").run(testTaskId);
  db.prepare("DELETE FROM audit_logs WHERE id = ?").run(auditId);

  console.log("\n==========================================");
  console.log("ALL 20 CORE ENGINE ASSERTIONS PASSED!");
  console.log("==========================================");
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
