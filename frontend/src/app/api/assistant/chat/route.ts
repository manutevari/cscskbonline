import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are CSCSKB Online's multilingual assistant for a Common Service Centre in Shikohabad, Uttar Pradesh.
Reply in the language the visitor uses (Hindi, Hinglish, or English); automatically handle mixed-language messages.
Help explain CSC services, document requirements, and how to use the appointment booking interface.
Never invent official fees, eligibility, or government rules. If uncertain, say so and recommend checking the relevant official portal or CSC operator.
Never request Aadhaar numbers, OTPs, PINs, passwords, or bank details. Do not claim to have booked or changed an appointment; direct the user to the website's booking form.
Keep answers concise, clear, and helpful.`;

const MODELS = [
  process.env.OPENROUTER_MODEL || "z-ai/glm-5.3-flash",
  process.env.OPENROUTER_FALLBACK_MODEL || "deepseek/deepseek-v4.1-flash",
  process.env.OPENROUTER_SECOND_FALLBACK_MODEL || "google/gemini-2.5-flash",
];

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI chat is not configured. Please use the appointment booking form." }, { status: 503 });
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      const allowed = ["cscskb.online", "www.cscskb.online", "localhost:3000", "127.0.0.1:3000"].includes(url.host)
        || (url.hostname.endsWith(".vercel.app") && url.protocol === "https:");
      if (!allowed) return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    }
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const safeMessages = messages.slice(-12).flatMap((message: { role?: string; content?: unknown }) => {
      if (!["user", "assistant"].includes(String(message?.role))) return [];
      if (typeof message?.content !== "string") return [];
      const content = message.content.trim().slice(0, 4000);
      return content ? [{ role: message.role, content }] : [];
    });

    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Please enter a message first." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.cscskb.online",
          "X-OpenRouter-Title": "CSCSKB Online Assistant",
        },
        body: JSON.stringify({
          models: MODELS,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
          temperature: 0.3,
          max_tokens: 700,
          stream: false,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeout);
    }

    const payload = await response.json().catch(() => null);
    const answer = payload?.choices?.[0]?.message?.content;
    if (!response.ok || typeof answer !== "string" || !answer.trim()) {
      console.error("OpenRouter assistant request failed", response.status);
      return NextResponse.json({ error: "The AI is temporarily unavailable. Please try again or use appointment booking." }, { status: 502 });
    }

    return NextResponse.json(
      { answer: answer.trim(), model: payload.model || "routed-fallback" },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? "The AI response took too long. Please try again." : "Could not reach the AI service. Please try again." },
      { status: timedOut ? 504 : 502 },
    );
  }
}
