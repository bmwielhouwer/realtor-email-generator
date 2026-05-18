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

// Unambiguous alphabet (no 0/O, 1/I/L) — 32 chars so % 32 is uniform across bytes.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateAccessCode(): string {
  const bytes = randomBytes(8);
  let result = "CLV-";
  for (let i = 0; i < 4; i++) result += CODE_ALPHABET[bytes[i] % 32];
  result += "-";
  for (let i = 4; i < 8; i++) result += CODE_ALPHABET[bytes[i] % 32];
  return result;
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
 * (b) auto-provisioned codes in Redis. Env codes are treated as "both" so the
 * personal CLV-BRIAN-TEST style codes keep working for testing.
 */
export async function validateAccessCode(
  submitted: string | undefined | null,
  tool: Tool,
): Promise<{ ok: true; plan: Plan } | { ok: false; reason: string }> {
  const code = (submitted ?? "").trim();
  if (!code) {
    return { ok: false, reason: "missing" };
  }

  const envCodes = (process.env.ACCESS_CODES ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (envCodes.some((c) => safeEqual(c, code))) {
    return { ok: true, plan: "both" };
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
  return { ok: true, plan: stored.plan };
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
