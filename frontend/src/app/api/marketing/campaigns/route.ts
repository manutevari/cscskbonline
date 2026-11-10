import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authenticateMarketingActor, unauthorized } from "@/lib/marketing-auth";

const VERTICALS = ["csc_services", "tata_water", "food_safety", "insurance_banking"];
const CHANNELS = ["whatsapp", "facebook", "instagram", "google_business", "email", "website"];
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_COPY_MODEL = "google/gemma-4-26b-a4b-it:free";
const FALLBACK_COPY_MODEL = "nvidia/nemotron-3-ultra:free";

async function db(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Marketing database is not configured");
  const r = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const body = await r.text();
  if (!r.ok) throw new Error(body || "Database request failed");
  return body ? JSON.parse(body) : [];
}

function templateDraft(input: {
  vertical: string;
  audience: string;
  objective: string;
}) {
  const labels: Record<string, string> = {
    csc_services: "CSC Services",
    tata_water: "Tata Water Distribution",
    food_safety: "Food Safety & FSSAI Consultancy",
    insurance_banking: "Insurance & Banking Services",
  };
  return `[${labels[input.vertical] || input.vertical}]

${input.objective}

We are here to help ${input.audience || "customers"} understand the available services and next steps. Contact CSCSKB to discuss your requirements.

Verify eligibility, documents, charges and availability with our team before proceeding.

Draft for review — not published.`;
}

async function draftWithAI(input: {
  vertical: string;
  channel: string;
  audience: string;
  objective: string;
  language: string;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return templateDraft(input);

  // Only accept explicitly free model variants. Never route to a paid model.
  const configuredPrimary = process.env.CSCSKB_MARKETING_MODEL_COPY || DEFAULT_COPY_MODEL;
  const configuredFallback = process.env.CSCSKB_MARKETING_MODEL_FALLBACK || FALLBACK_COPY_MODEL;
  const models = [...new Set([configuredPrimary, configuredFallback])];
  if (models.some((model) => model !== "openrouter/free" && !model.endsWith(":free"))) {
    throw new Error("OpenRouter model configuration must use free-only model IDs ending in :free (or openrouter/free).");
  }

  const messages = [
    {
      role: "system",
      content:
        "You are the CSCSKB marketing copilot. Draft accurate, ethical, locally relevant marketing copy. Never invent prices, offers, guarantees, government affiliation, product availability, regulatory approvals, insurance returns or eligibility. For FSSAI, insurance and banking topics, avoid legal or financial guarantees and use cautious factual wording. Use a clear call to action. Return only campaign copy.",
    },
    {
      role: "user",
      content: `Business vertical: ${input.vertical}. Channel: ${input.channel}. Audience: ${input.audience}. Objective: ${input.objective}. Language: ${input.language}. Draft concise, natural copy suitable for customers in India. Do not publish or send.`,
    },
  ];

  let lastError = "No free OpenRouter model was available.";
  for (const model of models) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.cscskb.online",
          "X-Title": "CSCSKB AI Marketing Agent",
        },
        body: JSON.stringify({
          model,
          temperature: 0.5,
          max_tokens: 700,
          messages,
        }),
        signal: AbortSignal.timeout(45000),
        cache: "no-store",
      });
      if (!response.ok) {
        lastError = `OpenRouter ${model} returned HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`;
        continue;
      }
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) return text.trim();
      lastError = `OpenRouter ${model} returned an empty response.`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "OpenRouter request failed.";
    }
  }

  // Keep the dashboard usable when free-provider capacity is exhausted.
  console.error("[marketing] Free OpenRouter models unavailable; using deterministic template.", lastError);
  return templateDraft(input);
}

export async function GET(req: NextRequest) {
  const actor = authenticateMarketingActor(req);
  if (!actor) return unauthorized();
  try {
    return NextResponse.json({
      campaigns: await db("marketing_campaigns?select=*&order=created_at.desc&limit=100"),
      actor,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to load campaigns" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const actor = authenticateMarketingActor(req);
  if (!actor) return unauthorized();
  if (actor.role === "service_expert") {
    return NextResponse.json(
      { error: "Service Expert role is for domain review, not campaign authoring." },
      { status: 403 },
    );
  }
  try {
    const b = await req.json();
    const vertical = String(b.vertical || "");
    const channel = String(b.channel || "");
    const name = String(b.name || "").trim().slice(0, 120);
    const audience = String(b.audience || "").trim().slice(0, 300);
    const objective = String(b.objective || "").trim().slice(0, 500);
    const language = String(b.language || "hi");
    if (!VERTICALS.includes(vertical) || !CHANNELS.includes(channel) || !name || !objective) {
      return NextResponse.json(
        { error: "Valid vertical, channel, campaign name and objective are required." },
        { status: 400 },
      );
    }

    const draft_content = await draftWithAI({ vertical, channel, audience, objective, language });
    const content_hash = createHash("sha256").update(draft_content, "utf8").digest("hex");
    const rows = await db("marketing_campaigns", {
      method: "POST",
      body: JSON.stringify({
        vertical,
        channel,
        name,
        audience,
        objective,
        language,
        draft_content,
        content_hash,
        created_by: actor.id,
        status: "DRAFT",
      }),
    });
    const campaign = rows[0];
    await db("marketing_activities", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: campaign.id,
        activity_type: "campaign_drafted",
        details: { vertical, channel, content_hash },
        actor: actor.id,
      }),
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to create campaign" },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Direct campaign approval is disabled. Use POST /api/marketing/approvals with action=request or action=decide." },
    { status: 410 },
  );
}
