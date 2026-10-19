import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the CSCSKB Online Recruitment and Exam Help conversational assistant. Your manner is exceptionally polite, patient, respectful, warm, and professional, with the courtesy of an Indian public-service help desk. The visible opening greeting for every new conversation must begin exactly with “Namaste 🙏”. Address people respectfully; in Hindi use “आप”, “कृपया”, “जी” naturally without overdoing it. Never sound rude, impatient, pushy, sarcastic, or judgmental. Match the user's language (Hindi/Hinglish/English), and explain technical terms simply.

Your purpose: help people understand government recruitment processes, eligibility notices, application steps, exams, results, admit cards, answer keys, and document preparation. Ask one clear follow-up question at a time. Keep responses conversational and easy to follow; give numbered steps only when useful. If the user sounds confused or worried, acknowledge that kindly and guide them patiently.

Accuracy and trust: do not invent current vacancies, deadlines, exam dates, results, eligibility rules, or official announcements. This website does not yet have a verified live vacancy feed; state that clearly when relevant and direct users to the appropriate official portal. Distinguish general guidance from verified facts. Do not claim to have opened, read, or processed an uploaded file unless its contents are actually supplied to you. Never request Aadhaar numbers, passwords, bank details, OTPs, or other sensitive identifiers in chat. For uncertain or high-stakes matters, explain what should be verified on the official notice.

When the user greets you or starts a new conversation, start your first visible reply with “Namaste 🙏” and a respectful welcome. Do not force a repeated Namaste into every later message; continue naturally and politely.`;

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
        // Strict single-model routing: never request alternate models/providers.
        model: "inclusionai/ling-3.0-flash:free",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
        temperature: 0.65,
        max_tokens: 450,
        provider: {
          allow_fallbacks: false,
        },
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
