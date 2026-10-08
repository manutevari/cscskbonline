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

async function supabase(path: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date") || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const today = todayIST();
    if (date < today || date > addDaysISO(today, 6)) {
      return NextResponse.json({ error: "Date is outside the 7-day booking window." }, { status: 400 });
    }

    const rows = await supabase(
      `appointments?date=eq.${encodeURIComponent(date)}&select=time,status&limit=500`
    );
    const bookedSlots = rows
      .filter((row: { status: string }) => row.status === "BOOKED" || row.status === "CONFIRMED")
      .map((row: { time: string }) => row.time);

    return NextResponse.json({ date, bookedSlots });
  } catch (error) {
    console.error("Appointment availability failed:", error);
    return NextResponse.json({ error: "Unable to load slot availability" }, { status: 500 });
  }
}
