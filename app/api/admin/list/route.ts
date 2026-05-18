import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { listActiveCodes } from "../../../lib/codes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
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
    return NextResponse.json({ codes });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to read access codes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
