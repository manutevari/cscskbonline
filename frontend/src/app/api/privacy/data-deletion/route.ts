import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      const allowed = ["cscskb.online", "www.cscskb.online", "localhost:3000", "127.0.0.1:3000"].includes(url.host)
        || (url.hostname.endsWith(".vercel.app") && url.protocol === "https:");
      if (!allowed) return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    }
  }

  try {
    const body = await request.json();
    const requestType = String(body?.requestType || "");
    const name = String(body?.name || "").trim().slice(0, 100);
    const email = String(body?.email || "").trim().slice(0, 254);
    const mobile = String(body?.mobile || "").replace(/\D/g, "").slice(0, 15);
    const details = String(body?.details || "").trim().slice(0, 1000);
    const consent = body?.consent === true;

    if (!["personal_data_deletion", "access_or_correction"].includes(requestType)) {
      return NextResponse.json({ error: "Please choose a valid request type." }, { status: 400 });
    }
    if (!consent) return NextResponse.json({ error: "Please confirm the privacy notice before submitting." }, { status: 400 });
    if (!email && !mobile) return NextResponse.json({ error: "Please provide either an email address or mobile number so the team can respond." }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (mobile && mobile.length < 10) return NextResponse.json({ error: "Please enter a valid contact number." }, { status: 400 });

    const config = supabaseConfig();
    if (!config) return NextResponse.json({ error: "The request service is not configured yet. Please contact the CSC centre directly." }, { status: 503 });

    const response = await fetch(config.url + "/rest/v1/data_deletion_requests", {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: "Bearer " + config.key,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        request_type: requestType,
        name: name || null,
        email: email || null,
        mobile: mobile || null,
        details: details || null,
        consent_confirmed: true,
        status: "RECEIVED",
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Privacy request insert failed", response.status);
      return NextResponse.json({ error: "Could not save the request right now. Please try again later or contact the CSC centre." }, { status: 502 });
    }
    const saved = await response.json();
    return NextResponse.json({ success: true, requestId: saved?.[0]?.id || null, message: "Your request has been received. The team may contact you to verify your identity before taking action." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Invalid request. Please check the form and try again." }, { status: 400 });
  }
}
