import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { validateAccessCode } from "../../lib/codes";
import {
  MONTHLY_GENERATION_LIMIT,
  USAGE_LIMIT_MESSAGE,
  getMonthlyUsage,
  recordGeneration,
} from "../../lib/usage";

export const runtime = "nodejs";
export const maxDuration = 60;

type Audience = "sellers" | "buyers" | "both";

type RequestBody = {
  name?: string;
  location?: string;
  audience?: Audience;
  uniqueSellingPoint?: string;
  callToAction?: string;
  accessCode?: string;
};

type GeneratedEmail = {
  subject: string;
  body: string;
};

const audienceLabel: Record<Audience, string> = {
  sellers: "home sellers",
  buyers: "home buyers",
  both: "both home buyers and home sellers",
};

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitLog = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMin: number } {
  const now = Date.now();
  const history = rateLimitLog.get(ip) ?? [];
  const recent = history.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    const oldest = recent[0]!;
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - oldest);
    return { allowed: false, retryAfterMin: Math.ceil(retryAfterMs / 60000) };
  }
  recent.push(now);
  rateLimitLog.set(ip, recent);
  return { allowed: true, retryAfterMin: 0 };
}

function buildPrompt(input: Required<Omit<RequestBody, "accessCode">>) {
  return `You are an expert copywriter for real estate agents. Write 5 distinct, professional cold outreach emails for the agent described below. Each email should sound human, warm, and consultative — never spammy.

Agent details:
- Name: ${input.name}
- Market: ${input.location}
- Target audience: ${audienceLabel[input.audience]}
- Unique selling point: ${input.uniqueSellingPoint}
- Call to action: ${input.callToAction}

Requirements:
- Tailor every email to ${audienceLabel[input.audience]} in ${input.location}.
- Vary tone and angle across the 5 emails (e.g., market insight, neighborhood expertise, social proof, problem/solution, friendly check-in).
- Keep each email under 150 words.
- Use a compelling subject line under 60 characters.
- Sign each email with the agent's name.
- Do NOT use placeholder tokens like [Name] or [Address]. Write a complete, ready-to-send email.
- Avoid overused phrases like "I hope this email finds you well".

Respond with ONLY a valid JSON object in this exact shape, with no extra prose or markdown fences:
{
  "emails": [
    { "subject": "string", "body": "string" },
    { "subject": "string", "body": "string" },
    { "subject": "string", "body": "string" },
    { "subject": "string", "body": "string" },
    { "subject": "string", "body": "string" }
  ]
}`;
}

function extractJson(text: string): { emails: GeneratedEmail[] } {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model response did not contain JSON.");
  }
  const slice = candidate.slice(start, end + 1);
  return JSON.parse(slice);
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The service is temporarily unavailable. Please try again shortly." },
      { status: 500 },
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const auth = await validateAccessCode(body.accessCode, "cold_email");
  if (!auth.ok) {
    const message =
      auth.reason === "plan_mismatch"
        ? "Your plan doesn't include the Cold Email Generator. Upgrade to the Suite to unlock it."
        : "Invalid or missing access code. Subscribe at Compass Line Ventures to receive your code.";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  // Enforce the per-customer monthly generation cap. Env/test codes have no
  // associated email and are exempt.
  if (auth.email) {
    const used = await getMonthlyUsage(auth.email);
    if (used >= MONTHLY_GENERATION_LIMIT) {
      return NextResponse.json({ error: USAGE_LIMIT_MESSAGE }, { status: 429 });
    }
  }

  const ip = getClientIp(request);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Rate limit reached. Try again in ${rate.retryAfterMin} minute${rate.retryAfterMin === 1 ? "" : "s"}.`,
      },
      { status: 429 },
    );
  }

  const name = body.name?.trim();
  const location = body.location?.trim();
  const audience = body.audience;
  const uniqueSellingPoint = body.uniqueSellingPoint?.trim();
  const callToAction = body.callToAction?.trim();

  if (
    !name ||
    !location ||
    !uniqueSellingPoint ||
    !callToAction ||
    !audience ||
    !(audience === "sellers" || audience === "buyers" || audience === "both")
  ) {
    return NextResponse.json(
      { error: "Please fill in every field." },
      { status: 400 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: buildPrompt({
            name,
            location,
            audience,
            uniqueSellingPoint,
            callToAction,
          }),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Model returned no text content." },
        { status: 502 },
      );
    }

    const parsed = extractJson(textBlock.text);
    const emails = Array.isArray(parsed.emails) ? parsed.emails : [];

    const sanitized: GeneratedEmail[] = emails
      .filter(
        (e): e is GeneratedEmail =>
          typeof e?.subject === "string" && typeof e?.body === "string",
      )
      .map((e) => ({ subject: e.subject.trim(), body: e.body.trim() }));

    if (sanitized.length === 0) {
      return NextResponse.json(
        { error: "Could not parse emails from model response." },
        { status: 502 },
      );
    }

    if (auth.email) {
      await recordGeneration(auth.email);
    }

    return NextResponse.json({ emails: sanitized });
  } catch (err) {
    const messageText =
      err instanceof Error ? err.message : "Unknown error from Anthropic API.";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
