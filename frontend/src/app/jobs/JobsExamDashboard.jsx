"use client";

import { useMemo, useState } from "react";

const categories = [
  { name: "Central", icon: "🇮🇳", groups: ["SSC", "Railway", "Banking", "Insurance", "Defence", "UPSC", "Central Teaching", "Courts", "Other Central"] },
  { name: "Uttar Pradesh", icon: "📍", groups: ["UPPSC", "UPSSSC", "UP Police", "UP TET", "UP Teaching", "UP Courts", "Other UP"] },
  { name: "Other States", icon: "🗺️", groups: ["Bihar", "Rajasthan", "Madhya Pradesh", "Jharkhand", "Delhi", "Other State"] },
  { name: "District", icon: "🏛️", groups: ["District Recruitment", "Local Bodies", "District Courts"] },
  { name: "Teaching", icon: "🎓", groups: ["CTET", "State TET", "REET", "Bihar TET", "Jharkhand TET", "MP TET", "UP TET", "PRT", "TGT", "PGT", "D.El.Ed / BTC", "B.Ed"] },
  { name: "Defence", icon: "🛡️", groups: ["Army", "Agniveer Army", "Navy", "Agniveer Navy", "Air Force", "Agniveer Vayu", "NDA", "CDS", "TES", "Coast Guard"] },
  { name: "Entrance", icon: "📚", groups: ["NEET", "JEE", "CUET", "NVS", "JNVST", "Sainik School", "Other Entrance"] },
  { name: "School Exams", icon: "🏫", groups: ["Class 9", "Class 10", "Class 11", "Class 12", "UP Board", "CBSE", "ICSE", "Other Boards"] },
  { name: "Computer & Skills", icon: "💻", groups: ["CCC", "CPC", "CPCT", "RSCIT", "IAF / IBF", "DR", "Computer Certification", "Other Skills"] },
  { name: "Other Exams", icon: "🔎", groups: ["High Court", "Supreme Court", "Lower Courts", "Intelligence Bureau", "Other Recruitment"] },
];

const examCatalog = [
  { exam: "SSC CGL", category: "SSC", level: "Central", qualification: "Graduate", age: "18–32", fee: "Paid / category exemptions", url: "https://ssc.gov.in/" },
  { exam: "SSC CHSL", category: "SSC", level: "Central", qualification: "12th", age: "18–27", fee: "Paid / category exemptions", url: "https://ssc.gov.in/" },
  { exam: "SSC MTS / Havaldar", category: "SSC", level: "Central", qualification: "10th", age: "18–25 / 18–27", fee: "Paid / category exemptions", url: "https://ssc.gov.in/" },
  { exam: "SSC GD Constable", category: "SSC", level: "Central", qualification: "10th", age: "18–23", fee: "Paid / category exemptions", url: "https://ssc.gov.in/" },
  { exam: "SSC CPO", category: "SSC", level: "Central", qualification: "Graduate", age: "20–25", fee: "Paid / category exemptions", url: "https://ssc.gov.in/" },
  { exam: "SSC Stenographer", category: "SSC", level: "Central", qualification: "12th", age: "Notification-based", fee: "Paid / category exemptions", url: "https://ssc.gov.in/" },
  { exam: "RRB NTPC", category: "Railway", level: "Central", qualification: "12th / Graduate", age: "Notification-based", fee: "Notification-based", url: "https://www.rrbapply.gov.in/" },
  { exam: "RRB Group D", category: "Railway", level: "Central", qualification: "10th / ITI", age: "Notification-based", fee: "Notification-based", url: "https://www.rrbapply.gov.in/" },
  { exam: "RRB ALP / Technician", category: "Railway", level: "Central", qualification: "ITI / Diploma", age: "Notification-based", fee: "Notification-based", url: "https://www.rrbapply.gov.in/" },
  { exam: "SBI PO / Clerk", category: "Banking", level: "Central", qualification: "Graduate", age: "Notification-based", fee: "Notification-based", url: "https://sbi.co.in/web/careers" },
  { exam: "IBPS PO / Clerk", category: "Banking", level: "Central", qualification: "Graduate", age: "Notification-based", fee: "Notification-based", url: "https://www.ibps.in/" },
  { exam: "RBI Assistant / Grade B", category: "Banking", level: "Central", qualification: "Graduate", age: "Notification-based", fee: "Notification-based", url: "https://www.rbi.org.in/" },
  { exam: "LIC Assistant / AAO", category: "Insurance", level: "Central", qualification: "Graduate", age: "Notification-based", fee: "Notification-based", url: "https://licindia.in/" },
  { exam: "UPPSC PCS", category: "UPPSC", level: "State", qualification: "Graduate", age: "Notification-based", fee: "Notification-based", url: "https://uppsc.up.nic.in/" },
  { exam: "UPSSSC PET", category: "UPSSSC", level: "State", qualification: "10th / Notification-based", age: "Notification-based", fee: "Notification-based", url: "https://upsssc.gov.in/" },
  { exam: "UPSSSC Lekhpal / Junior Assistant", category: "UPSSSC", level: "State", qualification: "Notification-based", age: "Notification-based", fee: "Notification-based", url: "https://upsssc.gov.in/" },
  { exam: "UP Police Constable / SI", category: "UP Police", level: "State", qualification: "12th / Graduate", age: "Notification-based", fee: "Notification-based", url: "https://uppbpb.gov.in/" },
  { exam: "CTET", category: "Teaching", level: "Central", qualification: "Teacher qualification as notified", age: "No upper age (verify notice)", fee: "Notification-based", url: "https://ctet.nic.in/" },
  { exam: "UPTET / State TETs", category: "Teaching", level: "State", qualification: "D.El.Ed / B.Ed etc. as notified", age: "Notification-based", fee: "Notification-based", url: "https://updeled.gov.in/" },
  { exam: "TGT / PGT / PRT Recruitments", category: "Teaching", level: "Central / State", qualification: "Relevant degree + teacher qualification", age: "Notification-based", fee: "Notification-based", url: "https://www.cbse.gov.in/" },
  { exam: "Army Agniveer / TES", category: "Defence", level: "Central", qualification: "10th / 12th / PCM etc. by entry", age: "Entry-specific", fee: "Notification-based", url: "https://joinindianarmy.nic.in/" },
  { exam: "Navy / Agniveer", category: "Defence", level: "Central", qualification: "Entry-specific", age: "Entry-specific", fee: "Notification-based", url: "https://joinindiannavy.gov.in/" },
  { exam: "Air Force / Agniveer Vayu", category: "Defence", level: "Central", qualification: "Entry-specific", age: "Entry-specific", fee: "Notification-based", url: "https://agnipathvayu.cdac.in/" },
  { exam: "NDA / CDS", category: "Defence", level: "Central", qualification: "12th / Graduate by entry", age: "Entry-specific", fee: "Notification-based", url: "https://upsc.gov.in/" },
  { exam: "UP Board / CBSE / School Exams", category: "School Exams", level: "School", qualification: "Class 9–12", age: "Student-specific", fee: "Board-specific", url: "https://upmsp.edu.in/" },
  { exam: "NEET / JEE / CUET", category: "Entrance", level: "Entrance", qualification: "12th / subject-specific", age: "Exam-specific", fee: "Notification-based", url: "https://nta.ac.in/" },
  { exam: "CCC / CPCT / RSCIT", category: "Computer & Skills", level: "Certification", qualification: "Exam-specific", age: "Exam-specific", fee: "Exam-specific", url: "https://www.nielit.gov.in/" },
  { exam: "High Court / District Court", category: "Courts", level: "Central / State / District", qualification: "Post-specific", age: "Notification-based", fee: "Notification-based", url: "https://www.sci.gov.in/" },
];

const getAgeBounds = (ageText) => {\n  if (!ageText || /notification|entry-specific|exam-specific|student-specific|no upper/i.test(ageText)) return null;\n  const nums = ageText.match(/\\d+/g)?.map(Number) || [];\n  if (nums.length < 2) return null;\n  return { min: Math.min(nums[0], nums[nums.length - 2]), max: Math.max(nums[1], nums[nums.length - 1]) };\n};\n\nconst quickLinks = [
  ["Latest Jobs", "New recruitment notices", "↗"],
  ["Admit Cards", "Download hall tickets", "▣"],
  ["Results", "Result & merit updates", "✓"],
  ["Answer Keys", "Keys & objections", "≡"],
  ["Exam Calendar", "Upcoming exam dates", "▦"],
  ["School Exams", "Class 9–12 & boards", "🏫"],
];

const css = `
  .jobportal * { box-sizing: border-box; }
  .jobportal { color:#15233d; font-family:Arial,'Noto Sans Devanagari',sans-serif; background:#f3f6fb; min-height:100vh; }
  .jp-shell { max-width:1380px; margin:auto; padding:0 22px 44px; }
  .jp-header { background:#102d59; color:#fff; }
  .jp-headerin { max-width:1380px; margin:auto; padding:16px 22px; display:flex; gap:18px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
  .jp-brand { font-weight:900; letter-spacing:.03em; font-size:19px; }
  .jp-brand small { font-weight:500; opacity:.72; display:block; font-size:11px; letter-spacing:.08em; margin-top:3px; }
  .jp-nav { display:flex; gap:7px; flex-wrap:wrap; }
  .jp-nav a { color:#e8f1ff; text-decoration:none; font-size:13px; font-weight:700; padding:8px 10px; border-radius:8px; }
  .jp-nav a:hover { background:#ffffff18; }
  .jp-ticker { background:#fff; border:1px solid #e3e9f2; border-radius:12px; margin:16px 0; display:flex; overflow:hidden; align-items:center; }
  .jp-tickerlabel { background:#e43d48; color:#fff; padding:11px 14px; font-size:12px; font-weight:900; white-space:nowrap; }
  .jp-tickertext { color:#344660; font-size:13px; padding:11px 14px; overflow:hidden; white-space:nowrap; }
  .jp-hero { background:linear-gradient(120deg,#173a71,#205ca8); color:white; border-radius:18px; padding:28px; margin-bottom:18px; }
  .jp-hero h1 { font-size:clamp(26px,4vw,40px); line-height:1.1; margin:9px 0 10px; letter-spacing:-.035em; }
  .jp-hero p { color:#d9eaff; margin:0 0 18px; line-height:1.55; }
  .jp-search { display:flex; gap:9px; background:white; border-radius:12px; padding:7px; max-width:850px; }
  .jp-search input { flex:1; min-width:0; border:0; outline:none; padding:12px; color:#16243c; font-size:15px; }
  .jp-search button { border:0; border-radius:9px; background:#155eef; color:white; font-weight:800; padding:0 18px; cursor:pointer; }
  .jp-layout { display:grid; grid-template-columns:240px minmax(0,1fr) 265px; gap:16px; align-items:start; }
  .jp-panel { background:#fff; border:1px solid #e2e8f0; border-radius:15px; padding:16px; }
  .jp-panel h2,.jp-panel h3 { margin:0 0 12px; }
  .jp-cats { display:grid; gap:5px; }
  .jp-cat { display:flex; align-items:center; gap:9px; width:100%; border:1px solid transparent; background:transparent; text-align:left; padding:9px; border-radius:9px; color:#243752; font-weight:700; font-size:13px; cursor:pointer; }
  .jp-cat:hover,.jp-cat.active { background:#edf4ff; color:#155eef; border-color:#d5e5ff; }
  .jp-cat small { margin-left:auto; color:#7b8ca3; font-weight:600; }
  .jp-examchips { display:flex; flex-wrap:wrap; gap:7px; margin-top:12px; }
  .jp-chip { border:1px solid #dbe4ef; background:#fff; color:#42546d; border-radius:999px; padding:7px 10px; font-size:12px; cursor:pointer; }
  .jp-chip.active { background:#eaf2ff; border-color:#b8d2ff; color:#155eef; font-weight:800; }
  .jp-sectionhead { display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:12px; }
  .jp-sectionhead h2 { margin:0; font-size:20px; }
  .jp-muted { color:#718198; font-size:12px; }
  .jp-count { background:#eef4ff; color:#155eef; border-radius:999px; padding:5px 9px; font-size:11px; font-weight:800; }
  .jp-filtergrid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
  .jp-filtergrid label { display:block; color:#6b7a90; font-size:11px; font-weight:800; margin-bottom:5px; }
  .jp-filtergrid select { width:100%; border:1px solid #dce4ee; background:white; color:#233650; padding:9px; border-radius:8px; font-size:12px; }
  .jp-vacancy { border:1px solid #e5ebf3; border-radius:12px; padding:14px; margin-top:10px; }
  .jp-vtitle { font-weight:850; font-size:15px; }
  .jp-vmeta { display:flex; gap:6px; flex-wrap:wrap; margin:8px 0; }
  .jp-tag { font-size:10px; font-weight:800; background:#f0f4fa; color:#51647e; padding:5px 7px; border-radius:6px; }
  .jp-vrow { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin:10px 0; }
  .jp-vrow div { background:#f8fafc; border-radius:8px; padding:8px; }
  .jp-vrow small { display:block; color:#75849a; font-size:10px; margin-bottom:4px; }
  .jp-vrow strong { font-size:12px; }
  .jp-link { display:inline-flex; align-items:center; text-decoration:none; font-weight:800; color:#155eef; font-size:12px; }
  .jp-quick { display:grid; gap:8px; }
  .jp-quick a { text-decoration:none; border:1px solid #e5ebf3; border-radius:10px; padding:10px; display:flex; gap:9px; align-items:center; color:#223650; }
  .jp-quick a:hover { border-color:#b8d2ff; background:#f7faff; }
  .jp-qicon { width:30px; height:30px; border-radius:8px; background:#edf4ff; color:#155eef; display:grid; place-items:center; font-weight:900; }
  .jp-quick strong { display:block; font-size:12px; }
  .jp-quick small { display:block; color:#77869b; font-size:10px; margin-top:2px; }
  .jp-dateitem { display:flex; justify-content:space-between; gap:8px; padding:9px 0; border-bottom:1px solid #eef2f7; font-size:12px; }
  .jp-dateitem:last-child { border-bottom:0; }
  .jp-zero { display:flex; gap:8px; align-items:center; margin-top:12px; font-size:12px; color:#465b75; }
  .jp-zero input { accent-color:#155eef; }
  .jp-bottomcats { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; margin-top:18px; }
  .jp-bottomcat { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:13px; text-align:left; cursor:pointer; color:#233650; }
  .jp-bottomcat:hover { border-color:#b8d2ff; background:#f8fbff; }
  .jp-bottomcat strong { display:block; font-size:12px; margin-top:5px; }
  .jp-bottomcat span { font-size:18px; }
  .jp-note { font-size:11px; color:#718198; line-height:1.55; background:#f8fafc; border:1px dashed #dbe3ed; border-radius:10px; padding:11px; margin-top:12px; }
  @media(max-width:1050px){ .jp-layout{grid-template-columns:220px minmax(0,1fr)} .jp-right{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px} .jp-right .jp-panel{height:fit-content} .jp-bottomcats{grid-template-columns:repeat(3,minmax(0,1fr))} }
  @media(max-width:700px){ .jp-shell{padding:0 12px 30px} .jp-headerin{padding:13px 14px} .jp-nav{display:none} .jp-ticker{margin:10px 0} .jp-tickerlabel{padding:9px 10px;font-size:10px} .jp-tickertext{font-size:11px;padding:9px 10px} .jp-hero{padding:19px;border-radius:14px} .jp-search{flex-direction:column} .jp-search button{padding:12px} .jp-layout{grid-template-columns:1fr} .jp-left{order:2} .jp-center{order:1} .jp-right{order:3;grid-column:auto;display:grid;grid-template-columns:1fr} .jp-filtergrid{grid-template-columns:1fr 1fr} .jp-vrow{grid-template-columns:1fr 1fr} .jp-bottomcats{grid-template-columns:repeat(2,minmax(0,1fr))} }
`;

export default function JobsExamDashboard() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [qualification, setQualification] = useState("All");
  const [age, setAge] = useState("All");
  const [fee, setFee] = useState("All");
  const [status, setStatus] = useState("All");
  const [zeroFee, setZeroFee] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const categoryNames = ["All", ...categories.map(c => c.name)];
  const activeCategory = categories.find(c => c.name === category);
  const examsInCategory = activeCategory ? activeCategory.groups : [];

  const filtered = useMemo(() => examCatalog.filter(item => {
    const term = search.toLowerCase().trim();
    const matchesSearch = !term || (item.exam + " " + item.category + " " + item.level + " " + item.qualification).toLowerCase().includes(term);
    const matchesCategory = category === "All" || item.category === category || (category === "Central" && item.level.includes("Central")) || (category === "Uttar Pradesh" && ["UPPSC","UPSSSC","UP Police"].includes(item.category)) || (category === "Other States" && ["Bihar","Rajasthan","Madhya Pradesh","Jharkhand"].includes(item.category)) || (category === "District" && item.level.includes("District"));
    const matchesLevel = level === "All" || item.level.includes(level);
    const matchesQualification = qualification === "All" || item.qualification.toLowerCase().includes(qualification.toLowerCase());
    const matchesAge = age === "All" || item.age.toLowerCase().includes(age.toLowerCase()) || item.age === "Notification-based" || item.age === "Entry-specific";
    const matchesFee = fee === "All" || item.fee.toLowerCase().includes(fee.toLowerCase()) || item.fee === "Notification-based";
    const matchesZero = !zeroFee || item.fee.toLowerCase().includes("free") || item.fee.toLowerCase().includes("exemption");
    const matchesStatus = status === "All" || status === "Official check required";
    return matchesSearch && matchesCategory && matchesLevel && matchesQualification && matchesAge && matchesFee && matchesZero && matchesStatus;
  }), [search, category, level, qualification, age, fee, zeroFee, status]);

  const openOfficial = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <main className="jobportal">
      <style>{css}</style>
      <header className="jp-header">
        <div className="jp-headerin">
          <div className="jp-brand">CSC SKB ONLINE <small>CAREER DESK · JOBS & EXAMS</small></div>
          <nav className="jp-nav" aria-label="Portal navigation">
            <a href="#vacancies">Latest Jobs</a><a href="#quicklinks">Admit Card</a><a href="#quicklinks">Results</a><a href="#quicklinks">Answer Key</a><a href="#school">School Exams</a>
          </nav>
        </div>
      </header>
      <div className="jp-shell">
        <div className="jp-ticker" aria-label="Recruitment notification ticker">
          <span className="jp-tickerlabel">LATEST UPDATES</span>
          <div className="jp-tickertext">Directory listings only · Vacancy status and fee/age details require official notification verification.</div>
        </div>
        <section className="jp-hero">
          <div style={{fontSize:11,fontWeight:900,letterSpacing:".15em",color:"#bddcff"}}>YOUR NEXT OPPORTUNITY STARTS HERE</div>
          <h1>Find your exam.<br/>Find your opportunity.</h1>
          <p>सरकारी भर्ती, प्रतियोगी परीक्षाएँ, स्कूल और प्रवेश परीक्षाएँ — एक व्यवस्थित पोर्टल पर।</p>
          <form className="jp-search" onSubmit={e=>e.preventDefault()}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search SSC, Railway, TET, Police, NEET, school exam..." aria-label="Search exams and vacancies"/>
            <button type="button" onClick={()=>document.getElementById("exam-list")?.scrollIntoView({behavior:"smooth"})}>Search Exams</button>
          </form>
        </section>

        <div className="jp-layout">
          <aside className="jp-left jp-panel">
            <h3 style={{fontSize:15}}>Browse Categories</h3>
            <div className="jp-cats">
              {categories.map(c=><button key={c.name} className={"jp-cat "+(category===c.name?"active":"")} onClick={()=>{setCategory(c.name);setSelectedExam(null);}}><span>{c.icon}</span>{c.name}<small>{c.groups.length}</small></button>)}
            <button className={"jp-cat "+(category==="All"?"active":"")} onClick={()=>{setCategory("All");setSelectedExam(null);}}>✦ All Exams <small>{examCatalog.length}</small></button>
            </div>
            {activeCategory && <div><div className="jp-muted" style={{marginTop:12,fontWeight:800}}>POPULAR IN {category.toUpperCase()}</div><div className="jp-examchips">{examsInCategory.map(g=><button key={g} className="jp-chip" onClick={()=>setSearch(g)}>{g}</button>)}</div></div>}
            <div className="jp-note">Categories are expandable; we will add the full exam directory progressively. Links open official recruitment websites.</div>
          </aside>

          <section className="jp-center" id="exam-list">
            <div className="jp-panel">
              <div className="jp-sectionhead"><h2>Smart Exam Finder</h2><span className="jp-count">{filtered.length} matches</span></div>
              <div className="jp-filtergrid">
                <div><label>Exam Level</label><select value={level} onChange={e=>setLevel(e.target.value)}><option>All</option><option>Central</option><option>State</option><option>District</option><option>School</option><option>Entrance</option><option>Certification</option></select></div>
                <div><label>Qualification</label><select value={qualification} onChange={e=>setQualification(e.target.value)}><option>All</option><option>10th</option><option>12th</option><option>Graduate</option><option>Postgraduate</option><option>Diploma</option><option>ITI</option></select></div>
                <div><label>Candidate Age (indicative range)</label><select value={age} onChange={e=>setAge(e.target.value)}><option>All</option><option>18</option><option>20</option><option>25</option><option>30</option><option>35</option><option>40</option></select></div>
                <div><label>Maximum Verified Fee</label><select value={fee} onChange={e=>setFee(e.target.value)}><option>All</option><option value="0">₹0</option><option value="100">Up to ₹100</option><option value="200">Up to ₹200</option><option value="500">Up to ₹500</option></select></div>
              </div>
              <div className="jp-zero"><input id="zeroFee" type="checkbox" checked={zeroFee} onChange={e=>setZeroFee(e.target.checked)}/><label htmlFor="zeroFee">Only verified ₹0 application fees</label></div>
              <div className="jp-zero"><label style={{margin:0,fontWeight:800}}>Notification:</label><select value={status} onChange={e=>setStatus(e.target.value)} style={{border:"1px solid #dce4ee",borderRadius:7,padding:"6px 8px",background:"#fff",fontSize:12}}><option>All</option><option value="verified">Officially verified only</option></select><span className="jp-muted">Status verification will be connected to live feeds</span></div>
            </div>

            <div className="jp-panel" id="vacancies" style={{marginTop:14}}>
              <div className="jp-sectionhead"><div><h2>Latest & Popular Exams</h2><div className="jp-muted">Select an exam to view eligibility basics and official link</div></div><span className="jp-count">Directory</span></div>
              {filtered.map(item=><article className="jp-vacancy" key={item.exam}>
                <div className="jp-sectionhead" style={{marginBottom:5}}><div className="jp-vtitle">{item.exam}</div><span className="jp-tag">{item.category}</span></div>
                <div className="jp-vmeta"><span className="jp-tag">{item.level}</span><span className="jp-tag">Qualification: {item.qualification}</span></div>
                <div className="jp-vrow"><div><small>Age (indicative; notice may differ)</small><strong>{item.age}</strong></div><div><small>Fee</small><strong>{item.fee}</strong></div><div><small>Verification</small><strong>Not verified</strong></div></div>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"center"}}><button onClick={()=>setSelectedExam(selectedExam===item.exam?null:item.exam)} className="jp-chip">{selectedExam===item.exam?"Hide details":"Eligibility & Details"}</button><a className="jp-link" href={item.url} target="_blank" rel="noopener noreferrer">Official website / Apply ↗</a></div>
                {selectedExam===item.exam&&<div className="jp-note"><strong>Important:</strong> Directory reference only—not a confirmed active vacancy. Unknown age or fee data will not qualify for numeric filters. Verify cutoff date, relaxation, qualification, fees, vacancies and dates in the official notice.</div>}
              </article>)}
              {filtered.length===0&&<div className="jp-note">No matching exams. Try clearing filters or searching another exam name.</div>}
            </div>
          </section>

          <aside className="jp-right">
            <section className="jp-panel">
              <h3 style={{fontSize:15}}>Important Dates</h3>
              <div className="jp-dateitem"><span>Application deadlines</span><strong>Official feed pending</strong></div>
              <div className="jp-dateitem"><span>Exam dates</span><strong>Official feed pending</strong></div>
              <div className="jp-dateitem"><span>Admit card releases</span><strong>Official feed pending</strong></div>
              <div className="jp-note">Verified date alerts and calendar reminders will be enabled with notification data integration.</div>
            </section>
            <section className="jp-panel" id="quicklinks" style={{marginTop:12}}>
              <h3 style={{fontSize:15}}>Quick Links</h3>
              <div className="jp-quick">{quickLinks.map(([title,desc,icon])=><a href={title==="School Exams"?"#school":"#vacancies"} key={title}><span className="jp-qicon">{icon}</span><span><strong>{title}</strong><small>{desc}</small></span></a>)}</div>
            </section>
            <section className="jp-panel" style={{marginTop:12}}>
              <h3 style={{fontSize:15}}>Official Source Check</h3>
              <p className="jp-muted" style={{lineHeight:1.6}}>Vacancy dates, fees and eligibility will only be marked verified after checking the official notice.</p>
              <a className="jp-link" href="https://www.sarkariresult.com/" target="_blank" rel="noopener noreferrer">Sarkari Result ↗</a>
            </section>
          </aside>
        </div>

        <section id="school" style={{marginTop:18}}>
          <div className="jp-sectionhead"><h2 style={{fontSize:18,margin:0}}>School & Entrance Exams</h2><span className="jp-muted">Class 9–12 · Boards · Entrance</span></div>
          <div className="jp-bottomcats">{["UP Board","CBSE","ICSE","NEET / JEE","CUET","NVS / JNVST","Sainik School","Other Boards","School Results","Admit Cards"].map((name,i)=><button className="jp-bottomcat" key={name} onClick={()=>{setCategory(name==="NEET / JEE"||name==="CUET"?"Entrance":"School Exams");setSearch(name);document.getElementById("exam-list")?.scrollIntoView({behavior:"smooth"});}}><span>{["🏫","📘","📗","🧪","🎓","🏫","🛡️","📚","✓","▣"][i]}</span><strong>{name}</strong></button>)}</div>
        </section>
        <footer style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",borderTop:"1px solid #e2e8f0",marginTop:20,paddingTop:14,color:"#75849a",fontSize:11}}>CSCSKB Online · Jobs & Exams <span>Always verify eligibility and dates from the official notification.</span></footer>
      </div>
    </main>
  );
}
