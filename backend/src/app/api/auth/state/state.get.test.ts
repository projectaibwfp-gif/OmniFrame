import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  createLoginState: vi.fn(),
  storeLoginState: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  createLoginState: authMocks.createLoginState,
  storeLoginState: authMocks.storeLoginState,
}));

import { GET } from './route';

describe('GET /api/auth/state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the generated login state', async () => {
    authMocks.createLoginState.mockReturnValue('state-123');

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        state: 'state-123',
      },
    });
  });

  it('stores the generated login state in the response', async () => {
    authMocks.createLoginState.mockReturnValue('state-xyz');

    const response = await GET();

    expect(authMocks.storeLoginState).toHaveBeenCalledTimes(1);
    expect(authMocks.storeLoginState).toHaveBeenCalledWith(response, 'state-xyz');
  });
});
