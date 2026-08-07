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

await sql`CREATE TABLE IF NOT EXISTS _migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

const applied = new Set((await sql`SELECT name FROM _migrations`).map((row) => row.name));

const files = fs
  .readdirSync(migrationDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

let appliedCount = 0;
for (const file of files) {
  if (applied.has(file)) {
    continue;
  }

  const content = fs.readFileSync(path.join(migrationDir, file), 'utf8');
  for (const statement of splitStatements(content)) {
    await sql.query(statement);
  }
  await sql`INSERT INTO _migrations (name) VALUES (${file})`;
  console.log(`applied: ${file}`);
  appliedCount++;
}

console.log(
  appliedCount > 0
    ? `done, ${appliedCount} migration(s) applied`
    : 'nothing to apply, database up to date',
);
