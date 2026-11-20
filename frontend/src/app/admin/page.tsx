"use client";

import { FormEvent, useEffect, useState } from "react";

const card: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 18,
  padding: 20,
  background: "rgba(255,255,255,.055)",
};
const primary: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: "12px 18px",
  background: "#ff9a22",
  color: "#1a1208",
  fontWeight: 800,
  cursor: "pointer",
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.18)",
  background: "#071a35",
  color: "#fff",
  font: "inherit",
};

const modules = [
  { title: "AI Marketing Command Centre", description: "Leads, campaign drafts, approvals and customer growth.", href: "/marketing", icon: "🤖", status: "Available" },
  { title: "Website & Content", description: "Manage public pages, service information and website content.", href: null, icon: "🌐", status: "Planned" },
  { title: "Jobs & Exam Portal", description: "Recruitment updates, exam resources and portal administration.", href: "/jobs-exams", icon: "🎓", status: "Portal" },
  { title: "Leads & Zoho CRM", description: "Website enquiries and CRM synchronization.", href: "/marketing", icon: "👥", status: "In progress" },
  { title: "Reports & Analytics", description: "Website performance, enquiries and business reporting.", href: null, icon: "📊", status: "Planned" },
  { title: "Integrations & Settings", description: "Secure configuration and connected services.", href: null, icon: "⚙️", status: "Planned" },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  async function checkSession() {
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      setAuthenticated(response.ok);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void checkSession(); }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Admin login failed.");
      setPassword("");
      setAuthenticated(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
  }

  return (
    <main style={{ minHeight: "100vh", padding: "clamp(18px,4vw,44px)", color: "#f7faff", background: "radial-gradient(circle at top left,rgba(255,138,0,.16),transparent 30%),linear-gradient(135deg,#06142d,#082449 48%,#06142d)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 30 }}>
          <div>
            <div style={{ color: "#ffb15a", fontWeight: 800, letterSpacing: ".14em", fontSize: 12 }}>CSCSKB ONLINE · CONTROL ROOM</div>
            <h1 style={{ fontSize: "clamp(30px,5vw,46px)", margin: "8px 0" }}>Admin Control Center</h1>
            <p style={{ color: "#a9bdd8", margin: 0 }}>A secure workspace for CSCSKB administration.</p>
          </div>
          {authenticated && <button onClick={logout} style={{ ...primary, background: "rgba(255,255,255,.1)", color: "#fff" }}>Lock Admin</button>}
        </header>

        {busy && <section style={{ ...card, maxWidth: 520 }}>Checking secure admin session…</section>}

        {!busy && !authenticated && (
          <section style={{ ...card, maxWidth: 480, margin: "48px auto" }}>
            <div style={{ fontSize: 32 }}>🔐</div>
            <h2 style={{ margin: "10px 0 6px" }}>Administrator Login</h2>
            <p style={{ color: "#a9bdd8", lineHeight: 1.6 }}>Sign in with the private CSCSKB administrator password. Your session is protected by an HttpOnly cookie and expires after 8 hours.</p>
            <form onSubmit={login}>
              <label htmlFor="admin-password" style={{ display: "block", margin: "18px 0 7px", fontSize: 13 }}>Admin password</label>
              <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required style={input} />
              <button disabled={busy || !password} type="submit" style={{ ...primary, width: "100%", marginTop: 14 }}>{busy ? "Signing in…" : "Secure Login"}</button>
            </form>
            {error && <p role="alert" style={{ color: "#ffaaa2", marginBottom: 0 }}>{error}</p>}
            <p style={{ color: "#7f96b6", fontSize: 11, marginBottom: 0 }}>Admin credentials are validated on the server. They are never stored in browser local storage.</p>
          </section>
        )}

        {!busy && authenticated && (
          <>
            <section style={{ ...card, display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ fontSize: 24 }}>🛡️</span>
              <div><strong>Owner / Administrator session active</strong><div style={{ color: "#a9bdd8", fontSize: 12, marginTop: 3 }}>External publishing and messaging remain disabled unless separately configured and approved.</div></div>
            </section>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(245px,1fr))", gap: 14 }}>
              {modules.map(module => (
                <article key={module.title} style={{ ...card, display: "flex", flexDirection: "column", minHeight: 190 }}>
                  <div style={{ fontSize: 28 }}>{module.icon}</div>
                  <h2 style={{ fontSize: 18, margin: "12px 0 6px" }}>{module.title}</h2>
                  <p style={{ color: "#a9bdd8", fontSize: 13, lineHeight: 1.55, margin: "0 0 16px", flex: 1 }}>{module.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#ffbd70", fontSize: 11, fontWeight: 700 }}>{module.status}</span>
                    {module.href ? <a href={module.href} style={{ color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Open →</a> : <span style={{ color: "#7187a5", fontSize: 11 }}>Not enabled</span>}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
        <footer style={{ color: "#7187a5", fontSize: 11, marginTop: 36, borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 16 }}>CSCSKB Online · Private administration area · Never share administrator credentials.</footer>
      </div>
    </main>
  );
}
