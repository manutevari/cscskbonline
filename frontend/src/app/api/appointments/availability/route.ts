import { NextRequest, NextResponse } from "next/server";

function todayIST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function addDaysISO(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function missingSupabaseConfig() {
  return [!process.env.SUPABASE_URL && "SUPABASE_URL", !process.env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean);
}
async function supabase(path: string) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_CONFIG_MISSING");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`SUPABASE_HTTP_${response.status}`);
  return response.json();
}
export async function GET(request: NextRequest) {
  const missing = missingSupabaseConfig();
  if (missing.length) return NextResponse.json({
    error: "Appointment booking is temporarily unavailable because the service is not configured.",
    code: "APPOINTMENTS_CONFIG_MISSING",
    missing,
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const date = request.nextUrl.searchParams.get("date") || "";
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const today = todayIST();
    if (date < today || date > addDaysISO(today, 6)) return NextResponse.json({ error: "Date is outside the 7-day booking window." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    const rows = await supabase(`appointments?date=eq.${encodeURIComponent(date)}&select=time,status&limit=500`);
    const bookedSlots = rows.filter((row: { status: string }) => row.status === "BOOKED" || row.status === "CONFIRMED").map((row: { time: string }) => row.time);
    return NextResponse.json({ date, bookedSlots }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Appointment availability failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Unable to load slot availability. Booking is temporarily paused.", code: "APPOINTMENTS_BACKEND_ERROR" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
