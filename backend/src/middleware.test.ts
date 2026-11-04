import { describe, expect, it } from 'vitest';
import { createRequest } from '@/test/http';
import { middleware } from './middleware';

const API_URL = 'http://localhost/api/auth/logout';

function requestFrom(origin: string | null, method = 'POST') {
  return createRequest(API_URL, {
    method,
    headers: origin === null ? {} : { origin },
  });
}

describe('middleware CSRF origin check', () => {
  it('rejects a mutation from a foreign origin', async () => {
    const response = middleware(requestFrom('https://evil.example'));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'CSRF_ORIGIN_NOT_ALLOWED', message: 'Request origin is not allowed' },
    });
  });

  it('accepts a mutation from the frontend origin', () => {
    const response = middleware(requestFrom('http://localhost:4200'));

    expect(response.status).toBe(200);
  });

  it('accepts a mutation from the backend origin (Swagger UI)', () => {
    const response = middleware(requestFrom('http://localhost'));

    expect(response.status).toBe(200);
  });

  it('accepts a mutation without Origin from a non-browser client', () => {
    const response = middleware(requestFrom(null));

    expect(response.status).toBe(200);
  });

  it('does not check safe methods', () => {
    const response = middleware(requestFrom('https://evil.example', 'GET'));

    expect(response.status).toBe(200);
  });
});
