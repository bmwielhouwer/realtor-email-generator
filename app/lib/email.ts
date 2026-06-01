import { Resend } from "resend";
import type { Plan } from "./codes";

const SITE_URL = "https://realtor-email-generator.vercel.app";
const CUSTOMER_PORTAL_URL =
  "https://billing.stripe.com/p/login/dRm00c7mEbUOg7Ie2U9AA00";
// Sent from the verified compasslineventures.com domain (note: no hyphens).
const FROM_ADDRESS = "Compass Line Ventures <hello@compasslineventures.com>";

let cachedClient: Resend | null = null;

function getResend(): Resend {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY.");
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

function planLabel(plan: Plan): string {
  if (plan === "both") return "The Suite (Cold Email Pro + Listing Pro)";
  if (plan === "listing") return "Listing Pro";
  return "Cold Email Pro";
}

function toolList(plan: Plan): string[] {
  if (plan === "both") {
    return ["Cold Email Generator", "Listing Description Generator"];
  }
  if (plan === "listing") return ["Listing Description Generator"];
  return ["Cold Email Generator"];
}

function renderToolBullets(plan: Plan): string {
  return toolList(plan)
    .map(
      (t) =>
        `<li style="padding:6px 0;color:#1B2447;font-size:15px;">${escapeHtml(t)}</li>`,
    )
    .join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildWelcomeEmail(args: {
  name: string | null;
  code: string;
  plan: Plan;
}): { subject: string; html: string; text: string } {
  const greeting = args.name
    ? `Hi ${escapeHtml(args.name.split(" ")[0])},`
    : "Hi there,";
  const subject = "Welcome to Compass Line Pro";

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
                <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;font-family:Georgia,serif;">Welcome to Compass Line Pro</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 18px;color:#1B2447;font-size:16px;line-height:1.55;">${greeting}</p>
                <p style="margin:0 0 24px;color:#1B2447;font-size:16px;line-height:1.55;">Thanks for subscribing to <strong>${escapeHtml(planLabel(args.plan))}</strong>. Here's your access code &mdash; keep it somewhere safe.</p>

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

                <h2 style="margin:0 0 12px;color:#1B2447;font-size:18px;font-weight:700;font-family:Georgia,serif;">Your subscription includes</h2>
                <ul style="margin:0 0 28px;padding-left:20px;list-style-type:disc;">
                  ${renderToolBullets(args.plan)}
                </ul>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="padding:8px 0 4px;">
                      <a href="${SITE_URL}" style="display:inline-block;background-color:#B8952A;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:14px 32px;border-radius:8px;">Open the Toolkit</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:32px 0 0;color:#6b7a87;font-size:13px;line-height:1.6;text-align:center;">
                  Need to manage your subscription? <a href="${CUSTOMER_PORTAL_URL}" style="color:#B8952A;text-decoration:none;font-weight:600;">Customer portal</a>
                </p>
                <p style="margin:8px 0 0;color:#6b7a87;font-size:13px;line-height:1.6;text-align:center;">
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

Thanks for subscribing to ${planLabel(args.plan)}. Here's your access code:

  ${args.code}

How to get started:
  1. Go to ${SITE_URL}
  2. Paste your access code into the "Subscriber access code" field
  3. Fill in the form and click Generate

Your subscription includes:
${toolList(args.plan).map((t) => `  - ${t}`).join("\n")}

Need to manage your subscription? ${CUSTOMER_PORTAL_URL}

Questions? Just reply to this email and Brian will get back to you.

— Compass Line Ventures`;

  return { subject, html, text };
}

export async function sendWelcomeEmail(args: {
  to: string;
  name: string | null;
  code: string;
  plan: Plan;
}): Promise<void> {
  const { subject, html, text } = buildWelcomeEmail({
    name: args.name,
    code: args.code,
    plan: args.plan,
  });
  const resend = getResend();
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: args.to,
    subject,
    html,
    text,
  });
}
