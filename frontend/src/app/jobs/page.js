"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [agentMessages, setAgentMessages] = useState([{ role: "assistant", text: "Namaste 🙏 CSCSKB Online के भर्ती एवं दस्तावेज़ सहायक में आपका हार्दिक स्वागत है। कृपया बताइए, मैं आपकी किस प्रकार सहायता कर सकती हूँ?\n\nमैं आपको सरकारी भर्ती के आधिकारिक पोर्टल खोजने, भर्ती का नाम चुनने, रिज्यूमे/दस्तावेज़ अपलोड करने और फोटो को सामान्य रूप से resize/compress करने में मार्गदर्शन दूँगा।\n\nआप किस भर्ती के लिए आवेदन करना चाहते हैं? SSC, UPPSC, UPSSSC, Railway या UP Police चुनें। अपना रिज्यूमे (PDF/DOC/DOCX) भी अटैच कर सकते हैं; इस prototype में फाइल की सामग्री AI द्वारा पढ़ी नहीं जाती।\n\nलाइव पोर्टल लिंक-जाँच उपलब्ध है, लेकिन यह verified vacancy feed नहीं है। कोई vacancy, अंतिम तारीख या पात्रता केवल आधिकारिक notification से सत्यापित करें।" }]);
  const [agentFiles, setAgentFiles] = useState([]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentStep, setAgentStep] = useState("start");
  const [agentTask, setAgentTask] = useState("");
  const [selectedRecruitment, setSelectedRecruitment] = useState("");
  const [documentStage, setDocumentStage] = useState(0);
  const [voiceListening, setVoiceListening] = useState(false);
  const voiceRecognitionRef = useRef(null);
  const voiceSilenceTimerRef = useRef(null);
  const voiceTranscriptRef = useRef("");
  const voiceSessionRef = useRef(false);
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);

  async function refreshLiveRecruitment() {
    setLiveLoading(true);
    setLiveError("");
    try {
      const response = await fetch("/api/recruitment/live", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error("अभी लाइव अपडेट प्राप्त नहीं हो सके।");
      setLiveData(data);
    } catch (error) {
      setLiveError(error.message || "लाइव अपडेट प्राप्त नहीं हो सके। कृपया फिर कोशिश करें।");
    } finally {
      setLiveLoading(false);
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
    refreshLiveRecruitment();
    const timer = window.setInterval(refreshLiveRecruitment, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);
  

  function addAgentMessage(role, text) {
    setAgentMessages((previous) => [...previous, { role, text }]);
  }

  function handleAgentFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const allowed = files.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) || [".pdf", ".doc", ".docx"].some((ext) => file.name.toLowerCase().endsWith(ext)));
    const rejected = files.filter((file) => !allowed.includes(file));
    if (rejected.length) addAgentMessage("assistant", "इन फाइलों का यह संस्करण समर्थन नहीं करता: " + rejected.map((f) => f.name).join(", ") + "। कृपया रिज्यूमे/दस्तावेज़ के लिए PDF, DOC, DOCX या इमेज के लिए JPG, PNG, WebP चुनें।");
    if (allowed.length) {
      setAgentFiles((previous) => [...previous, ...allowed.filter((file) => !previous.some((old) => old.name === file.name && old.size === file.size))]);
      allowed.forEach((file) => {
        addAgentMessage("user", "📎 " + file.name);
        if (file.type.startsWith("image/")) {
          addAgentMessage("assistant", "फोटो/इमेज मिल गई। मैं इसे ब्राउज़र में resize और compress कर सकता हूँ। पहले बताइए—किस दस्तावेज़ के लिए चाहिए: फोटो, हस्ताक्षर या प्रमाणपत्र?");
          setAgentStep("image-purpose");
        } else {
          addAgentMessage("assistant", /\\.(doc|docx)$/i.test(file.name) ? "आपकी फाइल मिल गई: " + file.name + "। यह रिज्यूमे/दस्तावेज़ के रूप में अटैच हुई है। इस prototype में मैं फाइल की सामग्री पढ़ या नौकरी के लिए उसका मिलान स्वतः नहीं कर सकता। अब बताइए, किस भर्ती के लिए आवेदन करना है?" : "PDF फाइल मिल गई: " + file.name + "। इस prototype में PDF का पूरा टेक्स्ट स्वतः नहीं पढ़ा जाता। कृपया भर्ती का नाम चुनें और notification में दिए नियम लिखें; मैं अगले कदम बताऊँगा।");
          setAgentStep("requirements");
        }
      });
    }
    event.target.value = "";
  }

  async function compressSelectedImages() {
    const images = agentFiles.filter((file) => file.type.startsWith("image/"));
    if (!images.length) {
      addAgentMessage("assistant", "पहले JPG, PNG या WebP इमेज अटैच करें।");
      return;
    }
    setAgentBusy(true);
    addAgentMessage("assistant", "इमेज को आपके ब्राउज़र में प्रोसेस कर रहा हूँ…");
    try {
      for (const file of images) {
        const source = URL.createObjectURL(file);
        try {
          const img = new Image();
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = source; });
          const maxDimension = 1600;
          const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas उपलब्ध नहीं है");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
          if (!blob) throw new Error("इमेज तैयार नहीं हो सकी");
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = file.name.replace(/\\.[^.]+$/, "") + "-optimized.jpg";
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          addAgentMessage("assistant", file.name + " प्रोसेस हो गई: " + canvas.width + "×" + canvas.height + " px; " + Math.round(file.size / 1024) + " KB से " + Math.round(blob.size / 1024) + " KB। डाउनलोड शुरू किया गया।");
        } finally {
          URL.revokeObjectURL(source);
        }
      }
      addAgentMessage("assistant", "ध्यान दें: यह सामान्य image optimization है, भर्ती की आधिकारिक size/dimension requirement की पुष्टि नहीं। अपलोड करने से पहले notification से मिलान करें।");
    } catch (error) {
      addAgentMessage("assistant", "इमेज प्रोसेस नहीं हो सकी। कृपया JPG/PNG/WebP फाइल दोबारा चुनें।");
    } finally {
      setAgentBusy(false);
    }
  }

  async function askConversationAgent(message) {
    if (!privacyConsent) {
      addAgentMessage("assistant", "कृपया पहले गोपनीयता सूचना पढ़कर सहमति दें। इसके बिना आपका संदेश AI सेवा को नहीं भेजा जाएगा।");
      return;
    }
    setAgentBusy(true);
    try {
      const history = [...agentMessages, { role: "user", text: message }]
        .filter((item) => (item.role === "user" || item.role === "assistant") && !item.text.startsWith("📎 "))
        .slice(-12)
        .map((item) => ({ role: item.role, content: item.text }));
      const response = await fetch("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, privacyConsent }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "AI service unavailable");
      addAgentMessage("assistant", data.reply);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const spoken = new SpeechSynthesisUtterance(data.reply);
        spoken.lang = /[\\u0900-\\u097F]/.test(data.reply) ? "hi-IN" : "en-IN";
        spoken.rate = 1;
        spoken.onend = () => { if (voiceSessionRef.current) window.setTimeout(() => startVoiceInput(), 350); };
        window.speechSynthesis.speak(spoken);
      }
    } catch (error) {
      addAgentMessage("assistant", error.message || "AI से संपर्क नहीं हो पाया। कृपया OPENROUTER_API_KEY सेट है या नहीं, यह जाँचें।");
    } finally {
      setAgentBusy(false);
    }
  }

  function stopVoiceSession() {
    voiceSessionRef.current = false;
    if (voiceSilenceTimerRef.current) window.clearTimeout(voiceSilenceTimerRef.current);
    voiceSilenceTimerRef.current = null;
    if (voiceRecognitionRef.current) { try { voiceRecognitionRef.current.stop(); } catch {} }
    voiceRecognitionRef.current = null;
    setVoiceListening(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function startVoiceInput() {
    if (!privacyConsent) { addAgentMessage("assistant", "कृपया पहले गोपनीयता सूचना पढ़कर सहमति दें। इसके बिना voice assistant शुरू नहीं होगा।"); return; }
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { addAgentMessage("assistant", "इस browser में voice recognition उपलब्ध नहीं है। Chrome में microphone permission दें, या संदेश टाइप करें।"); return; }
    voiceSessionRef.current = true;
    voiceTranscriptRef.current = "";
    const recognition = new SpeechRecognition();
    voiceRecognitionRef.current = recognition;
    recognition.lang = "hi-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceListening(true);
    recognition.onend = () => { setVoiceListening(false); if (voiceRecognitionRef.current === recognition) voiceRecognitionRef.current = null; };
    recognition.onerror = (event) => {
      if (voiceSilenceTimerRef.current) window.clearTimeout(voiceSilenceTimerRef.current);
      voiceSilenceTimerRef.current = null; setVoiceListening(false);
      if (event.error !== "no-speech" && event.error !== "aborted") addAgentMessage("assistant", "माइक से आवाज़ नहीं मिली। Microphone permission और इंटरनेट जाँचें, फिर दोबारा कोशिश करें।");
    };
    recognition.onresult = (event) => {
      let heardSpeech = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i] && event.results[i][0] ? event.results[i][0].transcript.trim() : "";
        if (transcript) { heardSpeech = true; if (event.results[i].isFinal) voiceTranscriptRef.current = (voiceTranscriptRef.current + " " + transcript).trim(); }
      }
      if (heardSpeech) {
        if (voiceSilenceTimerRef.current) window.clearTimeout(voiceSilenceTimerRef.current);
        voiceSilenceTimerRef.current = window.setTimeout(() => {
          const spokenText = voiceTranscriptRef.current.trim(); voiceSilenceTimerRef.current = null;
          if (voiceRecognitionRef.current === recognition) { try { recognition.stop(); } catch {} }
          if (spokenText && voiceSessionRef.current) { addAgentMessage("user", "🎙️ " + spokenText); askConversationAgent(spokenText); }
        }, 2000);
      }
    };
    try { recognition.start(); addAgentMessage("assistant", "🎙️ सुन रहा हूँ… बोलना पूरा होने के बाद 2 सेकंड रुकें; संदेश अपने-आप भेज दिया जाएगा। Voice बंद करने के लिए बटन फिर दबाएँ।"); }
    catch { voiceSessionRef.current = false; setVoiceListening(false); addAgentMessage("assistant", "माइक शुरू नहीं हो पाया। कृपया दोबारा कोशिश करें।"); }
  }
  function sendAgentMessage(event) {
    event.preventDefault();
    const message = agentInput.trim();
    if (!message || agentBusy) return;
    addAgentMessage("user", message);
    setAgentInput("");
    askConversationAgent(message);
  }
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
        <strong>महत्वपूर्ण सूचना:</strong> यह पोर्टल पाँच आधिकारिक भर्ती वेबसाइटों को चेक करके कुछ भर्ती/परीक्षा-संबंधी लिंक पहचानने की कोशिश करता है। यह verified vacancy/result feed या आधिकारिक API नहीं है। लिंक छूट सकते हैं या अप्रासंगिक हो सकते हैं; अंतिम तारीख, पात्रता, आयु-सीमा और परिणाम हमेशा आधिकारिक नोटिस से सत्यापित करें।
      </section>

      <JobsExamDashboard />

      <section className="section-block live-recruitment" aria-live="polite">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LIVE OFFICIAL PORTAL CHECK</span>
            <h2>Live Recruitment &amp; Exam Updates</h2>
            <p>आधिकारिक भर्ती पोर्टलों को सीधे अभी चेक किया जा रहा है। पेज खुला रहने पर हर 5 मिनट में फिर से जाँच होगी।</p>
          </div>
          <button type="button" className="live-refresh" onClick={refreshLiveRecruitment} disabled={liveLoading}>
            {liveLoading ? "जाँच जारी है…" : "↻ अभी अपडेट जाँचें"}
          </button>
        </div>
        {liveError && <p className="live-error" role="status">{liveError}</p>}
        {!liveData && liveLoading && <p className="jobs-empty">Namaste 🙏 कृपया प्रतीक्षा करें—आधिकारिक पोर्टल चेक किए जा रहे हैं…</p>}
        {liveData && <>
          <p className="live-meta">पिछली जाँच: {new Date(liveData.checkedAt).toLocaleString("hi-IN")} · मिले लिंक: {liveData.totalUpdates}</p>
          <div className="portal-grid">
            {liveData.portals.map((portal) => <article className="portal-card" key={portal.name}>
              <span className="eyebrow">{portal.category}</span>
              <h3>{portal.name}</h3>
              <p>{portal.status === "checked" ? "पोर्टल से अभी संपर्क हुआ" : "यह पोर्टल अभी उपलब्ध नहीं है"}</p>
              {portal.updates.length > 0
                ? <div className="portal-links">{portal.updates.map((item, index) => <a key={item.url + index} href={item.url} target="_blank" rel="noreferrer">{item.title} ↗</a>)}</div>
                : <p className="jobs-empty">{portal.status === "checked" ? "मुख्य पेज पर पहचानने योग्य भर्ती/परीक्षा लिंक नहीं मिले। आधिकारिक वेबसाइट खोलकर नवीनतम नोटिस देखें।" : "कृपया नीचे आधिकारिक वेबसाइट खोलकर देखें।"}</p>}
              <div className="portal-links"><a href={portal.url} target="_blank" rel="noreferrer">आधिकारिक पोर्टल खोलें ↗</a></div>
            </article>)}
          </div>
          <p className="live-disclaimer">ध्यान दें: यह लाइव वेबसाइट-जाँच है, आधिकारिक भर्ती डेटाबेस/API नहीं। यह पेज पर दिखने वाले लिंक पहचानता है; इससे vacancy की स्थिति, अंतिम तारीख या पात्रता की पुष्टि नहीं होती। अंतिम जानकारी आधिकारिक notification से जाँचें।</p>
        </>}
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

      <div className="jobs-agent-root">
        {agentOpen && <section className="jobs-agent-panel" aria-label="Recruitment document assistant">
          <header className="jobs-agent-header">
            <div><strong>Recruitment Assistant</strong><small>दस्तावेज़ सहायता · प्रारंभिक संस्करण</small></div>
            <button type="button" aria-label="चैट बंद करें" onClick={() => setAgentOpen(false)}>×</button>
          </header>
          <div className="jobs-agent-privacy">
            <strong>गोपनीयता और आपकी सहमति</strong>
            <p>चैट में आपके लिखे संदेश जवाब बनाने के लिए OpenRouter की AI सेवा को भेजे जाएंगे। इस वेबसाइट के इस फीचर में चैट इतिहास स्थायी रूप से सेव नहीं किया जाता। कृपया Aadhaar, OTP, पासवर्ड, बैंक विवरण या संवेदनशील दस्तावेज़ न भेजें। अटैच की गई फाइलें AI को नहीं भेजी जातीं; इमेज प्रोसेसिंग आपके ब्राउज़र में होती है। Voice input आपके ब्राउज़र की speech-recognition सुविधा का उपयोग करता है, जिसकी प्रोसेसिंग ब्राउज़र प्रदाता की शर्तों पर निर्भर हो सकती है। Privacy/grievance संपर्क: <a href="mailto:tiwarijicscs@gmail.com">tiwarijicscs@gmail.com</a>.</p>
            <label><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} /> मैंने <a href="/privacy" target="_blank" rel="noreferrer">गोपनीयता सूचना</a> पढ़ ली है और समझता/समझती हूँ कि चैट संदेश AI सेवा को भेजे जाएंगे।</label>
            <small>इस बॉक्स को अनचेक करने से आगे के AI chat requests रुकेंगे। इससे पहले भेजे गए संदेशों या provider/hosting logs के स्वतः मिटने की गारंटी नहीं है। हटाने या अन्य privacy request के लिए <a href="/privacy" target="_blank" rel="noreferrer">privacy notice</a> में दिए संपर्क का उपयोग करें।</small>
          </div>
          <div className="jobs-agent-flow">
            <div className="jobs-agent-flow-title">Document Checker Assistant <small>Step {documentStage + 1} of 5</small></div>
            <div className="jobs-agent-progress"><span style={{width: ((documentStage + 1) / 5 * 100) + "%"}} /></div>
            {documentStage === 0 && <div className="jobs-agent-step"><strong>1. भर्ती चुनें</strong><select aria-label="भर्ती चुनें" value={selectedRecruitment} onChange={(event) => setSelectedRecruitment(event.target.value)}><option value="">भर्ती चुनें…</option><option>SSC</option><option>UPPSC</option><option>UPSSSC</option><option>UP Police</option><option>Railway Recruitment</option><option>Other recruitment</option></select><button type="button" disabled={!selectedRecruitment} onClick={() => { setDocumentStage(1); addAgentMessage("user", "मेरी भर्ती: " + selectedRecruitment); addAgentMessage("assistant", selectedRecruitment + " के लिए आधिकारिक notification और document rules की पुष्टि आवश्यक है। मैं उपलब्ध आधिकारिक पोर्टल का लिंक दूँगा; किसी rule की पुष्टि न हो तो अनुमान नहीं लगाऊँगा।"); }}>भर्ती चुनें और आगे बढ़ें</button></div>}
            {documentStage === 1 && <div className="jobs-agent-step"><strong>2. आधिकारिक नियम</strong><p>आधिकारिक notification में photo, signature, format, file size और आवश्यक प्रमाणपत्र देखें। नियम पुष्ट होने पर ही आगे बढ़ें।</p><button type="button" onClick={() => { setDocumentStage(2); addAgentMessage("assistant", "अब notification में बताई गई required documents की सूची मिलान करें। यदि कोई नियम स्पष्ट नहीं है, notification का संबंधित पेज/टेक्स्ट साझा करें।"); }}>नियम देख लिए — दस्तावेज़ सूची</button></div>}
            {documentStage === 2 && <div className="jobs-agent-step"><strong>3. ज़रूरी दस्तावेज़ अपलोड करें</strong><p>नीचे Paperclip/File Tools से PDF, फोटो, मार्कशीट, हस्ताक्षर या प्रमाणपत्र जोड़ें। हर फ़ाइल के साथ Remove विकल्प उपलब्ध है।</p><button type="button" onClick={() => setDocumentStage(3)}>फ़ाइलें जोड़ दीं — आगे</button></div>}
            {documentStage === 3 && <div className="jobs-agent-step"><strong>4. Missing documents और फ़ाइल तैयारी</strong><p>अटैच फ़ाइलों की सूची देखें। वर्तमान संस्करण फ़ाइल चयन और सामान्य image optimization देता है; आधिकारिक भर्ती-नियम आधारित PDF/दस्तावेज़ OCR जाँच अभी पूरी तरह सक्रिय नहीं है।</p><button type="button" onClick={compressSelectedImages} disabled={agentBusy}>इमेज Compress / Resize करें</button><button type="button" onClick={() => setDocumentStage(4)}>आगे बढ़ें</button></div>}
            {documentStage === 4 && <div className="jobs-agent-step"><strong>5. Preview और Download</strong><p>तैयार इमेज डाउनलोड हो सकती है। PDF processing, automatic segregation और official-rule verification अभी लागू किए जाने वाले हिस्से हैं।</p><button type="button" onClick={() => { setDocumentStage(0); setSelectedRecruitment(""); }}>नई भर्ती शुरू करें</button></div>}
          </div>
          <div className="jobs-agent-messages" aria-live="polite">
            {agentMessages.map((message, index) => <div key={index} className={"jobs-agent-message " + message.role}>{message.text}</div>)}
            {agentFiles.length > 0 && <div className="jobs-agent-file-list"><strong>Attached files ({agentFiles.length})</strong>{agentFiles.map((file, index) => <div key={file.name + file.size + index}><span>📎 {file.name} · {Math.max(1, Math.round(file.size / 1024))} KB</span><button type="button" aria-label={file.name + " हटाएँ"} onClick={() => setAgentFiles((old) => old.filter((_, i) => i !== index))}>✕ Remove</button></div>)}</div>}
          </div>
          <form className="jobs-agent-compose" onSubmit={sendAgentMessage}>
            <label className="jobs-agent-attach" title="File Tools — फाइल अपलोड करें">📎
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,.pdf,.doc,.docx" onChange={handleAgentFiles} />
            </label>
            <input value={agentInput} onChange={(event) => setAgentInput(event.target.value)} placeholder="अपना संदेश लिखें…" aria-label="अपना संदेश लिखें" />
            <button type="button" onClick={() => voiceSessionRef.current ? stopVoiceSession() : startVoiceInput()} disabled={agentBusy} aria-label={voiceSessionRef.current ? "Voice बंद करें" : "बोलकर पूछें"} title={voiceSessionRef.current ? "Voice बंद करें" : "बोलकर पूछें"}>{voiceSessionRef.current ? "Voice बंद करें" : "🎙️"}</button>
            <button type="submit" disabled={agentBusy || !agentInput.trim()}>भेजें</button>
          </form>
          <div className="jobs-agent-tools"><button type="button" onClick={compressSelectedImages} disabled={agentBusy}>{agentBusy ? "प्रोसेस हो रहा है…" : "इमेज प्रोसेस करें"}</button><button type="button" onClick={() => addAgentMessage("assistant", "आप किस भर्ती के लिए आवेदन कर रहे हैं? SSC, UPPSC, UPSSSC, Railway या UP Police लिखें। लाइव पोर्टल लिंक-जाँच उपलब्ध है, लेकिन यह verified vacancy feed नहीं है; वर्तमान पद official notice से verify करें।")}>भर्ती सुझाव</button><button type="button" onClick={() => window.dispatchEvent(new Event("cscskb:open-appointment"))}>Book Appointment</button><button type="button" onClick={() => { setAgentFiles([]); setAgentStep("start"); setAgentTask(""); setDocumentStage(0); setSelectedRecruitment(""); addAgentMessage("assistant", "ठीक है, नई शुरुआत करते हैं। भर्ती का नाम बताइए या रिज्यूमे/दस्तावेज़ अटैच करें।"); }}>नई शुरुआत</button></div><p className="jobs-agent-disclaimer">इमेज processing आपके ब्राउज़र में होती है। यह आधिकारिक eligibility/dimensions की पुष्टि या PDF की automatic reading नहीं है।</p>
        </section>}
        <button type="button" className="jobs-agent-launcher" style={agentOpen ? { display: "none" } : undefined} onClick={() => setAgentOpen((open) => !open)} aria-expanded={agentOpen}>
          <span aria-hidden="true" className="jobs-agent-spark">✦</span><span>{agentOpen ? "चैट बंद करें" : "Document Checker Assistant"}</span>
        </button>
      </div>
      <footer className="jobs-footer">CSCSKB Online • यह सूचना-सहायक पोर्टल है; अंतिम पुष्टि संबंधित आधिकारिक भर्ती पोर्टल पर करें।</footer>
      <style jsx>{`

        .jobs-agent-flow{margin:5px 10px;padding:8px;border:1px solid rgba(110,180,255,.32);border-radius:12px;background:#0b2043;max-height:165px;overflow-y:auto;flex-shrink:0}.jobs-agent-flow-title{display:flex;justify-content:space-between;gap:8px;font-weight:900;font-size:.86rem}.jobs-agent-flow-title small{color:#9fc8ff;font-size:.7rem}.jobs-agent-progress{height:5px;background:#20395b;border-radius:999px;margin:9px 0;overflow:hidden}.jobs-agent-progress span{display:block;height:100%;background:#ff8a00;transition:width .2s}.jobs-agent-step{display:grid;gap:8px;font-size:.82rem;line-height:1.45}.jobs-agent-step p{margin:0;color:#c8d7ec}.jobs-agent-step select{width:100%;padding:9px;border-radius:8px;background:#071a35;color:white;border:1px solid #47658c}.jobs-agent-step button{padding:9px;border:0;border-radius:8px;background:#ff8a00;color:#160c00;font-weight:900;cursor:pointer}.jobs-agent-step button:disabled{opacity:.5}.jobs-agent-file-list{padding:8px 10px;font-size:.75rem;color:#dceeff}.jobs-agent-file-list>div{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:6px 0;border-top:1px solid #294361;overflow-wrap:anywhere}.jobs-agent-file-list button{flex-shrink:0;background:#5b2330;color:white;border:0;border-radius:6px;padding:5px;font-size:.7rem}.jobs-agent-spark{animation:jobsBob 1.7s ease-in-out infinite}@keyframes jobsBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .jobs-agent-root{position:fixed;left:12px;bottom:12px;z-index:10000;font-family:inherit;pointer-events:none}.jobs-agent-root button,.jobs-agent-panel{pointer-events:auto}
        .jobs-agent-launcher{display:flex;align-items:center;gap:9px;border:2px solid #fff;border-radius:999px;padding:13px 17px;background:#ff8a00;color:#160c00;font-weight:900;box-shadow:0 8px 28px rgba(0,0,0,.5);cursor:pointer;max-width:calc(100vw - 32px)}
        .jobs-agent-launcher span:first-child{font-size:1.2rem}
        .jobs-agent-panel{position:fixed;left:12px;bottom:12px;width:min(430px,calc(100vw - 24px));height:min(760px,calc(100dvh - 24px));display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:#071a35;color:#f8fbff;box-shadow:0 18px 55px rgba(0,0,0,.45)}
        .jobs-agent-header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 14px;background:#102748;border-bottom:1px solid rgba(255,255,255,.12)}
        .jobs-agent-header strong,.jobs-agent-header small{display:block}.jobs-agent-header small{margin-top:3px;color:#b7c7df;font-size:.76rem}
        .jobs-agent-header button{border:0;background:transparent;color:white;font-size:1.5rem;cursor:pointer}
        .jobs-agent-messages{flex:1;min-height:65px;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px}
        .jobs-agent-message{max-width:88%;padding:10px 12px;border-radius:14px;line-height:1.45;font-size:.9rem;white-space:pre-wrap;overflow-wrap:anywhere}
        .jobs-agent-message.assistant{align-self:flex-start;background:#102748;color:#edf5ff;border-bottom-left-radius:4px}
        .jobs-agent-message.user{align-self:flex-end;background:#ff8a00;color:#160c00;border-bottom-right-radius:4px}
        .jobs-agent-file-summary{font-size:.8rem;color:#9cf56f}
        .jobs-agent-privacy{margin:6px 10px;padding:8px;border:1px solid rgba(255,196,87,.35);border-radius:10px;background:rgba(255,196,87,.07);color:#e7eefb;font-size:.68rem;line-height:1.35;max-height:115px;overflow-y:auto;flex-shrink:0}
        .jobs-agent-privacy p{margin:5px 0 8px}.jobs-agent-privacy label{display:flex;align-items:flex-start;gap:7px}.jobs-agent-privacy input{margin-top:3px;flex:0 0 auto}.jobs-agent-privacy a{color:#9fc8ff;text-decoration:underline}.jobs-agent-privacy small{display:block;color:#a8bbd6;margin-top:5px}

        .jobs-agent-compose{display:flex;align-items:center;gap:7px;padding:10px;border-top:1px solid rgba(255,255,255,.12)}
        .jobs-agent-attach{display:grid;place-items:center;width:38px;height:38px;flex:0 0 38px;border:1px solid rgba(255,255,255,.2);border-radius:50%;font-size:1.4rem;cursor:pointer}
        .jobs-agent-attach input{display:none}
        .jobs-agent-compose input:not([type=file]){min-width:0;flex:1;padding:10px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:#0b2043;color:#fff}
        .jobs-agent-compose button{padding:10px;border:0;border-radius:10px;background:#ff8a00;color:#160c00;font-weight:900;cursor:pointer}
        .jobs-agent-tools{display:flex;gap:8px;padding:0 10px 8px}.jobs-agent-tools button{border:1px solid rgba(255,255,255,.2);border-radius:9px;padding:8px 10px;background:#173a5f;color:#fff;font-weight:800;cursor:pointer;font-size:.78rem}.jobs-agent-tools button:disabled{opacity:.6}.jobs-agent-disclaimer{margin:0;padding:0 12px 10px;color:#a8bbd6;font-size:.68rem;line-height:1.4;max-height:58px;overflow:auto}@media(max-width:480px){.jobs-agent-root{left:10px;bottom:12px}.jobs-agent-launcher{padding:10px 12px;font-size:.82rem}.jobs-agent-panel{left:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100dvh - 16px);max-height:none}.jobs-agent-header{padding:9px 12px}.jobs-agent-compose{padding:7px}.jobs-agent-message{font-size:.84rem}.jobs-agent-disclaimer{max-height:42px;font-size:.62rem}}
        .live-recruitment{padding:18px;border:1px solid rgba(156,245,111,.25);border-radius:18px;background:rgba(156,245,111,.035)}
        .live-refresh{padding:10px 14px;border:1px solid rgba(156,245,111,.45);border-radius:10px;background:#163b2a;color:#eaffdf;font-weight:800;cursor:pointer}
        .live-refresh:disabled{opacity:.65;cursor:wait}.live-meta{color:#9cf56f;font-size:.8rem}.live-error{padding:10px;border-radius:10px;background:rgba(255,70,70,.1);color:#ffd4d4}.live-disclaimer{margin-top:14px;color:#a8bbd6;font-size:.78rem;line-height:1.5}
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
