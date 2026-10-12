"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type SpeechRecognitionLike = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
};
declare global {
  interface Window { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike; }
}

export default function CSCLiveVoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "नमस्ते! मैं CSCSKB Online सहायक हूँ। CSC सेवाओं या appointment के बारे में पूछिए। आप हिंदी या English में लिख सकते हैं या microphone इस्तेमाल कर सकते हैं।" },
  ]);
  const suggestions = [
    "PAN card ke liye documents?",
    "Ayushman card kaise banega?",
    "PM-Kisan eligibility kya hai?",
    "Income certificate ke liye kya chahiye?",
    "CSC appointment kaise book karein?",
  ];
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef("");
  const autoListenRef = useRef(false);
  const awaitingResponseRef = useRef(false);
  const sendRef = useRef<(messageOverride?: string) => Promise<void>>(async () => {});

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, busy]);
  useEffect(() => () => { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  const openBooking = () => {
    autoListenRef.current = false;
    awaitingResponseRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    window.speechSynthesis?.cancel();
    window.dispatchEvent(new Event("cscskb:open-appointment"));
  };

  const stopVoice = () => {
    autoListenRef.current = false;
    awaitingResponseRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    recognitionRef.current?.stop();
    setListening(false);
    window.speechSynthesis?.cancel();
  };

  const startListening = () => {
    setError("");
    autoListenRef.current = true;
    awaitingResponseRef.current = false;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("इस browser में speech recognition उपलब्ध नहीं है। कृपया Chrome में खोलें या अपना प्रश्न लिखें।");
      return;
    }
    try {
      const recognition = new Recognition();
      recognition.lang = "hi-IN";
      recognition.interimResults = true;
      recognition.continuous = true;
      transcriptRef.current = "";
      recognition.onresult = (event) => {
        const parts: string[] = [];
        for (let i = 0; i < event.results.length; i++) {
          const part = event.results[i]?.[0]?.transcript || "";
          if (part) parts.push(part);
        }
        transcriptRef.current = parts.join(" ").trim();
        setInput(transcriptRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const finalTranscript = transcriptRef.current.trim();
          awaitingResponseRef.current = true;
          recognitionRef.current?.stop();
          setListening(false);
          if (finalTranscript) void sendRef.current(finalTranscript);
          else { awaitingResponseRef.current = false; if (autoListenRef.current) startListening(); }
        }, 2500);
      };
      recognition.onerror = (event) => {
        setListening(false);
        if (event?.error === "not-allowed" || event?.error === "service-not-allowed") autoListenRef.current = false;
        setError(event?.error === "not-allowed" ? "Microphone permission दें, या प्रश्न लिखें।" : "Voice input अभी उपलब्ध नहीं है। आप प्रश्न लिख सकते हैं।");
      };
      recognition.onend = () => {
        setListening(false);
        if (autoListenRef.current && !awaitingResponseRef.current && !busy) {
          window.setTimeout(() => { if (autoListenRef.current && !awaitingResponseRef.current) startListening(); }, 350);
        }
      };
      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      setError("Microphone शुरू नहीं हो सका। कृपया permission जाँचें या प्रश्न लिखें।");
    }
  };

  const speak = (text: string) => {
    if (!speaking || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
    utterance.rate = 1;
    utterance.onend = () => {
      if (autoListenRef.current) {
        awaitingResponseRef.current = false;
        window.setTimeout(() => { if (autoListenRef.current && !awaitingResponseRef.current) startListening(); }, 250);
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const send = async (event?: FormEvent, messageOverride?: string) => {
    event?.preventDefault();
    const message = (messageOverride ?? input).trim();
    if (!message || busy) return;

    // Booking requests should open the real appointment form instead of letting the
    // general chat model incorrectly say it cannot help with booking.
    const bookingIntent =
      /\b(book|booking|appointment|schedule)\b/i.test(message) ||
      /(अपॉइंटमेंट|appointment|बुक|बुकिंग|समय लेना|तारीख.*बुक|slot.*बुक)/i.test(message);
    if (bookingIntent) {
      setMessages((previous) => [
        ...previous,
        { role: "user", content: message },
        { role: "assistant", content: "जी, मैं आपका Appointment Booking Form खोल रहा हूँ। वहाँ नाम, मोबाइल नंबर, सेवा, तारीख़ और उपलब्ध समय चुनकर बुकिंग कन्फर्म करें।" },
      ]);
      setInput("");
      openBooking();
      if (speaking && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("जी, मैं आपका अपॉइंटमेंट बुकिंग फॉर्म खोल रहा हूँ। कृपया अपनी जानकारी भरकर बुकिंग कन्फर्म करें।");
        utterance.lang = "hi-IN";
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: message }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/voice/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: messages.slice(-8) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Assistant temporarily unavailable.");
      const answer = String(data.answer || "").trim();
      if (!answer) throw new Error("No answer received. Please try again.");
      setMessages((previous) => [...previous, { role: "assistant", content: answer }]);
      speak(answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed. Please try again.");
    } finally {
      setBusy(false);
      if (autoListenRef.current && (!speaking || !("speechSynthesis" in window))) {
        awaitingResponseRef.current = false;
        window.setTimeout(() => { if (autoListenRef.current && !awaitingResponseRef.current) startListening(); }, 250);
      }
    }
  };
  sendRef.current = async (messageOverride?: string) => send(undefined, messageOverride);

  return (
    <>
      <style jsx>{`
        .voice-fab{position:fixed;right:22px;bottom:175px;z-index:2147483000;border:2px solid #fff;border-radius:999px;padding:14px 18px;background:#123c32;color:#fff;font-weight:800;font-size:15px;box-shadow:0 8px 28px #0006;cursor:pointer;display:flex;align-items:center;gap:8px;visibility:visible;opacity:1;pointer-events:auto}
        .voice-panel{position:fixed;right:20px;bottom:20px;width:min(460px,calc(100vw - 28px));height:min(760px,calc(100dvh - 40px));z-index:2147483000;background:#fff;color:#17251f;border:1px solid #d7e4dd;border-radius:18px;box-shadow:0 18px 60px #0003;display:flex;flex-direction:column;overflow:hidden;font-family:inherit}.voice-panel.minimized{height:auto;bottom:20px}.voice-panel.minimized .voice-stage,.voice-panel.minimized .voice-messages,.voice-panel.minimized .voice-form,.voice-panel.minimized .voice-options,.voice-panel.minimized .voice-error{display:none}
        .voice-head{padding:16px 18px;background:#123c32;color:white;display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:72px;flex-shrink:0}.voice-head strong{font-size:17px}.voice-head-actions{display:flex;gap:8px;align-items:center}.voice-minimize,.voice-close{background:#ffffff20;color:white;border:2px solid #ffffffa0;border-radius:10px;width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;font-size:25px;font-weight:800;line-height:1;cursor:pointer}.voice-minimize:hover,.voice-close:hover{background:#ffffff45}.voice-close{border-radius:10px;font-size:29px}
        .voice-head small{display:block;opacity:.8;margin-top:3px}.voice-close{background:#ffffff20;color:white;border:1px solid #ffffff66;border-radius:50%;width:36px;height:36px;flex:0 0 36px;display:grid;place-items:center;font-size:25px;line-height:1;cursor:pointer;position:relative;z-index:2}.voice-close:hover{background:#ffffff38}
        .voice-stage{position:relative;flex-shrink:0;min-height:205px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;overflow:hidden;background:linear-gradient(145deg,#102d75 0%,#4935d5 55%,#852ee6 100%);color:white;padding:14px 12px 12px}
        .voice-orb-button{position:relative;width:128px;height:128px;display:grid;place-items:center;border:0;border-radius:50%;cursor:pointer;background:radial-gradient(circle at 35% 28%,#8cf8ff 0%,#46a9ff 26%,#6658ff 58%,#d86cff 82%,#ff9be8 100%);box-shadow:0 0 0 5px #ffffff28,0 0 32px #54d8ff88,inset 0 0 18px #ffffff90;color:white}
        .voice-orb-button:before{content:"";position:absolute;inset:-8px;border-radius:50%;border:2px solid #8ceaffaa;box-shadow:0 0 18px #66d9ff88;pointer-events:none}
        .voice-orb-button.listening{animation:orb-pulse 1.4s ease-in-out infinite}
        .voice-orb-button svg{width:42px;height:52px;filter:drop-shadow(0 2px 4px #2839a966)}
        .voice-wave{height:22px;width:min(280px,90%);display:flex;align-items:center;justify-content:center;gap:4px}
        .voice-wave span{width:3px;height:4px;border-radius:4px;background:#fff;opacity:.9}
        .voice-wave.active span{animation:wave 700ms ease-in-out infinite alternate}
        .voice-wave.active span:nth-child(3n){animation-delay:180ms}.voice-wave.active span:nth-child(2n){animation-delay:320ms}
        .voice-stage-label{font-size:12px;opacity:.92;text-align:center}
        @keyframes wave{from{height:4px;opacity:.55}to{height:20px;opacity:1}}
        @keyframes orb-pulse{0%,100%{transform:scale(1);box-shadow:0 0 0 5px #ffffff28,0 0 32px #54d8ff88}50%{transform:scale(1.04);box-shadow:0 0 0 10px #ffffff20,0 0 46px #54d8ffbb}}
        .voice-messages{padding:18px;overflow:auto;flex:1;background:#f7faf8;display:flex;flex-direction:column;gap:16px;min-height:100px}
        .voice-msg{white-space:pre-wrap;overflow-wrap:anywhere;max-width:96%;padding:14px 16px;border-radius:14px;font-size:16px;line-height:1.75;letter-spacing:.01em}
        .voice-msg.user{align-self:flex-end;background:#dcefe5}.voice-msg.assistant{align-self:flex-start;background:white;border:1px solid #e4ebe6}
        .voice-suggestions{display:flex;gap:7px;overflow-x:auto;padding:9px 12px 10px;background:#fff;border-top:1px solid #e3e9e5;scrollbar-width:thin}
        .voice-suggestion{flex:0 0 auto;max-width:205px;border:1px solid #c7d8ff;border-radius:999px;padding:7px 10px;background:#f2f6ff;color:#254b93;font-size:12px;cursor:pointer;white-space:nowrap}
        .voice-suggestion:hover{background:#e3ecff}
        .voice-form{padding:10px 12px 12px;border-top:1px solid #e3e9e5;display:flex;gap:7px;align-items:center}
        .voice-input{min-width:0;flex:1;padding:11px;border:1px solid #cbd8d0;border-radius:10px;color:#17251f;background:#fff}
        .voice-action{border:0;border-radius:10px;padding:10px 12px;background:#176b4d;color:white;font-weight:700;cursor:pointer}
        .voice-action:disabled{opacity:.5;cursor:default}.voice-error{margin:0;padding:8px 12px;color:#9c2525;font-size:12px;background:#fff6f6}
        .voice-options{display:flex;gap:8px;padding:0 12px 10px;font-size:12px;align-items:center;color:#42564b}.voice-options button{border:1px solid #d0ddd4;background:#fff;color:#234735;border-radius:8px;padding:6px 8px;cursor:pointer}
        @media(max-width:480px){.voice-panel{right:10px;bottom:220px;width:calc(100vw - 20px);height:min(680px,calc(100vh - 245px))}.voice-fab{right:12px;bottom:165px;padding:13px 16px}.voice-orb-button{width:112px;height:112px}.voice-suggestion{max-width:180px}}
        .voice-form{padding:14px 16px;border-top:1px solid #e3e9e5;display:flex;gap:10px;align-items:center;flex-shrink:0}
        .voice-input{min-width:0;flex:1;padding:14px 13px;border:1px solid #cbd8d0;border-radius:10px;color:#17251f;background:#fff;font:inherit;font-size:16px}
        .voice-action{border:0;border-radius:10px;padding:13px 16px;background:#176b4d;color:white;font-weight:700;font-size:15px;cursor:pointer}
        .voice-action:disabled{opacity:.5;cursor:default}.voice-error{margin:0;padding:8px 12px;color:#9c2525;font-size:12px;background:#fff6f6}
        .voice-options{display:flex;gap:8px;padding:0 12px 10px;font-size:12px;align-items:center;color:#42564b;flex-wrap:wrap}.voice-options button{border:1px solid #d0ddd4;background:#fff;color:#234735;border-radius:8px;padding:8px 10px;cursor:pointer}.voice-options .voice-book-button{background:#176b4d;border-color:#176b4d;color:#fff;font-weight:800}
        @media(max-width:480px){.voice-panel{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100dvh - 16px);max-height:none}.voice-panel.minimized{height:auto;bottom:8px}.voice-head{padding:12px;min-height:66px}.voice-head strong{font-size:16px}.voice-minimize,.voice-close{width:40px;height:40px;flex-basis:40px}.voice-messages{padding:14px;gap:14px}.voice-msg{max-width:100%;font-size:16px;line-height:1.75;padding:13px 14px}.voice-fab{right:12px;bottom:165px;padding:13px 16px}.voice-orb-button{width:100px;height:100px}.voice-stage{min-height:170px}}
      `}</style>
      {open && <section className={`voice-panel ${minimized ? "minimized" : ""}`} role="dialog" aria-modal="false" aria-label="CSCSKB Live Assistant">
        <header className="voice-head"><div><strong>🎙 CSCSKB AI Assistant</strong><small>Hindi • Hinglish • English</small></div><div className="voice-head-actions"><button type="button" className="voice-minimize" onClick={() => setMinimized((value) => !value)} aria-label={minimized ? "Expand assistant" : "Minimize assistant"} title={minimized ? "Expand" : "Minimize"}>{minimized ? "□" : "−"}</button><button type="button" className="voice-close" onClick={() => { stopVoice(); setMinimized(false); setOpen(false); }} aria-label="Close assistant" title="Close assistant">×</button></div></header>
        <div className="voice-stage">
          <button type="button" className={`voice-orb-button ${listening ? "listening" : ""}`} onClick={startListening} aria-label={listening ? "Listening" : "Start voice input"} title="बोलने के लिए क्लिक करें">
            <svg viewBox="0 0 48 60" fill="none" aria-hidden="true"><rect x="17" y="4" width="14" height="30" rx="7" stroke="currentColor" strokeWidth="3.5"/><path d="M9 27v3a15 15 0 0 0 30 0v-3M24 45v10M16 55h16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/></svg>
          </button>
          <div className={`voice-wave ${listening || busy ? "active" : ""}`} aria-hidden="true">{Array.from({length:35},(_,i)=><span key={i}/>)}</div>
          <div className="voice-stage-label">{listening ? "सुन रहा हूँ… बोलिए" : busy ? "आपका जवाब तैयार हो रहा है…" : "बात करने के लिए माइक्रोफोन दबाएँ"}</div>
        </div>
        <div className="voice-messages" aria-live="polite">
          {messages.map((message, i) => <div key={i} className={`voice-msg ${message.role}`}>{message.content}</div>)}
          {busy && <div className="voice-msg assistant">जवाब तैयार हो रहा है…</div>}
          <div ref={bottomRef} />
        </div>
        {error && <p className="voice-error" role="alert">{error}</p>}
        <div className="voice-options">
          <button onClick={startListening} disabled={listening || busy}>{listening ? "🎙 सुन रहा हूँ…" : "🎙 बोलें"}</button>
          <button type="button" onClick={stopVoice} aria-label="Stop voice and remain in assistant">⏹ Stop</button>
          <button className="voice-book-button" type="button" onClick={openBooking}>📅 Book Appointment</button>
          <button onClick={() => setSpeaking((value) => !value)}>{speaking ? "🔊 Voice on" : "🔇 Voice off"}</button>
          <span>Voice fallback: browser speech</span>
        </div>
        <div className="voice-suggestions" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" className="voice-suggestion" onClick={() => setInput(suggestion)}>{suggestion}</button>
          ))}
        </div>
        <form className="voice-form" onSubmit={send}>
          <input className="voice-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="अपना सवाल लिखें…" maxLength={4000} aria-label="Your message" />
          <button className="voice-action" type="submit" disabled={busy || !input.trim()}>{busy ? "…" : "Send"}</button>
        </form>
      </section>}
      {!open && <button className="voice-fab" onClick={() => { setOpen(true); setMinimized(false); }} aria-label="Open AI voice assistant">🎙 Ask AI</button>}
      {open && minimized && <button className="voice-fab" style={{ bottom: 20, right: 20 }} onClick={() => setMinimized(false)} aria-label="Expand AI voice assistant">🎙 Open Assistant</button>}
    </>
  );
}
