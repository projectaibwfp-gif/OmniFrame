import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createJsonRequest, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  isAuthDenied: authMocks.isAuthDenied,
  requireAuth: authMocks.requireAuth,
}));

vi.mock('@/lib/db', () => ({
  getSql: dbMocks.getSql,
}));

import { GET, POST } from './route';

describe('Products API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
  });

  it('denies unauthenticated access to GET /api/products', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/products'));

    expect(response.status).toBe(401);
  });

  it('returns recent products for authenticated GET /api/products', async () => {
    dbMocks.sql.mockResolvedValue([
      { id: 1, name: 'CRM', status: 'active', category: 'Sales', updatedAt: '2026-08-17' },
    ]);

    const response = await GET(createRequest('http://localhost/api/products'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 1, name: 'CRM', status: 'active', category: 'Sales', updatedAt: '2026-08-17' }],
    });
  });

  it('validates name in POST /api/products', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/products', 'POST', {
        name: '',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Name is required and must be no longer than 120 characters',
      },
    });
  });

  it('creates a new project in POST /api/products', async () => {
    dbMocks.sql.mockResolvedValue([{ id: 9 }]);

    const response = await POST(
      createJsonRequest('http://localhost/api/products', 'POST', {
        name: 'Nowy projekt',
        status: 'active',
        category: 'Ops',
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      data: {
        id: 9,
        name: 'Nowy projekt',
        status: 'active',
        category: 'Ops',
      },
    });
  });
});
