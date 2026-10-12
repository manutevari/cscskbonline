import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Safe deployment diagnostic: never returns the secret itself.
export async function GET() {
  return NextResponse.json({
    ok: true,
    providerConfigured: Boolean(process.env.OPENROUTER_API_KEY),
    vercelEnvironment: process.env.VERCEL_ENV ?? "unknown",
  });
}
