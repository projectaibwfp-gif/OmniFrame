import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('./db', () => ({
  getSql: dbMocks.getSql,
}));

import { upsertGoogleUser, upsertUser } from './auth-users';

const GOOGLE_ID = 'google-123';
const ROLE_UPDATE_FRAGMENT = 'role           = COALESCE(';

const existingAdminRow = {
  id: 1,
  google_id: GOOGLE_ID,
  email: 'admin@example.com',
  email_verified: true,
  role: 'admin',
  name: 'Admin',
  given_name: null,
  family_name: null,
  picture: null,
  locale: null,
  phone: null,
  birth_date: null,
  description: null,
  referral_code: 'code',
  referred_by_code: null,
  last_login_at: '2026-10-15 08:00:00+00',
  created_at: '2026-01-01 08:00:00+00',
  updated_at: '2026-10-15 08:00:00+00',
  was_created: false,
};

function roleUpdateValue(): unknown {
  const [strings, ...values] = dbMocks.sql.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
  const fragmentIndex = strings.findIndex((part) => part.endsWith(ROLE_UPDATE_FRAGMENT));
  expect(fragmentIndex).toBeGreaterThanOrEqual(0);
  return values[fragmentIndex];
}

describe('upsertUser role handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
    dbMocks.sql.mockResolvedValue([existingAdminRow]);
  });

  it('keeps the stored role when a returning user logs in with Google', async () => {
    const { user } = await upsertGoogleUser({ sub: GOOGLE_ID, email: 'admin@example.com' });

    expect(roleUpdateValue()).toBeNull();
    expect(user.role).toBe('admin');
  });

  it('overrides the stored role when the caller sets it explicitly', async () => {
    await upsertUser({ google_id: GOOGLE_ID, email: 'admin@example.com', role: 'moderator' });

    expect(roleUpdateValue()).toBe('moderator');
  });
});
