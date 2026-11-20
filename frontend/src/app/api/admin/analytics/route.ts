import { NextRequest, NextResponse } from "next/server";
import { authenticateMarketingActor, unauthorized } from "@/lib/marketing-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function b64url(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return Buffer.from(binary, "binary").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function pemBuffer(pem: string) {
  const raw = Buffer.from(pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, ""), "base64");
  return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
}
async function accessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) throw new Error("GA4 service-account credentials are not configured.");
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const unsigned = head + "." + body;
  const key = await crypto.subtle.importKey("pkcs8", pemBuffer(privateKey), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const assertion = unsigned + "." + b64url(signature);
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Google OAuth token exchange failed.");
  const json = await response.json();
  return json.access_token as string;
}
type Row = { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] };
async function report(token: string, propertyId: string, startDate: string, endDate: string, dimensions: string[], metrics: string[], limit = 12) {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: dimensions.map(name => ({ name })),
      metrics: metrics.map(name => ({ name })),
      limit,
      orderBys: [{ metric: { metricName: metrics[0] }, desc: true }],
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("GA4 report error", response.status, detail.slice(0, 1000));
    throw new Error(response.status === 403 ? "GA4 access denied. Share the Analytics property with the configured service-account email and enable the Google Analytics Data API." : "GA4 report request failed.");
  }
  const data = await response.json();
  return (data.rows || []) as Row[];
}
function values(rows: Row[]) {
  return rows.map(row => ({
    dimensions: (row.dimensionValues || []).map(v => v.value || ""),
    metrics: (row.metricValues || []).map(v => Number(v.value || 0)),
  }));
}
export async function GET(request: NextRequest) {
  const actor = authenticateMarketingActor(request);
  if (!actor || actor.role !== "owner_admin") return unauthorized();
  const range = request.nextUrl.searchParams.get("range") || "7";
  if (!["7", "28", "90"].includes(range)) return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId || !/^\d+$/.test(propertyId)) return NextResponse.json({ configured: false, error: "GA4_PROPERTY_ID is not configured." }, { status: 503 });
  try {
    const token = await accessToken();
    const startDate = `${range}daysAgo`;
    const endDate = "yesterday";
    const [overview, daily, channels, pages, events] = await Promise.all([
      report(token, propertyId, startDate, endDate, [], ["activeUsers", "newUsers", "sessions", "screenPageViews", "eventCount", "userEngagementDuration"], 1),
      report(token, propertyId, startDate, endDate, ["date"], ["activeUsers", "sessions", "screenPageViews"], 100),
      report(token, propertyId, startDate, endDate, ["sessionDefaultChannelGroup"], ["sessions", "newUsers"], 12),
      report(token, propertyId, startDate, endDate, ["pageTitle"], ["screenPageViews", "activeUsers"], 12),
      report(token, propertyId, startDate, endDate, ["eventName"], ["eventCount"], 20),
    ]);
    const summary = values(overview)[0]?.metrics || [0, 0, 0, 0, 0, 0];
    return NextResponse.json({
      configured: true, propertyId, rangeDays: Number(range), generatedAt: new Date().toISOString(),
      summary: { activeUsers: summary[0], newUsers: summary[1], sessions: summary[2], pageViews: summary[3], eventCount: summary[4], engagementSeconds: summary[5] },
      daily: values(daily).sort((a, b) => a.dimensions[0].localeCompare(b.dimensions[0])).map(r => ({ date: r.dimensions[0], activeUsers: r.metrics[0], sessions: r.metrics[1], pageViews: r.metrics[2] })),
      channels: values(channels).map(r => ({ channel: r.dimensions[0], sessions: r.metrics[0], newUsers: r.metrics[1] })),
      pages: values(pages).map(r => ({ title: r.dimensions[0], views: r.metrics[0], users: r.metrics[1] })),
      events: values(events).map(r => ({ name: r.dimensions[0], count: r.metrics[0] })),
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load GA4 analytics.";
    return NextResponse.json({ configured: true, error: message }, { status: 502 });
  }
}
