import type { MiddlewareHandler } from 'hono';

interface CacheEntry {
  body: string;
  status: number;
  contentType: string;
  expiresAt: number;
}

/**
 * GET-only, in-memory TTL cache keyed by request URL — mirrors the original
 * NestJS backend's global CacheInterceptor (7-day TTL, GET responses only),
 * preserved here for benchmarking parity across backends.
 */
export function cacheMiddleware(ttlSeconds: number): MiddlewareHandler {
  const store = new Map<string, CacheEntry>();

  return async (c, next) => {
    if (c.req.method !== 'GET') {
      await next();
      return;
    }

    const key = c.req.url;
    const cached = store.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return c.body(cached.body, cached.status as 200, {
        'content-type': cached.contentType,
      });
    }

    await next();

    if (c.res.status === 200) {
      const contentType = c.res.headers.get('content-type') ?? 'application/json';
      const body = await c.res.clone().text();
      store.set(key, {
        body,
        status: c.res.status,
        contentType,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  };
}
