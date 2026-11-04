import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

const sessionMocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
}));

vi.mock('./db', () => ({
  getSql: dbMocks.getSql,
}));

vi.mock('./auth-session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./auth-session')>()),
  requireAuth: sessionMocks.requireAuth,
}));

import { requireAdmin } from './auth-users';

const adminRequest = () => createRequest('http://localhost/api/users');

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
    sessionMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
  });

  it('passes the session through for an admin', async () => {
    dbMocks.sql.mockResolvedValue([{ role: 'admin' }]);

    await expect(requireAdmin(adminRequest())).resolves.toEqual({
      session: { sub: 'google-1' },
    });
  });

  it('returns 403 for a regular user', async () => {
    dbMocks.sql.mockResolvedValue([{ role: 'user' }]);

    const result = await requireAdmin(adminRequest());

    expect('response' in result && result.response.status).toBe(403);
  });

  it('returns 403 when the user row does not exist', async () => {
    dbMocks.sql.mockResolvedValue([]);

    const result = await requireAdmin(adminRequest());

    expect('response' in result && result.response.status).toBe(403);
  });

  it('keeps the 401 response of an unauthenticated request', async () => {
    sessionMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const result = await requireAdmin(adminRequest());

    expect('response' in result && result.response.status).toBe(401);
    expect(dbMocks.sql).not.toHaveBeenCalled();
  });
});
