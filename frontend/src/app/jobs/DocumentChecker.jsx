"use client";

import { useMemo, useState } from "react";

const examOptions = {
  SSC: [
    ["CGL", "SSC CGL"],
    ["CHSL", "SSC CHSL"],
    ["MTS", "SSC MTS / Havaldar"],
    ["GD", "SSC GD Constable"],
    ["CPO", "SSC CPO SI"],
    ["JE", "SSC JE"],
    ["STENO", "SSC Stenographer"],
    ["SELECTION_POST", "SSC Selection Post"],
    ["JHT", "SSC JHT / Hindi Translator"]
  ],
  UPSSSC: [["PET", "UPSSSC PET / अन्य भर्तियाँ"]],
  UPPSC: [["PCS", "UPPSC PCS / अन्य भर्तियाँ"]],
  RRB: [["NTPC", "RRB NTPC / अन्य भर्तियाँ"], ["GROUP_D", "RRB Group D"], ["ALP", "RRB ALP"]],
  UPPOLICE: [["CONSTABLE", "UP Police Constable / अन्य भर्तियाँ"]],
  OTHER: [["OTHER", "अन्य परीक्षा"]]
};

const portals = {
  SSC: "https://ssc.gov.in/",
  UPSSSC: "https://upsssc.gov.in/",
  UPPSC: "https://uppsc.up.nic.in/",
  RRB: "https://www.rrbapply.gov.in/",
  UPPOLICE: "https://uppbpb.gov.in/",
  OTHER: "https://ssc.gov.in/"
};

function splitChunks(text, maxWords = 500, overlap = 40) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let start = 0; start < words.length; start += maxWords - overlap) {
    chunks.push({ index: chunks.length + 1, text: words.slice(start, start + maxWords).join(" "), words: Math.min(maxWords, words.length - start) });
  }
  return chunks;
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim().replace(/\s{2,}/g, " ");
  }
  return "";
}

function extractFields(text, filename) {
  const normalized = text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ");
  const max = firstMatch(normalized, [/(?:maximum marks|total maximum marks|max\. marks|full marks|कुल पूर्णांक|पूर्णांक)\s*[:：-]?\s*([\d,]+)/i]);
  const obtained = firstMatch(normalized, [/(?:marks obtained|total marks obtained|obtained marks|कुल प्राप्तांक|प्राप्तांक|प्राप्त अंक)\s*[:：-]?\s*([\d,]+)/i]);
  const maxN = Number((max || "").replace(/,/g, ""));
  const obtainedN = Number((obtained || "").replace(/,/g, ""));
  const percent = maxN > 0 && Number.isFinite(obtainedN) && obtainedN <= maxN ? (obtainedN / maxN * 100).toFixed(2) : "";
  return [
    ["दस्तावेज़ फ़ाइल", filename],
    ["उम्मीदवार का नाम", firstMatch(normalized, [/(?:candidate name|student name|name of candidate|name)\s*[:：-]?\s*([A-Z][A-Z .'-]{2,})/i, /(?:अभ्यर्थी का नाम|विद्यार्थी का नाम|नाम)\s*[:：-]?\s*([^\n]{3,60})/i])],
    ["पिता का नाम", firstMatch(normalized, [/(?:father'?s name|father name)\s*[:：-]?\s*([^\n]{3,60})/i, /पिता का नाम\s*[:：-]?\s*([^\n]{3,60})/i])],
    ["माता का नाम", firstMatch(normalized, [/(?:mother'?s name|mother name)\s*[:：-]?\s*([^\n]{3,60})/i, /माता का नाम\s*[:：-]?\s*([^\n]{3,60})/i])],
    ["जन्मतिथि", firstMatch(normalized, [/(?:date of birth|dob|birth date)\s*[:：-]?\s*([\d./-]{6,12})/i, /जन्म तिथि\s*[:：-]?\s*([\d./-]{6,12})/i])],
    ["कोर्स / डिग्री", firstMatch(normalized, [/(\bB\.?Ed\.?\b|\bD\.?El\.?Ed\.?\b|\bBTC\b|\bB\.A\.?\b|\bB\.Sc\.?\b|\bM\.A\.?\b|\bM\.Sc\.?\b|\bM\.Com\.?\b|\bB\.Com\b)/i])],
    ["परीक्षा / मार्कशीट वर्ष", firstMatch(normalized, [/(?:exam year|year of passing|passing year|session|वर्ष|उत्तीर्ण वर्ष)\s*[:：-]?\s*(20\d{2}(?:[-/ ]20?\d{2})?)/i])],
    ["रोल नंबर", firstMatch(normalized, [/(?:roll no\.?|roll number|रोल नंबर)\s*[:：-]?\s*([A-Z0-9/-]{3,25})/i])],
    ["एनरोलमेंट / रजिस्ट्रेशन नंबर", firstMatch(normalized, [/(?:enrol(?:l)?ment no\.?|registration no\.?|enrollment number|रजिस्ट्रेशन नंबर|नामांकन संख्या)\s*[:：-]?\s*([A-Z0-9/-]{3,30})/i])],
    ["मार्कशीट सीरियल / प्रमाणपत्र नंबर", firstMatch(normalized, [/(?:serial no\.?|certificate no\.?|marksheet no\.?|serial number|प्रमाणपत्र संख्या|क्रमांक)\s*[:：-]?\s*([A-Z0-9/-]{3,30})/i])],
    ["कुल अधिकतम अंक", max],
    ["कुल प्राप्त अंक", obtained],
    ["गणना की गई प्रतिशत", percent ? percent + "%" : ""]
  ];
}

export default function DocumentChecker() {
  const [consent, setConsent] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [board, setBoard] = useState("SSC");
  const [exam, setExam] = useState("CGL");
  const [openingFilter, setOpeningFilter] = useState("all");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewDecision, setReviewDecision] = useState("recheck");

  const styles = {
    panel: { margin: "28px 0", padding: "clamp(16px,3vw,26px)", borderRadius: 20, border: "1px solid rgba(156,245,111,.28)", background: "linear-gradient(145deg,rgba(13,40,73,.96),rgba(8,24,46,.98))", color: "#f8fbff", boxShadow: "0 16px 42px rgba(0,0,0,.18)" },
    label: { display: "grid", gap: 7, color: "#c8d8ee", fontSize: ".88rem", fontWeight: 700 },
    select: { width: "100%", padding: "12px 13px", borderRadius: 10, border: "1px solid rgba(255,255,255,.18)", background: "#0b2043", color: "white", minHeight: 44 },
    button: { border: 0, borderRadius: 10, padding: "11px 14px", background: "#ff8a00", color: "#1b1100", fontWeight: 900, cursor: "pointer" },
    subtleButton: { border: "1px solid rgba(255,255,255,.22)", borderRadius: 10, padding: "10px 13px", background: "#15365b", color: "#fff", fontWeight: 800, cursor: "pointer" },
    card: { padding: 14, borderRadius: 13, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.12)", minWidth: 0 },
    muted: { color: "#a9bdd8", fontSize: ".84rem", lineHeight: 1.55 }
  };

  const selectedExam = useMemo(() => (examOptions[board] || examOptions.OTHER).find((item) => item[0] === exam)?.[1] || "अन्य परीक्षा", [board, exam]);

  function changeBoard(value) {
    setBoard(value);
    setExam((examOptions[value] || examOptions.OTHER)[0][0]);
  }

  function grantConsent() {
    try { window.localStorage.setItem("csc-document-checker-consent-v1", "granted"); } catch {}
    setConsent(true);
    setNoticeVisible(false);
    setStatus("सहमति दर्ज है। चुनी गई फाइलों की स्थानीय processing शुरू की जा सकती है।");
  }

  function withdrawConsent() {
    try { window.localStorage.removeItem("csc-document-checker-consent-v1"); } catch {}
    setConsent(false);
    setNoticeVisible(true);
    setFiles([]);
    setResults([]);
    setStatus("सहमति वापस ले ली गई है। दस्तावेज़ processing लॉक है।");
  }

  async function processFiles() {
    if (!consent) { setStatus("पहले privacy consent दें।"); return; }
    if (!files.length) { setStatus("पहले मार्कशीट या प्रमाणपत्र चुनें।"); return; }
    setBusy(true);
    setStatus("फाइलें आपके ब्राउज़र में पढ़ी जा रही हैं; कोई फ़ाइल इस चरण में सर्वर पर अपलोड नहीं होती।");
    const next = [];
    try {
      for (const file of files) {
        let text = "";
        let pageCount = 0;
        const lower = file.name.toLowerCase();
        if (lower.endsWith(".pdf")) {
          const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
          const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
          pageCount = pdf.numPages;
          const pages = [];
          for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
            const page = await pdf.getPage(pageNo);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str || "").join(" ").trim();
            pages.push(" [Page " + pageNo + "] " + pageText);
          }
          text = pages.join("\n");
          if (!text.replace(/\[Page \d+\]/g, "").trim()) {
            next.push({ fileName: file.name, text: "", chunks: [], fields: [], pageCount, error: "इस PDF में selectable text नहीं मिला। यह scanned PDF हो सकती है; इस build में scanned-PDF OCR अभी सक्षम नहीं है।" });
            continue;
          }
        } else if (file.type.startsWith("image/")) {
          const Tesseract = await import("tesseract.js");
          const worker = await Tesseract.createWorker("eng");
          try {
            const out = await worker.recognize(file);
            text = out.data.text || "";
          } finally {
            await worker.terminate();
          }
        } else {
          next.push({ fileName: file.name, text: "", chunks: [], fields: [], pageCount: 0, error: "DOC/DOCX फ़ाइल को अभी इस स्थानीय extractor में पढ़ना समर्थित नहीं है। इसे PDF में export करके अपलोड करें।" });
          continue;
        }
        const chunks = splitChunks(text);
        next.push({ fileName: file.name, text, chunks, fields: extractFields(text, file.name), pageCount, error: text.trim() ? "" : "पढ़ने योग्य टेक्स्ट नहीं मिला।" });
      }
      setResults(next);
      const count = next.filter((item) => item.text).length;
      setStatus(count + " फाइलों में से पढ़ने योग्य टेक्स्ट निकाला गया। कृपया निकाले गए फ़ील्ड मूल दस्तावेज़ से सत्यापित करें।");
    } catch (error) {
      setStatus("फाइल processing पूरी नहीं हो सकी: " + (error?.message || "अज्ञात त्रुटि"));
    } finally {
      setBusy(false);
    }
  }

  function clearLocalData() {
    setFiles([]);
    setResults([]);
    setReviewNote("");
    setStatus("इस पेज की चयनित फाइलें, निकाला गया टेक्स्ट और chunks साफ कर दिए गए। बाहरी सेवा को पहले भेजा गया डेटा इससे नहीं मिटता।");
  }

  return (
    <section id="document-checker" style={styles.panel}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: "1 1 320px" }}>
          <span style={{ color: "#9cf56f", fontWeight: 900, letterSpacing: ".1em", fontSize: ".75rem" }}>AI DOCUMENT INTELLIGENCE</span>
          <h2 style={{ margin: "8px 0", fontSize: "clamp(1.5rem,3vw,2.15rem)", color: "white" }}>Eligibility &amp; Certificate Checker</h2>
          <p style={styles.muted}>SSC सहित भर्ती चुनें, मार्कशीट पढ़ें, उपलब्ध फ़ील्ड निकालें और eligibility जाँच की तैयारी करें।</p>
        </div>
        <a href={portals[board]} target="_blank" rel="noreferrer" style={{ ...styles.subtleButton, textDecoration: "none" }}>आधिकारिक {board} पोर्टल ↗</a>
      </div>

      {noticeVisible && !consent && <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid rgba(255,174,0,.45)", background: "rgba(255,138,0,.08)" }}>
        <strong>Privacy और processing consent</strong>
        <p style={styles.muted}>इस prototype में PDF text extraction, image OCR और chunking आपके ब्राउज़र में होती है। इस चरण में फाइलें किसी AI/embedding सेवा को नहीं भेजी जातीं। OCR में गलती हो सकती है; निकाले गए डेटा की जाँच स्वयं करें। भविष्य में external AI/embeddings शुरू करने से पहले अलग अनुमति आवश्यक होगी।</p>
        <p style={styles.muted}>सहमति इस ब्राउज़र में सेव होगी। आप नीचे “सहमति वापस लें” से इसे कभी भी रोक सकते हैं।</p>
        <button type="button" style={styles.button} onClick={grantConsent}>मैं समझता/समझती हूँ और सहमति देता/देती हूँ</button>
        <p style={{ ...styles.muted, marginBottom: 0 }}><a href="/privacy" style={{ color: "#b7d9ff" }}>Privacy Policy पढ़ें</a></p>
      </div>}

      {consent && <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14 }}>
        <span style={{ color: "#9cf56f", fontSize: ".83rem" }}>✓ Consent active · local processing</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/privacy" style={{ color: "#b7d9ff", alignSelf: "center" }}>Privacy Policy</a>
          <button type="button" style={styles.subtleButton} onClick={withdrawConsent}>सहमति वापस लें</button>
        </div>
      </div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 12, marginTop: 18 }}>
        <label style={styles.label}>1. Recruiting body
          <select style={styles.select} value={board} onChange={(event) => changeBoard(event.target.value)} disabled={!consent}>
            <option value="SSC">SSC — Staff Selection Commission</option><option value="UPSSSC">UPSSSC</option><option value="UPPSC">UPPSC</option><option value="RRB">Railway Recruitment Board</option><option value="UPPOLICE">UP Police</option><option value="OTHER">Other</option>
          </select>
        </label>
        <label style={styles.label}>2. Exam / recruitment
          <select style={styles.select} value={exam} onChange={(event) => setExam(event.target.value)} disabled={!consent}>
            {(examOptions[board] || examOptions.OTHER).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label style={styles.label}>3. Current opening status filter
          <select style={styles.select} value={openingFilter} onChange={(event) => setOpeningFilter(event.target.value)} disabled={!consent}>
            <option value="all">सभी उपलब्ध सूचनाएँ</option><option value="open">केवल आवेदन खुले (officially verify करें)</option><option value="upcoming">आगामी / अपेक्षित</option><option value="closed_pending">आवेदन बंद, आगे की प्रक्रिया बाकी</option>
          </select>
        </label>
      </div>
      <div style={{ ...styles.card, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div><strong>{selectedExam}</strong><div style={styles.muted}>Opening status: <b>आधिकारिक स्रोत से सत्यापन आवश्यक</b></div></div>
          <a href={portals[board]} target="_blank" rel="noreferrer" style={{ color: "#b7d9ff" }}>Notification / Apply links ↗</a>
        </div>
        <p style={styles.muted}>इस ड्रॉपडाउन में exam categories उपलब्ध हैं। लाइव application status, dates और vacancies को verified feed से जोड़ना अभी अलग backend कार्य है; इसलिए यहाँ किसी भर्ती को बिना पुष्टि “Open” नहीं बताया जा रहा। चुना गया फ़िल्टर: {({ all: "सभी", open: "आवेदन खुले", upcoming: "आगामी", closed_pending: "आवेदन बंद / प्रक्रिया बाकी" })[openingFilter]}.</p>
      </div>

      <div style={{ marginTop: 18, ...styles.card }}>
        <h3 style={{ marginTop: 0 }}>4. Upload marksheets / certificates</h3>
        <p style={styles.muted}>समर्थित: searchable PDF और JPG/PNG/WebP इमेज। अभी scanned PDF के लिए OCR और DOC/DOCX extraction उपलब्ध नहीं है।</p>
        <input type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" disabled={!consent || busy} onChange={(event) => { setFiles((previous) => [...previous, ...Array.from(event.target.files || []).filter((file) => !previous.some((old) => old.name === file.name && old.size === file.size))]); event.target.value = ""; }} />
        {files.length > 0 && <ul style={{ ...styles.muted, paddingLeft: 20 }}>{files.map((file, index) => <li key={file.name + file.size + index}>{file.name} · {Math.max(1, Math.round(file.size / 1024))} KB</li>)}</ul>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button type="button" style={styles.button} onClick={processFiles} disabled={!consent || busy || !files.length}>{busy ? "Processing…" : "Extract text & fields"}</button>
          <button type="button" style={styles.subtleButton} onClick={clearLocalData}>Clear local data</button>
        </div>
      </div>

      {status && <p role="status" style={{ ...styles.muted, marginTop: 12 }}>{status}</p>}

      {results.map((result) => <div key={result.fileName} style={{ ...styles.card, marginTop: 14 }}>
        <h3 style={{ marginTop: 0, overflowWrap: "anywhere" }}>{result.fileName}</h3>
        {result.error ? <p style={{ color: "#ffd18a" }}>{result.error}</p> : <>
          <p style={styles.muted}>Pages: {result.pageCount || "image"} · Extracted chunks: {result.chunks.length} · Chunk limit 500 words / 40-word overlap</p>
          <h4>Extracted fields — please verify</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 8 }}>
            {result.fields.map(([label, value]) => <div key={label} style={{ padding: 9, borderRadius: 8, background: "rgba(255,255,255,.045)" }}><div style={{ ...styles.muted, fontSize: ".74rem" }}>{label}</div><div style={{ overflowWrap: "anywhere", fontWeight: 700 }}>{value || <span style={{ color: "#ffd18a" }}>Not found — manual entry/review</span>}</div></div>)}
          </div>
          <details style={{ marginTop: 12 }}><summary style={{ cursor: "pointer", fontWeight: 800 }}>Extracted text and source pages देखें</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 320, overflow: "auto", padding: 12, borderRadius: 8, background: "#07172b", color: "#dceeff", fontSize: ".78rem" }}>{result.text}</pre><h4>Chunks</h4>{result.chunks.map((chunk) => <details key={chunk.index} style={{ margin: "8px 0" }}><summary>Chunk {chunk.index} · {chunk.words} words</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{chunk.text}</pre></details>)}</details>
        </>}
      </div>)}

      {results.length > 0 && <div style={{ ...styles.card, marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>5. Human-in-the-Loop review (preview)</h3>
        <p style={styles.muted}>अभी यह review note केवल इस स्क्रीन के demo state में है; इसे server-side review queue में जमा नहीं करता। LLM-based certificate authenticity/eligibility verdict इस चरण में चालू नहीं है।</p>
        <label style={styles.label}>समीक्षा निर्णय
          <select style={styles.select} value={reviewDecision} onChange={(event) => setReviewDecision(event.target.value)}>
            <option value="recheck">दस्तावेज़ दोबारा जाँचें</option><option value="accept">प्रमाण देखकर स्वीकार करें</option><option value="request">स्पष्ट कॉपी माँगें</option><option value="reject">कारण सहित अस्वीकार करें</option>
          </select>
        </label>
        <textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="समीक्षा टिप्पणी (वैकल्पिक)" style={{ width: "100%", minHeight: 80, marginTop: 10, padding: 10, borderRadius: 9, background: "#0b2043", color: "white", border: "1px solid rgba(255,255,255,.2)" }} />
        <p style={styles.muted}>Confidence score अभी उपलब्ध नहीं है; इसे वास्तविक सत्यापित नियमों और दस्तावेज़ प्रमाण के साथ backend में जोड़ना होगा।</p>
      </div>}
    </section>
  );
}
