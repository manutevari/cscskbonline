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
          <section id="csc-courses-preview" style={{ marginTop: 20, border: "1px solid #dbe4f0", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
            <div style={{ padding: "18px clamp(14px, 2vw, 24px)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: "#f8fbff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 34 }}>🎓</span><div><h2 style={{ margin: 0, color: "#16449b", fontSize: 24 }}>CSC Courses</h2><p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Learn | Prepare | Upgrade Your Skills</p></div></div>
              <a href="/jobs/courses" style={{ background: "#0969da", color: "#fff", textDecoration: "none", padding: "11px 16px", borderRadius: 8, fontWeight: 800, fontSize: 13 }}>Explore Courses →</a>
            </div>
            <div style={{ margin: 14, padding: "20px clamp(14px, 3vw, 28px)", borderRadius: 10, color: "#fff", background: "linear-gradient(110deg,#193fa7 0%,#5146bd 65%,#e9b83c 100%)" }}>
              <h3 style={{ margin: 0, fontSize: "clamp(21px, 3vw, 30px)" }}>Find the right course for your next step</h3>
              <p style={{ margin: "7px 0 0", lineHeight: 1.6 }}>Explore course categories, details and official provider information.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 12, padding: 14 }}>
              {[
                ["📘", "Competitive Exams", "Exam-preparation programs"],
                ["💻", "Digital Skills", "Computer and digital training"],
                ["🧰", "Professional Skills", "Job-related skills"],
                ["🏅", "Certification Programs", "Provider and certificate details"]
              ].map(([icon, title, description]) => <a key={title} href="/jobs/courses" style={{ border: "1px solid #e0e7f1", borderRadius: 10, padding: 15, textDecoration: "none", color: "#14213d", background: "#fff" }}><span style={{ fontSize: 28 }}>{icon}</span><strong style={{ display: "block", marginTop: 8 }}>{title}</strong><span style={{ display: "block", marginTop: 5, color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>{description}</span><span style={{ display: "block", marginTop: 12, color: "#0969da", fontSize: 12, fontWeight: 800 }}>View courses →</span></a>)}
            </div>
            <p style={{ margin: 0, padding: "0 16px 16px", color: "#64748b", fontSize: 11, lineHeight: 1.5 }}>कोर्स की कीमत, ऑफ़र और पंजीकरण लिंक आधिकारिक पुष्टि के बाद ही सक्रिय किए जाएँगे।</p>
          </section>
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
