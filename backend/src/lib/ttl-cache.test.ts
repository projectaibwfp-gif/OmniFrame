import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTtlCache } from './ttl-cache';

const TTL_MS = 1_000;

describe('createTtlCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reuses a loaded value until the TTL elapses', async () => {
    const cache = createTtlCache<string>(TTL_MS);
    const load = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');

    await expect(cache.getOrLoad('key', load)).resolves.toBe('first');
    vi.advanceTimersByTime(TTL_MS);
    await expect(cache.getOrLoad('key', load)).resolves.toBe('first');
    vi.advanceTimersByTime(1);
    await expect(cache.getOrLoad('key', load)).resolves.toBe('second');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not cache failed loads', async () => {
    const cache = createTtlCache<string>(TTL_MS);
    const load = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok');

    await expect(cache.getOrLoad('key', load)).rejects.toThrow('boom');
    await expect(cache.getOrLoad('key', load)).resolves.toBe('ok');
    expect(cache.get('other')).toBeNull();
  });
});
