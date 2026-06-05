import { getRedis } from "./redis";

// Each customer may run up to this many generations per calendar month.
export const MONTHLY_GENERATION_LIMIT = 100;

// Friendly copy surfaced to the customer when they exceed the monthly cap.
export const USAGE_LIMIT_MESSAGE =
  "You've hit your monthly limit. Resets on the 1st.";

// `last_active` is the ISO timestamp of the most recent generation. It was
// added after launch, so older records may not carry it — callers treat a
// missing value as null.
type UsageRecord = { month: string; count: number; last_active?: string };

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
 * Read the customer's usage detail: generations in the current calendar month
 * and the timestamp of their most recent generation (null if never recorded or
 * stored before `last_active` was tracked).
 */
export async function getUsageDetail(
  email: string,
): Promise<{ generationsThisMonth: number; lastActive: string | null }> {
  const redis = getRedis();
  const record = await redis.get<UsageRecord>(usageKey(email));
  if (!record) return { generationsThisMonth: 0, lastActive: null };
  return {
    generationsThisMonth:
      record.month === currentMonth() ? record.count : 0,
    lastActive: record.last_active ?? null,
  };
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
  await redis.set(key, { month, count, last_active: new Date().toISOString() });
  return count;
}
