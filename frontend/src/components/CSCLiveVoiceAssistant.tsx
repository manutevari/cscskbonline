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
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "नमस्ते! मैं CSCSKB Online सहायक हूँ। CSC सेवाओं या appointment के बारे में पूछिए। आप हिंदी या English में लिख सकते हैं या microphone इस्तेमाल कर सकते हैं।" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, busy]);
  useEffect(() => () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  const startListening = () => {
    setError("");
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("इस browser में speech recognition उपलब्ध नहीं है। कृपया Chrome में खोलें या अपना प्रश्न लिखें।");
      return;
    }
    try {
      const recognition = new Recognition();
      recognition.lang = "hi-IN";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results as ArrayLike<any>).map((result: any) => result[0]?.transcript || "").join(" ").trim();
        if (transcript) setInput((previous) => previous ? previous + " " + transcript : transcript);
      };
      recognition.onerror = (event) => setError(event?.error === "not-allowed" ? "Microphone permission दें, या प्रश्न लिखें।" : "Voice input अभी उपलब्ध नहीं है। आप प्रश्न लिख सकते हैं।");
      recognition.onend = () => setListening(false);
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
    window.speechSynthesis.speak(utterance);
  };

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
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
    } finally { setBusy(false); }
  };

  return (
    <>
      <style jsx>{`
        .voice-fab{position:fixed;right:22px;bottom:175px;z-index:2147483000;border:2px solid #fff;border-radius:999px;padding:14px 18px;background:#123c32;color:#fff;font-weight:800;font-size:15px;box-shadow:0 8px 28px #0006;cursor:pointer;display:flex;align-items:center;gap:8px;visibility:visible;opacity:1;pointer-events:auto}
        .voice-panel{position:fixed;right:20px;bottom:230px;width:min(390px,calc(100vw - 28px));height:min(580px,calc(100vh - 260px));z-index:2147483000;background:#fff;color:#17251f;border:1px solid #d7e4dd;border-radius:18px;box-shadow:0 18px 60px #0003;display:flex;flex-direction:column;overflow:hidden;font-family:inherit}
        .voice-head{padding:15px 16px;background:#123c32;color:white;display:flex;justify-content:space-between;align-items:center;gap:12px}
        .voice-head small{display:block;opacity:.8;margin-top:3px}.voice-close{background:transparent;color:white;border:0;font-size:24px;cursor:pointer}
        .voice-messages{padding:14px;overflow:auto;flex:1;background:#f7faf8;display:flex;flex-direction:column;gap:10px}
        .voice-msg{white-space:pre-wrap;overflow-wrap:anywhere;max-width:90%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.45}
        .voice-msg.user{align-self:flex-end;background:#dcefe5}.voice-msg.assistant{align-self:flex-start;background:white;border:1px solid #e4ebe6}
        .voice-form{padding:12px;border-top:1px solid #e3e9e5;display:flex;gap:7px;align-items:center}
        .voice-input{min-width:0;flex:1;padding:11px;border:1px solid #cbd8d0;border-radius:10px;color:#17251f;background:#fff}
        .voice-action{border:0;border-radius:10px;padding:10px 12px;background:#176b4d;color:white;font-weight:700;cursor:pointer}
        .voice-action:disabled{opacity:.5;cursor:default}.voice-error{margin:0;padding:8px 12px;color:#9c2525;font-size:12px;background:#fff6f6}
        .voice-options{display:flex;gap:8px;padding:0 12px 10px;font-size:12px;align-items:center;color:#42564b}.voice-options button{border:1px solid #d0ddd4;background:#fff;color:#234735;border-radius:8px;padding:6px 8px;cursor:pointer}
        @media(max-width:480px){.voice-panel{right:10px;bottom:220px;width:calc(100vw - 20px);height:min(540px,calc(100vh - 245px))}.voice-fab{right:12px;bottom:165px;padding:13px 16px}}
      `}</style>
      {open && <section className="voice-panel" role="dialog" aria-modal="false" aria-label="CSCSKB Live Assistant">
        <header className="voice-head"><div><strong>🎙 CSCSKB AI Assistant</strong><small>Hindi • Hinglish • English</small></div><button className="voice-close" onClick={() => { setOpen(false); window.speechSynthesis?.cancel(); }} aria-label="Close assistant">×</button></header>
        <div className="voice-messages" aria-live="polite">
          {messages.map((message, i) => <div key={i} className={`voice-msg ${message.role}`}>{message.content}</div>)}
          {busy && <div className="voice-msg assistant">जवाब तैयार हो रहा है…</div>}
          <div ref={bottomRef} />
        </div>
        {error && <p className="voice-error" role="alert">{error}</p>}
        <div className="voice-options">
          <button onClick={startListening} disabled={listening || busy}>{listening ? "🎙 सुन रहा हूँ…" : "🎙 बोलें"}</button>
          <button onClick={() => setSpeaking((value) => !value)}>{speaking ? "🔊 Voice on" : "🔇 Voice off"}</button>
          <span>Voice fallback: browser speech</span>
        </div>
        <form className="voice-form" onSubmit={send}>
          <input className="voice-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="अपना सवाल लिखें…" maxLength={4000} aria-label="Your message" />
          <button className="voice-action" type="submit" disabled={busy || !input.trim()}>{busy ? "…" : "Send"}</button>
        </form>
      </section>}
      {!open && <button className="voice-fab" onClick={() => setOpen(true)} aria-label="Open AI voice assistant">🎙 Ask AI</button>}
    </>
  );
}
