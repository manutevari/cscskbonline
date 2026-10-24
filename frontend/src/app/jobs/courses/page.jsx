"use client";

import { useMemo, useState } from "react";

const categories = ["सभी कोर्स", "प्रतियोगी परीक्षाएँ", "डिजिटल स्किल्स", "प्रोफेशनल स्किल्स", "राज्य सेवाएँ", "सर्टिफिकेशन प्रोग्राम"];
const courses = [
  { title: "CSC Academy Courses", category: "सर्टिफिकेशन प्रोग्राम", description: "CSC Academy के आधिकारिक प्रशिक्षण और प्रमाणन कार्यक्रमों की जानकारी।", points: ["पात्रता कोर्स के अनुसार", "अवधि और प्रमाणपत्र की शर्तें जाँचें"] },
  { title: "Digital Seva Training", category: "डिजिटल स्किल्स", description: "डिजिटल सेवाओं से जुड़े प्रशिक्षण की आधिकारिक उपलब्धता और विवरण देखें।", points: ["प्रशिक्षण विवरण की पुष्टि करें", "पंजीकरण की शर्तें जाँचें"] },
  { title: "Computer & Digital Skills", category: "प्रोफेशनल स्किल्स", description: "कंप्यूटर और डिजिटल कौशल कार्यक्रमों के लिए आधिकारिक जानकारी देखें।", points: ["कोर्स उपलब्धता की पुष्टि करें", "शुल्क पहले जाँचें"] },
  { title: "Government Exam Preparation", category: "प्रतियोगी परीक्षाएँ", description: "प्रतियोगी परीक्षा तैयारी के लिए केवल सत्यापित कार्यक्रम यहाँ जोड़े जाएँगे।", points: ["सिलेबस और सामग्री की पुष्टि करें", "किसी भर्ती की गारंटी नहीं"] },
  { title: "State Service Training", category: "राज्य सेवाएँ", description: "राज्य-विशिष्ट सेवाओं या प्रशिक्षण कार्यक्रमों की जानकारी उपलब्ध होने पर यहाँ दिखेगी।", points: ["राज्य के अनुसार उपलब्धता", "आधिकारिक सूचना देखें"] },
  { title: "Professional Certification", category: "सर्टिफिकेशन प्रोग्राम", description: "प्रमाणन कार्यक्रमों की शर्तें, मूल्य और पंजीकरण लिंक सत्यापन के बाद प्रकाशित होंगे।", points: ["प्रमाणपत्र की शर्तें जाँचें", "प्रदाता की पुष्टि करें"] },
];

export default function CSCourseOffersPage() {
  const [category, setCategory] = useState("सभी कोर्स");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => courses.filter((course) =>
    (category === "सभी कोर्स" || course.category === category) &&
    (course.title + " " + course.description + " " + course.category).toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  const blue = "#0969da";
  const ink = "#101b35";
  const panel = { background: "#fff", border: "1px solid #dce4ef", borderRadius: 12, boxShadow: "0 2px 8px #14213d08" };

  return <main style={{ minHeight: "100vh", background: "#f4f7fc", color: ink, fontFamily: "Arial, 'Noto Sans Devanagari', sans-serif" }}>
    <header style={{ background: "#fff", borderBottom: "1px solid #dce4ef", padding: "12px clamp(12px, 2vw, 28px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
      <a href="/jobs-exams/jobs-dashboard" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: ink }}>
        <span style={{ fontSize: 34, fontWeight: 950, color: "#16449b", letterSpacing: -2 }}>CSC</span>
        <span><strong style={{ display: "block", fontSize: 19 }}>Jobs &amp; Exams Portal</strong><small style={{ color: "#64748b" }}>Your Guide to Government Opportunities</small></span>
      </a>
      <nav aria-label="Main navigation" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", fontSize: 13, fontWeight: 700 }}>
        {[["⌂ Home", "/jobs-exams/jobs-dashboard"], ["Latest Jobs", "/jobs-exams/jobs-dashboard#jobs-dashboard"], ["Results", "/jobs-exams/jobs-dashboard#jobs-dashboard"], ["Admit Card", "/jobs-exams/jobs-dashboard#jobs-dashboard"], ["Answer Key", "/jobs-exams/jobs-dashboard#jobs-dashboard"], ["Syllabus", "/jobs-exams/jobs-dashboard#jobs-dashboard"], ["▦ Courses", "/jobs/courses"]].map(([label, href]) => <a key={label} href={href} style={{ padding: "9px 10px", borderRadius: 7, color: href === "/jobs/courses" ? blue : "#27364d", background: href === "/jobs/courses" ? "#edf4ff" : "transparent", textDecoration: "none" }}>{label}</a>)}
      </nav>
      <form onSubmit={(e) => { e.preventDefault(); document.getElementById("course-catalog")?.scrollIntoView({ behavior: "smooth" }); }} style={{ display: "flex", gap: 6 }}>
        <input aria-label="पोर्टल खोजें" placeholder="Search courses..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: "min(260px, 65vw)", padding: 11, border: "1px solid #cbd5e1", borderRadius: 8 }} />
        <button aria-label="खोजें" type="submit" style={{ border: 0, background: blue, color: "#fff", padding: "0 15px", borderRadius: 8, fontWeight: 800 }}>⌕</button>
      </form>
    </header>

    <div style={{ background: "#bd1019", color: "#fff", padding: "11px 20px", fontSize: 13, fontWeight: 700 }}>
      <span style={{ marginRight: 18 }}>📢 CSC COURSE UPDATES</span>
      <span style={{ fontWeight: 500 }}>केवल आधिकारिक रूप से सत्यापित कोर्स, शुल्क और पंजीकरण लिंक प्रकाशित किए जाएँगे।</span>
    </div>

    <section aria-label="Portal shortcuts" style={{ margin: "16px clamp(12px, 2vw, 28px)", ...panel, padding: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      {[["📍 राज्य", "राज्य-विशिष्ट कोर्स"], ["▦ संगठन", "CSC Academy / आधिकारिक प्रदाता"], ["☷ कोर्स प्रकार", "सभी श्रेणियाँ"], ["▣ वर्ष", "वर्तमान उपलब्धता"]].map(([label, value]) => <div key={label} style={{ flex: "1 1 165px", minWidth: 0, border: "1px solid #dbe4f0", borderRadius: 8, padding: 11, background: "#fbfdff" }}><small style={{ color: "#64748b" }}>{label}</small><div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{value}</div></div>)}
      <button type="button" onClick={() => { setCategory("सभी कोर्स"); setQuery(""); document.getElementById("course-catalog")?.scrollIntoView({ behavior: "smooth" }); }} style={{ background: blue, color: "#fff", border: 0, borderRadius: 8, padding: "12px 24px", fontWeight: 800, cursor: "pointer" }}>कोर्स खोजें</button>
    </section>

    <div style={{ display: "grid", gridTemplateColumns: "minmax(170px, 290px) minmax(0, 1fr)", gap: 18, margin: "0 clamp(12px, 2vw, 28px) 24px", alignItems: "start" }}>
      <aside style={{ display: "grid", gap: 8 }}>
        {[["▣", "Results", "/jobs-exams/jobs-dashboard#jobs-dashboard", "#e94eae"], ["▣", "Admit Card", "/jobs-exams/jobs-dashboard#jobs-dashboard", "#3287e8"], ["↗", "Answer Key", "/jobs-exams/jobs-dashboard#jobs-dashboard", "#13b88a"], ["✓", "Eligibility Check", "/jobs-exams/jobs-dashboard#jobs-dashboard", "#f28b21"]].map(([icon, label, href, color]) => <a key={label} href={href} style={{ ...panel, padding: 13, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: ink, fontWeight: 800 }}><span style={{ background: color, color: "#fff", width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 9 }}>{icon}</span>{label}<span style={{ marginLeft: "auto" }}>›</span></a>)}
        <a href="#course-catalog" style={{ display: "block", border: "1px solid #f0c85a", borderRadius: 10, padding: 16, background: "#fff8dc", textDecoration: "none", color: ink }}><div style={{ fontSize: 25 }}>🎓</div><strong>Recommended Courses</strong><p style={{ fontSize: 12, lineHeight: 1.5, margin: "6px 0" }}>CSC Courses की सत्यापित जानकारी देखें</p><span style={{ fontWeight: 800 }}>कोर्स देखें ›</span></a>
      </aside>

      <div style={{ minWidth: 0 }}>
        <section style={{ ...panel, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", background: "linear-gradient(90deg,#eaf3ff,#f4f9ff)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div><h2 style={{ margin: 0, fontSize: 24 }}>CSC Courses</h2><p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>Learn | Prepare | Upgrade Your Skills</p></div>
            <div style={{ display: "flex", gap: 15, flexWrap: "wrap", fontSize: 12, fontWeight: 750 }}><span>✓ आधिकारिक जानकारी</span><span>◉ शुल्क सत्यापन</span><span>♧ करियर कौशल</span></div>
          </div>
          <div style={{ margin: 14, padding: "18px clamp(16px, 3vw, 30px)", borderRadius: 10, color: "#fff", background: "linear-gradient(110deg,#193fa7 0%,#5146bd 58%,#f3b93b 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <div><h1 style={{ margin: 0, fontSize: "clamp(24px, 3vw, 34px)" }}>CSC Course Information</h1><p style={{ margin: "8px 0 0", lineHeight: 1.5 }}>अपने लक्ष्य के लिए सही प्रशिक्षण खोजें—बिना अपुष्ट ऑफ़र के।</p></div>
            <div style={{ background: "#fff", color: ink, borderRadius: 9, padding: 13, maxWidth: 300 }}><strong style={{ color: "#9a3412" }}>कीमत और ऑफ़र</strong><div style={{ fontSize: 14, fontWeight: 800, marginTop: 5 }}>आधिकारिक पुष्टि के बाद</div><small style={{ color: "#64748b" }}>₹500/वर्ष जैसी कीमतें बिना सत्यापन नहीं दिखाई जाएँगी।</small></div>
          </div>
        </section>

        <section id="course-catalog" style={{ ...panel, marginTop: 14, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><h2 style={{ margin: 0, fontSize: 21 }}>Course Catalogue</h2><p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 12 }}>कोर्स, कीमत और खरीद लिंक सत्यापन के बाद ही सक्रिय होंगे।</p></div><input aria-label="कोर्स खोजें" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." style={{ padding: 11, border: "1px solid #cbd5e1", borderRadius: 8, width: "min(240px, 100%)", boxSizing: "border-box" }} /></div>
          <div aria-label="कोर्स श्रेणियाँ" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "16px 0 8px" }}>{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} style={{ whiteSpace: "nowrap", border: "1px solid " + (category === item ? blue : "#dbe4f0"), background: category === item ? blue : "#f7f9fc", color: category === item ? "#fff" : "#26364d", borderRadius: 24, padding: "9px 14px", fontWeight: 750, cursor: "pointer" }}>{item}</button>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 245px), 1fr))", gap: 12, marginTop: 10 }}>
            {visible.map((course, i) => <article key={course.title} style={{ border: "1px solid #e0e7f1", borderRadius: 11, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0, background: "#fff" }}>
              <div style={{ minHeight: 92, display: "grid", placeItems: "center", background: ["#eaf2ff", "#e4f8f0", "#fff1df", "#f4eaff", "#e8f6fb", "#fdf0f2"][i % 6], fontSize: 38 }}>{["🎓", "💻", "🧩", "📘", "🗂️", "🏅"][i % 6]}</div>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <span style={{ alignSelf: "start", borderRadius: 5, padding: "5px 8px", background: "#edf4ff", color: "#1746a2", fontSize: 10, fontWeight: 850 }}>{course.category}</span>
                <h3 style={{ margin: 0, fontSize: 16, lineHeight: 1.35 }}>{course.title}</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#5f6d80", lineHeight: 1.6 }}>{course.description}</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "#425166", lineHeight: 1.8 }}>{course.points.map((point) => <li key={point}>{point}</li>)}</ul>
                <div style={{ marginTop: "auto", borderTop: "1px solid #edf0f5", paddingTop: 10 }}><div style={{ fontSize: 12, fontWeight: 800, color: "#9a3412" }}>शुल्क: आधिकारिक पुष्टि आवश्यक</div><button type="button" disabled title="आधिकारिक कोर्स, शुल्क और पंजीकरण लिंक सत्यापित होने के बाद उपलब्ध होगा" style={{ width: "100%", marginTop: 9, border: 0, borderRadius: 7, padding: 10, background: "#dbe3ed", color: "#596579", fontWeight: 800, cursor: "not-allowed" }}>पंजीकरण लिंक पुष्टि के बाद</button></div>
              </div>
            </article>)}
          </div>
          {!visible.length && <p role="status" style={{ padding: 18, color: "#64748b" }}>इस खोज से कोई कोर्स नहीं मिला।</p>}
        </section>
        <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6, padding: "4px 2px" }}>नोट: यह कोर्स UI लेआउट है। लाइव CSC course feed, सत्यापित मूल्य और payment integration अभी जुड़ा नहीं है। पंजीकरण/भुगतान लिंक आधिकारिक पुष्टि से पहले सक्रिय नहीं होंगे।</p>
      </div>
    </div>
    <style jsx>{`
      @media (max-width: 760px) {
        header { align-items: flex-start !important; }
        header nav { width: 100%; overflow-x: auto; flex-wrap: nowrap !important; }
        main > div[style*="grid-template-columns"] { grid-template-columns: minmax(0, 1fr) !important; }
        aside { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        aside a { min-width: 0; }
      }
      @media (max-width: 430px) {
        aside { grid-template-columns: minmax(0, 1fr) !important; }
      }
    `}</style>
  </main>;
}
