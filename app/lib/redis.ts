import { Redis } from "@upstash/redis";

let cachedClient: Redis | null = null;

export function getRedis(): Redis {
  if (cachedClient) return cachedClient;
  // Vercel's KV integration exposes credentials as KV_REST_API_*; fall back to
  // those when the UPSTASH_* names aren't set so Redis works in either
  // configuration.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL/KV_REST_API_URL or UPSTASH_REDIS_REST_TOKEN/KV_REST_API_TOKEN.",
    );
  }
  cachedClient = new Redis({ url, token });
  return cachedClient;
}
