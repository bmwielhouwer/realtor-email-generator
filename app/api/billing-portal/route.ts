import Stripe from "stripe";
import { NextResponse } from "next/server";
import { validateAccessCode } from "../../lib/codes";
import { getSubscription } from "../../lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETURN_URL = "https://realtor-email-generator.vercel.app";

let cachedStripe: Stripe | null = null;
function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  cachedStripe = new Stripe(key);
  return cachedStripe;
}

export async function POST(request: Request) {
  let body: { access_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const accessCode = (body.access_code ?? "").trim();

  // Validate the code to resolve the customer's email. The helper enforces a
  // per-tool plan check, so try both tools and accept if either grants access —
  // a single-tool subscriber should still reach their billing portal.
  let result = await validateAccessCode(accessCode, "cold_email");
  if (!result.ok) {
    result = await validateAccessCode(accessCode, "listing");
  }
  if (!result.ok) {
    return NextResponse.json(
      { error: "Invalid access code." },
      { status: 401 },
    );
  }

  const email = result.email;
  if (!email) {
    // Codes from the env allow-list (personal/test codes) aren't tied to a
    // customer, so there's no subscription to manage.
    return NextResponse.json(
      { error: "No subscription found for this code." },
      { status: 404 },
    );
  }

  const subscription = await getSubscription(email);
  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No subscription found for this code." },
      { status: 404 },
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: RETURN_URL,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to open billing portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
