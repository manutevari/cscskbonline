"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  name: string;
  mobile: string;
  service: string;
  date: string;
  time: string;
  remarks: string;
  status: "BOOKED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
};

const SERVICES = [
  "Aadhaar → Mobile Number Update",
  "Aadhaar → Email ID Update",
  "Aadhaar → Address / Pincode Update",
  "PAN Card",
  "Ayushman Card",
  "e-Shram Registration",
  "FSSAI Registration / License",
  "PM-KISAN",
  "Income Certificate",
  "Caste Certificate",
  "Residence / Domicile Certificate",
  "EWS Certificate",
  "Jeevan Pramaan Patra (Digital Life Certificate)",
  "मुख्यमंत्री कन्या सुमंगला योजना",
  "Voter ID",
  "Insurance Policy / Premium Payment",
  "Insurance Renewal",
  "Life Insurance",
  "General Insurance",
  "Health Insurance",
  "Motor Insurance",
  "GST Registration",
  "Udyam / MSME Registration",
  "Other CSC Service",
];

const SLOT_START_MINUTES = 9 * 60;
const SLOT_END_MINUTES = 18 * 60;
const SLOT_STEP = 15;

function todayISO() {
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

function formatDate(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...options }).format(new Date(`${iso}T00:00:00+05:30`));
}

function makeSlots() {
  return Array.from({ length: (SLOT_END_MINUTES - SLOT_START_MINUTES) / SLOT_STEP }, (_, index) => {
    const start = SLOT_START_MINUTES + index * SLOT_STEP;
    const end = start + SLOT_STEP;
    const fmt = (minutes: number) => {
      const h24 = Math.floor(minutes / 60);
      const h = h24 % 12 || 12;
      const m = String(minutes % 60).padStart(2, "0");
      return `${String(h).padStart(2, "0")}:${m} ${h24 >= 12 ? "PM" : "AM"}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
  });
}

const SLOTS = makeSlots();

function currentISTMinutes() {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

export default function CSCAppointmentAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "book" | "success">("menu");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(SLOTS[0]);
  const [remarks, setRemarks] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [qrSrc, setQrSrc] = useState("");

  const dates = useMemo(() => {
    const start = todayISO();
    return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
  }, []);

  const verifyUrl = appointment ? `https://cscskb.online/verify/${encodeURIComponent(appointment.id)}` : "";
  const primaryQr = verifyUrl
    ? `https://quickchart.io/qr?size=260&margin=2&text=${encodeURIComponent(verifyUrl)}`
    : "";
  const fallbackQr = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(verifyUrl)}`
    : "";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cscskb-last-appointment");
      if (saved) setAppointment(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (!open || mode !== "book") return;
    let cancelled = false;
    setLoadingSlots(true);
    fetch(`/api/appointments/availability?date=${encodeURIComponent(date)}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          const booked = Array.isArray(payload.bookedSlots) ? payload.bookedSlots : [];
          setBookedSlots(booked);
          const firstAvailable = SLOTS.find((slot) => !booked.includes(slot) && (date !== todayISO() || SLOTS.indexOf(slot) * SLOT_STEP + SLOT_START_MINUTES >= currentISTMinutes()));
          if (firstAvailable) setTime(firstAvailable);
        }
      })
      .catch(() => { if (!cancelled) setBookedSlots([]); })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [open, mode, date]);

  useEffect(() => {
    if (qrSrc === primaryQr) return;
    if (primaryQr) setQrSrc(primaryQr);
  }, [primaryQr, qrSrc]);

  const slotDisabled = (slot: string) => {
    if (bookedSlots.includes(slot)) return true;
    if (date !== todayISO()) return false;
    const index = SLOTS.indexOf(slot);
    return SLOT_START_MINUTES + index * SLOT_STEP <= currentISTMinutes();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !/^[0-9]{10}$/.test(mobile) || !service || !date || !time) {
      setSubmitError("Please complete all required appointment details.");
      return;
    }
    if (slotDisabled(time)) {
      setSubmitError("That time slot is no longer available. Please choose another slot.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, service, date, time, remarks }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Booking failed");
      const next = payload.appointment as Appointment;
      setAppointment(next);
      localStorage.setItem("cscskb-last-appointment", JSON.stringify(next));
      setQrSrc(payload.qrUrl || primaryQr);
      setMode("success");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setName("");
    setMobile("");
    setService(SERVICES[0]);
    setDate(todayISO());
    setTime(SLOTS[0]);
    setRemarks("");
    setBookedSlots([]);
    setSubmitError("");
    setMode("book");
  };

  const close = () => setOpen(false);

  return (
    <>
      {open && (
        <div className="csc-appt-backdrop" onClick={close}>
          <section className="csc-appt-modal" role="dialog" aria-modal="true" aria-label="CSC Appointment Assistant" onClick={(event) => event.stopPropagation()}>
            <div className="csc-appt-header">
              <div className="csc-appt-brand">
                <span className="csc-appt-avatar">📅</span>
                <div><strong>CSC Appointment Assistant</strong><small>CSC SKB Online • Shikohabad</small></div>
              </div>
              <button className="csc-appt-close" onClick={close} aria-label="Close">×</button>
            </div>

            {mode === "menu" && (
              <div className="csc-appt-menu">
                <div className="csc-appt-welcome">
                  <span className="csc-appt-check">✓</span>
                  <div><h3>Book your CSC visit</h3><p>Choose a date and 15-minute time slot. Your appointment ID and QR will be generated instantly.</p></div>
                </div>
                <button className="csc-appt-primary" onClick={() => setMode("book")}>📅 Book CSC Appointment</button>
                {appointment && <button className="csc-appt-secondary" onClick={() => setMode("success")}>🎫 View Last Appointment</button>}
              </div>
            )}

            {mode === "book" && (
              <form className="csc-appt-form" onSubmit={submit}>
                <div className="csc-appt-form-title">
                  <h3>Appointment Details</h3>
                  <p>Book any available slot within the next 7 days • 15-minute slots • CSC hours 9:00 AM–3:00 PM.</p>
                </div>

                <label>Applicant Name *<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" required /></label>
                <label>Mobile Number *<input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" inputMode="numeric" pattern="[0-9]{10}" required /></label>
                <label>Service Required *<select value={service} onChange={(e) => setService(e.target.value)}>{SERVICES.map((item) => <option key={item}>{item}</option>)}</select></label>

                <div className="csc-appt-calendar">
                  <div className="csc-appt-section-label">📅 Choose Date</div>
                  <div className="csc-appt-date-grid">
                    {dates.map((item, index) => (
                      <button type="button" key={item} className={item === date ? "csc-appt-date active" : "csc-appt-date"} onClick={() => { setDate(item); setSubmitError(""); }}>
                        <span>{index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatDate(item, { weekday: "short" })}</span>
                        <strong>{formatDate(item, { day: "2-digit", month: "short" })}</strong>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="csc-appt-calendar">
                  <div className="csc-appt-section-label">🕘 Choose 15-Minute Time Slot {loadingSlots && <small>Checking availability…</small>}</div>
                  <div className="csc-appt-slot-grid">
                    {SLOTS.map((slot) => {
                      const disabled = slotDisabled(slot);
                      return <button type="button" key={slot} disabled={disabled} className={slot === time && !disabled ? "csc-appt-slot active" : "csc-appt-slot"} onClick={() => { setTime(slot); setSubmitError(""); }}>{slot}{bookedSlots.includes(slot) && <small>Booked</small>}</button>;
                    })}
                  </div>
                  <div className="csc-appt-legend"><span>● Available</span><span>● Booked</span><span>● Past</span></div>
                </div>

                <label>Remarks<textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional — tell us what you need" rows={3} /></label>
                {submitError && <p className="csc-appt-error" role="alert">{submitError}</p>}
                <div className="csc-appt-actions">
                  <button type="button" className="csc-appt-secondary" onClick={() => setMode("menu")}>Back</button>
                  <button type="submit" className="csc-appt-primary" disabled={submitting || loadingSlots || slotDisabled(time)}>{submitting ? "Booking…" : "✓ Book Appointment"}</button>
                </div>
              </form>
            )}

            {mode === "success" && appointment && (
              <div className="csc-appt-success">
                <div className="csc-appt-success-icon">✓</div>
                <h3>Appointment Booked</h3>
                <p>Your appointment receipt is ready. The QR below verifies this appointment securely.</p>
                <div className="csc-appt-ticket">
                  <div><span>Appointment ID</span><strong>{appointment.id}</strong></div>
                  <div><span>Applicant</span><strong>{appointment.name}</strong></div>
                  <div><span>Service</span><strong>{appointment.service}</strong></div>
                  <div><span>Date & Time</span><strong>{appointment.date} • {appointment.time}</strong></div>
                  <div><span>Status</span><strong className="csc-appt-status">{appointment.status}</strong></div>
                  <div className="csc-appt-qr">
                    {qrSrc ? <img src={qrSrc} alt="Appointment verification QR code" onError={() => setQrSrc(fallbackQr)} /> : <div className="csc-appt-qr-placeholder">Generating QR…</div>}
                    <small>Scan to verify • {verifyUrl}</small>
                  </div>
                </div>
                <div className="csc-appt-actions">
                  <button className="csc-appt-secondary" onClick={resetBooking}>Book Another</button>
                  <button className="csc-appt-primary" onClick={() => window.print()}>🖨 Print Receipt</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      <div className="csc-appt-float">
        {!open && <div className="csc-appt-prompt"><strong>Need a CSC service?</strong><span>Book an appointment</span></div>}
        <button className="csc-appt-fab" onClick={() => { setOpen(true); setMode("menu"); }} aria-label="Book CSC Appointment" title="Book CSC Appointment"><span>📅</span><b>Book Appointment</b></button>
      </div>
    </>
  );
}
