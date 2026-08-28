import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const profileMocks = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/profile', () => profileMocks);

import { PATCH } from './route';

describe('PATCH /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
    profileMocks.getCurrentUserProfile.mockResolvedValue({ email: 'anna@example.com' });
    profileMocks.updateCurrentUserProfile.mockResolvedValue(undefined);
  });

  it('updates a valid profile', async () => {
    const response = await PATCH(
      createRequest('http://localhost/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          phone: '+48 123 456 789',
          birthDate: '1990-01-01',
          description: 'Opis',
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(profileMocks.updateCurrentUserProfile).toHaveBeenCalledWith({
      googleId: 'google-1',
      phone: '+48 123 456 789',
      birthDate: '1990-01-01',
      description: 'Opis',
    });
  });

  it('rejects a phone with fewer than nine digits', async () => {
    const response = await PATCH(
      createRequest('http://localhost/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ phone: '---------', birthDate: null, description: null }),
      }),
    );

    expect(response.status).toBe(400);
    expect(profileMocks.updateCurrentUserProfile).not.toHaveBeenCalled();
  });

  it('rejects a birth date before the minimum age birthday', async () => {
    const response = await PATCH(
      createRequest('http://localhost/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ phone: null, birthDate: '2013-12-31', description: null }),
      }),
    );

    expect(response.status).toBe(400);
    expect(profileMocks.updateCurrentUserProfile).not.toHaveBeenCalled();
  });
});
