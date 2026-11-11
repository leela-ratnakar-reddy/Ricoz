import type { DatabaseSync } from "node:sqlite";
import { migration001, Migration } from "./001_enterprise_rbac_and_departments";

const MIGRATIONS: Migration[] = [migration001];

export function runMigrations(db: DatabaseSync): void {
  // Ensure migration tracking table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      version INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = db.prepare("SELECT version FROM schema_migrations").all() as Array<{ version: number }>;
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    console.log(`[Database Migration] Applying migration v${migration.version}: ${migration.name}...`);
    const now = new Date().toISOString();

    // Execute migration within SQLite transaction
    db.exec("BEGIN TRANSACTION;");
    try {
      migration.up(db);
      db.prepare(`
        INSERT INTO schema_migrations (id, version, name, applied_at)
        VALUES (?, ?, ?, ?)
      `).run(`mig-${migration.version}`, migration.version, migration.name, now);
      db.exec("COMMIT;");
      console.log(`[Database Migration] Successfully applied migration v${migration.version}: ${migration.name}`);
    } catch (err) {
      db.exec("ROLLBACK;");
      console.error(`[Database Migration] Failed applying migration v${migration.version}:`, err);
      throw err;
    }
  }
}
