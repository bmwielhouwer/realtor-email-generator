import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getRedis } from "../../lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTIFY_TO = "brianwielhouwer@gmail.com";
// Sent from the verified compasslineventures.com domain (no hyphens).
const FROM_ADDRESS = "Compass Line Apps <noreply@compasslineventures.com>";
const DEFAULT_FEATURE_ID = "sphere-nurture";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (cachedResend) return cachedResend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY.");
  cachedResend = new Resend(apiKey);
  return cachedResend;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  let body: {
    email?: string;
    name?: string;
    problem?: string;
    feature_id?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email is required." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const problem = typeof body.problem === "string" ? body.problem.trim() : "";
  const featureId =
    (typeof body.feature_id === "string" && body.feature_id.trim()) ||
    DEFAULT_FEATURE_ID;

  try {
    const redis = getRedis();
    const record = {
      email,
      name,
      problem,
      created_at: new Date().toISOString(),
      feature_id: featureId,
    };

    // Idempotent: a repeat signup overwrites the existing record (set) and the
    // set add is a no-op for an email already present.
    await redis.set(`waitlist:${featureId}:${email}`, record);
    await redis.sadd(`waitlist_emails:${featureId}`, email);

    // Notification is best-effort — don't lose a valid signup to an email error.
    try {
      const html = `<p>New Sphere Nurture waitlist signup:</p>
<ul>
  <li><strong>Email:</strong> ${escapeHtml(email)}</li>
  <li><strong>Name:</strong> ${escapeHtml(name || "—")}</li>
  <li><strong>Problem:</strong> ${escapeHtml(problem || "—")}</li>
</ul>`;
      const text = `New Sphere Nurture waitlist signup:

Email: ${email}
Name: ${name || "—"}
Problem: ${problem || "—"}`;

      await getResend().emails.send({
        from: FROM_ADDRESS,
        to: NOTIFY_TO,
        subject: "New Sphere Nurture waitlist signup",
        html,
        text,
      });
    } catch (err) {
      console.error("[waitlist] failed to send notification email:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to join waitlist.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
