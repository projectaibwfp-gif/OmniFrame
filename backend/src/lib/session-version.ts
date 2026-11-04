import { getSql } from './db';

export async function readSessionVersion(googleId: string): Promise<number | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT session_version
    FROM users
    WHERE google_id = ${googleId}
    LIMIT 1
  `) as Array<{ session_version: number }>;

  return rows[0]?.session_version ?? null;
}

export async function incrementSessionVersion(googleId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET session_version = session_version + 1
    WHERE google_id = ${googleId}
  `;
}
