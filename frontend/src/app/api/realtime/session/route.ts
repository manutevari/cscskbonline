import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Live voice is not configured yet. Please use text chat or appointment booking." }, { status: 503 });

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      const allowed = ["cscskb.online", "www.cscskb.online", "localhost:3000", "127.0.0.1:3000"].includes(url.host) || (url.hostname.endsWith(".vercel.app") && url.protocol === "https:");
      if (!allowed) return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
    } catch { return NextResponse.json({ error: "Invalid origin." }, { status: 403 }); }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, cache: "no-store",
      body: JSON.stringify({ session: { type: "realtime", model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime", instructions: "You are CSCSKB Live Assistant for a CSC service center in Shikohabad, Uttar Pradesh. Speak naturally in the visitor’s language: Hindi, Hinglish, or English. Explain CSC services, documents, and appointment steps. Never invent fees or eligibility. You can guide users but must not claim an appointment is booked; direct them to the Book Appointment form. Never ask for Aadhaar numbers, OTPs, PINs, passwords, or bank details.", audio: { input: { transcription: { model: "gpt-4o-mini-transcribe" } }, output: { voice: "marin" } } } })
    });
    const payload = await response.json();
    if (!response.ok || !payload?.client_secret?.value) {
      console.error("Realtime session creation failed", response.status);
      return NextResponse.json({ error: "Could not start live voice. Please try again shortly." }, { status: 502 });
    }
    return NextResponse.json({ clientSecret: payload.client_secret.value }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Realtime session endpoint failed", error);
    return NextResponse.json({ error: "Could not start live voice right now." }, { status: 500 });
  }
}
