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
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState([{ role: "assistant", text: "नमस्ते! मैं भर्ती के दस्तावेज़ तैयार करने में मदद करूँगा। पहले भर्ती का notification/PDF अपलोड करें या अपनी भर्ती का नाम लिखें।" }]);
  const [agentFiles, setAgentFiles] = useState([]);
  const [agentBusy, setAgentBusy] = useState(false);

  function addAgentMessage(role, text) {
    setAgentMessages((previous) => [...previous, { role, text }]);
  }

  function handleAgentFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAgentFiles((previous) => [...previous, ...files]);
    files.forEach((file) => addAgentMessage("assistant", "फाइल प्राप्त हुई: " + file.name + " (" + Math.round(file.size / 1024) + " KB)। अभी यह केवल upload receipt है—दस्तावेज़ का प्रकार या भर्ती की शर्तें सत्यापित नहीं हुई हैं।"));
    event.target.value = "";
  }

  function sendAgentMessage(event) {
    event.preventDefault();
    const message = agentInput.trim();
    if (!message) return;
    addAgentMessage("user", message);
    setAgentInput("");
    const lower = message.toLowerCase();
    if (lower.includes("compress") || lower.includes("कंप्रेस") || lower.includes("साइज़")) {
      addAgentMessage("assistant", "मैं आपकी जरूरत समझ गया। इस चैट में अभी वास्तविक compression चालू नहीं है। फाइलें प्राप्त हुई हैं, लेकिन तैयार डाउनलोड देने से पहले processing सुविधा जोड़कर जाँचनी होगी।");
    } else if (lower.includes("signature") || lower.includes("हस्ताक्षर") || lower.includes("सिग्नेचर")) {
      addAgentMessage("assistant", "ठीक है—अब अपना हस्ताक्षर वाली image या PDF पेज अटैच करें। अपलोड होने के बाद मैं प्राप्ति बताऊँगा; सही document type की पुष्टि अभी उम्मीदवार को करनी होगी।");
    } else if (lower.includes("photo") || lower.includes("फोटो")) {
      addAgentMessage("assistant", "कृपया भर्ती के notification में बताए गए format और size को ध्यान में रखकर अपनी फोटो अटैच करें। अभी मैं फाइल प्राप्ति बता सकता हूँ, लेकिन automatic validation अभी सक्रिय नहीं है।");
    } else {
      addAgentMessage("assistant", "समझ गया। संबंधित भर्ती का notification/PDF अटैच करें। मैं इस प्रारंभिक version में फाइल प्राप्ति और अगले कदम के निर्देश दे सकता हूँ; AI-based पहचान और वास्तविक compression अभी जोड़ी जानी बाकी है।");
    }
  }
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

      <div className="jobs-agent-root">
        {agentOpen && <section className="jobs-agent-panel" aria-label="Recruitment document assistant">
          <header className="jobs-agent-header">
            <div><strong>Recruitment Assistant</strong><small>दस्तावेज़ सहायता · प्रारंभिक संस्करण</small></div>
            <button type="button" aria-label="चैट बंद करें" onClick={() => setAgentOpen(false)}>×</button>
          </header>
          <div className="jobs-agent-messages" aria-live="polite">
            {agentMessages.map((message, index) => <div key={index} className={"jobs-agent-message " + message.role}>{message.text}</div>)}
            {agentFiles.length > 0 && <div className="jobs-agent-file-summary">अटैच की गई फाइलें: {agentFiles.length}</div>}
          </div>
          <form className="jobs-agent-compose" onSubmit={sendAgentMessage}>
            <label className="jobs-agent-attach" title="फाइल अटैच करें">＋
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.zip" onChange={handleAgentFiles} />
            </label>
            <input value={agentInput} onChange={(event) => setAgentInput(event.target.value)} placeholder="अपना संदेश लिखें…" aria-label="अपना संदेश लिखें" />
            <button type="submit" disabled={agentBusy || !agentInput.trim()}>भेजें</button>
          </form>
          <p className="jobs-agent-disclaimer">ध्यान दें: अभी फाइल अपलोड चैट में स्थानीय रूप से प्राप्त होती है; AI पहचान, server processing और compression सक्रिय नहीं हैं। संवेदनशील दस्तावेज़ साझा करने से पहले सावधानी रखें।</p>
        </section>}
        <button type="button" className="jobs-agent-launcher" onClick={() => setAgentOpen((open) => !open)} aria-expanded={agentOpen}>
          <span aria-hidden="true">✦</span><span>{agentOpen ? "चैट बंद करें" : "दस्तावेज़ सहायता"}</span>
        </button>
      </div>
      <footer className="jobs-footer">CSCSKB Online • यह सूचना-सहायक पोर्टल है; अंतिम पुष्टि संबंधित आधिकारिक भर्ती पोर्टल पर करें।</footer>
      <style jsx>{`

        .jobs-agent-root{position:fixed;right:18px;bottom:18px;z-index:1000;font-family:inherit}
        .jobs-agent-launcher{display:flex;align-items:center;gap:9px;border:0;border-radius:999px;padding:13px 17px;background:#ff8a00;color:#160c00;font-weight:900;box-shadow:0 8px 28px rgba(0,0,0,.28);cursor:pointer}
        .jobs-agent-launcher span:first-child{font-size:1.2rem}
        .jobs-agent-panel{position:absolute;right:0;bottom:62px;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100dvh - 110px));display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:#071a35;color:#f8fbff;box-shadow:0 18px 55px rgba(0,0,0,.45)}
        .jobs-agent-header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;background:#102748;border-bottom:1px solid rgba(255,255,255,.12)}
        .jobs-agent-header strong,.jobs-agent-header small{display:block}.jobs-agent-header small{margin-top:3px;color:#b7c7df;font-size:.76rem}
        .jobs-agent-header button{border:0;background:transparent;color:white;font-size:1.5rem;cursor:pointer}
        .jobs-agent-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
        .jobs-agent-message{max-width:88%;padding:10px 12px;border-radius:14px;line-height:1.45;font-size:.9rem;white-space:pre-wrap;overflow-wrap:anywhere}
        .jobs-agent-message.assistant{align-self:flex-start;background:#102748;color:#edf5ff;border-bottom-left-radius:4px}
        .jobs-agent-message.user{align-self:flex-end;background:#ff8a00;color:#160c00;border-bottom-right-radius:4px}
        .jobs-agent-file-summary{font-size:.8rem;color:#9cf56f}
        .jobs-agent-compose{display:flex;align-items:center;gap:7px;padding:10px;border-top:1px solid rgba(255,255,255,.12)}
        .jobs-agent-attach{display:grid;place-items:center;width:38px;height:38px;flex:0 0 38px;border:1px solid rgba(255,255,255,.2);border-radius:50%;font-size:1.4rem;cursor:pointer}
        .jobs-agent-attach input{display:none}
        .jobs-agent-compose input:not([type=file]){min-width:0;flex:1;padding:10px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:#0b2043;color:#fff}
        .jobs-agent-compose button{padding:10px;border:0;border-radius:10px;background:#ff8a00;color:#160c00;font-weight:900;cursor:pointer}
        .jobs-agent-disclaimer{margin:0;padding:0 12px 12px;color:#a8bbd6;font-size:.68rem;line-height:1.4}
        .jobs-shell{max-width:1180px;margin:0 auto;padding:clamp(12px,3vw,28px);color:#f8fbff;min-height:100vh}
        .jobs-header{padding:clamp(20px,4vw,38px);border:1px solid rgba(255,255,255,.14);border-radius:24px;background:linear-gradient(135deg,rgba(11,114,231,.23),rgba(255,138,0,.13))}
        .jobs-home{display:inline-block;color:#b7d9ff;text-decoration:none;margin-bottom:22px;font-weight:700}
        .jobs-badge,.eyebrow{display:block;color:#9cf56f;font-size:.74rem;font-weight:900;letter-spacing:.12em}
        .jobs-header h1{font-size:clamp(2rem,5vw,3.6rem);margin:10px 0;line-height:1.08;color:#fff}
        .jobs-header p,.section-heading p{color:#b7c7df;line-height:1.6}
        .hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.hero-actions a,.jobs-apply{display:inline-block;padding:11px 15px;border-radius:10px;background:#ff8a00;color:#160c00;text-decoration:none;font-weight:900}
        .hero-actions a+ a{background:#12335f;color:#fff;border:1px solid rgba(255,255,255,.2)}
        .jobs-notice{margin:18px 0;padding:16px 18px;border:1px solid rgba(255,174,0,.3);background:rgba(255,138,0,.08);border-radius:14px;color:#dbeafe;line-height:1.65}
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
        @media(max-width:700px){.jobs-filters,.jobs-grid,.portal-grid{grid-template-columns:1fr}.jobs-header{padding:20px}.portal-tabs{margin-right:-2px}.jobs-card,.portal-card{padding:16px}}
      `}
      </style>
    </main>
  );
}
