import { getRedis } from "./redis";

// Each customer may run up to this many generations per calendar month.
export const MONTHLY_GENERATION_LIMIT = 100;

// Friendly copy surfaced to the customer when they exceed the monthly cap.
export const USAGE_LIMIT_MESSAGE =
  "You've hit your monthly limit. Resets on the 1st.";

type UsageRecord = { month: string; count: number };

// Usage is bucketed by calendar month (UTC). Storing the month alongside the
// count means a new month resets the counter automatically the first time the
// customer generates after the 1st — no scheduled job or TTL required.
function currentMonth(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function usageKey(email: string): string {
  return `usage:${email.trim().toLowerCase()}`;
}

/** Read the customer's generation count for the current calendar month. */
export async function getMonthlyUsage(email: string): Promise<number> {
  const redis = getRedis();
  const record = await redis.get<UsageRecord>(usageKey(email));
  if (!record || record.month !== currentMonth()) return 0;
  return record.count;
}

/**
 * Increment the customer's generation count for the current month and return
 * the new total. Call this only after a generation has actually succeeded so
 * customers aren't charged usage for server-side failures.
 */
export async function recordGeneration(email: string): Promise<number> {
  const redis = getRedis();
  const key = usageKey(email);
  const month = currentMonth();
  const record = await redis.get<UsageRecord>(key);
  const count = record && record.month === month ? record.count + 1 : 1;
  await redis.set(key, { month, count });
  return count;
}
