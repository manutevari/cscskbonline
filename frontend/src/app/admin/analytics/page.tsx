"use client";

import { useCallback, useEffect, useState } from "react";

type Dashboard = {
  configured: boolean;
  propertyId?: string;
  rangeDays?: number;
  generatedAt?: string;
  error?: string;
  summary?: { activeUsers: number; newUsers: number; sessions: number; pageViews: number; eventCount: number; engagementSeconds: number };
  daily?: { date: string; activeUsers: number; sessions: number; pageViews: number }[];
  channels?: { channel: string; sessions: number; newUsers: number }[];
  pages?: { title: string; views: number; users: number }[];
  events?: { name: string; count: number }[];
};
const panel: React.CSSProperties = { background: "#fff", border: "1px solid #e4e8ef", borderRadius: 18, padding: 18, boxShadow: "0 5px 20px rgba(20,40,80,.04)" };
const muted: React.CSSProperties = { color: "#68758a", fontSize: 13 };
const number = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n || 0));
const dateLabel = (date: string) => date.length === 8 ? new Date(Number(date.slice(0,4)), Number(date.slice(4,6))-1, Number(date.slice(6,8))).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : date;
export default function AdminAnalyticsPage() {
  const [token, setToken] = useState("");
  const [range, setRange] = useState("7");
  const [data, setData] = useState<Dashboard | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (auth: string, days: string) => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/analytics?range=" + days, { headers: { Authorization: "Bearer " + auth }, cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not load GA4 data.");
      setData(json);
    } catch (e) { setError(e instanceof Error ? e.message : "Analytics request failed."); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { const saved = sessionStorage.getItem("cscskb_marketing_token"); if (saved) { setToken(saved); void load(saved, range); } }, [load, range]);
  const maxSessions = Math.max(1, ...(data?.daily || []).map(d => d.sessions));
  const maxChannel = Math.max(1, ...(data?.channels || []).map(c => c.sessions));
  const connect = () => { sessionStorage.setItem("cscskb_marketing_token", token); void load(token, range); };
  return <main style={{ minHeight: "100vh", background: "#f5f7fb", color: "#182338", padding: "26px clamp(14px,3vw,34px) 56px", fontFamily: "var(--font-outfit),Arial,sans-serif" }}>
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
        <div><div style={{ color: "#1765c1", fontWeight: 800, fontSize: 12, letterSpacing: ".12em" }}>CSCSKB ONLINE · ADMIN</div><h1 style={{ fontSize: "clamp(26px,4vw,38px)", margin: "5px 0" }}>Business Analytics</h1><p style={{ ...muted, margin: 0 }}>Google Analytics 4 · acquisition, engagement and content performance</p></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select aria-label="Date range" value={range} onChange={e => setRange(e.target.value)} style={{ padding: "10px 12px", border: "1px solid #d7deea", borderRadius: 10, background: "#fff", color: "#182338" }}><option value="7">Last 7 days</option><option value="28">Last 28 days</option><option value="90">Last 90 days</option></select>
          <button onClick={() => token && void load(token, range)} disabled={!token || busy} style={{ border: 0, borderRadius: 10, padding: "10px 14px", background: "#1765c1", color: "#fff", fontWeight: 700, opacity: busy ? .6 : 1 }}>{busy ? "Refreshing…" : "Refresh"}</button>
        </div>
      </header>
      {!token && <section style={{ ...panel, maxWidth: 520, margin: "42px auto" }}><h2 style={{ marginTop: 0 }}>Admin sign-in</h2><p style={muted}>Use your existing CSCSKB Owner/Admin marketing token. The token remains in this browser tab session.</p><input type="password" value={token} onChange={e => setToken(e.target.value)} onKeyDown={e => e.key === "Enter" && connect()} placeholder="Owner/Admin token" style={{ width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #d7deea", borderRadius: 10 }} /><button onClick={connect} disabled={!token || busy} style={{ marginTop: 10, border: 0, borderRadius: 10, padding: "11px 16px", background: "#1765c1", color: "#fff", fontWeight: 700 }}>Connect analytics</button></section>}
      {error && <div role="alert" style={{ ...panel, borderColor: "#f0c3c0", color: "#a52d27", marginBottom: 16 }}>{error}</div>}
      {data?.configured && data.summary && <>
        <div style={{ ...muted, marginBottom: 12 }}>Property {data.propertyId} · Data through yesterday · Updated {data.generatedAt ? new Date(data.generatedAt).toLocaleString("en-IN") : "—"}</div>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 12, marginBottom: 14 }}>
          {([{ label: "Active users", value: data.summary.activeUsers }, { label: "New users", value: data.summary.newUsers }, { label: "Sessions", value: data.summary.sessions }, { label: "Page views", value: data.summary.pageViews }, { label: "Events", value: data.summary.eventCount }, { label: "Avg. engagement", value: data.summary.activeUsers ? data.summary.engagementSeconds / data.summary.activeUsers : 0, duration: true }] as const).map(item => <article key={item.label} style={panel}><div style={muted}>{item.label}</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 7 }}>{item.duration ? Math.floor(item.value/60) + "m " + Math.round(item.value%60) + "s" : number(item.value)}</div></article>)}
        </section>
        <section style={{ ...panel, marginBottom: 14 }}><h2 style={{ margin: "0 0 16px", fontSize: 19 }}>Daily traffic trend</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 9, alignItems: "end", minHeight: 190 }}>{(data.daily || []).map(d => <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}><strong style={{ fontSize: 12 }}>{d.sessions}</strong><div title={d.sessions + " sessions"} style={{ width: "min(100%,48px)", height: Math.max(5, d.sessions/maxSessions*132), background: "#2875d0", borderRadius: "7px 7px 2px 2px" }} /><span style={{ ...muted, fontSize: 10 }}>{dateLabel(d.date)}</span></div>)}</div></section>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginBottom: 14 }}>
          <article style={panel}><h2 style={{ margin: "0 0 12px", fontSize: 19 }}>Sessions by channel</h2>{(data.channels || []).map(c => <div key={c.channel} style={{ margin: "12px 0" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}><span>{c.channel || "(not set)"}</span><strong>{number(c.sessions)}</strong></div><div style={{ height: 7, background: "#edf0f5", borderRadius: 9, marginTop: 6 }}><div style={{ width: (c.sessions/maxChannel*100)+"%", height: 7, background: "#2875d0", borderRadius: 9 }} /></div><div style={muted}>{number(c.newUsers)} new users</div></div>)}</article>
          <article style={panel}><h2 style={{ margin: "0 0 12px", fontSize: 19 }}>Top pages</h2>{(data.pages || []).map((p,i) => <div key={p.title+i} style={{ padding: "10px 0", borderBottom: "1px solid #edf0f5" }}><div style={{ fontSize: 13, fontWeight: 650 }}>{p.title || "(not set)"}</div><div style={muted}>{number(p.views)} views · {number(p.users)} users</div></div>)}</article>
        </section>
        <section style={panel}><h2 style={{ margin: "0 0 12px", fontSize: 19 }}>Event counts</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 10 }}>{(data.events || []).map(e => <div key={e.name} style={{ background: "#f5f8fc", borderRadius: 11, padding: 12 }}><div style={{ ...muted, overflowWrap: "anywhere" }}>{e.name}</div><strong style={{ fontSize: 22 }}>{number(e.count)}</strong></div>)}</div></section>
      </>}
      {data && !data.configured && <section style={panel}><h2>GA4 connection required</h2><p>{data.error}</p></section>}
      {!data && !error && token && <section style={panel}>{busy ? "Loading GA4 reports…" : "Connect to load your analytics."}</section>}
      <footer style={{ ...muted, marginTop: 24 }}>Private admin report · Read-only GA4 Data API · No production content, settings or customer records are modified.</footer>
    </div>
  </main>;
}
