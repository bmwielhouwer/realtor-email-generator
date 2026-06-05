import Stripe from "stripe";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
  const adminPassword = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Server is missing ADMIN_PASSWORD." },
      { status: 500 },
    );
  }

  let body: { password?: string; subscription_id?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const submitted = (body.password ?? "").trim();
  if (!submitted || !safeEqual(submitted, adminPassword)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const subscriptionId = (body.subscription_id ?? "").trim();
  if (!subscriptionId) {
    return NextResponse.json(
      { ok: false, error: "Missing subscription_id." },
      { status: 400 },
    );
  }

  try {
    // Immediately cancel in Stripe. The stripe-webhook handler listens for the
    // resulting customer.subscription.deleted event and updates Redis, so no
    // Redis writes are needed here.
    await getStripe().subscriptions.cancel(subscriptionId);
    return NextResponse.json({ ok: true, status: "canceled" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to cancel subscription.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
