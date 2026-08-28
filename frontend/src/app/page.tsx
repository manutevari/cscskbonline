"use client";

import React, { useState, useEffect, useRef } from "react";

const UPDATES = [
  { color: "#78d64b", text: "PMGDISHA Registration Open" },
  { color: "#ff8a00", text: "Ayushman Card Update" },
  { color: "#0b72e7", text: "Voter ID Special Drive" },
  { color: "#ffc107", text: "PM Kisan eKYC Last Date Extended" },
  { color: "#e855e8", text: "New Aadhaar Correction Portal Live" },
];

const SERVICES = [
  { icon: "📋", color: "#ff8a00", bg: "rgba(255,138,0,0.15)", title: "Government Forms", desc: "Apply for government forms & certificates" },
  { icon: "🤖", color: "#0b72e7", bg: "rgba(11,114,231,0.15)", title: "AI Knowledge Assistant", desc: "Get instant answers to your CSC queries" },
  { icon: "📜", color: "#78d64b", bg: "rgba(120,214,75,0.15)", title: "Certificates Services", desc: "All certificate types made easy" },
  { icon: "💳", color: "#ff8a00", bg: "rgba(255,138,0,0.12)", title: "Digital Payments", desc: "Safe, secure and instant payments" },
  { icon: "🏛️", color: "#a78bfa", bg: "rgba(167,139,250,0.15)", title: "Schemes & Benefits", desc: "Government welfare scheme info" },
  { icon: "📍", color: "#34d399", bg: "rgba(52,211,153,0.15)", title: "Maps & Location", desc: "Find us and get directions" },
];

const QUICK_QUERIES = [
  "PAN card ke documents?",
  "Ayushman card kaise bane?",
  "PM Kisan eligibility?",
  "Voter ID apply kaise kare?",
  "Income certificate ke liye?",
  "CSC Shikohabad kahan hai?",
  "Aadhaar update kaise kare?",
  "Passport apply process?",
];

const REVIEWS = [
  { text: "Bahut achha service mila, mera Ayushman card ban gaya bina koi dikkat ke.", name: "Ramesh Singh", location: "Shikohabad", initial: "R" },
  { text: "Income certificate ke liye help mili, process bahut fast aur transparent tha.", name: "Pooja Verma", location: "Shikohabad", initial: "P" },
  { text: "Yahan par sabhi CSC services easy aur fast milti hain. Thank you!", name: "Amit Kumar", location: "Shikohabad", initial: "A" },
];

const STATS = [
  { icon: "📋", value: "100+", label: "Services" },
  { icon: "😊", value: "5000+", label: "Happy Customers" },
  { icon: "🎧", value: "24/7", label: "Support" },
  { icon: "✅", value: "100%", label: "Satisfaction" },
];

const MAP_QUERY = "Purana+Bijli+Office,+Agra+Road,+near+Roadways+Bus+Stand,+Shikohabad,+Uttar+Pradesh+283135";

function getServiceAnswer(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("pan")) {
    if (lower.includes("doc") || lower.includes("paper") || lower.includes("kya") || lower.includes("lagega") || lower.includes("chahiye")) {
      return "### PAN Card — Required Documents\n\n1. Aadhaar Card (Identity Proof)\n2. Passport Size Photo\n3. Signature (on white paper)\n4. Date of Birth Proof (if DOB not in Aadhaar)\n5. Address Proof (if not available in Aadhaar)\n\nNote: Documents may vary based on applicant type.\n\nSource: NSDL / UTITSL Official Guidelines";
    }
    if (lower.includes("fee") || lower.includes("kitni") || lower.includes("charge")) {
      return "PAN Card Fee: ₹107 (Indian address delivery) or ₹1,017 (Foreign address). e-PAN is ₹66. CSC service charges may apply additionally.";
    }
  }
  if (lower.includes("ayushman") || lower.includes("pmjay")) {
    return "### Ayushman Card Process\n\n1. Check eligibility via pmjay.gov.in\n2. Visit CSC with Aadhaar & mobile\n3. e-KYC via OTP or Fingerprint\n4. Card generated instantly\n\nDocuments: Aadhaar Card + Mobile Number + Ration Card (if available)";
  }
  if (lower.includes("pm kisan") || lower.includes("kisan")) {
    return "### PM-KISAN Eligibility\n\nLandholding farmer families with cultivable land. Annual benefit: ₹6,000 in 3 installments.\n\nDocuments: Aadhaar + Bank Passbook + Khatauni (Land Record)\n\nSource: pmkisan.gov.in";
  }
  if (lower.includes("income") || lower.includes("aay")) {
    return "### Income Certificate — Required Documents\n\n1. Aadhaar Card\n2. Passport-size photo\n3. Self-declaration form\n4. Previous income proof or Ration card\n\nFee: ₹30–50 + CSC service charge\nTime: 7–15 working days";
  }
  if (lower.includes("kaha") || lower.includes("location") || lower.includes("address") || lower.includes("where")) {
    return "### CSC — Shikohabad\n\nPurana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad, Uttar Pradesh 283135\n\n📞 9720000000\n🕐 Mon–Sun: 9:00 AM – 7:00 PM";
  }
  if (lower.includes("voter") || lower.includes("pehchan")) {
    return "### Voter ID Application\n\nDocuments: Aadhaar, Photo, Age Proof\nProcess: Apply on voters.eci.gov.in or at CSC\nTime: 15–30 days after verification";
  }
  return "Please visit CSC center with your Aadhaar and relevant documents for exact service requirements. Our staff will guide you step by step. You can also call: 9720000000.";
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ type: "user" | "bot"; text: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          const handler = () => {
            audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
            window.removeEventListener("click", handler);
          };
          window.addEventListener("click", handler);
        });
    }
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const userMsg = query.trim();
    setMessages(prev => [...prev, { type: "user", text: userMsg }]);
    setQuery("");
    setTimeout(() => {
      setMessages(prev => [...prev, { type: "bot", text: getServiceAnswer(userMsg) }]);
    }, 600);
  };

  const handleQuick = (q: string) => {
    setQuery(q);
    const userMsg = q;
    setMessages(prev => [...prev, { type: "user", text: userMsg }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { type: "bot", text: getServiceAnswer(userMsg) }]);
    }, 600);
  };

  return (
    <div>
      {/* Hidden Audio */}
      <audio ref={audioRef} loop preload="none">
        <source src="/audio/TIWARIJIKCSCENTER.mp3" type="audio/mpeg" />
        <source src="/audio/TIWARIJIKCSCCENTER.mp3" type="audio/mpeg" />
      </audio>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-logo">
          <div>
            <div className="logo-csc">CSC</div>
            <div className="logo-tagline">Ankit Tiwari CSC Center</div>
          </div>
          <div className="logo-divider" />
        </div>

        <div className="navbar-links">
          {[
            { icon: "🌐", label: "Official CSC Portal", href: "https://csc.gov.in/" },
            { icon: "💻", label: "Digital Seva Portal", href: "https://digitalseva.csc.gov.in/" },
            { icon: "🗂️", label: "CSC Services", href: "#services" },
            { icon: "📞", label: "Contact Us", href: "#footer" },
          ].map((link) => (
            <a key={link.label} href={link.href} className="nav-link" target={link.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>

        <div className="navbar-music">
          <div>
            <div className="music-label">🎵 Background Music</div>
            <div className="music-status">{isPlaying ? "Playing..." : "Paused"}</div>
          </div>
          <button className="music-btn" onClick={toggleMusic} title="Toggle music">
            {isPlaying ? "⏸" : "▶️"}
          </button>
        </div>
      </nav>

      {/* UPDATES BAR */}
      <div className="updates-bar">
        <div className="updates-label">
          <span className="updates-dot" style={{ background: "#ff8a00" }} />
          Latest CSC Updates:
        </div>
        <div className="updates-track">
          {[...UPDATES, ...UPDATES].map((u, i) => (
            <span key={i} className="update-item">
              <span className="update-dot" style={{ background: u.color }} />
              {u.text}
            </span>
          ))}
        </div>
        <a href="https://csc.gov.in/" target="_blank" rel="noopener noreferrer" className="btn-view-all">
          View All →
        </a>
      </div>

      <div className="container">

        {/* HERO */}
        <section className="hero-section">
          <div className="panel">
            <div>
              <p className="hero-welcome">Welcome to</p>
              <h1 className="hero-csc">CSC</h1>
              <h2 className="hero-center-name">Ankit Tiwari CSC Center</h2>
              <p className="hero-tagline">
                Your trusted partner for Digital India services, Government schemes, and online solutions.
              </p>
              <div className="hero-badges">
                <div className="hero-badge">
                  <span>🛡️</span>
                  <div><b>Trusted</b><span>CSC Center</span></div>
                </div>
                <div className="hero-badge">
                  <span>📋</span>
                  <div><b>100+</b><span>Services</span></div>
                </div>
                <div className="hero-badge">
                  <span>⚡</span>
                  <div><b>Fast & Easy</b><span>Solutions</span></div>
                </div>
                <div className="hero-badge">
                  <span>🔒</span>
                  <div><b>Secure</b><span>& Reliable</span></div>
                </div>
              </div>
            </div>
            <div className="cta-group">
              <a href="#services" className="btn btn-primary">🗂️ Explore Services</a>
              <a href="https://maps.app.goo.gl/WNidZh1cEukiXna88" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">📍 Get Directions</a>
              <a href="#ai-assistant" className="btn btn-secondary">🤖 Ask AI Assistant</a>
            </div>
          </div>

          <aside className="panel local-center-card">
            <div>
              <span className="center-badge">✦ Your Local CSC Center</span>
              <div className="center-header">
                <img src="/photo.jpg" alt="Ankit Tiwari" className="center-photo" />
                <div>
                  <div className="center-name">
                    Ankit Tiwari CSC Center
                    <span className="verified-icon">✓</span>
                  </div>
                  <p className="center-sub">Digital India • Power To Empower</p>
                </div>
              </div>
              <ul className="center-features">
                {[
                  { icon: "📋", color: "#ff8a00", bg: "rgba(255,138,0,0.15)", text: "Government Forms & Certificates" },
                  { icon: "🎓", color: "#0b72e7", bg: "rgba(11,114,231,0.15)", text: "Scheme & Document Guidance" },
                  { icon: "💳", color: "#78d64b", bg: "rgba(120,214,75,0.15)", text: "Online Payment & Applications" },
                  { icon: "🗣️", color: "#a78bfa", bg: "rgba(167,139,250,0.15)", text: "Support in Hindi & English" },
                  { icon: "⚡", color: "#ffc107", bg: "rgba(255,193,7,0.15)", text: "Quick, Transparent & Reliable" },
                ].map((f) => (
                  <li key={f.text}>
                    <span className="feature-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
            <img src="/storefront.png" alt="CSC Shikohabad Center" className="storefront-img" />
          </aside>
        </section>

        {/* SERVICES */}
        <section id="services">
          <div className="section-header">
            <h2>Our Key Services</h2>
            <p>Comprehensive government services available at your local CSC center</p>
          </div>
          <div className="services-grid">
            {SERVICES.map((s) => (
              <a href="#ai-assistant" key={s.title} className="service-card">
                <div className="service-icon" style={{ background: s.bg, color: s.color }}>
                  {s.icon}
                </div>
                <h3 style={{ color: s.color }}>{s.title}</h3>
                <p>{s.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* AI ASSISTANT + MAP */}
        <section id="ai-assistant" className="assistant-section">

          {/* Quick Queries */}
          <div className="quick-panel">
            <h3>Quick Queries</h3>
            <ul className="quick-list">
              {QUICK_QUERIES.map((q) => (
                <li key={q}>
                  <button className="quick-item" onClick={() => handleQuick(q)}>
                    <span>{q}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </li>
              ))}
            </ul>
            <a href="#ai-assistant" className="btn-more-queries">More Queries ↓</a>
          </div>

          {/* Chat Panel */}
          <div className="chat-panel">
            <div className="chat-header">
              <div className="chat-avatar">🤖</div>
              <div className="chat-header-text">
                <h3>AI Knowledge Assistant</h3>
                <p>Ask anything about CSC services, documents, schemes, and more...</p>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="msg-bubble msg-user">
                  PAN card ke liye kya documents lagenge?
                </div>
              )}
              {messages.length === 0 && (
                <div className="msg-bubble msg-bot">
                  <div className="msg-bot-header">✦ CSC Assistant</div>
                  {`PAN Card — Required Documents\n\n1. Aadhaar Card (Identity Proof)\n2. Passport Size Photo\n3. Signature (on white paper)\n4. Date of Birth Proof\n5. Address Proof\n\nNote: Documents may vary based on the applicant type. For exact requirements, please verify on the official portal or confirm at CSC center.`}
                  <div className="msg-source">Source: NSDL / UTITSL Official Guidelines</div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`msg-bubble ${m.type === "user" ? "msg-user" : "msg-bot"}`}>
                  {m.type === "bot" && <div className="msg-bot-header">✦ CSC Assistant</div>}
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input-row">
              <input
                type="text"
                className="chat-input"
                placeholder="Type your question in Hindi or English..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="chat-send-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>

          {/* Map Panel */}
          <div className="map-panel">
            <h3><span className="location-pin">📍</span> Our Location</h3>
            <div className="map-address">
              <h4>CSC, Shikohabad</h4>
              <p>Purana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad, Uttar Pradesh 283135</p>
            </div>
            <div className="map-iframe-wrap">
              <iframe
                title="CSC Shikohabad Location"
                src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
            <div className="map-actions">
              <a href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`} target="_blank" rel="noopener noreferrer" className="btn-map btn-map-primary">
                📍 Open in Google Maps
              </a>
              <a href="https://maps.app.goo.gl/WNidZh1cEukiXna88" target="_blank" rel="noopener noreferrer" className="btn-map btn-map-secondary">
                🔵 Get Directions
              </a>
            </div>
          </div>
        </section>

        {/* REVIEWS + STATS */}
        <section className="reviews-stats">
          <div>
            <div className="reviews-heading">
              <span>💬</span> What People Say
            </div>
            <div className="reviews-grid">
              {REVIEWS.map((r) => (
                <div key={r.name} className="review-card">
                  <div className="stars">{"★★★★★"}</div>
                  <p className="review-text">"{r.text}"</p>
                  <div className="review-author-row">
                    <div className="reviewer-avatar">{r.initial}</div>
                    <div>
                      <div className="reviewer-name">{r.name}</div>
                      <div className="reviewer-location">{r.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-panel">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer id="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Important Links</h4>
              <ul className="footer-links">
                {[
                  { label: "Official CSC Portal", href: "https://csc.gov.in/" },
                  { label: "Digital Seva Portal", href: "https://digitalseva.csc.gov.in/" },
                  { label: "PM Kisan Portal", href: "https://pmkisan.gov.in/" },
                  { label: "UIDAI (Aadhaar)", href: "https://uidai.gov.in/" },
                  { label: "Ayushman Bharat", href: "https://pmjay.gov.in/" },
                  { label: "More Links →", href: "#" },
                ].map((l) => (
                  <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer">🔗 {l.label}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact Us</h4>
              <div className="footer-contact-item">
                <span className="contact-icon">📍</span>
                <span>Purana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad, Uttar Pradesh 283135</span>
              </div>
              <div className="footer-contact-item">
                <span className="contact-icon">📞</span>
                <span>9720000000</span>
              </div>
              <div className="footer-contact-item">
                <span className="contact-icon">✉️</span>
                <span>support@cscskb.online</span>
              </div>
              <div className="footer-contact-item">
                <span className="contact-icon">🕐</span>
                <span>Mon – Sun: 9:00 AM – 7:00 PM</span>
              </div>
            </div>

            <div className="footer-col">
              <h4>Follow Us</h4>
              <div className="social-links">
                {[
                  { icon: "📘", bg: "#1877f2", href: "#" },
                  { icon: "💬", bg: "#25d366", href: "#" },
                  { icon: "▶️", bg: "#ff0000", href: "#" },
                  { icon: "📸", bg: "#e1306c", href: "#" },
                ].map((s, i) => (
                  <a key={i} href={s.href} className="social-btn" style={{ background: s.bg + "22" }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4>Scan & Connect</h4>
              <div className="qr-box">
                <div style={{ fontSize: "2.5rem" }}>📱</div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Scan to open location in maps</p>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2024 CSC. All rights reserved.</span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
