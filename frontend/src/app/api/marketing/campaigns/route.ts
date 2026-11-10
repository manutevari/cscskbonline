import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authenticateMarketingActor, unauthorized } from "@/lib/marketing-auth";

const VERTICALS = ["csc_services", "tata_water", "food_safety", "insurance_banking"];
const CHANNELS = ["whatsapp", "facebook", "instagram", "google_business", "email", "website", "paid_ads"];
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

function confidenceThreshold() {
  const value = Number(process.env.CSCSKB_MARKETING_CONFIDENCE_THRESHOLD || 80);
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error("CSCSKB_MARKETING_CONFIDENCE_THRESHOLD must be an integer from 1 to 100.");
  return value;
}

function assessDraft(text: string, context: string) {
  let score = 100;
  const reasons: string[] = [];
  if (text.trim().length < 100) { score -= 25; reasons.push("Draft is unusually short."); }
  if (/(guaranteed|100% assured| निश्चित लाभ|गारंटीड|पक्का मुनाफा|सरकारी गारंटी)/i.test(text)) {
    score -= 50; reasons.push("Potential guarantee or unsupported promise detected.");
  }
  if (/(₹|rs\\.?\\s?\\d|\\bprice\\b|discount|छूट)/i.test(text)) {
    score -= 15; reasons.push("Price or offer needs source verification.");
  }
  const sensitivePatterns = [
    /\\b\\d{12}\\b/, /\\b[A-Z]{5}\\d{4}[A-Z]\\b/i,
    /\\b(?:aadhaar|आधार|pan number|पैन नंबर|bank account|account number|ifsc|cvv|otp|password|पासवर्ड|medical record|health condition)\\b/i,
    /\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/i,
    /(?:\\+?91[- ]?)?[6-9]\\d{9}\\b/,
  ];
  const sensitive = sensitivePatterns.some((p) => p.test(context + "\\n" + text));
  if (sensitive) { score = Math.min(score, 79); reasons.push("Possible personal, financial, health or credential data detected; human review required."); }
  score = Math.max(0, Math.min(100, score));
  return { score, sensitive, reason: reasons.join(" ") || "Passed deterministic content-quality and policy checks." };
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

    // Fail closed before any third-party AI call: sensitive input must be reviewed/redacted by a human first.
    const sensitiveInputPatterns = [
      /\\b\\d{12}\\b/, /\\b[A-Z]{5}\\d{4}[A-Z]\\b/i,
      /\\b(?:aadhaar|आधार|pan number|पैन नंबर|bank account|account number|ifsc|cvv|otp|password|पासवर्ड|medical record|health condition)\\b/i,
      /\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/i,
      /(?:\\+?91[- ]?)?[6-9]\\d{9}\\b/,
    ];
    if (sensitiveInputPatterns.some((pattern) => pattern.test([audience, objective].join("\\n")))) {
      return NextResponse.json({
        error: "Potentially sensitive personal, financial, health or credential data detected. The input was not sent to the AI provider or saved. A human must review and redact it before resubmission.",
        human_review_required: true,
        external_ai_call_made: false,
      }, { status: 422 });
    }

    const draft_content = await draftWithAI({ vertical, channel, audience, objective, language });
    const threshold = confidenceThreshold();
    const assessment = assessDraft(draft_content, [audience, objective].join("\\n"));
    const confidence_decision = assessment.score < threshold ? "AUTO_REJECT" : "PASS";
    const human_review_required = assessment.sensitive;

    const content_hash = createHash("sha256").update([vertical, channel, draft_content].join("\n"), "utf8").digest("hex");
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
        status: confidence_decision === "AUTO_REJECT" ? "REJECTED" : "DRAFT",
      }),
    });
    const campaign = rows[0];
    await db("marketing_ai_assessments", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: campaign.id, confidence_score: assessment.score,
        confidence_threshold: threshold, confidence_decision,
        confidence_reason: assessment.reason, assessment_source: "deterministic_policy_checks",
        sensitive_data_detected: assessment.sensitive, human_review_required, assessed_by: actor.id,
      }),
    });
    await db("marketing_activities", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: campaign.id,
        activity_type: "campaign_drafted",
        details: { vertical, channel, content_hash, confidence_score: assessment.score, confidence_threshold: threshold, confidence_decision, sensitive_data_detected: assessment.sensitive, human_review_required },
        actor: actor.id,
      }),
    });
    return NextResponse.json({ campaign, assessment: { confidence_score: assessment.score, confidence_threshold: threshold, confidence_decision, confidence_reason: assessment.reason, sensitive_data_detected: assessment.sensitive, human_review_required, next_step: confidence_decision === "AUTO_REJECT" ? "AUTO_REJECTED" : human_review_required ? "HUMAN_REVIEW_REQUIRED" : "PASS_TO_APPROVAL_QUEUE" } }, { status: 201 });
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
