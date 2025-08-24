// Lightweight in-memory TTL cache. Swap to Redis by replacing the implementation.
// For production, consider Upstash Redis or a managed Redis with ioredis.

type Entry<T> = { value: T; expiresAt: number };

class TTLCache {
  private store = new Map<string, Entry<unknown>>();

  get<T>(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return e.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  del(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

export const memoryCache = new TTLCache();

export async function getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const cached = memoryCache.get<T>(key);
  if (cached !== undefined) return cached;
  const value = await loader();
  memoryCache.set(key, value, ttlMs);
  return value;
}
