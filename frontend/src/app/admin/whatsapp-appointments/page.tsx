"use client";

import { useState } from "react";

type Status = {
  checkedAt: string;
  access: { role: string };
  checks: {
    supabase: { configured: boolean; detail: string };
    whatsapp: { configured: boolean; detail: string };
    sms: { configured: boolean; detail: string };
    appointmentApi: { present: boolean; detail: string };
  };
  safety: string[];
};

const panel: React.CSSProperties = { background: "#10243e", border: "1px solid #29435f", borderRadius: 14, padding: 18 };
const pill = (ok: boolean): React.CSSProperties => ({ display: "inline-block", borderRadius: 99, padding: "5px 10px", fontSize: 12, fontWeight: 700, background: ok ? "#123d32" : "#49321c", color: ok ? "#8df0c1" : "#ffd08a" });

export default function WhatsAppAppointmentAdminPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function inspect() {
    setBusy(true); setError(""); setStatus(null);
    try {
      const response = await fetch("/api/admin/whatsapp-appointments/status", {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Admin access could not be verified.");
      setStatus(data as Status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to inspect configuration.");
    } finally { setBusy(false); }
  }

  return <main style={{ minHeight: "100vh", background: "#071629", color: "#f4f8ff", padding: "28px 18px 60px", fontFamily: "Arial, sans-serif" }}>
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ color: "#f7b45f", fontSize: 12, fontWeight: 800, letterSpacing: ".12em" }}>CSCSKB · ADMIN ONLY</div>
      <h1 style={{ fontSize: "clamp(26px,5vw,38px)", margin: "8px 0" }}>WhatsApp &amp; Appointment Remediation</h1>
      <p style={{ color: "#b8c9dc", lineHeight: 1.6 }}>Private operational workspace for appointment booking, WhatsApp notifications and delivery diagnostics.</p>

      {!status && <section style={{ ...panel, maxWidth: 560, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Owner / Administrator authentication</h2>
        <p style={{ color: "#b8c9dc", lineHeight: 1.5 }}>Use the dedicated CSCSKB Owner/Admin role token. Marketing Manager, Service Expert and Operations Manager tokens are not accepted here.</p>
        <label htmlFor="admin-token" style={{ display: "block", marginBottom: 8 }}>Owner/Admin token</label>
        <input id="admin-token" type="password" autoComplete="current-password" value={token} onChange={e => setToken(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && token && !busy) void inspect(); }} placeholder="Enter Owner/Admin token" style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 9, border: "1px solid #45617e", background: "#071629", color: "#fff" }} />
        <button disabled={!token || busy} onClick={() => void inspect()} style={{ marginTop: 12, padding: "11px 16px", border: 0, borderRadius: 9, background: "#f7a43b", color: "#201609", fontWeight: 800, cursor: "pointer" }}>{busy ? "Checking…" : "Open Admin diagnostics"}</button>
        {error && <p role="alert" style={{ color: "#ffaaa0" }}>{error}</p>}
      </section>}

      {status && <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "22px 0" }}>
          <span style={{ ...pill(true) }}>Authenticated: {status.access.role}</span>
          <span style={{ color: "#9eb3ca", fontSize: 12 }}>Checked: {new Date(status.checkedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span>
          <button onClick={() => { setStatus(null); setToken(""); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #45617e", background: "transparent", color: "#e9f1fb" }}>Lock Admin section</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          {[
            ["Supabase configuration", status.checks.supabase],
            ["WhatsApp Cloud API configuration", status.checks.whatsapp],
            ["SMS provider configuration", status.checks.sms],
            ["Appointment API", status.checks.appointmentApi],
          ].map(([name, item]) => {
            const check = item as { configured?: boolean; present?: boolean; detail: string };
            const ok = Boolean(check.configured ?? check.present);
            return <section key={name as string} style={panel}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <strong>{name as string}</strong><span style={pill(ok)}>{ok ? "Configured / Present" : "Needs attention"}</span>
              </div>
              <p style={{ color: "#b8c9dc", lineHeight: 1.5, marginBottom: 0 }}>{check.detail}</p>
            </section>;
          })}
        </div>
        <section style={{ ...panel, marginTop: 14 }}>
          <h2 style={{ marginTop: 0 }}>Safety boundaries</h2>
          <ul style={{ color: "#b8c9dc", lineHeight: 1.8, paddingLeft: 20 }}>{status.safety.map(item => <li key={item}>{item}</li>)}</ul>
        </section>
        <section style={{ ...panel, marginTop: 14 }}>
          <h2 style={{ marginTop: 0 }}>Next remediation checks</h2>
          <ol style={{ color: "#b8c9dc", lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Verify Preview-only Supabase and WhatsApp environment variables.</li>
            <li>Validate Meta template names, language and phone-number ID without sending a customer message.</li>
            <li>Run a controlled test using an explicitly designated test recipient.</li>
            <li>Confirm delivery webhooks and display booking and notification outcomes separately.</li>
          </ol>
          <p style={{ color: "#f7c987", fontSize: 13 }}>A green configuration status confirms variable presence only. It does not prove Meta credentials, templates or message delivery are valid.</p>
        </section>
      </>}
    </div>
  </main>;
}
