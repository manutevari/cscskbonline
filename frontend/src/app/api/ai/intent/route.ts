import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Settings = {
  widthCm?: number;
  heightCm?: number;
  dpi?: number;
  maxKb?: number;
  pixelWidth?: number;
  pixelHeight?: number;
  compressionQuality?: number;
  whiteBg?: boolean;
};

function boundedNumber(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(max, Math.max(min, value));
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server पर OPENROUTER_API_KEY environment variable सेट नहीं है।" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const instruction = typeof body?.instruction === "string" ? body.instruction.trim() : "";
    if (!instruction || instruction.length > 1500) {
      return NextResponse.json({ error: "Instruction 1 से 1500 characters के बीच होना चाहिए।" }, { status: 400 });
    }

    const model = process.env.OPENROUTER_MODEL || "openrouter/free";
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://www.cscskb.online",
        "X-Title": "CSCSKB Smart Photo & Document Studio"
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You interpret photo/document editing instructions. Return ONLY a JSON object with keys settings, explanation, missingInfo. settings may contain only widthCm (number 0.5-20), heightCm (number 0.5-28), dpi (integer 72-1200), maxKb (integer 1-10000), pixelWidth (integer 1-10000), pixelHeight (integer 1-10000), compressionQuality (number 0.08-0.98), whiteBg (boolean). Include only values clearly requested or safely implied. Never invent missing measurements. Do not claim background removal, OCR, image enlargement, or other unsupported operations are done. If user asks for unsupported work, explain that limitation. explanation must be concise and in the user's language. missingInfo must be an array of short strings. Never request or process the actual photo, Aadhaar, certificate, or other personal document."
          },
          { role: "user", content: instruction }
        ]
      }),
      signal: AbortSignal.timeout(25000)
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const detail = typeof payload?.error?.message === "string" ? payload.error.message : "OpenRouter request असफल रही।";
      return NextResponse.json({ error: detail }, { status: upstream.status === 429 ? 429 : 502 });
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "AI ने readable JSON response नहीं दिया।" }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "AI response valid JSON नहीं था। दोबारा instruction भेजें।" }, { status: 502 });
    }

    const raw = parsed?.settings && typeof parsed.settings === "object" ? parsed.settings : {};
    const settings: Settings = {};
    const widthCm = boundedNumber(raw.widthCm, 0.5, 20);
    const heightCm = boundedNumber(raw.heightCm, 0.5, 28);
    const dpi = boundedNumber(raw.dpi, 72, 1200);
    const maxKb = boundedNumber(raw.maxKb, 1, 10000);
    const pixelWidth = boundedNumber(raw.pixelWidth, 1, 10000);
    const pixelHeight = boundedNumber(raw.pixelHeight, 1, 10000);
    const compressionQuality = boundedNumber(raw.compressionQuality, 0.08, 0.98);
    if (widthCm !== undefined) settings.widthCm = widthCm;
    if (heightCm !== undefined) settings.heightCm = heightCm;
    if (dpi !== undefined) settings.dpi = Math.round(dpi);
    if (maxKb !== undefined) settings.maxKb = Math.round(maxKb);
    if (pixelWidth !== undefined) settings.pixelWidth = Math.round(pixelWidth);
    if (pixelHeight !== undefined) settings.pixelHeight = Math.round(pixelHeight);
    if (compressionQuality !== undefined) settings.compressionQuality = compressionQuality;
    if (typeof raw.whiteBg === "boolean") settings.whiteBg = raw.whiteBg;

    return NextResponse.json({
      settings,
      explanation: typeof parsed.explanation === "string" ? parsed.explanation.slice(0, 500) : "Instruction समझ लिया गया।",
      missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo.filter((v: unknown) => typeof v === "string").slice(0, 5) : []
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError" ? "OpenRouter ने समय पर जवाब नहीं दिया। फिर कोशिश करें।" : "AI request process नहीं हो सकी।";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
