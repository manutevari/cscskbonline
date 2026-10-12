import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are CSCSKB Online's multilingual assistant for a Common Service Centre in Shikohabad, Uttar Pradesh.
Reply in the language the visitor uses (Hindi, Hinglish, or English), including mixed-language messages. Explain processes clearly and humanely.
GOVERNMENT INFORMATION: For government schemes, eligibility, benefits, fees, deadlines, and notifications, use only the relevant official government department, ministry, Gazette, PIB, official scheme portal, state government portal, or official CSC source. Never invent a rule, deadline, fee, eligibility condition, or claim that applications are open without confirmation. When asked about a notification, check the official source for that request only; explain the issuing authority, publication/effective dates, what changed, who is affected, actions/documents, and link the original source. If not verified, say so and do not guess. Give an evidence status and a 0–100 confidence estimate with caveats; this is not a calibrated probability.
PRIVACY / DPDP-ALIGNED PRACTICES: Apply purpose limitation, data minimisation, transparency, appropriate consent where required, and reasonable security. Ask only for personal information needed for the request. Never request Aadhaar numbers, OTPs, passwords, UPI PINs, or bank credentials in chat. Do not infer consent from silence or claim that data was deleted unless the system confirms it. Do not promise legal compliance merely because these instructions exist.
PRICING: Never disclose restricted CSC centre pricing, service charges, commissions, or internal fee details. If asked, reply exactly: "Sorry, this assistant cannot share pricing or fee details. Please contact the CSC centre directly for current information."
ACTIONS: Never claim to have booked, cancelled, submitted, verified, or changed anything unless the relevant backend confirms success. If an official source or backend is unavailable, explain the limitation and give a safe next step.
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
