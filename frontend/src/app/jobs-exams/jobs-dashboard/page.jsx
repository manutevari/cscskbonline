"use client";

import JobsExamDashboard from "../../jobs/JobsExamDashboard";

const navItems = [
  { href: "#jobs-dashboard", label: "Latest Jobs" },
  { href: "#jobs-dashboard", label: "Documents & Eligibility" },
  { href: "#government-forms", label: "Government Forms" },
  { href: "/jobs/courses", label: "CSC Courses" },
];

export default function JobsDashboardPage() {
  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: "12px clamp(10px, 2vw, 24px)", color: "#14213d" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(160px, 210px) minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
        <aside aria-label="Page navigation" style={{ position: "sticky", top: 12, alignSelf: "start", background: "#fff", border: "1px solid #dbe4f0", borderRadius: 14, padding: 12, boxShadow: "0 4px 18px #14213d0a" }}>
          <strong style={{ display: "block", fontSize: 13, margin: "4px 6px 10px" }}>Quick navigation</strong>
          <nav style={{ display: "grid", gap: 6 }}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href} style={{ display: "block", padding: "10px 9px", borderRadius: 8, textDecoration: "none", color: "#1746a2", background: "#f3f7ff", fontSize: 12, fontWeight: 750 }}>
                {item.label}
              </a>
            ))}
          </nav>
          <p style={{ margin: "12px 6px 4px", color: "#64748b", fontSize: 11, lineHeight: 1.5 }}>Scroll the page to view more sections and documents.</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ width: "100%", marginTop: 8, padding: 9, borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#1746a2", fontWeight: 750, cursor: "pointer" }}>↑ Back to top</button>
        </aside>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "none" }} aria-hidden="true" />
          <JobsExamDashboard />
        </div>
      </div>
      <nav aria-label="Mobile quick navigation" style={{ display: "none" }}>
        {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <style jsx>{`
        @media (max-width: 760px) {
          main > div { grid-template-columns: minmax(0, 1fr) !important; }
          aside[aria-label="Page navigation"] { position: relative !important; top: auto !important; }
          aside[aria-label="Page navigation"] nav { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </main>
  );
}
