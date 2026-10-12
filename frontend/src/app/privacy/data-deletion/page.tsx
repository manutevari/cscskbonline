"use client";

import { FormEvent, useState } from "react";

export default function DataDeletionPage() {
  const [requestType, setRequestType] = useState("personal_data_deletion");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [details, setDetails] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/privacy/data-deletion", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType, name, email, mobile, details, consent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request could not be submitted.");
      setSuccess(data.message + (data.requestId ? " Reference: " + data.requestId : ""));
      setName(""); setEmail(""); setMobile(""); setDetails(""); setConsent(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request could not be submitted.");
    } finally { setBusy(false); }
  };

  return (
    <main style={{minHeight:"100vh",background:"#f3f7f4",padding:"32px 16px",color:"#17251f"}}>
      <section style={{maxWidth:720,margin:"0 auto",background:"#fff",border:"1px solid #dbe7df",borderRadius:20,padding:24,boxShadow:"0 12px 36px #102d7512"}}>
        <a href="/" style={{color:"#176b4d",fontWeight:700,textDecoration:"none"}}>← CSCSKB Online</a>
        <p style={{margin:"22px 0 6px",fontSize:12,fontWeight:800,letterSpacing:".12em",color:"#176b4d"}}>PRIVACY CENTRE</p>
        <h1 style={{fontSize:28,lineHeight:1.2,margin:"0 0 12px"}}>Personal Data Request</h1>
        <p style={{lineHeight:1.7,color:"#4c6257"}}>आप चैट में दिखाई देने वाली बातचीत को <strong>“चैट मिटाएँ”</strong> बटन से अपने वर्तमान session में साफ़ कर सकते हैं। अपने व्यक्तिगत डेटा से संबंधित अनुरोध भेजने के लिए यह फॉर्म इस्तेमाल करें।</p>
        <div style={{padding:14,background:"#fff8e7",border:"1px solid #f0d9a4",borderRadius:12,fontSize:13,lineHeight:1.6,margin:"16px 0"}}>
          <strong>महत्वपूर्ण:</strong> अनुरोध भेजने से डेटा अपने-आप नहीं मिटता। पहचान और रिकॉर्ड की जाँच के बाद टीम लागू कानून तथा आवश्यक रिकॉर्ड-रिटेंशन के अनुसार कार्रवाई करेगी। इस फॉर्म में Aadhaar number, OTP, password, UPI PIN या bank details न लिखें।
        </div>
        <form onSubmit={submit} style={{display:"grid",gap:14}}>
          <label style={{display:"grid",gap:6,fontWeight:700,fontSize:14}}>Request type
            <select value={requestType} onChange={e=>setRequestType(e.target.value)} style={inputStyle}>
              <option value="personal_data_deletion">Request deletion of my personal data</option>
              <option value="access_or_correction">Ask about / correct my personal data</option>
            </select>
          </label>
          <label style={{display:"grid",gap:6,fontWeight:700,fontSize:14}}>Name (optional)
            <input value={name} onChange={e=>setName(e.target.value)} maxLength={100} style={inputStyle} autoComplete="name" />
          </label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            <label style={{display:"grid",gap:6,fontWeight:700,fontSize:14}}>Email (provide email or mobile)
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} style={inputStyle} autoComplete="email" />
            </label>
            <label style={{display:"grid",gap:6,fontWeight:700,fontSize:14}}>Mobile (provide email or mobile)
              <input inputMode="tel" value={mobile} onChange={e=>setMobile(e.target.value.replace(/[^0-9+ ]/g,"").slice(0,20))} maxLength={20} style={inputStyle} autoComplete="tel" />
            </label>
          </div>
          <label style={{display:"grid",gap:6,fontWeight:700,fontSize:14}}>Details (optional; do not include sensitive IDs)
            <textarea value={details} onChange={e=>setDetails(e.target.value)} maxLength={1000} rows={4} style={{...inputStyle,resize:"vertical"}} placeholder="For example, appointment date or the type of information you are referring to." />
          </label>
          <label style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:13,lineHeight:1.6}}>
            <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required style={{marginTop:4}} />
            I confirm that the contact details are mine or I am authorised to use them, and I have read the notice above. I understand that the team may contact me to verify my identity and that some records may need to be retained where required by law.
          </label>
          {error && <p role="alert" style={{color:"#b42318",background:"#fff1f0",padding:12,borderRadius:8}}>{error}</p>}
          {success && <p role="status" style={{color:"#176b4d",background:"#eaf7ef",padding:12,borderRadius:8}}>{success}</p>}
          <button disabled={busy} type="submit" style={{border:0,borderRadius:10,padding:"13px 16px",background:"#176b4d",color:"#fff",fontWeight:800,cursor:busy?"wait":"pointer",opacity:busy?.7:1}}>{busy?"Submitting…":"Submit privacy request"}</button>
        </form>
        <p style={{fontSize:12,color:"#65776d",lineHeight:1.6,marginTop:18}}>This form records a request; it does not promise immediate or automatic deletion. Please contact the CSC centre directly if the form is unavailable.</p>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {width:"100%",boxSizing:"border-box",border:"1px solid #cbd8d0",borderRadius:9,padding:"11px 12px",font:"inherit",fontWeight:400,color:"#17251f",background:"#fff"};
