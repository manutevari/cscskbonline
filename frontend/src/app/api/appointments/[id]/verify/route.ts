import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: "Verification service is not configured" }, { status: 503 });
    const response = await fetch(
      `${url}/rest/v1/appointments?id=eq.${encodeURIComponent(id)}&select=id,name,service,date,time,status,created_at`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!response.ok) return NextResponse.json({ error: "Verification lookup failed" }, { status: 502 });
    const rows = await response.json();
    if (!rows.length) return NextResponse.json({ valid: false, message: "Appointment not found" }, { status: 404 });
    return NextResponse.json({ valid: true, appointment: rows[0] });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
