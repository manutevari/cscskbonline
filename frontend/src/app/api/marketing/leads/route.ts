import { NextRequest, NextResponse } from "next/server";

const VERTICALS = ["csc_services", "tata_water", "food_safety", "insurance_banking"] as const;
type Vertical = (typeof VERTICALS)[number];

function adminAllowed(request: NextRequest) {
  const expected = process.env.CSCSKB_MARKETING_ADMIN_TOKEN;
  return Boolean(expected && request.headers.get("authorization") === `Bearer ${expected}`);
}
async function db(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Marketing database is not configured");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init, headers: {
      apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json",
      Prefer: "return=representation", ...(init.headers || {}),
    }, cache: "no-store",
  });
  const body = await response.text();
  if (!response.ok) throw new Error(body || "Database request failed");
  return body ? JSON.parse(body) : [];
}
function scoreLead(input: { service_interest?: string; message?: string; email?: string }) {
  let score = 20;
  if (input.service_interest) score += 25;
  if (input.message && input.message.length > 20) score += 15;
  if (input.email) score += 10;
  return Math.min(score, 70);
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vertical = String(body.vertical || "") as Vertical;
    const full_name = String(body.full_name || "").trim().slice(0, 120);
    const phone = String(body.phone || "").replace(/\D/g, "").slice(-10);
    const email = String(body.email || "").trim().slice(0, 160) || null;
    const city = String(body.city || "").trim().slice(0, 100) || null;
    const service_interest = String(body.service_interest || "").trim().slice(0, 160) || null;
    const message = String(body.message || "").trim().slice(0, 1500) || null;
    const source = String(body.source || "website").trim().slice(0, 80);
    const consent_to_contact = body.consent_to_contact === true;
    if (!VERTICALS.includes(vertical) || full_name.length < 2 || !/^\d{10}$/.test(phone) || !consent_to_contact) {
      return NextResponse.json({ error: "Please provide a valid name, 10-digit phone number, business interest and contact consent." }, { status: 400 });
    }
    const rows = await db("marketing_leads", {
      method: "POST",
      body: JSON.stringify({ vertical, full_name, phone, email, city, service_interest, message, source, consent_to_contact, lead_score: scoreLead({service_interest: service_interest || undefined, message: message || undefined, email: email || undefined}) }),
    });
    const lead = rows[0];
    await db("marketing_activities", { method: "POST", body: JSON.stringify({ lead_id: lead.id, activity_type: "lead_created", details: { vertical, source }, actor: "lead_capture" }) });
    return NextResponse.json({ success: true, lead_id: lead.id, message: "Your enquiry has been received. Our team will contact you." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save lead" }, { status: 500 });
  }
}
export async function GET(request: NextRequest) {
  if (!adminAllowed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const vertical = request.nextUrl.searchParams.get("vertical");
    const status = request.nextUrl.searchParams.get("status");
    const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: "200" });
    if (vertical && VERTICALS.includes(vertical as Vertical)) params.set("vertical", `eq.${vertical}`);
    if (status) params.set("status", `eq.${status}`);
    const leads = await db(`marketing_leads?${params.toString()}`);
    return NextResponse.json({ leads });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load leads" }, { status: 500 });
  }
}
