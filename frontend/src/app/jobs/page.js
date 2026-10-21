"use client";

import { useMemo, useState } from "react";

const jobs = [
  { id: 1, title: "SSC भर्ती और परीक्षा अपडेट", category: "केंद्र सरकार", qualification: "10वीं / 12वीं / स्नातक", minAge: 18, maxAge: 30, url: "https://ssc.gov.in/" },
  { id: 2, title: "UPPSC भर्ती अपडेट", category: "उत्तर प्रदेश", qualification: "स्नातक (पद के अनुसार)", minAge: 21, maxAge: 40, url: "https://uppsc.up.nic.in/" },
  { id: 3, title: "UPSSSC भर्ती अपडेट", category: "उत्तर प्रदेश", qualification: "10वीं / 12वीं / स्नातक (पद के अनुसार)", minAge: 18, maxAge: 40, url: "https://upsssc.gov.in/" },
  { id: 4, title: "Railway Recruitment Board अपडेट", category: "केंद्र सरकार", qualification: "10वीं / ITI / 12वीं / स्नातक", minAge: 18, maxAge: 33, url: "https://www.rrbapply.gov.in/" },
  { id: 5, title: "UP Police भर्ती अपडेट", category: "उत्तर प्रदेश", qualification: "12वीं / पद के अनुसार", minAge: 18, maxAge: 25, url: "https://uppbpb.gov.in/" },
];

const categories = [
  { title: "Latest Jobs", hindi: "नई सरकारी भर्तियाँ", desc: "भर्ती नोटिफिकेशन, पात्रता और आवेदन लिंक", links: [
    ["SSC", "https://ssc.gov.in/"], ["UPPSC", "https://uppsc.up.nic.in/"], ["UPSSSC", "https://upsssc.gov.in/"], ["Railway Recruitment", "https://www.rrbapply.gov.in/"], ["UP Police", "https://uppbpb.gov.in/"]
  ]},
  { title: "Results", hindi: "परीक्षा परिणाम", desc: "रिजल्ट और मेरिट लिस्ट संबंधित आधिकारिक पोर्टल पर देखें", links: [
    ["SSC Results", "https://ssc.gov.in/"], ["UPPSC Results", "https://uppsc.up.nic.in/"], ["UPSSSC Results", "https://upsssc.gov.in/"], ["UP Police Results", "https://uppbpb.gov.in/"]
  ]},
  { title: "Admit Card", hindi: "प्रवेश पत्र", desc: "एडमिट कार्ड डाउनलोड और परीक्षा संबंधी निर्देश", links: [
    ["SSC Admit Card / Notices", "https://ssc.gov.in/"], ["UPPSC Admit Card / Notices", "https://uppsc.up.nic.in/"], ["UPSSSC Admit Card / Notices", "https://upsssc.gov.in/"], ["Railway Updates", "https://www.rrbapply.gov.in/"]
  ]},
  { title: "Answer Key", hindi: "उत्तर कुंजी", desc: "आंसर-की, आपत्ति और अंतिम उत्तर कुंजी के नोटिस", links: [
    ["SSC Answer Key / Notices", "https://ssc.gov.in/"], ["UPPSC Answer Key / Notices", "https://uppsc.up.nic.in/"], ["UPSSSC Answer Key / Notices", "https://upsssc.gov.in/"]
  ]},
  { title: "Exam Updates", hindi: "परीक्षा कैलेंडर और नोटिस", desc: "परीक्षा तारीख, शेड्यूल और आधिकारिक घोषणाएँ", links: [
    ["SSC", "https://ssc.gov.in/"], ["UPPSC", "https://uppsc.up.nic.in/"], ["UPSSSC", "https://upsssc.gov.in/"], ["Railway", "https://www.rrbapply.gov.in/"]
  ]},
];

export default function JobsPage() {
  const [qualification, setQualification] = useState("All");
  const [age, setAge] = useState("All");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState("All");
  const [liveFeed, setLiveFeed] = useState(null);
  const [liveFeedLoading, setLiveFeedLoading] = useState(false);
  const [liveFeedError, setLiveFeedError] = useState("");
  const [feedLanguage, setFeedLanguage] = useState("both");

  async function refreshOfficialNotices(force = false) {
    setLiveFeedLoading(true);
    setLiveFeedError("");
    try {
      const response = await fetch("/api/recruitment/live" + (force ? "?refresh=1" : ""), { cache: "no-store" });
      if (!response.ok) throw new Error("Official portal scan is unavailable right now.");
      const data = await response.json();
      setLiveFeed(data);
    } catch {
      setLiveFeedError("अभी official notifications प्राप्त नहीं हो सके। / Official notices could not be fetched right now.");
    } finally {
      setLiveFeedLoading(false);
    }
  }

  useEffect(() => {
    refreshOfficialNotices();
    const timer = window.setInterval(() => refreshOfficialNotices(), 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);
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
        <span className="jobs-badge">CSCSKB ONLINE • JOBS • EXAMS • RESULTS</span>
        <h1>Education &amp; Sarkari Result Portal</h1>
        <p>सरकारी नौकरी, परीक्षा, रिजल्ट, एडमिट कार्ड और आंसर-की के आधिकारिक लिंक एक जगह।</p>
        <div className="hero-actions"><a href="#latest-jobs">Latest Jobs देखें</a><a href="#result-sections">Results / Admit Card</a></div>
      </header>

      <section className="jobs-notice" role="note">
        <strong>महत्वपूर्ण सूचना:</strong> यह पोर्टल संबंधित आधिकारिक वेबसाइटों के लिंक देता है। अभी स्वतः अपडेट होने वाली live job/result feed सक्रिय नहीं है। अंतिम तारीख, पात्रता, आयु-सीमा और परिणाम हमेशा आधिकारिक नोटिस से सत्यापित करें।
      </section>

      <section className="official-notices" aria-labelledby="official-notices-heading">
        <div className="official-notices-head">
          <div>
            <span className="eyebrow">OFFICIAL SOURCE SCAN • आधिकारिक स्रोत</span>
            <h2 id="official-notices-heading">Live Recruitment & Exam Notifications / लाइव भर्ती एवं परीक्षा सूचनाएँ</h2>
            <p>Links are scanned from official portal homepages every 5 minutes. A link is a lead to check—not proof that a vacancy is active.</p>
          </div>
          <div className="official-notice-actions">
            <label>Language / भाषा
              <select value={feedLanguage} onChange={(e) => setFeedLanguage(e.target.value)}>
                <option value="both">Hindi + English / हिंदी + English</option>
                <option value="hi">Hindi / हिंदी</option>
                <option value="en">English</option>
              </select>
            </label>
            <button type="button" onClick={() => refreshOfficialNotices(true)} disabled={liveFeedLoading}>{liveFeedLoading ? "Checking… / जाँच रहे हैं…" : "Check now / अभी जाँचें"}</button>
          </div>
        </div>
        {liveFeed?.checkedAt && <p className="official-notice-meta">Last checked / अंतिम जाँच: {new Date(liveFeed.checkedAt).toLocaleString()} • Sources: {(liveFeed.sources || []).filter((x) => x.status === "ok").length}/{(liveFeed.sources || []).length} reachable</p>}
        {liveFeedError && <p className="official-notice-error" role="status">{liveFeedError}</p>}
        {liveFeed && <div className="official-source-status">
          {(liveFeed.sources || []).map((source) => <a key={source.name} href={source.url} target="_blank" rel="noreferrer" className={source.status === "ok" ? "source-ok" : "source-down"}>
            <span>{source.name}</span><small>{source.status === "ok" ? (feedLanguage === "en" ? "Checked" : feedLanguage === "hi" ? "जाँचा गया" : "Checked / जाँचा गया") : (feedLanguage === "en" ? "Unavailable" : feedLanguage === "hi" ? "उपलब्ध नहीं" : "Unavailable / उपलब्ध नहीं")}</small>
          </a>)}
        </div>}
        {liveFeed && liveFeed.notices?.length > 0 ? <div className="official-notice-grid">
          {liveFeed.notices.map((notice) => <article key={notice.id} className="official-notice-card">
            <div className="official-notice-tags"><span>{notice.board}</span><span>{notice.kind.replace("-", " ")}</span></div>
            <h3>{notice.title}</h3>
            <p>{feedLanguage === "en" ? "Detected on the official portal. Open the source to verify details." : feedLanguage === "hi" ? "आधिकारिक पोर्टल पर लिंक मिला है। तारीख और पात्रता के लिए मूल नोटिस खोलें।" : "Official portal link detected. / आधिकारिक पोर्टल पर लिंक मिला है।"}</p>
            <a href={notice.url} target="_blank" rel="noreferrer">{feedLanguage === "en" ? "Open official notice ↗" : feedLanguage === "hi" ? "आधिकारिक नोटिस खोलें ↗" : "Open official notice / नोटिस खोलें ↗"}</a>
            <small>{feedLanguage === "en" ? "Link scan, not vacancy verification" : feedLanguage === "hi" ? "लिंक स्कैन, भर्ती की पुष्टि नहीं" : "Link scan, not vacancy verification / भर्ती की पुष्टि नहीं"}</small>
          </article>)}
        </div> : liveFeed && <p className="official-notice-empty">{feedLanguage === "en" ? "No matching notice links were extracted from the portal homepages. This does not mean no vacancies exist; open the official portals above." : feedLanguage === "hi" ? "पोर्टल के मुख्य पृष्ठों से कोई संबंधित लिंक नहीं मिला। इसका अर्थ यह नहीं कि भर्ती नहीं है; आधिकारिक पोर्टल खोलें।" : "No notice links extracted / कोई लिंक नहीं मिला। This does not prove there are no vacancies / इसका अर्थ भर्ती न होना नहीं है।"}</p>}
        <p className="official-notice-disclaimer">{feedLanguage === "en" ? liveFeed?.disclaimer : feedLanguage === "hi" ? "यह जाँच आधिकारिक वेबसाइट के मुख्य पृष्ठ पर उपलब्ध लिंक देखती है, कोई आधिकारिक API या पूरी vacancy database नहीं है। अंतिम तारीख, पात्रता और active status मूल notification में जाँचें।" : "Automated homepage link scan—not an official API or verified vacancy database. / यह स्वचालित लिंक-जाँच है, पूरी सत्यापित भर्ती सूची नहीं।"}</p>
      </section>

      <section id="latest-jobs" className="section-block">
        <div className="section-heading"><div><span className="eyebrow">FIND YOUR OPPORTUNITY</span><h2>Latest Jobs &amp; Recruitment</h2><p>योग्यता और आयु के आधार पर भर्ती लिंक छाँटें।</p></div></div>
        <section className="jobs-filters" aria-label="भर्ती फ़िल्टर">
          <label>योग्यता<select value={qualification} onChange={(e) => setQualification(e.target.value)}>
            <option value="All">सभी योग्यताएँ</option><option value="10वीं">10वीं</option><option value="12वीं">12वीं</option><option value="स्नातक">स्नातक</option><option value="ITI">ITI</option>
          </select></label>
          <label>आयु सीमा<select value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="All">सभी आयु</option><option value="18-25">18–25 वर्ष</option><option value="26-35">26–35 वर्ष</option><option value="36+">36 वर्ष या अधिक</option>
          </select></label>
          <label>भर्ती श्रेणी<select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">सभी श्रेणियाँ</option><option value="केंद्र सरकार">केंद्र सरकार</option><option value="उत्तर प्रदेश">उत्तर प्रदेश</option>
          </select></label>
        </section>
        <section className="jobs-grid">
          {filtered.map((job) => <article className="jobs-card" key={job.id}>
            <div className="jobs-card-top"><span>{job.category}</span><span className="jobs-status">Official portal</span></div>
            <h3>{job.title}</h3><p><b>योग्यता:</b> {job.qualification}</p>
            <p><b>आयु संकेत:</b> लगभग {job.minAge}–{job.maxAge} वर्ष। वास्तविक आयु सीमा और छूट अधिसूचना के अनुसार अलग हो सकती है।</p>
            <a className="jobs-apply" href={job.url} target="_blank" rel="noreferrer">आधिकारिक वेबसाइट खोलें ↗</a>
          </article>)}
          {filtered.length === 0 && <p className="jobs-empty">इन फ़िल्टरों से कोई लिंक नहीं मिला। फ़िल्टर बदलकर देखें।</p>}
        </section>
      </section>

      <section id="result-sections" className="section-block">
        <div className="section-heading"><div><span className="eyebrow">EXAM INFORMATION DESK</span><h2>Results, Admit Card &amp; Answer Key</h2><p>अपनी परीक्षा की जानकारी संबंधित विभाग की वेबसाइट पर खोलें।</p></div></div>
        <div className="portal-tabs" role="tablist" aria-label="Education portal categories">
          <button className={active === "All" ? "selected" : ""} onClick={() => setActive("All")}>सभी</button>
          {categories.map((item) => <button key={item.title} className={active === item.title ? "selected" : ""} onClick={() => setActive(item.title)}>{item.title}</button>)}
        </div>
        <div className="portal-grid">
          {categories.filter(item => active === "All" || item.title === active).map(item => <article className="portal-card" key={item.title}>
            <span className="eyebrow">{item.title}</span><h3>{item.hindi}</h3><p>{item.desc}</p>
            <div className="portal-links">{item.links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer">{label} ↗</a>)}</div>
          </article>)}
        </div>
      </section>

      <section className="jobs-help">
        <h2>फॉर्म भरने या रिजल्ट देखने से पहले</h2>
        <ol><li>आधिकारिक notification में पात्रता, उम्र, शुल्क और अंतिम तारीख जाँचें।</li><li>एडमिट कार्ड पर परीक्षा केंद्र, तारीख और रिपोर्टिंग समय जाँचें।</li><li>फॉर्म submit करने या रिजल्ट डाउनलोड करने के बाद आवेदन संख्या/रसीद सुरक्षित रखें।</li></ol>
      </section>
      <footer className="jobs-footer">CSCSKB Online • यह सूचना-सहायक पोर्टल है; अंतिम पुष्टि संबंधित आधिकारिक भर्ती पोर्टल पर करें।</footer>
      <style jsx>{`
        .jobs-shell{max-width:1180px;margin:0 auto;padding:clamp(12px,3vw,28px);color:#f8fbff;min-height:100vh}
        .jobs-header{padding:clamp(20px,4vw,38px);border:1px solid rgba(255,255,255,.14);border-radius:24px;background:linear-gradient(135deg,rgba(11,114,231,.23),rgba(255,138,0,.13))}
        .jobs-home{display:inline-block;color:#b7d9ff;text-decoration:none;margin-bottom:22px;font-weight:700}
        .jobs-badge,.eyebrow{display:block;color:#9cf56f;font-size:.74rem;font-weight:900;letter-spacing:.12em}
        .jobs-header h1{font-size:clamp(2rem,5vw,3.6rem);margin:10px 0;line-height:1.08;color:#fff}
        .jobs-header p,.section-heading p{color:#b7c7df;line-height:1.6}
        .hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.hero-actions a,.jobs-apply{display:inline-block;padding:11px 15px;border-radius:10px;background:#ff8a00;color:#160c00;text-decoration:none;font-weight:900}
        .hero-actions a+ a{background:#12335f;color:#fff;border:1px solid rgba(255,255,255,.2)}
        .jobs-notice{margin:18px 0;padding:16px 18px;border:1px solid rgba(255,174,0,.3);background:rgba(255,138,0,.08);border-radius:14px;color:#dbeafe;line-height:1.65}
        .official-notices{margin:22px 0;padding:clamp(16px,3vw,24px);border:1px solid rgba(76,160,255,.28);border-radius:20px;background:linear-gradient(135deg,rgba(14,64,120,.45),rgba(18,39,73,.65))}
        .official-notices-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;flex-wrap:wrap}.official-notices h2{margin:6px 0;color:#fff;font-size:clamp(1.35rem,3vw,1.9rem)}.official-notices-head p{color:#b7c7df;max-width:660px;line-height:1.55}
        .official-notice-actions{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}.official-notice-actions label{display:grid;gap:5px;color:#dce8f8;font-size:.8rem;font-weight:700}.official-notice-actions select,.official-notice-actions button{padding:10px;border-radius:9px;border:1px solid #526e94;background:#102748;color:#fff;font:inherit}.official-notice-actions button{background:#ff8a00;border-color:#ff8a00;color:#160c00;font-weight:900;cursor:pointer}.official-notice-actions button:disabled{opacity:.65;cursor:wait}
        .official-notice-meta,.official-notice-disclaimer{color:#9fb3cf;font-size:.82rem;line-height:1.6}.official-notice-error{color:#ffd2d2}.official-source-status{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.official-source-status a{display:flex;flex-direction:column;gap:3px;text-decoration:none;border:1px solid rgba(255,255,255,.15);border-radius:9px;padding:9px 11px;color:#fff;background:rgba(255,255,255,.05)}.official-source-status small{color:#9cf56f}.official-source-status .source-down small{color:#ffc38c}
        .official-notice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0}.official-notice-card{min-width:0;padding:15px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(0,0,0,.12)}.official-notice-tags{display:flex;gap:7px;flex-wrap:wrap}.official-notice-tags span{font-size:.72rem;color:#b9d9ff;border:1px solid #345577;border-radius:99px;padding:3px 8px}.official-notice-card h3{color:#fff;overflow-wrap:anywhere;margin:10px 0;font-size:1rem}.official-notice-card p{color:#b7c7df;font-size:.87rem;line-height:1.5}.official-notice-card a{display:inline-block;color:#ffbd67;font-weight:900;text-decoration:none;margin:4px 0 8px}.official-notice-card small{display:block;color:#94a8c6;font-size:.76rem}.official-notice-empty{color:#dbeafe;border:1px dashed #526e94;padding:14px;border-radius:10px}
        .section-block{margin:28px 0}.section-heading{margin-bottom:16px}.section-heading h2{font-size:clamp(1.45rem,3vw,2rem);margin:5px 0 3px;color:#fff}
        .jobs-filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:18px 0}
        .jobs-filters label{display:grid;gap:7px;color:#b7c7df;font-size:.88rem;font-weight:700}
        .jobs-filters select{width:100%;padding:12px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:#0b2043;color:white}
        .jobs-grid,.portal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .jobs-card,.portal-card,.jobs-help{min-width:0;padding:20px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(255,255,255,.055)}
        .jobs-card-top{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;color:#9fc8ff;font-size:.78rem;font-weight:800}
        .jobs-status{color:#9cf56f}.jobs-card h3,.portal-card h3{font-size:1.18rem;margin:12px 0;color:#fff}
        .jobs-card p,.portal-card p{color:#b7c7df;font-size:.92rem;margin:8px 0;line-height:1.55}.jobs-card p b{color:#fff}
        .jobs-apply{margin-top:10px}.portal-tabs{display:flex;gap:8px;overflow-x:auto;padding:3px 1px 12px}.portal-tabs button{flex:0 0 auto;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:#102748;color:#dbeafe;padding:10px 14px;font-weight:800;cursor:pointer}.portal-tabs button.selected{background:#ff8a00;color:#160c00;border-color:#ff8a00}
        .portal-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.portal-links a{color:#dceeff;text-decoration:none;border:1px solid rgba(255,255,255,.16);background:rgba(11,114,231,.13);border-radius:9px;padding:8px 10px;font-size:.84rem;font-weight:700}.portal-links a:hover{border-color:#ff8a00}
        .jobs-help{margin-top:20px}.jobs-help h2{margin:0 0 10px;color:#fff}.jobs-help li{margin:8px 0;color:#b7c7df;line-height:1.5}
        .jobs-empty{color:#b7c7df}.jobs-footer{text-align:center;color:#8298b8;font-size:.8rem;padding:26px 0}
        @media(max-width:700px){.jobs-filters,.jobs-grid,.portal-grid,.official-notice-grid{grid-template-columns:1fr}.jobs-header{padding:20px}.portal-tabs{margin-right:-2px}.jobs-card,.portal-card{padding:16px}}
      `}
      </style>
    </main>
  );
}
