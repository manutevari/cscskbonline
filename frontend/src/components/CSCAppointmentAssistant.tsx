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
  status: "BOOKED";
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

const TIMES = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
];

function istNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

function bookingWindow() {
  const now = istNow();
  const open = new Date(now);
  open.setHours(0, 1, 0, 0);
  const close = new Date(now);
  close.setHours(15, 0, 0, 0);
  return { now, open, close };
}

function bookingState() {
  const { now, open, close } = bookingWindow();
  if (now < open) return "PREOPEN" as const;
  if (now >= close) return "CLOSED" as const;
  return "OPEN" as const;
}

function secondsUntilOpen() {
  const { now, open } = bookingWindow();
  return Math.max(0, Math.ceil((open.getTime() - now.getTime()) / 1000));
}

function todayISO() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export default function CSCAppointmentAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "book" | "success">("menu");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("09:00 AM");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [availability, setAvailability] = useState(bookingState());
  const [countdown, setCountdown] = useState(secondsUntilOpen());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAvailability(bookingState());
      setCountdown(secondsUntilOpen());
    }, 1000);
    try {
      const saved = localStorage.getItem("cscskb-last-appointment");
      if (saved) setAppointment(JSON.parse(saved));
    } catch {
      // Ignore malformed local storage.
    }
    return () => window.clearInterval(timer);
  }, []);

  const verifyUrl = appointment
    ? `https://cscskb.online/api/appointments/${encodeURIComponent(appointment.id)}/verify`
    : "";

  const qrUrl = useMemo(
    () =>
      verifyUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verifyUrl)}`
        : "",
    [verifyUrl]
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (availability !== "OPEN") {
      setSubmitError(availability === "PREOPEN"
        ? "Appointments open at 12:01 AM. Please wait for the opening time."
        : "Today's appointment booking is closed after 3:00 PM.");
      return;
    }
    if (!name.trim() || !/^[0-9]{10}$/.test(mobile)) return;
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
    setTime("09:00 AM");
    setRemarks("");
    setSubmitError("");
    setMode("book");
  };

  const close = () => setOpen(false);

  return (
    <>
      {open && (
        <div className="csc-appt-backdrop" onClick={close}>
          <section
            className="csc-appt-modal"
            role="dialog"
            aria-modal="true"
            aria-label="CSC Appointment Assistant"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="csc-appt-header">
              <div className="csc-appt-brand">
                <span className="csc-appt-avatar">📅</span>
                <div>
                  <strong>CSC Appointment Assistant</strong>
                  <small>CSC SKB Online • Shikohabad</small>
                </div>
              </div>
              <button className="csc-appt-close" onClick={close} aria-label="Close">
                ×
              </button>
            </div>

            {mode === "menu" && (
              <div className="csc-appt-menu">
                <div className="csc-appt-welcome">
                  <span className="csc-appt-check">✓</span>
                  <div>
                    <h3>Book your CSC visit</h3>
                    <p>Choose your service and preferred time. Your appointment ID and QR will be generated instantly.</p>
                  </div>
                </div>
                <button className="csc-appt-primary" onClick={() => setMode("book")}>
                  📅 Book CSC Appointment
                </button>
                {appointment && (
                  <button className="csc-appt-secondary" onClick={() => setMode("success")}>
                    🎫 View Last Appointment
                  </button>
                )}
              </div>
            )}

            {mode === "book" && (
              <form className="csc-appt-form" onSubmit={submit}>
                <div className="csc-appt-form-title">
                  <h3>Appointment Details</h3>
                  <p>Same-day appointments only • Booking window: 12:01 AM–3:00 PM (IST).</p>
                  {availability === "PREOPEN" && <p className="csc-appt-error">⏳ Booking opens in {countdown} seconds.</p>}
                  {availability === "CLOSED" && <p className="csc-appt-error">🔒 Today's booking window is closed. New appointments open tomorrow at 12:01 AM.</p>}
                </div>

                <label>
                  Applicant Name *
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" required />
                </label>

                <label>
                  Mobile Number *
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    required
                  />
                </label>

                <label>
                  Service Required *
                  <select value={service} onChange={(e) => setService(e.target.value)}>
                    {SERVICES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>

                <div className="csc-appt-two-col">
                  <label>
                    Preferred Date *
                    <input type="date" min={todayISO()} max={todayISO()} value={date} readOnly required />
                  </label>
                  <label>
                    Preferred Time *
                    <select value={time} onChange={(e) => setTime(e.target.value)}>
                      {TIMES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>

                <label>
                  Remarks
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional — tell us what you need" rows={3} />
                </label>

                {submitError && <p className="csc-appt-error" role="alert">{submitError}</p>}

                <div className="csc-appt-actions">
                  <button type="button" className="csc-appt-secondary" onClick={() => setMode("menu")}>Back</button>
                  <button type="submit" className="csc-appt-primary" disabled={submitting || availability !== "OPEN"}>{submitting ? "Booking…" : availability === "OPEN" ? "✓ Book Appointment" : availability === "PREOPEN" ? "Opens in " + countdown + "s" : "Booking Closed"}</button>
                </div>
              </form>
            )}

            {mode === "success" && appointment && (
              <div className="csc-appt-success">
                <div className="csc-appt-success-icon">✓</div>
                <h3>Appointment Booked</h3>
                <p>Your receipt has been generated. WhatsApp delivery is attempted automatically when the CSC WhatsApp API is configured.</p>

                <div className="csc-appt-ticket">
                  <div>
                    <span>Appointment ID</span>
                    <strong>{appointment.id}</strong>
                  </div>
                  <div>
                    <span>Applicant</span>
                    <strong>{appointment.name}</strong>
                  </div>
                  <div>
                    <span>Service</span>
                    <strong>{appointment.service}</strong>
                  </div>
                  <div>
                    <span>Date & Time</span>
                    <strong>{appointment.date} • {appointment.time}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong className="csc-appt-status">BOOKED</strong>
                  </div>
                  <div className="csc-appt-qr">
                    <img src={qrUrl} alt="Appointment verification QR code" />
                    <small>Scan to verify</small>
                  </div>
                </div>

                <div className="csc-appt-actions">
                  <button className="csc-appt-secondary" onClick={resetBooking}>Book Another</button>
                  <button className="csc-appt-primary" onClick={() => window.print()}>🖨 Print</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      <div className="csc-appt-float">
        {open === false && (
          <div className="csc-appt-prompt">
            <strong>Need a CSC service?</strong>
            <span>Book an appointment</span>
          </div>
        )}
        <button
          className="csc-appt-fab"
          onClick={() => { setOpen(true); setMode("menu"); }}
          aria-label="Book CSC Appointment"
          title="Book CSC Appointment"
        >
          <span>📅</span>
          <b>Book Appointment</b>
        </button>
      </div>
    </>
  );
}
