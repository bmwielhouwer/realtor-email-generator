import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type BuyerType = "first_time" | "luxury" | "investor" | "family";

type RequestBody = {
  agentName?: string;
  propertyAddress?: string;
  cityState?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqft?: string;
  yearBuilt?: string;
  features?: string;
  neighborhood?: string;
  buyerType?: BuyerType;
  accessCode?: string;
};

type ListingOutput = {
  kind: "mls" | "social" | "email" | "text";
  title: string;
  body: string;
};

const buyerLabel: Record<BuyerType, string> = {
  first_time: "first-time buyer",
  luxury: "luxury buyer",
  investor: "investor",
  family: "family buyer",
};

const buyerTone: Record<BuyerType, string> = {
  first_time:
    "Warm, reassuring, and educational. Emphasize affordability cues, livability, and the comfort of moving in. Avoid jargon.",
  luxury:
    "Sophisticated, exclusive, and refined. Evoke craftsmanship, lifestyle, and prestige. Use elevated vocabulary without being flowery.",
  investor:
    "Data-driven, ROI-focused, and factual. Lead with numbers, rentability, condition, and value-add opportunities. Skip emotional language.",
  family:
    "Family-friendly and lifestyle-focused. Highlight bedrooms, yard, schools, safety, and community. Picture daily life for kids and parents.",
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

function buildPrompt(input: {
  agentName: string;
  propertyAddress: string;
  cityState: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  yearBuilt: string;
  features: string;
  neighborhood: string;
  buyerType: BuyerType;
}) {
  const label = buyerLabel[input.buyerType];
  const tone = buyerTone[input.buyerType];

  return `You are an expert real estate copywriter. Generate four distinct marketing pieces for the property below, each tailored to a ${label}. Every output must be polished, ready-to-publish, and free of placeholder tokens like [Name] or [Address].

Listing agent: ${input.agentName}

Property:
- Address: ${input.propertyAddress}
- City/State: ${input.cityState}
- Bedrooms: ${input.bedrooms}
- Bathrooms: ${input.bathrooms}
- Square footage: ${input.sqft} sq ft
- Year built: ${input.yearBuilt}
- Key features and upgrades: ${input.features}
- Neighborhood highlights: ${input.neighborhood}

Target buyer: ${label}
Tone to use across all four outputs: ${tone}

Generate exactly four outputs in this order:

1. MLS Listing Description (150–250 words): Professional and descriptive. Lead with the strongest selling points relevant to the target buyer. Follow MLS conventions. No emojis, no hashtags.

2. Social Media Caption (60–100 words): Scroll-stopping caption for Instagram and Facebook. Open with a hook. Use 1–2 tasteful emojis if appropriate. End with 4–6 relevant hashtags on the last line.

3. Email to Buyer Leads (120–180 words): Warm, personal email the agent can send to buyer leads in their database. Start with a compelling subject line on its own line in the exact format "Subject: ..." followed by a blank line, then the body. End with a clear call to action and the agent's name on the final line.

4. Text Message Version (under 50 words): Casual, punchy SMS-friendly version. Short lines, no formatting markup. End with the agent's name on the last line.

Respond with ONLY a valid JSON object in this exact shape, with no extra prose or markdown fences:
{
  "outputs": [
    { "kind": "mls", "title": "MLS Listing Description", "body": "string" },
    { "kind": "social", "title": "Social Media Caption", "body": "string" },
    { "kind": "email", "title": "Email to Buyer Leads", "body": "string" },
    { "kind": "text", "title": "Text Message Version", "body": "string" }
  ]
}`;
}

function extractJson(text: string): { outputs: ListingOutput[] } {
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

  const validCodes = (process.env.ACCESS_CODES ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (validCodes.length > 0) {
    const submitted = body.accessCode?.trim();
    if (!submitted || !validCodes.includes(submitted)) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing access code. Subscribe at Compass Line Ventures to receive your code.",
        },
        { status: 403 },
      );
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

  const agentName = body.agentName?.trim();
  const propertyAddress = body.propertyAddress?.trim();
  const cityState = body.cityState?.trim();
  const bedrooms = body.bedrooms?.trim();
  const bathrooms = body.bathrooms?.trim();
  const sqft = body.sqft?.trim();
  const yearBuilt = body.yearBuilt?.trim();
  const features = body.features?.trim();
  const neighborhood = body.neighborhood?.trim();
  const buyerType = body.buyerType;

  const validBuyerTypes: BuyerType[] = ["first_time", "luxury", "investor", "family"];
  if (
    !agentName ||
    !propertyAddress ||
    !cityState ||
    !bedrooms ||
    !bathrooms ||
    !sqft ||
    !yearBuilt ||
    !features ||
    !neighborhood ||
    !buyerType ||
    !validBuyerTypes.includes(buyerType)
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
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: buildPrompt({
            agentName,
            propertyAddress,
            cityState,
            bedrooms,
            bathrooms,
            sqft,
            yearBuilt,
            features,
            neighborhood,
            buyerType,
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
    const rawOutputs = Array.isArray(parsed.outputs) ? parsed.outputs : [];

    const validKinds: ListingOutput["kind"][] = ["mls", "social", "email", "text"];
    const sanitized: ListingOutput[] = rawOutputs
      .filter(
        (o): o is ListingOutput =>
          typeof o?.title === "string" &&
          typeof o?.body === "string" &&
          typeof o?.kind === "string" &&
          validKinds.includes(o.kind as ListingOutput["kind"]),
      )
      .map((o) => ({
        kind: o.kind,
        title: o.title.trim(),
        body: o.body.trim(),
      }));

    if (sanitized.length === 0) {
      return NextResponse.json(
        { error: "Could not parse outputs from model response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ outputs: sanitized });
  } catch (err) {
    const messageText =
      err instanceof Error ? err.message : "Unknown error from Anthropic API.";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
