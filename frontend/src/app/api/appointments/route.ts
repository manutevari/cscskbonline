import { NextRequest, NextResponse } from "next/server";

type Booking = {
  id: string;
  name: string;
  mobile: string;
  service: string;
  date: string;
  time: string;
  remarks?: string;
  status: "BOOKED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  created_at: string;
};

const OWNER_WHATSAPP = process.env.CSC_OWNER_WHATSAPP || "918937887070";
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

function cleanPhone(value: string) {
  return value.replace(/\\D/g, "").replace(/^0+/, "");
}

function makeId() {
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()).replaceAll("-", "");
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
  return `CSC-${d}-${token}`;
}

async function supabase(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  const response = await fetch(`${url}/rest/v1/${path}`, {
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
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function sendWhatsApp(to: string, appointment: Booking, role: "customer" | "owner") {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = role === "customer"
    ? process.env.WHATSAPP_CUSTOMER_TEMPLATE
    : process.env.WHATSAPP_OWNER_TEMPLATE;
  if (!token || !phoneNumberId || !template) return { sent: false, reason: "whatsapp_not_configured" };

  // Templates are configured in Meta Business Manager. The variable order is:
  // customer: name, appointment id, service, date, time, verification URL
  // owner: appointment id, name, mobile, service, date, time, status
  const verificationUrl = `https://cscskb.online/api/appointments/${encodeURIComponent(appointment.id)}/verify`;
  const parameters = role === "customer"
    ? [appointment.name, appointment.id, appointment.service, appointment.date, appointment.time, verificationUrl]
    : [appointment.id, appointment.name, appointment.mobile, appointment.service, appointment.date, appointment.time, appointment.status];

  const response = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: cleanPhone(to),
      type: "template",
      template: {
        name: template,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US" },
        components: [{ type: "body", parameters: parameters.map(text => ({ type: "text", text: String(text) })) }],
      },
    }),
  });
  if (!response.ok) return { sent: false, reason: await response.text() };
  return { sent: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const mobile = cleanPhone(String(body.mobile || ""));
    const service = String(body.service || "").trim();
    const date = String(body.date || "").trim();
    const time = String(body.time || "").trim();
    const remarks = String(body.remarks || "").trim();

    if (!name || !/^\\d{10}$/.test(mobile) || !service || !/^\\d{4}-\\d{2}-\\d{2}$/.test(date) || !time) {
      return NextResponse.json({ error: "Invalid appointment details" }, { status: 400 });
    }

    const appointment: Booking = {
      id: makeId(), name, mobile, service, date, time, remarks,
      status: "BOOKED", created_at: new Date().toISOString(),
    };

    const inserted = await supabase("appointments", { method: "POST", body: JSON.stringify(appointment) });
    const saved = inserted[0] || appointment;

    const [customer, owner] = await Promise.all([
      sendWhatsApp(mobile, saved, "customer"),
      sendWhatsApp(OWNER_WHATSAPP, saved, "owner"),
    ]);

    return NextResponse.json({
      appointment: saved,
      notifications: { customerWhatsApp: customer, ownerWhatsApp: owner },
      verificationUrl: `https://cscskb.online/api/appointments/${encodeURIComponent(saved.id)}/verify`,
    });
  } catch (error) {
    console.error("Appointment booking failed:", error);
    return NextResponse.json({ error: "Unable to create appointment" }, { status: 500 });
  }
}
