import { NextRequest, NextResponse } from "next/server";

const VERTICALS = ["csc_services", "tata_water", "food_safety", "insurance_banking"];
const CHANNELS = ["whatsapp", "facebook", "instagram", "google_business", "email", "website"];
function authorized(request: NextRequest) {
  const token = process.env.CSCSKB_MARKETING_ADMIN_TOKEN;
  return Boolean(token && request.headers.get("authorization") === `Bearer ${token}`);
}
async function db(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Marketing database is not configured");
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers: {
    apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json",
    Prefer: "return=representation", ...(init.headers || {}),
  }, cache: "no-store" });
  const body = await response.text();
  if (!response.ok) throw new Error(body || "Database request failed");
  return body ? JSON.parse(body) : [];
}
async function draftWithAI(input: { vertical: string; channel: string; audience: string; objective: string; language: string }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.CSCSKB_MARKETING_MODEL || "gpt-4o-mini", temperature: 0.6,
        messages: [
          { role: "system", content: "You are the CSCSKB marketing copilot. Draft accurate, ethical, locally relevant marketing copy. Never invent prices, offers, guarantees, government affiliation, product availability, regulatory approvals, insurance returns or eligibility. Use clear CTA and avoid spammy claims. Return only the campaign copy." },
          { role: "user", content: `Business vertical: ${input.vertical}. Channel: ${input.channel}. Audience: ${input.audience}. Objective: ${input.objective}. Language: ${input.language}. Draft concise campaign content with a clear enquiry CTA. Do not publish or send it.` },
        ] }) });
    if (!response.ok) throw new Error("AI drafting failed: " + await response.text());
    const result = await response.json();
    return result.choices?.[0]?.message?.content?.trim() || "AI returned an empty draft.";
  }
  const labels: Record<string,string> = { csc_services:"CSC Services",tata_water:"Tata Water Distribution",food_safety:"Food Safety & FSSAI Consultancy",insurance_banking:"Insurance & Banking Services" };
  return `[${labels[input.vertical] || input.vertical}]\n\n${input.objective}\n\nWe are here to help ${input.audience || "customers"} understand the available services and next steps. Contact CSCSKB to discuss your requirements.\n\nPlease verify eligibility, documents, charges and availability with our team before proceeding.\n\nDraft for review — not published.`;
}
export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ campaigns: await db("marketing_campaigns?select=*&order=created_at.desc&limit=100") }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load campaigns" }, { status: 500 }); }
}
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const vertical = String(body.vertical || ""), channel = String(body.channel || "");
    const name = String(body.name || "").trim().slice(0, 120), audience = String(body.audience || "").trim().slice(0, 300);
    const objective = String(body.objective || "").trim().slice(0, 500), language = String(body.language || "hi");
    if (!VERTICALS.includes(vertical) || !CHANNELS.includes(channel) || !name || !objective) return NextResponse.json({ error: "Valid vertical, channel, campaign name and objective are required." }, { status: 400 });
    const draft_content = await draftWithAI({ vertical, channel, audience, objective, language });
    const rows = await db("marketing_campaigns", { method: "POST", body: JSON.stringify({ vertical, channel, name, audience, objective, language, draft_content, status: "DRAFT" }) });
    const campaign = rows[0];
    await db("marketing_activities", { method: "POST", body: JSON.stringify({ campaign_id: campaign.id, activity_type: "campaign_drafted", details: { vertical, channel }, actor: "marketing_agent" }) });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create campaign" }, { status: 500 }); }
}
export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json(), id = String(body.id || ""), action = String(body.action || "");
    if (!id || !["submit_for_approval","approve","reject"].includes(action)) return NextResponse.json({ error: "Invalid approval action" }, { status: 400 });
    const status = action === "submit_for_approval" ? "PENDING_APPROVAL" : action === "approve" ? "APPROVED" : "REJECTED";
    const rows = await db(`marketing_campaigns?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status, ...(action === "approve" ? { approved_by: "admin", approved_at: new Date().toISOString() } : {}) }) });
    if (!rows[0]) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    await db("marketing_activities", { method: "POST", body: JSON.stringify({ campaign_id: id, activity_type: action, details: {}, actor: "admin" }) });
    return NextResponse.json({ campaign: rows[0], message: action === "approve" ? "Approved. Publishing remains a separate, manual step." : "Campaign status updated." });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update approval" }, { status: 500 }); }
}
