"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Appointment = {
  id: string;
  name: string;
  service: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
};

export default function AppointmentVerificationPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch("/api/appointments/" + encodeURIComponent(id) + "/verify", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.valid) {
          throw new Error(payload.message || payload.error || "Appointment not found");
        }
        setAppointment(payload.appointment);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to verify appointment"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="csc-verify-page">
      <section className="csc-verify-card">
        <div className="csc-verify-brand">CSC SKB ONLINE</div>

        {loading && (
          <div className="csc-verify-state">
            <div className="csc-verify-spinner" />
            <h1>Verifying Appointment</h1>
            <p>Please wait while we check the appointment record.</p>
          </div>
        )}

        {!loading && error && (
          <div className="csc-verify-state">
            <div className="csc-verify-icon csc-verify-invalid">×</div>
            <h1>Appointment Not Found</h1>
            <p>{error}</p>
            <span className="csc-verify-id">{id}</span>
          </div>
        )}

        {!loading && appointment && (
          <div className="csc-verify-state">
            <div className="csc-verify-icon csc-verify-valid">✓</div>
            <h1>Appointment Verified</h1>
            <p>This appointment is registered with CSC SKB Online, Shikohabad.</p>

            <div className="csc-verify-details">
              <div><span>Appointment ID</span><strong>{appointment.id}</strong></div>
              <div><span>Applicant</span><strong>{appointment.name}</strong></div>
              <div><span>Service</span><strong>{appointment.service}</strong></div>
              <div><span>Date</span><strong>{appointment.date}</strong></div>
              <div><span>Time</span><strong>{appointment.time}</strong></div>
              <div><span>Status</span><strong className="csc-verify-status">{appointment.status}</strong></div>
            </div>

            <p className="csc-verify-note">
              Purana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad, Uttar Pradesh 283135
            </p>
          </div>
        )}

        <footer className="csc-verify-footer">Secure appointment verification • cscskb.online</footer>
      </section>
    </main>
  );
}
