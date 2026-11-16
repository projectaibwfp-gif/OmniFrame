import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Load .env the same way Next.js does (no extra dependency).
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2];
    }
  }
}

const PRODUCTION_ENVIRONMENT = 'production';
// Arbitrary application-wide key; every migration runner takes the same lock.
const MIGRATION_LOCK_KEY = 2_026_111_601;
const UNIQUE_VIOLATION_CODE = '23505';
const MIGRATIONS_PRIMARY_KEY = '_migrations_pkey';
const NO_TRANSACTION_MARKER = '-- migrate:no-transaction';

// Preview deployments share the production DATABASE_URL, so only production builds migrate.
const vercelEnvironment = process.env.VERCEL_ENV;
if (vercelEnvironment && vercelEnvironment !== PRODUCTION_ENVIRONMENT) {
  process.stdout.write(`skipping migrations for VERCEL_ENV=${vercelEnvironment}\n`);
  process.exit(0);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set (missing backend/.env?)');
  process.exit(1);
}

const sql = neon(connectionString);
const migrationDir = path.join(root, 'migration');

// The Neon HTTP driver runs single statements only (extended protocol),
// so migration files are split on ";" at end of line.
// Limitation: no PL/pgSQL function bodies with ";" inside ($$ ... $$).
function splitStatements(content: string): string[] {
  return content
    .split(/;\s*(?:\r?\n|$)/)
    .map((chunk) => chunk.trim())
    .filter((chunk) =>
      chunk.split('\n').some((line) => line.trim() !== '' && !line.trim().startsWith('--')),
    );
}

function isConcurrentlyAppliedError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const { code, constraint } = error as { code?: unknown; constraint?: unknown };
  return code === UNIQUE_VIOLATION_CODE && constraint === MIGRATIONS_PRIMARY_KEY;
}

async function recordMigration(file: string): Promise<boolean> {
  try {
    await sql`INSERT INTO _migrations (name) VALUES (${file})`;
    return true;
  } catch (error) {
    if (isConcurrentlyAppliedError(error)) {
      return false;
    }
    throw error;
  }
}

/**
 * Commands such as VACUUM cannot run inside a transaction, so files marked with
 * NO_TRANSACTION_MARKER run statement by statement and must be idempotent.
 */
async function applyMigrationWithoutTransaction(file: string, content: string): Promise<boolean> {
  for (const statement of splitStatements(content)) {
    await sql.query(statement);
  }
  return recordMigration(file);
}

/**
 * Runs one migration file in a single transaction guarded by an advisory lock.
 * The `_migrations` row is inserted right after taking the lock, so a runner that
 * lost the race fails on the primary key and rolls back without touching the schema.
 */
async function applyMigrationInTransaction(file: string, content: string): Promise<boolean> {
  try {
    await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(${MIGRATION_LOCK_KEY})`,
      sql`INSERT INTO _migrations (name) VALUES (${file})`,
      ...splitStatements(content).map((statement) => sql.query(statement)),
    ]);
    return true;
  } catch (error) {
    if (isConcurrentlyAppliedError(error)) {
      return false;
    }
    throw error;
  }
}

function applyMigration(file: string): Promise<boolean> {
  const content = fs.readFileSync(path.join(migrationDir, file), 'utf8');
  return content.trimStart().startsWith(NO_TRANSACTION_MARKER)
    ? applyMigrationWithoutTransaction(file, content)
    : applyMigrationInTransaction(file, content);
}

async function main(): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  const applied = new Set(
    ((await sql`SELECT name FROM _migrations`) as Array<{ name: string }>).map((row) => row.name),
  );

  const files = fs
    .readdirSync(migrationDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  let appliedCount = 0;
  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    if (await applyMigration(file)) {
      process.stdout.write(`applied: ${file}\n`);
      appliedCount++;
    } else {
      process.stdout.write(`skipped: ${file} (applied by a concurrent runner)\n`);
    }
  }

  process.stdout.write(
    appliedCount > 0
      ? `done, ${appliedCount} migration(s) applied\n`
      : 'nothing to apply, database up to date\n',
  );
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
