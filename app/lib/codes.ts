import { randomBytes, timingSafeEqual } from "crypto";
import { getRedis } from "./redis";

export type Plan = "cold_email" | "listing" | "both";

export type Tool = "cold_email" | "listing";

export type StoredCode = {
  email: string;
  name: string | null;
  plan: Plan;
  customerId: string | null;
  subscriptionId: string | null;
  createdAt: string;
};

// Access codes are 8 uppercase alphanumeric characters with no prefix and no
// dashes (e.g. "04E5EPU4"). This matches the format Event Overlay's webhook
// writes into the shared Redis instance so codes are uniform regardless of
// which service provisioned them.
const CODE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // 36 chars
const CODE_LENGTH = 8;

export function generateAccessCode(): string {
  let result = "";
  while (result.length < CODE_LENGTH) {
    // One byte at a time, rejecting values that would bias the modulo (256 is
    // not divisible by 36; 252 = 36 * 7 is the largest unbiased cutoff).
    const byte = randomBytes(1)[0];
    if (byte >= 252) continue;
    result += CODE_ALPHABET[byte % 36];
  }
  return result;
}

// New codes are 8 alphanumeric chars; legacy codes used a prefix and dashes
// (CLM-XXXX-XXXX / CLV-XXXX-XXXX, and personal test codes like CLV-BRIAN-TEST).
// Accept both so codes minted before the format change keep working.
const NEW_CODE_FORMAT = /^[A-Z0-9]{8}$/i;
const LEGACY_CODE_FORMAT = /^[A-Z]{2,4}(?:-[A-Z0-9]+)+$/i;

export function isSupportedCodeFormat(code: string): boolean {
  return NEW_CODE_FORMAT.test(code) || LEGACY_CODE_FORMAT.test(code);
}

export function planAllowsTool(plan: Plan, tool: Tool): boolean {
  if (plan === "both") return true;
  return plan === tool;
}

/**
 * Detect which plan a customer purchased from the product name on the line item.
 * Names from Stripe products are matched fuzzily so small wording changes don't
 * break provisioning. Falls back to "both" so a paying customer is never blocked.
 */
export function planFromProductName(rawName: string | null | undefined): Plan {
  const name = (rawName ?? "").toLowerCase();
  if (
    name.includes("suite") ||
    name.includes("bundle") ||
    name.includes("full")
  ) {
    return "both";
  }
  if (name.includes("listing") || name.includes("home lister")) {
    return "listing";
  }
  if (name.includes("email") || name.includes("cold")) {
    return "cold_email";
  }
  return "both";
}

function codeKey(code: string): string {
  return `code:${code}`;
}

function subscriptionKey(subscriptionId: string): string {
  return `sub:${subscriptionId}`;
}

export async function storeCode(
  code: string,
  data: StoredCode,
): Promise<void> {
  const redis = getRedis();
  await redis.set(codeKey(code), data);
  if (data.subscriptionId) {
    await redis.set(subscriptionKey(data.subscriptionId), code);
  }
}

export async function lookupCode(code: string): Promise<StoredCode | null> {
  const redis = getRedis();
  const value = await redis.get<StoredCode>(codeKey(code));
  return value ?? null;
}

export async function lookupCodeBySubscription(
  subscriptionId: string,
): Promise<string | null> {
  const redis = getRedis();
  return (await redis.get<string>(subscriptionKey(subscriptionId))) ?? null;
}

export async function revokeBySubscription(
  subscriptionId: string,
): Promise<{ code: string; data: StoredCode } | null> {
  const redis = getRedis();
  const code = await lookupCodeBySubscription(subscriptionId);
  if (!code) return null;
  const data = await lookupCode(code);
  await redis.del(codeKey(code));
  await redis.del(subscriptionKey(subscriptionId));
  return data ? { code, data } : null;
}

/**
 * Validate a submitted code against (a) the ACCESS_CODES env var allow-list and
 * (b) auto-provisioned codes in Redis. Both the new 8-char format and legacy
 * prefixed codes (CLM-/CLV-XXXX-XXXX, plus personal CLV-BRIAN-TEST style test
 * codes) are accepted so nothing minted before the format change breaks.
 */
export async function validateAccessCode(
  submitted: string | undefined | null,
  tool: Tool,
): Promise<
  | { ok: true; plan: Plan; email: string | null }
  | { ok: false; reason: string }
> {
  const code = (submitted ?? "").trim();
  if (!code) {
    return { ok: false, reason: "missing" };
  }

  // The env allow-list is matched by exact value, so codes in either format are
  // honored. Checked first so personal/test codes always work even if they
  // don't fit the strict new/legacy shapes below.
  const envCodes = (process.env.ACCESS_CODES ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (envCodes.some((c) => safeEqual(c, code))) {
    // Personal/test codes from the env allow-list aren't tied to a customer
    // email, so they bypass the per-customer usage cap.
    return { ok: true, plan: "both", email: null };
  }

  // Reject anything that is neither a new 8-char code nor a legacy prefixed
  // code before hitting Redis, but accept both so old codes keep validating.
  if (!isSupportedCodeFormat(code)) {
    return { ok: false, reason: "not_found" };
  }

  let stored: StoredCode | null = null;
  try {
    stored = await lookupCode(code);
  } catch {
    return { ok: false, reason: "redis_unavailable" };
  }

  if (!stored) {
    return { ok: false, reason: "not_found" };
  }
  if (!planAllowsTool(stored.plan, tool)) {
    return { ok: false, reason: "plan_mismatch" };
  }
  return { ok: true, plan: stored.plan, email: stored.email };
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function listActiveCodes(): Promise<
  Array<{ code: string } & StoredCode>
> {
  const redis = getRedis();
  const keys = await redis.keys("code:*");
  if (keys.length === 0) return [];
  const values = await Promise.all(
    keys.map((k) => redis.get<StoredCode>(k)),
  );
  const out: Array<{ code: string } & StoredCode> = [];
  keys.forEach((key, idx) => {
    const data = values[idx];
    if (data) out.push({ code: key.replace(/^code:/, ""), ...data });
  });
  out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return out;
}
