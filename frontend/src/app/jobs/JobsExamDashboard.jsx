"use client";
import { useMemo, useState } from "react";

const rowsAll = [
{exam:"SSC CGL",cat:"SSC",age:"18–32",fee:"UR/OBC/EWS ₹100 · SC/ST/PwBD/Women exempt",qual:"Graduate",url:"https://ssc.gov.in/"},
{exam:"SSC CHSL",cat:"SSC",age:"18–27",fee:"₹100 · exemptions as notified",qual:"12th",url:"https://ssc.gov.in/"},
{exam:"SSC MTS / Havaldar",cat:"SSC",age:"18–25 / 18–27",fee:"₹100 · exemptions as notified",qual:"10th",url:"https://ssc.gov.in/"},
{exam:"SSC GD Constable",cat:"SSC",age:"18–23",fee:"₹100 · exemptions as notified",qual:"10th",url:"https://ssc.gov.in/"},
{exam:"SSC CPO",cat:"SSC",age:"20–25",fee:"₹100 · exemptions as notified",qual:"Graduate",url:"https://ssc.gov.in/"},
{exam:"SSC Stenographer",cat:"SSC",age:"Notice-based",fee:"See notice",qual:"12th + skill test",url:"https://ssc.gov.in/"},
{exam:"RRB NTPC",cat:"Railway",age:"Notice-based",fee:"Category-wise; see notice",qual:"12th / Graduate by post",url:"https://www.rrbapply.gov.in/"},
{exam:"RRB Group D",cat:"Railway",age:"Notice-based",fee:"Category-wise; see notice",qual:"10th / ITI",url:"https://www.rrbapply.gov.in/"},
{exam:"RRB ALP / Technician",cat:"Railway",age:"Notice-based",fee:"Category-wise; see notice",qual:"ITI / Diploma",url:"https://www.rrbapply.gov.in/"},
{exam:"SBI PO / Clerk",cat:"Banking",age:"Notice-based",fee:"Category-wise; see notice",qual:"Graduate",url:"https://sbi.co.in/web/careers"},
{exam:"IBPS PO / Clerk",cat:"Banking",age:"Notice-based",fee:"Category-wise; see notice",qual:"Graduate",url:"https://www.ibps.in/"},
{exam:"RBI Assistant / Grade B",cat:"Banking",age:"Notice-based",fee:"Category-wise; see notice",qual:"Post-specific",url:"https://www.rbi.org.in/"},
{exam:"LIC AAO / Assistant",cat:"Insurance",age:"Notice-based",fee:"Category-wise; see notice",qual:"Post-specific",url:"https://licindia.in/"},
{exam:"UPPSC PCS",cat:"UP",age:"Notice-based",fee:"Category-wise; see notice",qual:"Graduate",url:"https://uppsc.up.nic.in/"},
{exam:"UPSSSC PET",cat:"UP",age:"Notice-based",fee:"Category-wise; see notice",qual:"As notified",url:"https://upsssc.gov.in/"},
{exam:"UPSSSC Lekhpal / Junior Assistant",cat:"UP",age:"Notice-based",fee:"Category-wise; see notice",qual:"Post-specific",url:"https://upsssc.gov.in/"},
{exam:"UP Police Constable / SI",cat:"UP",age:"Notice-based",fee:"Category-wise; see notice",qual:"12th / Graduate by post",url:"https://uppbpb.gov.in/"},
{exam:"CTET",cat:"Teaching",age:"Verify notice",fee:"Category-wise; see notice",qual:"Teacher qualification",url:"https://ctet.nic.in/"},
{exam:"UPTET / State TET",cat:"Teaching",age:"Notice-based",fee:"Category-wise; see notice",qual:"D.El.Ed / B.Ed etc.",url:"https://updeled.gov.in/"},
{exam:"PRT / TGT / PGT Recruitment",cat:"Teaching",age:"Recruitment-specific",fee:"Category-wise; see notice",qual:"Relevant degree + teacher qualification",url:"https://www.cbse.gov.in/"},
{exam:"Army Agniveer / TES",cat:"Defence",age:"Entry-specific",fee:"See notice",qual:"10th / 12th / PCM by entry",url:"https://joinindianarmy.nic.in/"},
{exam:"Navy / Agniveer",cat:"Defence",age:"Entry-specific",fee:"See notice",qual:"Entry-specific",url:"https://joinindiannavy.gov.in/"},
{exam:"Air Force / Agniveer Vayu",cat:"Defence",age:"Entry-specific",fee:"See notice",qual:"Entry-specific",url:"https://agnipathvayu.cdac.in/"},
{exam:"NDA / CDS",cat:"Defence",age:"Entry-specific",fee:"Exemptions as notified",qual:"12th / Graduate by entry",url:"https://upsc.gov.in/"},
{exam:"NEET / JEE / CUET",cat:"Entrance",age:"Exam-specific",fee:"Category-wise; see notice",qual:"12th / subject-specific",url:"https://nta.ac.in/"},
{exam:"NVS / JNVST",cat:"Entrance",age:"Class-specific",fee:"See notice",qual:"Class-specific",url:"https://navodaya.gov.in/"},
{exam:"UP Board / CBSE / ICSE",cat:"School",age:"Student-specific",fee:"Board-specific",qual:"Class 9–12",url:"https://upmsp.edu.in/"},
{exam:"CCC / CPCT / RSCIT",cat:"Computer",age:"Exam-specific",fee:"Exam-specific",qual:"Exam-specific",url:"https://www.nielit.gov.in/"},
{exam:"High Court / District Court",cat:"Courts",age:"Post-specific",fee:"Category-wise; see notice",qual:"Post-specific",url:"https://www.sci.gov.in/"},
];
const rowsOld = [
{exam:"SSC CGL — Previous cycles",cat:"SSC",age:"Cycle-specific",fee:"Historical notice",qual:"Graduate",url:"https://ssc.gov.in/"},
{exam:"SSC CHSL — Previous cycles",cat:"SSC",age:"Cycle-specific",fee:"Historical notice",qual:"12th",url:"https://ssc.gov.in/"},
{exam:"SSC MTS — Previous cycles",cat:"SSC",age:"Cycle-specific",fee:"Historical notice",qual:"10th",url:"https://ssc.gov.in/"},
{exam:"RRB NTPC — Previous cycles",cat:"Railway",age:"Cycle-specific",fee:"Historical notice",qual:"12th / Graduate",url:"https://www.rrbapply.gov.in/"},
{exam:"UP Police — Previous recruitment",cat:"UP",age:"Cycle-specific",fee:"Historical notice",qual:"Post-specific",url:"https://uppbpb.gov.in/"},
{exam:"UPSSSC — Previous recruitments",cat:"UP",age:"Cycle-specific",fee:"Historical notice",qual:"Post-specific",url:"https://upsssc.gov.in/"},
{exam:"CTET — Previous sessions",cat:"Teaching",age:"Session-specific",fee:"Historical notice",qual:"Teacher qualification",url:"https://ctet.nic.in/"},
{exam:"UPTET — Previous sessions",cat:"Teaching",age:"Session-specific",fee:"Historical notice",qual:"Teacher qualification",url:"https://updeled.gov.in/"},
];
const cats=["All Categories","SSC","Railway","Banking","Insurance","UP","Teaching","Defence","Entrance","School","Computer","Courts"];
const blank="—";

export default function JobsExamDashboard(){
 const [section,setSection]=useState("All"),[category,setCategory]=useState("All Categories"),[search,setSearch]=useState(""),[selected,setSelected]=useState("");
 const base=section==="Old"?rowsOld:rowsAll;
 const filtered=useMemo(()=>base.filter(r=>(category==="All Categories"||r.cat===category)&&(!search.trim()||(r.exam+" "+r.cat+" "+r.qual).toLowerCase().includes(search.trim().toLowerCase()))),[base,category,search]);
 const item=filtered.find(r=>r.exam===selected);
 return <main className="exam-register"><style>{`
 .exam-register{min-height:100vh;background:linear-gradient(135deg,#101827,#1d3048);padding:clamp(12px,2.5vw,30px);font-family:Arial,'Noto Sans Devanagari',sans-serif;color:#14233b}.wrap{max-width:1600px;margin:auto}.head{display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap;color:#f8fafc;margin-bottom:18px}.brand{font-size:13px;font-weight:900;letter-spacing:.14em;color:#cbd5e1}.brand small{display:block;font-size:11px;letter-spacing:.05em;font-weight:500;color:#94a3b8;margin-top:5px}.title{font-size:clamp(25px,3vw,36px);font-weight:900;letter-spacing:-.04em;margin:5px 0}.subtitle{color:#aebed2;font-size:13px}.card{background:#f8fafc;border:1px solid #d9e2ed;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px #0002}.toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:16px;border-bottom:1px solid #dce4ee;background:white}.tabs{display:flex;padding:4px;background:#edf2f7;border-radius:10px;gap:4px}.tabs button{border:0;border-radius:8px;padding:9px 18px;font-weight:800;color:#52657d;background:transparent;cursor:pointer}.tabs button.active{background:#17365f;color:white}.search{flex:1;min-width:180px;border:1px solid #d5deea;border-radius:9px;padding:10px 12px;font-size:14px}.select{border:1px solid #d5deea;border-radius:9px;padding:10px 12px;background:white;color:#1e344f;font-size:13px}.count{font-size:12px;font-weight:800;color:#64748b;margin-left:auto;white-space:nowrap}.scroll{overflow:auto;max-height:calc(100vh - 255px);min-height:350px}.table{border-collapse:separate;border-spacing:0;width:100%;min-width:1500px;font-size:12px;background:white}.table th{position:sticky;top:0;z-index:2;background:#17365f;color:white;text-align:left;padding:13px 12px;font-size:11px;white-space:nowrap}.table td{padding:12px;border-bottom:1px solid #e8edf3;vertical-align:top;color:#33465f;line-height:1.45}.table tbody tr:nth-child(even){background:#f7f9fc}.table tbody tr:hover,.table tbody tr.selected{background:#edf5ff}.name{border:0;background:none;padding:0;color:#164a91;font-weight:900;font-size:13px;text-align:left;cursor:pointer}.sub{font-size:10px;color:#8090a5;margin-top:4px}.fee{min-width:220px;max-width:270px}.pill{display:inline-block;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800;background:#edf1f6;color:#66758a;white-space:nowrap}.link{display:inline-block;background:#e7f0ff;color:#1452a1;border:1px solid #cbdfff;padding:7px 9px;border-radius:7px;text-decoration:none;font-weight:800;white-space:nowrap}.empty{text-align:center!important;padding:45px!important;color:#718096!important}.detail{padding:16px;background:#eef5ff;border-top:1px solid #d7e5f8;display:flex;gap:18px;justify-content:space-between;align-items:center;flex-wrap:wrap}.detail strong{display:block;color:#183c69;margin-bottom:5px}.detail p{margin:0;color:#5c6f87;font-size:12px;line-height:1.5}.note{padding:12px 16px;color:#738298;font-size:11px;background:#f8fafc;border-top:1px solid #e6ebf2}@media(max-width:650px){.toolbar{align-items:stretch}.tabs{width:100%}.tabs button{flex:1}.search,.select{width:100%}.count{margin-left:0}.scroll{max-height:70vh}}`}</style>
 <div className="wrap"><header className="head"><div><div className="brand">CSC SKB ONLINE <small>CAREER DESK · JOBS & EXAMS</small></div><h1 className="title">Exam Register</h1><div className="subtitle">भर्ती और परीक्षाओं की साफ़ spreadsheet-style सूची</div></div><div style={{fontSize:12,color:"#aebed2"}}>Preview only · Production untouched</div></header>
 <section className="card"><div className="toolbar"><div className="tabs" role="tablist">{["All","Old"].map(t=><button key={t} role="tab" aria-selected={section===t} className={section===t?"active":""} onClick={()=>{setSection(t);setSelected("");}}>{t}</button>)}</div><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search SSC, Railway, TGT, exam…" aria-label="Search exams"/><select className="select" value={category} onChange={e=>setCategory(e.target.value)} aria-label="Category filter">{cats.map(c=><option key={c}>{c}</option>)}</select><span className="count">{filtered.length} entries</span></div>
 <div className="scroll"><table className="table"><thead><tr><th>Exam / Recruitment</th><th>Age</th><th>Category-wise Fees</th><th>Qualification</th><th>Form Start</th><th>Last Date</th><th>Correction</th><th>Exam Date</th><th>Admit Card</th><th>Result</th><th>Action</th></tr></thead><tbody>{filtered.map(r=><tr key={r.exam} className={selected===r.exam?"selected":""}><td><button className="name" onClick={()=>setSelected(selected===r.exam?"":r.exam)}>{r.exam}</button><div className="sub">{r.cat}</div></td><td>{r.age||blank}</td><td className="fee">{r.fee||blank}</td><td>{r.qual||blank}</td><td>{r.start||blank}</td><td>{r.last||blank}</td><td>{r.correction||blank}</td><td>{r.examDate||blank}</td><td><span className="pill">{r.admit||"Not announced"}</span></td><td><span className="pill">{r.result||"Not announced"}</span></td><td><a className="link" href={r.url} target="_blank" rel="noopener noreferrer">{section==="Old"?"Archive / Official":"Official portal"} ↗</a></td></tr>)}{!filtered.length&&<tr><td colSpan="11" className="empty">इस category में कोई entry नहीं मिली।</td></tr>}</tbody></table></div>
 {item&&<div className="detail"><div><strong>{item.exam}</strong><p>Category: {item.cat} · Qualification: {item.qual} · Age: {item.age}. Dates/status केवल official notice verify होने पर अपडेट होंगे।</p></div><a className="link" href={item.url} target="_blank" rel="noopener noreferrer">Official source ↗</a></div>}
 <div className="note">यह directory/reference list है। Form dates, exam dates, admit card और result status अभी verified notice के बिना खाली/Not announced हैं। Old में previous-cycle references हैं; cycle-wise archive data बाद में सत्यापित entries से भरेगा।</div></section></div></main>;
}
