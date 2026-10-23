"use client";

import { useState } from "react";

const links = [
  ["Latest Jobs", "नई सरकारी भर्तियाँ", "भर्ती नोटिफिकेशन, पात्रता और आवेदन लिंक", "📢"],
  ["Eligibility Checker", "पात्रता जाँच", "उम्र, योग्यता और भर्ती के नियम समझें", "✓"],
  ["Document Verification", "दस्तावेज़ जाँच", "मार्कशीट, फोटो और हस्ताक्षर की checklist", "▤"],
  ["AI Counselling", "आवेदन सहायता", "फॉर्म भरने और अगले कदमों में मदद", "☏"],
];

export default function JobsPreviewPage() {
  const [files, setFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(["नमस्ते! मैं Jobs & Exams Assistant का preview हूँ। यहाँ आप फाइल जोड़ने और checklist का demo देख सकते हैं।"]);
  function addFiles(event) {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter((f) => /\.(pdf|png|jpe?g|webp|docx?)$/i.test(f.name));
    setFiles((old) => [...old, ...valid.filter((f) => !old.some((x) => x.name === f.name && x.size === f.size))]);
    event.target.value = "";
  }
  function send() {
    if (!question.trim()) return;
    setMessages((old) => [...old, "आप: " + question.trim(), "Demo: यह preview अभी वास्तविक AI/API से जुड़ा नहीं है। असली उत्तर और document matching लागू करने के बाद उपलब्ध होंगे।"]);
    setQuestion("");
  }
  const fmt = (n) => n < 1024 * 1024 ? Math.max(1, Math.round(n / 1024)) + " KB" : (n / 1024 / 1024).toFixed(1) + " MB";
  return <main style={{minHeight:"100vh",background:"#f3f7fc",color:"#142849",fontFamily:"Arial, sans-serif"}}>
    <header style={{background:"#fff",borderBottom:"1px solid #dbe5f2",padding:"16px 4vw",display:"flex",gap:24,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
      <div><div style={{fontSize:26,fontWeight:800,color:"#0755ad"}}>CSC <span style={{color:"#15966b"}}>SKB</span> Online</div><div style={{fontSize:13,color:"#52647c"}}>Education &amp; Government Portal</div></div>
      <nav style={{display:"flex",gap:20,flexWrap:"wrap",fontSize:14}}><a href="/">Home</a><b style={{color:"#075fe4"}}>Jobs &amp; Exams</b><a href="/jobs">Results &amp; Updates</a><a href="/jobs">Admit Card</a><a href="/jobs">AI Help</a></nav>
    </header>
    <div style={{maxWidth:1400,margin:"24px auto",padding:"0 20px",display:"grid",gridTemplateColumns:"minmax(0,1.25fr) minmax(340px,.8fr)",gap:18}}>
      <section>
        <div style={{padding:"30px",borderRadius:18,background:"linear-gradient(115deg,#dceeff,#f5fbff)",border:"1px solid #d2e6fb"}}>
          <span style={{fontSize:12,fontWeight:700,color:"#0863c8"}}>CSC SKB ONLINE • EDUCATION &amp; GOVERNMENT PORTAL</span>
          <h1 style={{fontSize:"clamp(32px,4vw,48px)",margin:"14px 0 10px",lineHeight:1.1}}>Jobs &amp; Exams Help</h1>
          <p style={{fontSize:17,lineHeight:1.65,margin:0,color:"#405574"}}>Latest government jobs • Eligibility check • Document verification • Results • Admit cards • Application guidance</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,marginTop:14}}>
          {links.map(([title,hi,desc,icon],i)=><article key={title} style={{background:["#e6f2ff","#e7f8ee","#fff5dc","#f0edff"][i],padding:18,borderRadius:14,minHeight:120}}><div style={{fontSize:25,fontWeight:800}}>{icon}</div><h3 style={{margin:"10px 0 5px",fontSize:17}}>{title}</h3><b style={{fontSize:13}}>{hi}</b><p style={{margin:"6px 0 0",fontSize:13,lineHeight:1.45,color:"#52647c"}}>{desc}</p></article>)}
        </div>
        <div style={{background:"#fff",border:"1px solid #dce6f2",borderRadius:16,padding:20,marginTop:16}}>
          <h2 style={{margin:"0 0 4px",fontSize:22}}>📎 Upload Your Documents</h2><p style={{color:"#65758d",fontSize:14,margin:"6px 0 16px"}}>PDF, JPG, PNG, WebP, DOC और DOCX • फाइल चुनते ही सूची में जुड़ जाएगी।</p>
          <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:22,border:"2px dashed #9dbff4",borderRadius:12,background:"#f7fbff",cursor:"pointer",fontWeight:700,color:"#0755ad"}}><span style={{fontSize:28}}>📎</span><span>Click to attach files<br/><small style={{fontWeight:400,color:"#64748b"}}>एक से अधिक फाइल जोड़ सकते हैं</small><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" onChange={addFiles} style={{display:"none"}}/></span></label>
          <h3 style={{fontSize:15,margin:"18px 0 10px"}}>Attached files ({files.length})</h3>
          {files.length===0?<p style={{padding:16,background:"#f8fafc",borderRadius:10,color:"#6b7890",fontSize:14}}>अभी कोई फाइल नहीं जोड़ी गई है। 📎 पर टैप करके फाइल चुनें।</p>:files.map((file,i)=><div key={file.name+file.size} style={{display:"flex",alignItems:"center",gap:12,padding:12,border:"1px solid #e2e8f0",borderRadius:10,marginTop:8}}><span style={{fontSize:24}}>{/\.pdf$/i.test(file.name)?"📕":/\.(png|jpe?g|webp)$/i.test(file.name)?"🖼️":"📄"}</span><div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,overflowWrap:"anywhere"}}>{file.name}</div><small style={{color:"#64748b"}}>{fmt(file.size)} • चुनी गई फाइल</small></div><button onClick={()=>setFiles(old=>old.filter((_,j)=>j!==i))} style={{background:"#fff1f2",border:"1px solid #fecdd3",color:"#c81e3a",borderRadius:8,padding:"8px 12px",cursor:"pointer"}}>✕ Remove</button></div>)}
          <p style={{fontSize:12,color:"#718096",marginBottom:0}}>नोट: यह UI preview है। अभी फाइलें केवल इस browser session में चुनी जाती हैं; server upload या असली AI verification सक्रिय नहीं है।</p>
        </div>
      </section>
      <aside style={{background:"#fff",border:"1px solid #dce6f2",borderRadius:16,padding:18,alignSelf:"start"}}>
        <div style={{background:"#e8f2ff",padding:14,borderRadius:12,fontSize:20,fontWeight:800}}>🤖 Ask AI – Jobs &amp; Exams Assistant <span style={{fontSize:12,color:"#16845b",float:"right"}}>Preview</span></div>
        <div style={{padding:"12px 4px",minHeight:110}}>{messages.map((m,i)=><div key={i} style={{background:i%2?"#f4f7fb":"#eef6ff",padding:12,borderRadius:10,margin:"8px 0",fontSize:14,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{m}</div>)}</div>
        <div style={{border:"1px solid #dce6f2",borderRadius:12,overflow:"hidden",marginTop:10}}>
          <div style={{padding:13,fontWeight:800,background:"#f0faf5"}}>☑ Document Verification Checklist</div>
          {["नाम का मिलान","पिता/माता के नाम का मिलान","जन्मतिथि (DOB)","मार्कशीट/योग्यता","फोटो की स्पष्टता","हस्ताक्षर की उपलब्धता"].map((label,i)=><div key={label} style={{display:"flex",gap:10,alignItems:"center",padding:"11px 12px",borderTop:"1px solid #edf1f6",fontSize:14}}><span style={{color:"#718096",fontWeight:800}}>⚪</span><span style={{flex:1}}>{label}</span><span style={{color:"#6b7890",fontSize:12}}>जाँच बाकी</span></div>)}
          <div style={{padding:12,fontSize:12,color:"#64748b",background:"#f8fafc"}}>✓ Match • ✕ Mismatch • ⚠️ Manual review — असली जाँच लागू होने पर status दिखेगा।</div>
        </div>
        <form onSubmit={(e)=>{e.preventDefault();send();}} style={{display:"flex",gap:8,marginTop:14}}><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="भर्ती या पात्रता के बारे में पूछें…" style={{minWidth:0,flex:1,border:"1px solid #cbd5e1",borderRadius:10,padding:12,fontSize:14}}/><button type="submit" style={{background:"#075fe4",color:"#fff",border:0,borderRadius:10,padding:"0 15px",fontSize:18,cursor:"pointer"}} aria-label="Send">➤</button></form>
      </aside>
    </div>
    <footer style={{textAlign:"center",padding:"20px",fontSize:12,color:"#718096"}}>CSC SKB Online • Education &amp; Government Portal • Layout preview only</footer>
    <style jsx>{`@media(max-width:850px){main>div{grid-template-columns:1fr!important} header nav{gap:12px!important}}a{color:inherit;text-decoration:none}a:hover{color:#075fe4}`}</style>
  </main>;
}
