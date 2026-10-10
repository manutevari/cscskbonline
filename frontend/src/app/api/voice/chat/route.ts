import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are the CSCSKB Online assistant for a CSC service centre in Shikohabad, Uttar Pradesh. Reply naturally in Hindi, Hinglish, or English based on the visitor. Give practical guidance about CSC services and appointments. Do not invent fees, eligibility, deadlines, or government rules; state uncertainty and recommend checking official sources. Never ask for Aadhaar numbers, OTPs, PINs, passwords, or bank details. Do not claim an appointment is booked; direct users to the site's booking form.`;

function getMessageText(data: any): string {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part: any) => part?.text || "").join("").trim();
  return "";
}

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body?.history) ? body.history.slice(-8).filter((m: any) =>
    (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
  ).map((m: any) => ({ role: m.role, content: m.content.slice(0, 3000) })) : [];

  if (!message || message.length > 4000) return NextResponse.json({ error: "Enter a message up to 4,000 characters." }, { status: 400 });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ error: "AI chat is not configured. Please try again later or use appointment booking." }, { status: 503 });

  const models = [
    process.env.OPENROUTER_MODEL || "z-ai/glm-5.3-flash",
    process.env.OPENROUTER_FALLBACK_MODEL || "deepseek/deepseek-v4.1-flash",
    process.env.OPENROUTER_SECOND_FALLBACK_MODEL || "openai/gpt-oss-120b",
  ].filter((model, index, all) => all.indexOf(model) === index);

  const controller = new AbortController();
  const totalTimeout = setTimeout(() => controller.abort(), 18000);
  const failures: string[] = [];
  try {
    for (const model of models) {
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
            model,
            messages: [{ role: "system", content: SYSTEM }, ...history, { role: "user", content: message }],
            temperature: 0.4,
            max_tokens: 700,
          }),
          signal: AbortSignal.timeout(6500),
          cache: "no-store",
        });
        if (!response.ok) {
          failures.push(`${model}:${response.status}`);
          if (response.status === 401 || response.status === 402) break;
          continue;
        }
        const data = await response.json();
        const answer = getMessageText(data);
        if (!answer) { failures.push(`${model}:empty-response`); continue; }
        return NextResponse.json({ answer, model, fallbackUsed: models.indexOf(model) > 0 }, { headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        failures.push(`${model}:${error instanceof Error ? error.name : "error"}`);
      }
    }
    console.error("All OpenRouter model attempts failed", failures);
    return NextResponse.json({
      error: "AI providers are temporarily unavailable. You can still use the appointment booking form or try sending your message again.",
      fallback: true,
    }, { status: 503 });
  } finally {
    clearTimeout(totalTimeout);
  }
}
