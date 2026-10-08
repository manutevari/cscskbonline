import { NextRequest, NextResponse } from "next/server";

type Booking = {
  id: string; name: string; mobile: string; service: string; date: string; time: string;
  remarks?: string; status: "BOOKED" | "CONFIRMED" | "COMPLETED" | "CANCELLED"; created_at: string;
};

const OWNER_WHATSAPP = process.env.CSC_OWNER_WHATSAPP || "918937887070";
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;
const SLOT_START = 9 * 60;
const SLOT_END = 15 * 60;
const SLOT_STEP = 15;

function cleanPhone(value: string) { return value.replace(/\D/g, "").replace(/^0+/, ""); }

function istDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function todayIST() {
  const p = istDateParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function addDaysISO(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function makeSlots() {
  return Array.from({ length: (SLOT_END - SLOT_START) / SLOT_STEP }, (_, index) => {
    const start = SLOT_START + index * SLOT_STEP;
    const end = start + SLOT_STEP;
    const fmt = (minutes: number) => {
      const h24 = Math.floor(minutes / 60), h = h24 % 12 || 12, m = String(minutes % 60).padStart(2, "0");
      return `${String(h).padStart(2, "0")}:${m} ${h24 >= 12 ? "PM" : "AM"}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
  });
}
const SLOTS = makeSlots();

function makeId() {
  const d = todayIST().replaceAll("-", "");
  return `CSC-${d}-${crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase()}`;
}

async function supabase(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init, headers: {
      apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json",
      Prefer: "return=representation", ...(init.headers || {}),
    }, cache: "no-store",
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function sendWhatsApp(to: string, appointment: Booking, role: "customer" | "owner") {
  const token = process.env.WHATSAPP_ACCESS_TOKEN, phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = role === "customer" ? process.env.WHATSAPP_CUSTOMER_TEMPLATE : process.env.WHATSAPP_OWNER_TEMPLATE;
  if (!token || !phoneNumberId || !template) return { sent: false, reason: "whatsapp_not_configured" };
  const verificationUrl = `https://cscskb.online/verify/${encodeURIComponent(appointment.id)}`;
  const parameters = role === "customer"
    ? [appointment.name, appointment.id, appointment.service, appointment.date, appointment.time, verificationUrl]
    : [appointment.id, appointment.name, appointment.mobile, appointment.service, appointment.date, appointment.time, appointment.status];
  const response = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to: cleanPhone(to), type: "template",
      template: { name: template, language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US" },
        components: [{ type: "body", parameters: parameters.map(text => ({ type: "text", text: String(text) })) }] },
    }),
  });
  if (!response.ok) return { sent: false, reason: await response.text() };
  return { sent: true };
}

function slotIsValid(time: string) { return SLOTS.includes(time); }

function slotStartMinutes(time: string) {
  const match = time.match(/^(\d{2}):(\d{2}) (AM|PM)/);
  if (!match) return -1;
  let hour = Number(match[1]) % 12;
  if (match[3] === "PM") hour += 12;
  return hour * 60 + Number(match[2]);
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

    if (!name || !/^\d{10}$/.test(mobile) || !service || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !slotIsValid(time)) {
      return NextResponse.json({ error: "Invalid appointment details" }, { status: 400 });
    }

    const today = todayIST();
    const lastBookableDate = addDaysISO(today, 6);
    if (date < today || date > lastBookableDate) {
      return NextResponse.json({ error: "Please choose a date within the next 7 days." }, { status: 400 });
    }

    if (date === today && slotStartMinutes(time) <= (() => {
      const p = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      return Number(p.find(x => x.type === "hour")?.value || 0) * 60 + Number(p.find(x => x.type === "minute")?.value || 0);
    })()) {
      return NextResponse.json({ error: "That time slot has already started or passed. Please choose another slot." }, { status: 400 });
    }

    const existing = await supabase(`appointments?date=eq.${encodeURIComponent(date)}&time=eq.${encodeURIComponent(time)}&status=in.(BOOKED,CONFIRMED)&select=id&limit=1`);
    if (existing.length) {
      return NextResponse.json({ error: "That time slot has just been booked. Please choose another slot.", code: "SLOT_BOOKED" }, { status: 409 });
    }

    const appointment: Booking = {
      id: makeId(), name, mobile, service, date, time, remarks, status: "BOOKED", created_at: new Date().toISOString(),
    };

    let inserted: Booking[];
    try {
      inserted = await supabase("appointments", { method: "POST", body: JSON.stringify(appointment) });
    } catch (error) {
      const message = String(error);
      if (message.includes("appointments_date_time_unique")) {
        return NextResponse.json({ error: "That time slot has just been booked. Please choose another slot.", code: "SLOT_BOOKED" }, { status: 409 });
      }
      throw error;
    }
    const saved = inserted[0] || appointment;
    const [customer, owner] = await Promise.all([
      sendWhatsApp(mobile, saved, "customer"),
      sendWhatsApp(OWNER_WHATSAPP, saved, "owner"),
    ]);

    const verificationUrl = `https://cscskb.online/verify/${encodeURIComponent(saved.id)}`;
    const qrUrl = `https://quickchart.io/qr?size=260&margin=2&text=${encodeURIComponent(verificationUrl)}`;
    return NextResponse.json({
      appointment: saved, qrUrl, verificationUrl,
      notifications: { customerWhatsApp: customer, ownerWhatsApp: owner },
    });
  } catch (error) {
    console.error("Appointment booking failed:", error);
    return NextResponse.json({ error: "Unable to create appointment" }, { status: 500 });
  }
}
