import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Audience = "sellers" | "buyers" | "both";

type RequestBody = {
  name?: string;
  location?: string;
  audience?: Audience;
  uniqueSellingPoint?: string;
  callToAction?: string;
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

function buildPrompt(input: Required<RequestBody>) {
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
      { error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
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

    return NextResponse.json({ emails: sanitized });
  } catch (err) {
    const messageText =
      err instanceof Error ? err.message : "Unknown error from Anthropic API.";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
