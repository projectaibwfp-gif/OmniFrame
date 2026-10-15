interface TtlCacheEntry<T> {
  value: T;
  storedAt: number;
}

export interface TtlCache<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  getOrLoad(key: string, load: () => Promise<T>): Promise<T>;
}

export function createTtlCache<T>(ttlMs: number): TtlCache<T> {
  const entries = new Map<string, TtlCacheEntry<T>>();

  function get(key: string): T | null {
    const entry = entries.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.storedAt > ttlMs) {
      entries.delete(key);
      return null;
    }

    return entry.value;
  }

  function set(key: string, value: T): void {
    entries.set(key, { value, storedAt: Date.now() });
  }

  async function getOrLoad(key: string, load: () => Promise<T>): Promise<T> {
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await load();
    set(key, value);
    return value;
  }

  return { get, set, getOrLoad };
}
