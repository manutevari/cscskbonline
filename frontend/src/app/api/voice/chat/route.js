import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are CSCSKB Online's Hindi-first government recruitment voice assistant. Speak naturally and briefly in Hindi or Hinglish, matching the user's language. Welcome the user, ask which recruitment they want (SSC, UPPSC, UPSSSC, Railway, UP Police, or another), guide them step by step, ask for their resume only when useful, and explain what documents are commonly needed. Never claim a vacancy is currently open unless the user provides a notice or the server has verified current official data. This service has no live vacancy feed yet, so be honest and direct users to the relevant official portal. Do not claim to read uploaded files unless their contents are actually supplied in the request. Do not ask users to paste Aadhaar, bank details, passwords, or other sensitive identifiers into chat.`;

export async function POST(request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Voice assistant is not configured yet. Add OPENROUTER_API_KEY in Vercel Project Settings → Environment Variables." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const safeMessages = messages
      .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    if (!safeMessages.length || !safeMessages.some((m) => m.role === "user")) {
      return NextResponse.json({ error: "Please send a message to begin." }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://www.cscskb.online",
        "X-Title": "CSCSKB Online Recruitment Voice Assistant",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
        temperature: 0.5,
        max_tokens: 450,
      }),
      signal: AbortSignal.timeout(25000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const status = response.status === 402 ? 402 : 502;
      return NextResponse.json({
        error: response.status === 402
          ? "OpenRouter ने 402 लौटाया है। API key की credits/spending limit जाँचें; यह ChatGPT subscription से अलग है।"
          : "AI सेवा अभी जवाब नहीं दे सकी। थोड़ी देर बाद फिर कोशिश करें।",
      }, { status });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "AI से खाली जवाब मिला। फिर कोशिश करें।" }, { status: 502 });
    }
    return NextResponse.json({ reply: reply.trim() });
  } catch (error) {
    return NextResponse.json({
      error: error?.name === "TimeoutError" ? "जवाब आने में अधिक समय लगा। फिर कोशिश करें।" : "Voice assistant से संपर्क नहीं हो सका।",
    }, { status: 500 });
  }
}
