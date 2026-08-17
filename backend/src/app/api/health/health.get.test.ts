import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => ({
  checkDatabaseConnection: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  checkDatabaseConnection: dbMocks.checkDatabaseConnection,
}));

import { GET } from './route';

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns healthy status when database is connected', async () => {
    dbMocks.checkDatabaseConnection.mockResolvedValue(undefined);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: 'ok',
      service: 'project-ai-backend',
      database: 'connected',
    });
  });

  it('returns 503 when database health check fails', async () => {
    dbMocks.checkDatabaseConnection.mockRejectedValue(new Error('down'));

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'DB_CONNECTION_FAILED',
        message: 'Database connection failed',
      },
    });
  });
});
