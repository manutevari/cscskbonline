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
  "Aadhaar Update",
  "PAN Card",
  "Ayushman Card",
  "PM-KISAN",
  "Income / Caste / Residence Certificate",
  "Voter ID",
  "Insurance / Banking",
  "GST / MSME",
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
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function makeAppointmentId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const token = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CSC-${date}-${token}`;
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cscskb-last-appointment");
      if (saved) setAppointment(JSON.parse(saved));
    } catch {
      // Ignore malformed local storage.
    }
  }, []);

  const verifyUrl = appointment
    ? `https://cscskb.online/appointment/verify/${appointment.id}`
    : "";

  const qrUrl = useMemo(
    () =>
      verifyUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verifyUrl)}`
        : "",
    [verifyUrl]
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !/^[0-9]{10}$/.test(mobile)) return;

    const next: Appointment = {
      id: makeAppointmentId(),
      name: name.trim(),
      mobile,
      service,
      date,
      time,
      remarks: remarks.trim(),
      status: "BOOKED",
    };

    setAppointment(next);
    localStorage.setItem("cscskb-last-appointment", JSON.stringify(next));
    setMode("success");
  };

  const resetBooking = () => {
    setName("");
    setMobile("");
    setService(SERVICES[0]);
    setDate(todayISO());
    setTime("09:00 AM");
    setRemarks("");
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
                  <p>No separate appointment page — booking stays on this page.</p>
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
                    <input type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} required />
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

                <div className="csc-appt-actions">
                  <button type="button" className="csc-appt-secondary" onClick={() => setMode("menu")}>Back</button>
                  <button type="submit" className="csc-appt-primary">✓ Book Appointment</button>
                </div>
              </form>
            )}

            {mode === "success" && appointment && (
              <div className="csc-appt-success">
                <div className="csc-appt-success-icon">✓</div>
                <h3>Appointment Booked</h3>
                <p>Save this appointment ID. Show the QR at the CSC counter.</p>

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
