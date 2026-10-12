"use client";

import { useMemo, useState } from "react";

const jobs = [
  { id: 1, title: "SSC भर्ती और परीक्षा अपडेट", category: "केंद्र सरकार", qualification: "10वीं / 12वीं / स्नातक", minAge: 18, maxAge: 30, url: "https://ssc.gov.in/" },
  { id: 2, title: "UPPSC भर्ती अपडेट", category: "उत्तर प्रदेश", qualification: "स्नातक (पद के अनुसार)", minAge: 21, maxAge: 40, url: "https://uppsc.up.nic.in/" },
  { id: 3, title: "UPSSSC भर्ती अपडेट", category: "उत्तर प्रदेश", qualification: "10वीं / 12वीं / स्नातक (पद के अनुसार)", minAge: 18, maxAge: 40, url: "https://upsssc.gov.in/" },
  { id: 4, title: "Railway Recruitment Board अपडेट", category: "केंद्र सरकार", qualification: "10वीं / ITI / 12वीं / स्नातक", minAge: 18, maxAge: 33, url: "https://www.rrbapply.gov.in/" },
  { id: 5, title: "UP Police भर्ती अपडेट", category: "उत्तर प्रदेश", qualification: "12वीं / पद के अनुसार", minAge: 18, maxAge: 25, url: "https://uppbpb.gov.in/" },
];

export default function JobsPage() {
  const [qualification, setQualification] = useState("All");
  const [age, setAge] = useState("All");
  const [category, setCategory] = useState("All");
  const filtered = useMemo(() => jobs.filter((job) => {
    const qMatch = qualification === "All" || job.qualification.toLowerCase().includes(qualification.toLowerCase());
    const aMatch = age === "All" || (age === "18-25" ? job.maxAge >= 18 && job.minAge <= 25 : age === "26-35" ? job.maxAge >= 26 && job.minAge <= 35 : job.maxAge >= 36);
    const cMatch = category === "All" || job.category === category;
    return qMatch && aMatch && cMatch;
  }), [qualification, age, category]);

  return (
    <main className="jobs-shell">
      <header className="jobs-header">
        <a className="jobs-home" href="/">← CSC Shikohabad Home</a>
        <span className="jobs-badge">JOBS • EXAMS • RESULTS</span>
        <h1>Jobs &amp; Exams Portal</h1>
        <p>सरकारी नौकरी, भर्ती, परीक्षा और रिज़ल्ट के लिए आधिकारिक वेबसाइटों के लिंक एक जगह।</p>
      </header>
      <section className="jobs-notice">
        <strong>महत्वपूर्ण:</strong> यह पोर्टल आधिकारिक भर्ती वेबसाइटों तक पहुँच देता है। आवेदन की अंतिम तारीख, आयु सीमा और पात्रता हर भर्ती की आधिकारिक अधिसूचना से सत्यापित करें। अभी स्वचालित live job-feed या result-feed सक्रिय होने का दावा नहीं है।
      </section>
      <section className="jobs-filters" aria-label="भर्ती फ़िल्टर">
        <label>योग्यता
          <select value={qualification} onChange={(e) => setQualification(e.target.value)}>
            <option value="All">सभी योग्यताएँ</option><option value="10वीं">10वीं</option><option value="12वीं">12वीं</option><option value="स्नातक">स्नातक</option><option value="ITI">ITI</option>
          </select>
        </label>
        <label>आयु सीमा
          <select value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="All">सभी आयु</option><option value="18-25">18–25 वर्ष</option><option value="26-35">26–35 वर्ष</option><option value="36+">36 वर्ष या अधिक</option>
          </select>
        </label>
        <label>भर्ती श्रेणी
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">सभी श्रेणियाँ</option><option value="केंद्र सरकार">केंद्र सरकार</option><option value="उत्तर प्रदेश">उत्तर प्रदेश</option>
          </select>
        </label>
      </section>
      <section className="jobs-grid">
        {filtered.map((job) => <article className="jobs-card" key={job.id}>
          <div className="jobs-card-top"><span>{job.category}</span><span className="jobs-status">आधिकारिक अपडेट देखें</span></div>
          <h2>{job.title}</h2>
          <p><b>योग्यता:</b> {job.qualification}</p>
          <p><b>आयु संकेत:</b> लगभग {job.minAge}–{job.maxAge} वर्ष; वास्तविक सीमा, छूट और पात्रता notification के अनुसार अलग हो सकती है।</p>
          <p><b>आवेदन की तारीख:</b> आधिकारिक अधिसूचना में जाँचें।</p>
          <a className="jobs-apply" href={job.url} target="_blank" rel="noreferrer">आधिकारिक वेबसाइट खोलें ↗</a>
        </article>)}
        {filtered.length === 0 && <p className="jobs-empty">इन फ़िल्टरों से कोई लिंक नहीं मिला। फ़िल्टर बदलकर देखें।</p>}
      </section>
      <section className="jobs-help">
        <h2>फॉर्म भरने से पहले</h2>
        <ol><li>आधिकारिक notification में पात्रता, उम्र, शुल्क और अंतिम तारीख जाँचें।</li><li>फोटो, हस्ताक्षर, शैक्षणिक प्रमाणपत्र और पहचान-पत्र की माँगी गई फ़ाइलें तैयार रखें।</li><li>फॉर्म submit करने से पहले विवरण जाँचें और आवेदन संख्या/रसीद सुरक्षित रखें।</li></ol>
      </section>
      <footer className="jobs-footer">CSCSKB Online • अंतिम पुष्टि संबंधित आधिकारिक भर्ती पोर्टल पर करें।</footer>
      <style jsx>{`
        .jobs-shell{max-width:1180px;margin:0 auto;padding:24px;color:#f8fbff;min-height:100vh}
        .jobs-header{padding:28px;border:1px solid rgba(255,255,255,.14);border-radius:24px;background:linear-gradient(135deg,rgba(11,114,231,.2),rgba(255,138,0,.12))}
        .jobs-home{display:inline-block;color:#b7d9ff;text-decoration:none;margin-bottom:22px;font-weight:700}
        .jobs-badge{display:block;color:#9cf56f;font-size:.75rem;font-weight:900;letter-spacing:.14em}
        .jobs-header h1{font-size:clamp(2rem,5vw,3.8rem);margin:8px 0;line-height:1.08}
        .jobs-header p{color:#b7c7df}
        .jobs-notice{margin:18px 0;padding:16px 18px;border:1px solid rgba(255,174,0,.3);background:rgba(255,138,0,.08);border-radius:14px;color:#dbeafe;line-height:1.65}
        .jobs-filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:18px 0}
        .jobs-filters label{display:grid;gap:7px;color:#b7c7df;font-size:.88rem;font-weight:700}
        .jobs-filters select{padding:12px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:#0b2043;color:white}
        .jobs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .jobs-card,.jobs-help{padding:20px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(255,255,255,.055)}
        .jobs-card-top{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;color:#9fc8ff;font-size:.78rem;font-weight:800}
        .jobs-status{color:#ffcf85}.jobs-card h2{font-size:1.2rem;margin:14px 0}
        .jobs-card p{color:#b7c7df;font-size:.92rem;margin:8px 0;line-height:1.5}.jobs-card p b{color:#fff}
        .jobs-apply{display:inline-block;margin-top:10px;padding:10px 14px;border-radius:10px;background:#ff8a00;color:#160c00;text-decoration:none;font-weight:900}
        .jobs-help{margin-top:20px}.jobs-help h2{margin-top:0}.jobs-help li{margin:8px 0;color:#b7c7df;line-height:1.5}
        .jobs-empty{color:#b7c7df}.jobs-footer{text-align:center;color:#8298b8;font-size:.8rem;padding:26px 0}
        @media(max-width:700px){.jobs-shell{padding:12px}.jobs-header{padding:20px}.jobs-filters,.jobs-grid{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
