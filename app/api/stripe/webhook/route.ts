import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  generateAccessCode,
  lookupCodeBySubscription,
  planFromProductName,
  revokeBySubscription,
  storeCode,
  type Plan,
} from "../../../lib/codes";
import { sendWelcomeEmail } from "../../../lib/email";

export const runtime = "nodejs";
// Webhook handlers must always run dynamically (raw body + headers).
export const dynamic = "force-dynamic";

let cachedStripe: Stripe | null = null;
function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  cachedStripe = new Stripe(key);
  return cachedStripe;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server is missing STRIPE_WEBHOOK_SECRET." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        // Unhandled event types — acknowledge so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // Log on the server but still return 200 so Stripe doesn't retry indefinitely
    // for fix-it-yourself errors (bad customer email, etc.). Real infra failures
    // surface in Resend/Upstash dashboards.
    console.error(`[stripe-webhook] handler error for ${event.type}:`, err);
    return NextResponse.json(
      { received: true, handlerError: true },
      { status: 200 },
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  // Idempotency: Stripe retries webhooks. If we've already provisioned this
  // subscription, don't generate a second code.
  if (subscriptionId) {
    const existing = await lookupCodeBySubscription(subscriptionId);
    if (existing) return;
  }

  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  if (!email) {
    throw new Error(
      `checkout.session.completed missing email for session ${session.id}`,
    );
  }

  const name = session.customer_details?.name ?? null;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  // Fetch line items with the product expanded so we can read the product name
  // and infer the plan.
  let plan: Plan = "both";
  try {
    const lineItems = await getStripe().checkout.sessions.listLineItems(
      session.id,
      { expand: ["data.price.product"], limit: 5 },
    );
    const firstItem = lineItems.data[0];
    const product = firstItem?.price?.product;
    const productName =
      product && typeof product !== "string" && !("deleted" in product)
        ? product.name
        : null;
    plan = planFromProductName(productName);
  } catch (err) {
    console.error(
      `[stripe-webhook] failed to read line items for ${session.id}:`,
      err,
    );
    // Fall back to "both" so the customer is never blocked from a tool they
    // paid for. Brian can manually downgrade in the admin if needed.
  }

  const code = generateAccessCode();
  await storeCode(code, {
    email,
    name,
    plan,
    customerId,
    subscriptionId,
    createdAt: new Date().toISOString(),
  });

  await sendWelcomeEmail({ to: email, name, code, plan });
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  await revokeBySubscription(subscription.id);
}
