import { Redis } from "@upstash/redis";

let cachedClient: Redis | null = null;

/**
 * Vercel exposes Upstash credentials under different env var names depending
 * on which marketplace integration was used:
 *   - "Upstash for Redis"     → UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   - "Vercel KV" (legacy)    → KV_REST_API_URL / KV_REST_API_TOKEN
 *   - "Redis" (newer)         → REDIS_URL  (full https:// URL with embedded token)
 *
 * Accept all so /admin and the Stripe webhook work regardless of which
 * integration the project was wired up with.
 */
export function getRedis(): Redis {
  if (cachedClient) return cachedClient;

  const url =
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL ??
    null;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    null;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis credentials. Expected UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL / KV_REST_API_TOKEN in env.",
    );
  }
  cachedClient = new Redis({ url, token });
  return cachedClient;
}
