import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../../config/database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATION_FILE_RE = /^\d{3}_.*\.sql$/;

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrationNames(): Promise<Set<string>> {
  const result = await pool.query<{ name: string }>(
    "SELECT name FROM schema_migrations",
  );
  return new Set(result.rows.map((row) => row.name));
}

async function run(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrationNames();
  const files = (await readdir(__dirname))
    .filter((f) => MIGRATION_FILE_RE.test(f))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`Skip (already applied): ${file}`);
      continue;
    }

    const sql = await readFile(join(__dirname, file), "utf8");
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    console.log(`Applied migration: ${file}`);
  }

  console.log("Migrations finished.");
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
  pool.end().catch(() => undefined);
});
