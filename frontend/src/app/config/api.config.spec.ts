import { describe, expect, it } from 'vitest';
import { API_BASE_URL, buildApiUrl } from './api.config';

describe('buildApiUrl', () => {
  it('adds a leading slash to a relative API path', () => {
    expect(buildApiUrl('users')).toBe(`${API_BASE_URL}/users`);
  });
});
