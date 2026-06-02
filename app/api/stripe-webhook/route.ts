import Stripe from "stripe";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

// Agent Marketing Autopilot — Founding Member. We only provision welcome access
// for this price; other line items are ignored.
const FOUNDING_MEMBER_PRICE_ID = "price_1TdMl86JkjZ2eY7uYaMLh7Pt";

const SITE_URL = "https://realtor-email-generator.vercel.app";
// Sent from the verified compasslineventures.com domain (note: no hyphens).
const FROM_ADDRESS = "Compass Line Apps <noreply@compasslineventures.com>";

export const runtime = "nodejs";
// Webhook handlers must always run dynamically (raw body + headers).
export const dynamic = "force-dynamic";

// --- Lazily instantiated clients -------------------------------------------

let cachedStripe: Stripe | null = null;
function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  cachedStripe = new Stripe(key);
  return cachedStripe;
}

let cachedRedis: Redis | null = null;
function getRedis(): Redis {
  if (cachedRedis) return cachedRedis;
  // Vercel's KV integration exposes credentials as KV_REST_API_*; fall back to
  // those when the UPSTASH_* names aren't set so the webhook works in either
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
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (cachedResend) return cachedResend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY.");
  cachedResend = new Resend(apiKey);
  return cachedResend;
}

// --- Access code generation -------------------------------------------------

// 8 uppercase alphanumeric characters, no prefix and no dashes (e.g.
// "04E5EPU4"). This matches the format Event Overlay's webhook writes into the
// shared Redis instance so provisioned codes are uniform across services.
const CODE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // 36 chars

function generateAccessCode(): string {
  let result = "";
  while (result.length < 8) {
    // One byte at a time, rejecting values that would bias the modulo (256 is
    // not divisible by 36; 252 = 36 * 7 is the largest unbiased cutoff).
    const byte = randomBytes(1)[0];
    if (byte >= 252) continue;
    result += CODE_ALPHABET[byte % 36];
  }
  return result;
}

// --- Webhook entry point ----------------------------------------------------

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server is missing STRIPE_WEBHOOK_SECRET." },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  // Raw request body is required for Stripe signature verification.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Signature verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
    }
  } catch (err) {
    // Log server-side but still return 200 so Stripe doesn't retry forever on
    // fix-it-yourself errors. Infra failures surface in Resend/Upstash.
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

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  if (!email) {
    throw new Error(
      `checkout.session.completed missing email for session ${session.id}`,
    );
  }
  const name = session.customer_details?.name ?? null;

  // Only provision for the Founding Member price.
  const lineItems = await getStripe().checkout.sessions.listLineItems(
    session.id,
    { limit: 100 },
  );
  const isFoundingMember = lineItems.data.some(
    (item) => item.price?.id === FOUNDING_MEMBER_PRICE_ID,
  );
  if (!isFoundingMember) return;

  const redis = getRedis();
  const normalizedEmail = email.trim().toLowerCase();

  // Idempotency: Stripe retries webhooks. If we've already provisioned a code
  // for this customer, reuse it rather than generating a second one.
  const existing = await redis.get<string>(`access_code:${normalizedEmail}`);
  const code = existing ?? generateAccessCode();

  const now = new Date().toISOString();

  // Store the access code keyed by email, and the subscription record keyed by
  // email (mirrors the SubscriptionRecord shape used for access gating).
  await redis.set(`access_code:${normalizedEmail}`, code);
  await redis.set(`subscription:${normalizedEmail}`, {
    stripe_customer_id: customerId,
    subscription_id: subscriptionId ?? "",
    status: "active",
    created_at: now,
  });

  // Also store the code keyed by code (StoredCode shape) so the existing
  // /api/generate validation (validateAccessCode -> lookupCode) accepts it.
  // Founding Member unlocks every tool, so plan is "both".
  await redis.set(`code:${code}`, {
    email: normalizedEmail,
    name,
    plan: "both",
    customerId,
    subscriptionId,
    createdAt: now,
  });

  await sendWelcomeEmail({ to: email, name, code });
}

// --- Welcome email ----------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendWelcomeEmail(args: {
  to: string;
  name: string | null;
  code: string;
}): Promise<void> {
  const greeting = args.name
    ? `Hi ${escapeHtml(args.name.split(" ")[0])},`
    : "Hi there,";
  const subject = "Your Compass Line Apps access code";

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f3f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f3f4f8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(27,36,71,0.08);">
            <tr>
              <td style="background-color:#1B2447;padding:32px 32px 24px;text-align:center;">
                <div style="color:#B8952A;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Compass Line Ventures</div>
                <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;font-family:Georgia,serif;">Welcome to Compass Line Apps!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 18px;color:#1B2447;font-size:16px;line-height:1.55;">${greeting}</p>
                <p style="margin:0 0 24px;color:#1B2447;font-size:16px;line-height:1.55;">Thanks for becoming a Founding Member. Here's your access code &mdash; keep it somewhere safe.</p>

                <div style="background-color:#fbf6e8;border:1px solid #e6ce78;border-radius:10px;padding:24px;text-align:center;margin:0 0 28px;">
                  <div style="color:#B8952A;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;">Your Access Code</div>
                  <div style="font-family:'SF Mono',Menlo,Monaco,Consolas,monospace;font-size:24px;font-weight:700;color:#1B2447;letter-spacing:3px;">${escapeHtml(args.code)}</div>
                </div>

                <h2 style="margin:0 0 12px;color:#1B2447;font-size:18px;font-weight:700;font-family:Georgia,serif;">How to get started</h2>
                <ol style="margin:0 0 24px;padding-left:20px;color:#1B2447;font-size:15px;line-height:1.7;">
                  <li>Go to <a href="${SITE_URL}" style="color:#B8952A;text-decoration:none;font-weight:600;">${SITE_URL.replace("https://", "")}</a></li>
                  <li>Paste your access code into the <strong>Subscriber access code</strong> field at the top</li>
                  <li>Fill in the form and click Generate</li>
                </ol>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="padding:8px 0 4px;">
                      <a href="${SITE_URL}" style="display:inline-block;background-color:#B8952A;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:14px 32px;border-radius:8px;">Open the Toolkit</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:32px 0 0;color:#6b7a87;font-size:13px;line-height:1.6;text-align:center;">
                  Questions? Just reply to this email and Brian will get back to you.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f3f4f8;padding:20px;text-align:center;color:#6b7a87;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
                Compass Line Ventures
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${greeting}

Thanks for becoming a Founding Member. Here's your access code:

  ${args.code}

How to get started:
  1. Go to ${SITE_URL}
  2. Paste your access code into the "Subscriber access code" field
  3. Fill in the form and click Generate

Questions? Just reply to this email and Brian will get back to you.

— Compass Line Ventures`;

  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: args.to,
    subject,
    html,
    text,
  });
  // Resend reports failures in the response body rather than throwing, so
  // surface them instead of silently "succeeding".
  if (error) {
    throw new Error(
      `Resend failed to send welcome email to ${args.to}: ${error.message}`,
    );
  }
}
