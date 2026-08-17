import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJsonRequest } from '@/test/http';

const referralMocks = vi.hoisted(() => ({
  getPendingReferral: vi.fn(),
  normalizeReferralCode: vi.fn(),
  setPendingReferral: vi.fn(),
}));

vi.mock('@/lib/referral', () => ({
  getPendingReferral: referralMocks.getPendingReferral,
  normalizeReferralCode: referralMocks.normalizeReferralCode,
  setPendingReferral: referralMocks.setPendingReferral,
}));

import { POST } from './route';

describe('POST /api/referrals/capture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    referralMocks.getPendingReferral.mockReturnValue(null);
  });

  it('returns 400 when referral code is invalid', async () => {
    referralMocks.normalizeReferralCode.mockReturnValue(null);

    const response = await POST(
      createJsonRequest('http://localhost/api/referrals/capture', 'POST', {
        referralCode: '!!!',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'referralCode must contain only letters, numbers, dots, underscores, or dashes',
      },
    });
  });

  it('stores a new referral code when cookie is empty', async () => {
    referralMocks.normalizeReferralCode.mockReturnValue('invite-1');

    const response = await POST(
      createJsonRequest('http://localhost/api/referrals/capture', 'POST', {
        referralCode: 'invite-1',
      }),
    );

    expect(response.status).toBe(200);
    expect(referralMocks.setPendingReferral).toHaveBeenCalledWith(response, 'invite-1');
    await expect(response.json()).resolves.toEqual({
      data: {
        referralCode: 'invite-1',
        stored: true,
      },
    });
  });

  it('keeps the original referral code when cookie already exists', async () => {
    referralMocks.normalizeReferralCode.mockReturnValue('invite-2');
    referralMocks.getPendingReferral.mockReturnValue({ code: 'first-ref' });

    const response = await POST(
      createJsonRequest('http://localhost/api/referrals/capture', 'POST', {
        referralCode: 'invite-2',
      }),
    );

    expect(response.status).toBe(200);
    expect(referralMocks.setPendingReferral).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      data: {
        referralCode: 'first-ref',
        stored: false,
      },
    });
  });
});
