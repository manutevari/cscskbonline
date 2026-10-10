import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are the CSCSKB Online assistant for a CSC service centre in Shikohabad, Uttar Pradesh. Reply naturally in Hindi, Hinglish, or English based on the visitor. Keep answers concise and practical, usually under 120 words. Give guidance about CSC services and appointments. Do not invent fees, eligibility, deadlines, or government rules; state uncertainty and recommend checking official sources. Never ask for Aadhaar numbers, OTPs, PINs, passwords, or bank details. Do not claim an appointment is booked; direct users to the site's booking form.`;

function getMessageText(data: any): string {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part: any) => part?.text || "").join("").trim();
  return "";
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body?.history)
    ? body.history
        .slice(-6)
        .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
        .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1800) }))
    : [];

  if (!message || message.length > 4000) {
    return NextResponse.json({ error: "Enter a message up to 4,000 characters." }, { status: 400 });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "AI chat is not configured. Please try again later or use appointment booking." },
      { status: 503 },
    );
  }

  // Let OpenRouter route/fallback across models in one request instead of
  // waiting through several sequential client-side model timeouts.
  const models = [
    process.env.OPENROUTER_MODEL || "z-ai/glm-5.3-flash",
    process.env.OPENROUTER_FALLBACK_MODEL || "deepseek/deepseek-v4.1-flash",
    process.env.OPENROUTER_SECOND_FALLBACK_MODEL || "openai/gpt-oss-120b",
  ].filter((model, index, all) => all.indexOf(model) === index);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://www.cscskb.online",
        "X-Title": "CSCSKB Online Assistant",
      },
      body: JSON.stringify({
        models,
        messages: [{ role: "system", content: SYSTEM }, ...history, { role: "user", content: message }],
        temperature: 0.3,
        max_tokens: 450,
        stream: false,
      }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    const answer = getMessageText(data);
    if (!response.ok || !answer) {
      console.error("OpenRouter voice chat failed", response.status, data?.error?.code || data?.error?.message || "empty response");
      return NextResponse.json(
        { error: "AI providers are temporarily unavailable. Please try again or use appointment booking.", fallback: true },
        { status: response.status === 401 || response.status === 402 ? 503 : 502 },
      );
    }

    return NextResponse.json(
      { answer, model: data?.model || "openrouter-fallback", fallbackUsed: Boolean(data?.model && !models.includes(data.model)) },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "AI response took too long. Please try again." : "Could not reach the AI service. Please try again." },
      { status: timedOut ? 504 : 502 },
    );
  }
}
