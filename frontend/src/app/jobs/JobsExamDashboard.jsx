"use client";

import { useMemo, useState } from "react";

const boards = {
  SSC: { exams: ["CGL", "CHSL", "MTS / Havaldar", "GD Constable", "CPO SI", "JE", "Stenographer", "Selection Post", "JHT"], url: "https://ssc.gov.in/" },
  UPPSC: { exams: ["Combined State / Upper Subordinate", "RO / ARO", "Assistant Professor", "Other UPPSC recruitment"], url: "https://uppsc.up.nic.in/" },
  UPSSSC: { exams: ["PET", " लेखपाल", "Junior Assistant", " अन्य भर्तियाँ"], url: "https://upsssc.gov.in/" },
  RRB: { exams: ["NTPC", "Group D", "ALP", "Technician", "JE"], url: "https://www.rrbapply.gov.in/" },
  "UP Police": { exams: ["Constable", "Sub Inspector", " अन्य भर्तियाँ"], url: "https://uppbpb.gov.in/" },
};

const shortcuts = [
  { title: "Latest Jobs", desc: "नई भर्ती और आवेदन की जानकारी", icon: "▤", id: "latest-jobs" },
  { title: "Admit Cards", desc: "परीक्षा प्रवेश पत्र", icon: "▣", id: "admit-cards" },
  { title: "Results", desc: "परीक्षा परिणाम और मेरिट", icon: "✓", id: "results" },
  { title: "Answer Keys", desc: "उत्तर कुंजी और आपत्ति", icon: "≡", id: "answer-keys" },
  { title: "Syllabus", desc: "पाठ्यक्रम और परीक्षा पैटर्न", icon: "▥", id: "syllabus" },
  { title: "Exam Calendar", desc: "आगामी परीक्षा कार्यक्रम", icon: "▦", id: "exam-calendar" },
];

const ink = "#14233f";
const muted = "#64748b";
const border = "#e2e8f0";
const card = { background: "#fff", border: "1px solid " + border, borderRadius: 16, padding: 18, minWidth: 0 };

export default function JobsExamDashboard() {
  const [board, setBoard] = useState("SSC");
  const [exam, setExam] = useState("CGL");
  const [section, setSection] = useState("latest-jobs");
  const [query, setQuery] = useState("");
  const selected = boards[board];
  const filtered = useMemo(() => shortcuts.filter(x => (x.title + " " + x.desc).toLowerCase().includes(query.toLowerCase())), [query]);

  function changeBoard(value) { setBoard(value); setExam(boards[value].exams[0]); }

  return (
    <main style={{ color: ink, background: "#f5f7fb", minHeight: "100vh", fontFamily: "Arial, 'Noto Sans Devanagari', sans-serif" }}>
      <div style={{ background: "linear-gradient(120deg,#102a56 0%,#174b91 58%,#2476bd 100%)", color: "#fff", padding: "clamp(24px,5vw,52px) clamp(18px,4vw,48px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 900, letterSpacing: ".04em" }}>CSC SKB <span style={{ opacity: .7, fontWeight: 500 }}>/ CAREER DESK</span></a>
            <span style={{ border: "1px solid #ffffff55", background: "#ffffff14", borderRadius: 30, padding: "7px 12px", fontSize: 12 }}>Jobs &amp; Exams Portal</span>
          </div>
          <div style={{ maxWidth: 760, paddingTop: 38 }}>
            <p style={{ margin: 0, color: "#b9d8ff", fontSize: 12, fontWeight: 800, letterSpacing: ".16em" }}>YOUR CAREER, ONE PLACE</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.08, margin: "12px 0", letterSpacing: "-.035em" }}>Find your next <span style={{ color: "#8ed5ff" }}>opportunity.</span></h1>
            <p style={{ color: "#e1edff", fontSize: 16, lineHeight: 1.7, margin: "0 0 22px" }}>सरकारी नौकरी, प्रतियोगी परीक्षाएँ और जरूरी परीक्षा अपडेट — साफ, सरल और एक ही जगह।</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="#latest-jobs" style={{ background: "#fff", color: "#16477f", borderRadius: 9, padding: "12px 17px", textDecoration: "none", fontWeight: 800 }}>भर्ती देखें ↓</a>
              <a href={selected.url} target="_blank" rel="noreferrer" style={{ border: "1px solid #ffffff80", color: "#fff", borderRadius: 9, padding: "12px 17px", textDecoration: "none", fontWeight: 750 }}>Official {board} website ↗</a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "22px clamp(14px,3vw,28px) 44px" }}>
        <section style={{ ...card, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 16, alignItems: "end", boxShadow: "0 8px 28px #14233f0a" }}>
          <div><label htmlFor="recruiting-board" style={{ display: "block", fontSize: 12, fontWeight: 800, color: muted, marginBottom: 8 }}>RECRUITING BOARD</label><select id="recruiting-board" value={board} onChange={e => changeBoard(e.target.value)} style={{ width: "100%", padding: 13, border: "1px solid " + border, borderRadius: 9, background: "#fff", color: ink }}>{Object.keys(boards).map(x => <option key={x}>{x}</option>)}</select></div>
          <div><label htmlFor="exam-choice" style={{ display: "block", fontSize: 12, fontWeight: 800, color: muted, marginBottom: 8 }}>EXAM / RECRUITMENT</label><select id="exam-choice" value={exam} onChange={e => setExam(e.target.value)} style={{ width: "100%", padding: 13, border: "1px solid " + border, borderRadius: 9, background: "#fff", color: ink }}>{selected.exams.map(x => <option key={x}>{x}</option>)}</select></div>
          <a href={selected.url} target="_blank" rel="noreferrer" style={{ textAlign: "center", padding: 13, borderRadius: 9, background: "#155eef", color: "#fff", textDecoration: "none", fontWeight: 800 }}>Official notification ↗</a>
        </section>

        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "30px 0 14px" }}>
          <div><p style={{ margin: 0, color: "#155eef", fontSize: 11, fontWeight: 900, letterSpacing: ".13em" }}>EXPLORE THE PORTAL</p><h2 style={{ margin: "5px 0 0", fontSize: 25 }}>What are you looking for?</h2></div>
          <input aria-label="Search portal sections" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs, results, syllabus…" style={{ width: "min(100%,330px)", padding: 12, border: "1px solid " + border, borderRadius: 9, background: "#fff", color: ink }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,175px),1fr))", gap: 12 }}>
          {filtered.map(item => <button key={item.id} onClick={() => { setSection(item.id); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ textAlign: "left", cursor: "pointer", ...card, transition: "transform .15s", borderColor: section === item.id ? "#8bb8ff" : border, boxShadow: section === item.id ? "0 0 0 2px #dceaff" : "none" }}>
            <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", background: "#edf4ff", color: "#155eef", borderRadius: 11, fontSize: 20, fontWeight: 900 }}>{item.icon}</span>
            <strong style={{ display: "block", marginTop: 13, fontSize: 15 }}>{item.title}</strong><span style={{ display: "block", marginTop: 5, color: muted, fontSize: 12, lineHeight: 1.5 }}>{item.desc}</span>
          </button>)}
        </div>

        <section id="latest-jobs" style={{ ...card, marginTop: 26, scrollMarginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
            <div><p style={{ margin: 0, color: "#155eef", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" }}>RECRUITMENT UPDATES</p><h2 style={{ margin: "6px 0", fontSize: 23 }}>Latest {board} Jobs</h2><p style={{ margin: 0, color: muted, fontSize: 13 }}>Selected exam: {exam}</p></div>
            <a href={selected.url} target="_blank" rel="noreferrer" style={{ color: "#155eef", textDecoration: "none", fontWeight: 800, fontSize: 13 }}>Visit official board ↗</a>
          </div>
          <div style={{ marginTop: 18, padding: 18, borderRadius: 12, background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
            <strong style={{ display: "block", fontSize: 15 }}>Live verified vacancy feed is not connected yet.</strong>
            <p style={{ color: muted, fontSize: 13, lineHeight: 1.7, margin: "7px 0 12px" }}>इसलिए यहाँ कोई अपुष्ट भर्ती, तारीख या vacancy count नहीं दिखाया जा रहा है। नवीनतम और सही आवेदन तिथियों के लिए संबंधित भर्ती बोर्ड की आधिकारिक सूचना देखें।</p>
            <a href={selected.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: "10px 13px", background: "#155eef", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 800, fontSize: 13 }}>Open {board} official website ↗</a>
          </div>
        </section>

        <section style={{ marginTop: 26 }}>
          <div style={{ marginBottom: 12 }}><p style={{ margin: 0, color: "#155eef", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" }}>EXAM RESOURCES</p><h2 style={{ margin: "6px 0", fontSize: 23 }}> परीक्षा से जुड़ी जानकारी</h2></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 12 }}>
            {shortcuts.slice(1).map(item => <article id={item.id} key={item.id} style={{ ...card, scrollMarginTop: 18 }}>
              <span style={{ color: "#155eef", fontSize: 21, fontWeight: 900 }}>{item.icon}</span><h3 style={{ margin: "10px 0 5px", fontSize: 16 }}>{item.title}</h3><p style={{ color: muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item.desc} के लिए आधिकारिक बोर्ड की सूचना देखें।</p>
              <a href={selected.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 13, color: "#155eef", fontWeight: 800, textDecoration: "none", fontSize: 13 }}>Official updates ↗</a>
            </article>)}
          </div>
        </section>

        <footer style={{ marginTop: 28, padding: "18px 2px", borderTop: "1px solid " + border, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: muted, fontSize: 12 }}>
          <span>CSC SKB Online · Jobs &amp; Exams</span><span>सूचनाओं की अंतिम पुष्टि संबंधित official notification से करें।</span>
        </footer>
      </div>
    </main>
  );
}
