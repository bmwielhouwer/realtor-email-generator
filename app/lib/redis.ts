import { Redis } from "@upstash/redis";

let cachedClient: Redis | null = null;

export function getRedis(): Redis {
  if (cachedClient) return cachedClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN.",
    );
  }
  cachedClient = new Redis({ url, token });
  return cachedClient;
}
