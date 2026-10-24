"use client";

import { useState } from "react";

const categories = ["सभी कोर्स", "प्रतियोगी परीक्षाएँ", "डिजिटल स्किल्स", "प्रोफेशनल स्किल्स", "सर्टिफिकेशन"];
const courseCards = [
  { title: "Government Exam Preparation", category: "प्रतियोगी परीक्षाएँ", description: "सरकारी भर्ती और परीक्षाओं की तैयारी के लिए अध्ययन सामग्री।", status: "आधिकारिक सूची की पुष्टि आवश्यक" },
  { title: "Digital Skills", category: "डिजिटल स्किल्स", description: "डिजिटल सेवाओं और कंप्यूटर कौशल से जुड़े प्रशिक्षण।", status: "आधिकारिक सूची की पुष्टि आवश्यक" },
  { title: "Computer Basics", category: "प्रोफेशनल स्किल्स", description: "कंप्यूटर और डिजिटल कार्यों की बुनियादी जानकारी।", status: "आधिकारिक सूची की पुष्टि आवश्यक" },
  { title: "Certification Programs", category: "सर्टिफिकेशन", description: "प्रमाणपत्र देने वाले कार्यक्रम—शर्तें कोर्स के अनुसार होंगी।", status: "आधिकारिक सूची की पुष्टि आवश्यक" },
];

export default function CSCourseOffersPage() {
  const [category, setCategory] = useState("सभी कोर्स");
  const [query, setQuery] = useState("");
  const visible = courseCards.filter((course) =>
    (category === "सभी कोर्स" || course.category === category) &&
    (course.title + " " + course.description).toLowerCase().includes(query.toLowerCase())
  );

  return <main style={{ minHeight: "100vh", background: "#f4f7fc", color: "#14213d", padding: "24px clamp(14px, 3vw, 36px)", fontFamily: "Arial, sans-serif" }}>
    <div style={{ maxWidth: 1240, margin: "0 auto" }}>
      <a href="/jobs-exams/jobs-dashboard" style={{ display: "inline-block", color: "#1746a2", textDecoration: "none", fontWeight: 700, marginBottom: 18 }}>← Jobs &amp; Exams Portal पर वापस जाएँ</a>
      <header style={{ background: "#fff", border: "1px solid #dce5f2", borderRadius: 18, padding: "22px clamp(16px, 3vw, 32px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ background: "#155eef", color: "#fff", borderRadius: 14, padding: 14, fontSize: 22, fontWeight: 900 }}>CSC</span>
          <div><h1 style={{ margin: 0, fontSize: "clamp(23px, 3vw, 34px)" }}>CSC Courses</h1><p style={{ margin: "6px 0 0", color: "#64748b" }}>सीखें · कौशल बढ़ाएँ · आगे बढ़ें</p></div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, fontWeight: 700 }}><span>✓ आधिकारिक जानकारी</span><span>✓ स्पष्ट शुल्क</span><span>✓ सुरक्षित पंजीकरण</span></div>
      </header>

      <section style={{ marginTop: 18, borderRadius: 18, padding: "clamp(22px, 4vw, 42px)", color: "#fff", background: "linear-gradient(115deg, #1746a2, #5b4bc4)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", alignItems: "center", gap: 24 }}>
        <div><span style={{ display: "inline-block", background: "rgba(255,255,255,.16)", padding: "7px 11px", borderRadius: 30, fontSize: 12, fontWeight: 800 }}>CSC LEARNING</span><h2 style={{ fontSize: "clamp(27px, 4vw, 42px)", lineHeight: 1.12, margin: "16px 0 12px" }}>अपने अगले लक्ष्य के लिए सही कोर्स चुनें</h2><p style={{ maxWidth: 600, lineHeight: 1.7, margin: 0, color: "#eef2ff" }}>कोर्स की जानकारी, पात्रता, अवधि और वास्तविक शुल्क को आधिकारिक स्रोत से सत्यापित करके ही प्रकाशित किया जाएगा।</p></div>
        <aside style={{ background: "#fff", color: "#14213d", borderRadius: 16, padding: 22, maxWidth: 420, justifySelf: "end", width: "100%", boxSizing: "border-box" }}><p style={{ margin: 0, fontWeight: 800, color: "#b45309" }}>ऑफर और छूट</p><h3 style={{ fontSize: 23, margin: "9px 0" }}>सत्यापित ऑफर जल्द</h3><p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>₹500/वर्ष जैसी कीमतें तब तक प्रकाशित नहीं होंगी, जब तक CSC के आधिकारिक स्रोत से उनकी पुष्टि न हो जाए।</p></aside>
      </section>

      <section style={{ marginTop: 22, background: "#fff", border: "1px solid #dce5f2", borderRadius: 16, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><h2 style={{ margin: 0, fontSize: 23 }}>कोर्स कैटलॉग</h2><p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>केवल आधिकारिक रूप से सत्यापित CSC offerings प्रकाशित करें।</p></div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="कोर्स खोजें…" aria-label="कोर्स खोजें" style={{ padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, minWidth: 220, maxWidth: "100%", boxSizing: "border-box" }} /></div>
        <nav aria-label="कोर्स श्रेणियाँ" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "18px 0 8px" }}>{categories.map((item) => <button key={item} onClick={() => setCategory(item)} style={{ whiteSpace: "nowrap", border: "1px solid " + (category === item ? "#155eef" : "#dbe4f0"), background: category === item ? "#155eef" : "#fff", color: category === item ? "#fff" : "#334155", borderRadius: 30, padding: "10px 15px", fontWeight: 700, cursor: "pointer" }}>{item}</button>)}</nav>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 245px), 1fr))", gap: 14, marginTop: 12 }}>{visible.map((course) => <article key={course.title} style={{ border: "1px solid #dce5f2", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 12, minHeight: 220 }}><span style={{ alignSelf: "start", background: "#eaf2ff", color: "#1746a2", padding: "6px 9px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>{course.category}</span><h3 style={{ margin: 0, fontSize: 18 }}>{course.title}</h3><p style={{ margin: 0, color: "#64748b", fontSize: 13, lineHeight: 1.65, flex: 1 }}>{course.description}</p><div style={{ padding: 10, background: "#fff7ed", color: "#9a3412", borderRadius: 8, fontSize: 12, lineHeight: 1.5 }}>{course.status}</div><button type="button" disabled title="आधिकारिक course और payment link सत्यापित होने के बाद उपलब्ध होगा" style={{ border: 0, borderRadius: 9, padding: 11, background: "#cbd5e1", color: "#475569", fontWeight: 800, cursor: "not-allowed" }}>खरीद विकल्प पुष्टि के बाद</button></article>)}</div>
        {!visible.length && <p role="status" style={{ padding: 18, color: "#64748b" }}>इस खोज से कोई कोर्स नहीं मिला।</p>}
      </section>
      <footer style={{ marginTop: 18, padding: 14, color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>यह प्रारंभिक UI है। इसमें अभी लाइव CSC course feed, आधिकारिक कीमतें, discount verification या payment integration जुड़ा नहीं है। कोई काल्पनिक ऑफर बिक्री के लिए प्रदर्शित नहीं किया जा रहा।</footer>
    </div>
  </main>;
}
