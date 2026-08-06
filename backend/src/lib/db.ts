import mysql, { type Pool, type QueryResult } from 'mysql2/promise';

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const ssl = process.env.MYSQL_SSL === 'true'
      ? { rejectUnauthorized: true }
      : undefined;

    pool = mysql.createPool({
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? 'project_user',
      password: process.env.MYSQL_PASSWORD ?? 'project_password',
      database: process.env.MYSQL_DATABASE ?? 'project_ai',
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
      queueLimit: 0,
      enableKeepAlive: true,
      ssl,
    });
  }

  return pool;
}

export async function query<T extends QueryResult>(
  sql: string,
  values: unknown[] = [],
): Promise<T> {
  const [rows] = await getPool().query<T>(sql, values);
  return rows;
}

export async function checkDatabaseConnection(): Promise<void> {
  await getPool().query('SELECT 1');
}
