import Stripe from "stripe";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { listActiveCodes } from "../../../lib/codes";
import { getSubscription } from "../../../lib/subscriptions";
import { getUsageDetail } from "../../../lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Founding Member price — used to forecast MRR from active subscriptions.
const FOUNDING_PRICE_USD = 29;

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

let cachedStripe: Stripe | null = null;
function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  cachedStripe = new Stripe(key);
  return cachedStripe;
}

// Trial-end lookups hit Stripe, so cache per subscription id at module scope
// (persists across warm invocations). A short TTL keeps the dashboard fresh
// without re-fetching every subscription on each manual refresh.
const TRIAL_CACHE_TTL_MS = 5 * 60 * 1000;
type TrialCacheEntry = { trialEnd: string | null; fetchedAt: number };
const trialCache = new Map<string, TrialCacheEntry>();

async function getTrialEnd(subscriptionId: string): Promise<string | null> {
  const cached = trialCache.get(subscriptionId);
  if (cached && Date.now() - cached.fetchedAt < TRIAL_CACHE_TTL_MS) {
    return cached.trialEnd;
  }

  let trialEnd: string | null = cached?.trialEnd ?? null;
  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;
  } catch (err) {
    // Missing key, deleted subscription, or transient Stripe error — keep the
    // last known value (if any) and don't fail the whole dashboard.
    console.error(
      `[admin/list] failed to retrieve subscription ${subscriptionId}:`,
      err,
    );
  }

  trialCache.set(subscriptionId, { trialEnd, fetchedAt: Date.now() });
  return trialEnd;
}

export async function POST(request: Request) {
  const adminPassword = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Server is missing ADMIN_PASSWORD." },
      { status: 500 },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const submitted = (body.password ?? "").trim();
  if (!submitted || !safeEqual(submitted, adminPassword)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const codes = await listActiveCodes();

    // Enrich each code with subscription health (status, trial end) and usage
    // (generations this month, last active). Per-customer reads run in parallel.
    const enriched = await Promise.all(
      codes.map(async (entry) => {
        const [subscription, usage] = await Promise.all([
          getSubscription(entry.email).catch(() => null),
          getUsageDetail(entry.email).catch(() => ({
            generationsThisMonth: 0,
            lastActive: null,
          })),
        ]);

        const trial_end = entry.subscriptionId
          ? await getTrialEnd(entry.subscriptionId)
          : null;

        return {
          ...entry,
          status: subscription?.status ?? null,
          trial_end,
          generations_this_month: usage.generationsThisMonth,
          last_active: usage.lastActive,
        };
      }),
    );

    const activeCount = enriched.filter((e) => e.status === "active").length;
    const summary = {
      total_signups: enriched.length,
      trialing_count: enriched.filter((e) => e.status === "trialing").length,
      active_count: activeCount,
      canceled_count: enriched.filter((e) => e.status === "canceled").length,
      mrr_forecast_usd: activeCount * FOUNDING_PRICE_USD,
    };

    return NextResponse.json({ codes: enriched, summary });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to read access codes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
