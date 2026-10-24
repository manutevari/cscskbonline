"use client";

import { useState } from "react";
import JobsExamDashboard from "../../jobs/JobsExamDashboard";

const items = [
  { key: "jobs", label: "Latest Jobs" },
  { key: "documents", label: "Documents & Eligibility" },
  { key: "forms", label: "Government Forms" },
  { key: "courses", label: "CSC Courses" },
];

export default function JobsDashboardPage() {
  const [active, setActive] = useState(null);

  function choose(key) {
    if (key === "courses") {
      window.location.href = "/jobs/courses";
      return;
    }
    setActive(key);
  }

  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: "16px clamp(12px, 2vw, 24px)", color: "#14213d", fontFamily: "Arial, sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
          <strong style={{ color: "#16449b", fontSize: 32, letterSpacing: -2 }}>CSC</strong>
          <div><strong style={{ display: "block", fontSize: 19 }}>Jobs &amp; Exams Portal</strong><small style={{ color: "#64748b" }}>Your Guide to Government Opportunities</small></div>
        </div>
      </header>

      <section aria-label="Quick navigation" style={{ border: "1px solid #dbe4f0", borderRadius: 12, padding: 16, background: "#f8fbff", marginBottom: 18 }}>
        <strong style={{ display: "block", fontSize: 15, marginBottom: 6 }}>Quick Navigation</strong>
        <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: 13 }}>जिस सेक्शन को देखना है, उस पर क्लिक करें। क्लिक करने से पहले उसका डेटा छिपा रहेगा।</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 9 }}>
          {items.map((item) => (
            <button key={item.key} type="button" onClick={() => choose(item.key)} aria-pressed={active === item.key} style={{ textAlign: "left", padding: "13px 14px", borderRadius: 9, border: "1px solid " + (active === item.key ? "#0969da" : "#dbe4f0"), background: active === item.key ? "#eaf2ff" : "#fff", color: "#14213d", fontWeight: 750, cursor: "pointer" }}>
              {item.label}<span style={{ float: "right", color: "#0969da" }}>›</span>
            </button>
          ))}
        </div>
      </section>

      {active === null ? (
        <div role="status" style={{ padding: "34px 18px", textAlign: "center", border: "1px solid #dbe4f0", borderRadius: 12, background: "#fff" }}>
          <strong style={{ fontSize: 17 }}>कोई सेक्शन खुला नहीं है</strong>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 0 }}>डेटा देखने के लिए ऊपर किसी विकल्प पर क्लिक करें।</p>
        </div>
      ) : (
        <section aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 17 }}>{items.find((item) => item.key === active)?.label}</strong>
            <button type="button" onClick={() => setActive(null)} style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", color: "#334155", cursor: "pointer" }}>Close section ×</button>
          </div>
          <JobsExamDashboard />
        </section>
      )}
    </main>
  );
}
