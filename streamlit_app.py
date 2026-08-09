from __future__ import annotations

import base64
import html
import os

import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="CSC Shikohabad | AI Knowledge Platform",
    page_icon="🧾",
    layout="wide",
)

from core.answer_engine import generate_answer
from core.confidence import ConfidenceLevel

UPDATES = [
    ("#78d64b", "PMGDISHA Registration Open"),
    ("#ff8a00", "Ayushman Card Update"),
    ("#0b72e7", "Voter ID Special Drive"),
    ("#ffc107", "PM Kisan eKYC Last Date Extended"),
    ("#e855e8", "New Aadhaar Correction Portal Live"),
]

NAV_LINKS = [
    ("🌐", "Official CSC Portal", "https://csc.gov.in/"),
    ("💻", "Digital Seva Portal", "https://digitalseva.csc.gov.in/"),
    ("🗂️", "CSC Services", "#services"),
    ("📞", "Contact Us", "#contact"),
]

SERVICES = [
    ("📋", "#ff8a00", "rgba(255,138,0,0.15)", "Government Forms", "Apply for government forms & certificates"),
    ("🤖", "#0b72e7", "rgba(11,114,231,0.15)", "AI Knowledge Assistant", "Get instant answers to your CSC queries"),
    ("📜", "#78d64b", "rgba(120,214,75,0.15)", "Certificate Services", "All certificate types made easy"),
    ("💳", "#ff8a00", "rgba(255,138,0,0.12)", "Digital Payments", "Safe, secure and instant payments"),
    ("🏛️", "#a78bfa", "rgba(167,139,250,0.15)", "Schemes & Benefits", "Government welfare scheme info"),
    ("📍", "#34d399", "rgba(52,211,153,0.15)", "Maps & Location", "Find us easily and get directions"),
]

QUICK_QUERIES = [
    "PAN card ke documents?",
    "Ayushman card kaise bane?",
    "PM Kisan eligibility?",
    "Voter ID apply kaise kare?",
    "Income certificate ke liye?",
    "CSC Shikohabad kahan hai?",
    "Aadhaar update kaise kare?",
    "Passport apply process?",
]

REVIEWS = [
    ("R", "#0b72e7", "Bahut achha service mila, mera Ayushman card ban gaya bina koi dikkat ke.", "Ramesh Singh", "Shikohabad"),
    ("P", "#78d64b", "Income certificate ke liye help mili, process bahut fast aur transparent tha.", "Pooja Verma", "Shikohabad"),
    ("A", "#a78bfa", "Yahan par sabhi CSC services easy aur fast milti hain. Thank you!", "Amit Kumar", "Shikohabad"),
]

STATS = [("📋", "100+", "Services"), ("😊", "5000+", "Happy Customers"), ("🎧", "24/7", "Support"), ("✅", "100%", "Satisfaction")]

MAP_QUERY = "Purana+Bijli+Office,+Agra+Road,+near+Roadways+Bus+Stand,+Shikohabad,+Uttar+Pradesh+283135"
MAP_LABEL = "Purana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad, Uttar Pradesh 283135"
PHONE = "+91-8937887070"
PHOTO_PATH = "frontend/public/photo.jpg"
STOREFRONT_PATH = "assets/storefront.png"
AUDIO_PATH = "assets/audio/TIWARIJIKCSCCENTER.mp3"


def load_b64(path: str) -> str | None:
    if os.path.exists(path):
        with open(path, "rb") as file:
            return base64.b64encode(file.read()).decode()
    return None


def render_css() -> None:
    st.markdown(
        """
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
  :root{--navy:#06142d;--navy-dark:#020817;--orange:#ff8a00;--orange-l:#ffae00;--blue:#0b72e7;--blue-l:#3b9eff;--green:#78d64b;--text:#f8fbff;--muted:#b7c7df;--muted-d:#7a94b8;--card:rgba(255,255,255,.06);--border:rgba(255,255,255,.12)}
  html,body,.stApp{font-family:'Outfit',system-ui,sans-serif!important;background:radial-gradient(ellipse 80% 60% at 10% 0%,rgba(11,114,231,.18) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 90% 10%,rgba(255,138,0,.12) 0%,transparent 45%),linear-gradient(160deg,#040f25 0%,#07183a 40%,#050e23 100%)!important;color:var(--text)!important}
  [data-testid="stHeader"]{background:rgba(2,8,23,.95)!important;border-bottom:1px solid var(--border)!important}[data-testid="stSidebar"]{background:rgba(2,8,23,.97)!important;border-right:1px solid var(--border)!important}[data-testid="stSidebar"] *{color:var(--muted)!important}.block-container{padding-top:0!important;max-width:1280px!important}
  .stTextInput input{background:rgba(2,8,23,.7)!important;border:1px solid var(--border)!important;border-radius:10px!important;color:#fff!important;font-family:'Outfit',sans-serif!important;font-size:.95rem!important;padding:.7rem 1rem!important}.stTextInput input:focus{border-color:var(--blue)!important;box-shadow:0 0 12px rgba(11,114,231,.25)!important}
  .stButton>button{background:linear-gradient(135deg,var(--orange),var(--orange-l))!important;color:#120800!important;font-weight:800!important;border:none!important;border-radius:10px!important;padding:.55rem 1.2rem!important;font-family:'Outfit',sans-serif!important;transition:all .25s ease!important}.stButton>button:hover{transform:translateY(-2px)!important;box-shadow:0 8px 20px rgba(255,138,0,.4)!important}
  .panel{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:1.5rem;backdrop-filter:blur(14px);box-shadow:0 12px 40px rgba(0,0,0,.3)}.panel:hover{border-color:rgba(255,255,255,.22)}
  h1{font-size:clamp(2.5rem,6vw,4.5rem)!important;color:#fff!important;line-height:.95!important;margin:0!important}h2,h3{color:#fff!important}p,li{color:var(--muted)!important}.badge{display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .65rem;border-radius:999px;font-size:.72rem;font-weight:800;text-transform:uppercase}.btn-link{display:inline-block;padding:.75rem 1.3rem;border-radius:10px;text-decoration:none!important;font-weight:800;transition:all .25s}.svc-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.25rem;text-align:center;cursor:pointer;transition:all .25s;height:100%}.svc-card:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.22)}.review-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.2rem}.stat-box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.1rem;text-align:center}.chat-msg-user{background:linear-gradient(135deg,var(--blue),#0f5bc7);border-radius:14px 14px 4px 14px;padding:.7rem 1rem;color:#fff;font-size:.88rem;margin-left:auto;max-width:82%;width:fit-content;animation:fade .3s ease-out}.chat-msg-bot{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px 14px 14px 4px;padding:.75rem 1rem;color:var(--text);font-size:.88rem;max-width:90%;animation:fade .3s ease-out;white-space:pre-wrap}@keyframes fade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}footer{text-align:center;padding:1.5rem;color:var(--muted);border-top:1px solid var(--border);margin-top:2rem}#MainMenu{visibility:hidden!important}.stDeployButton,[data-testid="stStatusWidget"]{display:none!important}
  @media(max-width:760px){.mobile-stack{grid-template-columns:1fr!important}.updates-shell{padding:.6rem .8rem!important;align-items:flex-start!important}.updates-cta{display:none!important}}
</style>
""",
        unsafe_allow_html=True,
    )


def render_audio() -> None:
    audio = load_b64(AUDIO_PATH)
    if not audio:
        return
    components.html(
        f"""
<div style="position:fixed;bottom:20px;right:20px;z-index:9999;background:rgba(2,8,23,.9);padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(8px);display:flex;align-items:center;gap:10px;">
  <audio id="csc-audio" loop><source src="data:audio/mpeg;base64,{audio}" type="audio/mpeg"></audio>
  <div><div style="font-size:.65rem;color:#b7c7df;font-weight:700;">🎵 Background Music</div><div id="music-status" style="font-size:.6rem;color:#78d64b;font-weight:700;">Click ▶ to play</div></div>
  <button id="music-toggle" onclick="toggleAudio()" style="background:transparent;border:1px solid rgba(255,255,255,.2);color:#fff;cursor:pointer;font-size:.85rem;border-radius:7px;padding:4px 8px;transition:all .2s;">▶</button>
</div>
<script>
const a=document.getElementById('csc-audio'),s=document.getElementById('music-status'),b=document.getElementById('music-toggle');let playing=false;function toggleAudio(){{if(playing){{a.pause();playing=false;s.textContent='Paused';b.textContent='▶';}}else{{a.play();playing=true;s.textContent='Playing...';b.textContent='⏸';}}}}
</script>
""",
        height=70,
    )


def render_navbar() -> None:
    links = "".join(
        f'<a href="{url}" target="_blank" style="display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:.35rem .85rem;border-radius:9px;text-decoration:none;color:#b7c7df;font-size:.72rem;font-weight:600;transition:all .25s;">{icon}<span>{html.escape(label)}</span></a>'
        for icon, label, url in NAV_LINKS
    )
    st.markdown(
        f"""
<nav style="display:flex;align-items:center;justify-content:space-between;padding:.7rem 2rem;background:rgba(2,8,23,.95);border-bottom:1px solid rgba(255,255,255,.08);position:sticky;top:0;z-index:50;gap:1rem;flex-wrap:wrap;">
  <div style="display:flex;align-items:center;gap:.75rem;"><div><div style="font-size:2rem;font-weight:900;color:#ff8a00;line-height:1;">CSC</div><div style="font-size:.65rem;color:#b7c7df;font-weight:500;">Ankit Tiwari CSC Center</div></div><div style="width:1px;height:36px;background:rgba(255,255,255,.15);"></div></div>
  <div style="display:flex;align-items:center;gap:.25rem;flex:1;justify-content:center;flex-wrap:wrap;">{links}</div>
</nav>
""",
        unsafe_allow_html=True,
    )


def render_updates_bar() -> None:
    items = "".join(
        f'<span style="display:inline-flex;align-items:center;gap:.4rem;font-size:.82rem;color:#f8fbff;font-weight:500;"><span style="width:6px;height:6px;border-radius:50%;background:{color};display:inline-block;flex-shrink:0;"></span>{html.escape(text)}</span>'
        for color, text in UPDATES * 3
    )
    st.markdown(
        f"""
<div class="updates-shell" style="background:rgba(2,8,23,.85);border-bottom:1px solid rgba(255,255,255,.07);padding:.5rem 2rem;display:flex;align-items:center;gap:1rem;overflow:hidden;">
  <div style="display:flex;align-items:center;gap:.5rem;white-space:nowrap;font-size:.75rem;font-weight:800;color:#ff8a00;text-transform:uppercase;letter-spacing:.05em;flex-shrink:0;"><span style="width:7px;height:7px;border-radius:50%;background:#ff8a00;display:inline-block;"></span>Latest CSC Updates:</div>
  <div style="flex:1;overflow:hidden;display:flex;"><div style="display:flex;gap:2.5rem;white-space:nowrap;animation:ticker 32s linear infinite;">{items}</div></div>
  <a class="updates-cta" href="https://csc.gov.in/" target="_blank" style="display:inline-flex;align-items:center;gap:.3rem;padding:.3rem .85rem;border-radius:6px;background:#ff8a00;color:#120800;font-size:.75rem;font-weight:800;text-decoration:none;flex-shrink:0;">View All →</a>
</div>
""",
        unsafe_allow_html=True,
    )


def render_hero() -> None:
    hero_col, aside_col = st.columns([1.15, 0.85], gap="large")
    with hero_col:
        st.markdown(
            """
<div class="panel"><p style="font-size:.85rem;color:#b7c7df;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.2rem;">Welcome to</p><h1 style="font-size:clamp(3rem,7vw,5rem)!important;font-weight:900!important;color:#fff!important;line-height:.9!important;letter-spacing:-.03em;">CSC</h1><h2 style="font-size:1.4rem!important;font-weight:700!important;color:#ff8a00!important;margin:.4rem 0 .8rem!important;">Ankit Tiwari CSC Center</h2><p style="color:#b7c7df;font-size:1rem;margin-bottom:1.5rem;max-width:480px;line-height:1.6;">Your trusted partner for Digital India services, Government schemes, and online solutions.</p><div style="display:flex;gap:.8rem;flex-wrap:wrap;margin-bottom:1.5rem;"><div style="display:flex;align-items:center;gap:.5rem;padding:.55rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:.8rem;color:#f8fbff;font-weight:600;">🛡️ <div><b style="display:block;font-size:.95rem;color:#fff;">Trusted</b><span style="font-size:.7rem;color:#b7c7df;">CSC Center</span></div></div><div style="display:flex;align-items:center;gap:.5rem;padding:.55rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:.8rem;color:#f8fbff;font-weight:600;">📋 <div><b style="display:block;font-size:.95rem;color:#fff;">100+</b><span style="font-size:.7rem;color:#b7c7df;">Services</span></div></div><div style="display:flex;align-items:center;gap:.5rem;padding:.55rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:.8rem;color:#f8fbff;font-weight:600;">⚡ <div><b style="display:block;font-size:.95rem;color:#fff;">Fast & Easy</b><span style="font-size:.7rem;color:#b7c7df;">Solutions</span></div></div><div style="display:flex;align-items:center;gap:.5rem;padding:.55rem .9rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:.8rem;color:#f8fbff;font-weight:600;">🔒 <div><b style="display:block;font-size:.95rem;color:#fff;">Secure</b><span style="font-size:.7rem;color:#b7c7df;">& Reliable</span></div></div></div><div style="display:flex;gap:.7rem;flex-wrap:wrap;"><a href="#services" class="btn-link" style="background:linear-gradient(135deg,#ff8a00,#ffae00);color:#120800;">🗂️ Explore Services</a><a href="https://maps.app.goo.gl/WNidZh1cEukiXna88" target="_blank" class="btn-link" style="background:rgba(18,51,95,.6);color:#fff;border:1px solid rgba(255,255,255,.15);">📍 Get Directions</a><a href="#ai-assistant" class="btn-link" style="background:rgba(18,51,95,.6);color:#fff;border:1px solid rgba(255,255,255,.15);">🤖 Ask AI Assistant</a></div></div>
""",
            unsafe_allow_html=True,
        )
    with aside_col:
        photo_b64 = load_b64(PHOTO_PATH)
        storefront_b64 = load_b64(STOREFRONT_PATH)
        photo_tag = f'<img src="data:image/jpeg;base64,{photo_b64}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #ff8a00;flex-shrink:0;" />' if photo_b64 else '<div style="width:64px;height:64px;border-radius:50%;background:#1a3060;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">👤</div>'
        storefront_tag = f'<img src="data:image/png;base64,{storefront_b64}" style="width:100%;height:150px;object-fit:cover;border-radius:12px;border:1px solid rgba(255,255,255,.1);margin-top:.75rem;" />' if storefront_b64 else ""
        feature_items = "".join(
            f'<li style="display:flex;align-items:center;gap:.6rem;padding:.4rem 0;color:#b7c7df;font-size:.88rem;border-bottom:1px solid rgba(255,255,255,.05);"><span style="width:22px;height:22px;border-radius:6px;background:{bg};color:{color};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.75rem;">{icon}</span>{text}</li>'
            for icon, color, bg, text in [
                ("📋", "#ff8a00", "rgba(255,138,0,.15)", "Government Forms & Certificates"),
                ("🎓", "#0b72e7", "rgba(11,114,231,.15)", "Scheme & Document Guidance"),
                ("💳", "#78d64b", "rgba(120,214,75,.15)", "Online Payment & Applications"),
                ("🗣️", "#a78bfa", "rgba(167,139,250,.15)", "Support in Hindi & English"),
                ("⚡", "#ffc107", "rgba(255,193,7,.15)", "Quick, Transparent & Reliable Service"),
            ]
        )
        st.markdown(f"""<div class="panel" style="position:relative;overflow:hidden;"><div style="position:absolute;top:-50%;right:-30%;width:260px;height:260px;background:radial-gradient(circle,rgba(11,114,231,.15),transparent 70%);pointer-events:none;"></div><span class="badge" style="background:rgba(120,214,75,.12);border:1px solid rgba(120,214,75,.25);color:#78d64b;margin-bottom:.75rem;">✦ Your Local CSC Center</span><div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1rem;">{photo_tag}<div><div style="font-size:1.3rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:.4rem;">Ankit Tiwari CSC Center <span style="width:18px;height:18px;background:#0b72e7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.6rem;color:#fff;">✓</span></div><p style="font-size:.82rem;color:#b7c7df;margin:0;">Digital India • Power To Empower</p></div></div><ul style="list-style:none;padding:0;margin:0 0 .75rem 0;">{feature_items}</ul>{storefront_tag}</div>""", unsafe_allow_html=True)


def render_services() -> None:
    st.markdown('<div id="services"></div>', unsafe_allow_html=True)
    st.markdown('<div style="text-align:center;margin:2rem 0 1.5rem;"><h2 style="font-size:2rem!important;font-weight:800!important;color:#fff!important;margin-bottom:.4rem;">Our Key Services</h2><div style="width:60px;height:3px;background:linear-gradient(90deg,#ff8a00,#0b72e7);border-radius:2px;margin:.4rem auto 0;"></div><p style="color:#b7c7df;font-size:.9rem;margin-top:.5rem;">Comprehensive government services at your local CSC center</p></div>', unsafe_allow_html=True)
    cols = st.columns(6, gap="small")
    for col, (icon, color, bg, title, desc) in zip(cols, SERVICES):
        col.markdown(f'<div class="svc-card"><div style="width:52px;height:52px;border-radius:13px;background:{bg};color:{color};display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin:0 auto .6rem;">{icon}</div><h3 style="font-size:.82rem!important;font-weight:700!important;color:{color}!important;margin:.4rem 0 .3rem!important;">{html.escape(title)}</h3><p style="font-size:.72rem!important;color:#b7c7df!important;line-height:1.4!important;">{html.escape(desc)}</p></div>', unsafe_allow_html=True)


def render_assistant_section() -> None:
    st.markdown('<div id="ai-assistant"></div>', unsafe_allow_html=True)
    quick_col, chat_col, map_col = st.columns([1, 2, 1.3], gap="medium")
    with quick_col:
        st.markdown('<div class="panel" style="height:100%;"><h3 style="font-size:.9rem!important;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:.6rem;margin-bottom:.75rem;">Quick Queries</h3></div>', unsafe_allow_html=True)
        for query in QUICK_QUERIES:
            if st.button(query, key=f"quick_{query}", use_container_width=True):
                result = generate_answer(query)
                st.session_state.setdefault("chat_history", [])
                st.session_state.chat_history.append(("user", query))
                st.session_state.chat_history.append(("bot", result["answer"], result.get("source"), result.get("confidence", ConfidenceLevel.MEDIUM.value)))
                st.rerun()
    with chat_col:
        st.markdown('<div style="background:var(--card);border:1px solid var(--border);border-radius:18px;padding:1.25rem;"><div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:1px solid rgba(255,255,255,.08);"><div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#0b72e7,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">🤖</div><div><div style="font-size:1rem;font-weight:700;color:#fff;">AI Knowledge Assistant</div><div style="font-size:.73rem;color:#b7c7df;">Ask anything about CSC services, documents, schemes, and more...</div></div></div>', unsafe_allow_html=True)
        history = st.session_state.get("chat_history", [])
        if not history:
            st.markdown('<div style="display:flex;flex-direction:column;gap:.6rem;min-height:200px;"><div class="chat-msg-user">PAN card ke liye kya documents lagenge?</div><div class="chat-msg-bot"><b style="font-size:.72rem;color:#78d64b;">✦ CSC Assistant</b><br>PAN Card — Required Documents\n\n1. Aadhaar Card\n2. Passport Size Photo\n3. Signature on white paper\n4. Date of Birth Proof if DOB is not in Aadhaar\n5. Please visit CSC center with your Aadhaar and relevant documents for exact service requirements. You can also call: +91-8937887070.<span style="font-size:.7rem;color:#7a94b8;display:block;margin-top:.4rem;border-top:1px solid rgba(255,255,255,.08);padding-top:.4rem;font-style:italic;">Source: NSDL / UTIITSL Official Guidelines</span></div></div>', unsafe_allow_html=True)
        else:
            messages = "<div style='display:flex;flex-direction:column;gap:.6rem;max-height:320px;overflow-y:auto;'>"
            for item in history:
                if item[0] == "user":
                    messages += f'<div class="chat-msg-user">{html.escape(item[1])}</div>'
                else:
                    source = f'<span style="font-size:.7rem;color:#7a94b8;display:block;margin-top:.4rem;border-top:1px solid rgba(255,255,255,.08);padding-top:.4rem;font-style:italic;">Source: {html.escape(item[2])}</span>' if len(item) > 2 and item[2] else ""
                    messages += f'<div class="chat-msg-bot"><b style="font-size:.72rem;color:#78d64b;">✦ CSC Assistant</b><br><span style="white-space:pre-wrap;">{html.escape(item[1])}</span>{source}</div>'
            messages += "</div>"
            st.markdown(messages, unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
        with st.form("chat_form", clear_on_submit=True):
            question = st.text_input("", placeholder="Type your question in Hindi or English...", label_visibility="collapsed")
            submitted = st.form_submit_button("➤ Send", use_container_width=False)
            if submitted and question.strip():
                result = generate_answer(question.strip())
                st.session_state.setdefault("chat_history", [])
                st.session_state.chat_history.append(("user", question.strip()))
                st.session_state.chat_history.append(("bot", result["answer"], result.get("source"), result.get("confidence", ConfidenceLevel.MEDIUM.value)))
                st.rerun()
    with map_col:
        st.markdown(f'<div class="panel"><h3 style="font-size:1rem!important;display:flex;align-items:center;gap:.4rem;margin-bottom:.75rem!important;"><span style="color:#ea4335;">📍</span> Our Location</h3><div style="padding:.7rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;margin-bottom:.8rem;"><div style="font-size:.88rem;font-weight:700;color:#fff;margin-bottom:.2rem;">CSC, Shikohabad</div><div style="font-size:.75rem;color:#b7c7df;line-height:1.5;">{MAP_LABEL}</div></div></div>', unsafe_allow_html=True)
        components.iframe(f"https://www.google.com/maps?q={MAP_QUERY}&output=embed", height=220, scrolling=False)
        st.markdown(f'<div style="display:flex;gap:.5rem;margin-top:.5rem;"><a href="https://www.google.com/maps/search/?api=1&query={MAP_QUERY}" target="_blank" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:.3rem;padding:.6rem .5rem;border-radius:9px;font-size:.75rem;font-weight:700;background:rgba(11,114,231,.2);border:1px solid rgba(11,114,231,.3);color:#3b9eff;text-decoration:none;">📍 Open in Maps</a><a href="https://maps.app.goo.gl/WNidZh1cEukiXna88" target="_blank" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:.3rem;padding:.6rem .5rem;border-radius:9px;font-size:.75rem;font-weight:700;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#b7c7df;text-decoration:none;">🔵 Get Directions</a></div>', unsafe_allow_html=True)


def render_reviews_stats() -> None:
    reviews_col, stats_col = st.columns([2.2, 1], gap="large")
    with reviews_col:
        st.markdown('<div style="display:flex;align-items:center;gap:.5rem;font-size:1.15rem;font-weight:800;color:#fff;margin-bottom:1rem;">💬 What People Say</div>', unsafe_allow_html=True)
        cols = st.columns(3, gap="medium")
        for col, (initial, color, text, name, location) in zip(cols, REVIEWS):
            col.markdown(f'<div class="review-card"><div style="color:#ffc107;font-size:1rem;margin-bottom:.65rem;">★★★★★</div><p style="font-size:.83rem!important;color:#b7c7df!important;font-style:italic;line-height:1.6;margin-bottom:.9rem;">“{html.escape(text)}”</p><div style="display:flex;align-items:center;gap:.55rem;"><div style="width:32px;height:32px;border-radius:50%;background:{color}33;border:1px solid {color}44;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#fff;font-weight:700;flex-shrink:0;">{initial}</div><div><div style="font-size:.82rem;font-weight:700;color:#fff;">{html.escape(name)}</div><div style="font-size:.72rem;color:#7a94b8;">{html.escape(location)}</div></div></div></div>', unsafe_allow_html=True)
    with stats_col:
        col_a, col_b = st.columns(2, gap="small")
        for col, (icon, value, label) in zip([col_a, col_b, col_a, col_b], STATS):
            col.markdown(f'<div class="stat-box" style="margin-bottom:.6rem;"><div style="font-size:1.5rem;margin-bottom:.3rem;">{icon}</div><div style="font-size:1.5rem;font-weight:900;color:#fff;line-height:1;">{value}</div><div style="font-size:.72rem;color:#b7c7df;margin-top:.2rem;">{label}</div></div>', unsafe_allow_html=True)


def render_sidebar() -> None:
    with st.sidebar:
        st.markdown('<div style="text-align:center;padding:.5rem 0;"><span style="font-size:2.5rem;font-weight:900;color:#ff8a00;">CSC</span><br><span style="font-size:.7rem;color:#b7c7df;">Ankit Tiwari CSC Center</span></div>', unsafe_allow_html=True)
        st.divider()
        st.link_button("🌐 Official CSC Portal", "https://csc.gov.in/", use_container_width=True)
        st.link_button("💻 Digital Seva", "https://digitalseva.csc.gov.in/", use_container_width=True)
        st.link_button("📍 Get Directions", "https://maps.app.goo.gl/WNidZh1cEukiXna88", use_container_width=True)
        st.divider()
        st.markdown(f'<p style="font-size:.75rem;color:#b7c7df;">📞 {PHONE}<br>🕐 Mon–Sun: 9AM–7PM</p>', unsafe_allow_html=True)


def render_footer() -> None:
    st.markdown(
        f"""
<div id="contact"></div><div style="background:rgba(2,8,23,.9);border-top:1px solid rgba(255,255,255,.08);padding:2.5rem 2rem 1.5rem;margin-top:2rem;"><div style="max-width:1280px;margin:0 auto;"><div class="mobile-stack" style="display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:2rem;margin-bottom:2rem;flex-wrap:wrap;"><div><h4 style="font-size:.82rem;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.9rem;padding-bottom:.4rem;border-bottom:1px solid rgba(255,255,255,.08);">Important Links</h4><div style="display:flex;flex-direction:column;gap:.4rem;"><a href="https://csc.gov.in/" target="_blank" style="font-size:.8rem;color:#b7c7df;text-decoration:none;">🔗 Official CSC Portal</a><a href="https://digitalseva.csc.gov.in/" target="_blank" style="font-size:.8rem;color:#b7c7df;text-decoration:none;">🔗 Digital Seva Portal</a><a href="https://pmkisan.gov.in/" target="_blank" style="font-size:.8rem;color:#b7c7df;text-decoration:none;">🔗 PM Kisan Portal</a><a href="https://uidai.gov.in/" target="_blank" style="font-size:.8rem;color:#b7c7df;text-decoration:none;">🔗 UIDAI (Aadhaar)</a><a href="https://pmjay.gov.in/" target="_blank" style="font-size:.8rem;color:#b7c7df;text-decoration:none;">🔗 Ayushman Bharat</a></div></div><div><h4 style="font-size:.82rem;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.9rem;padding-bottom:.4rem;border-bottom:1px solid rgba(255,255,255,.08);">Contact Us</h4><div style="display:flex;flex-direction:column;gap:.5rem;"><div style="display:flex;align-items:flex-start;gap:.5rem;font-size:.8rem;color:#b7c7df;"><span style="color:#ff8a00;flex-shrink:0;">📍</span><span>{MAP_LABEL}</span></div><div style="display:flex;align-items:center;gap:.5rem;font-size:.8rem;color:#b7c7df;"><span style="color:#ff8a00;">📞</span> {PHONE}</div><div style="display:flex;align-items:center;gap:.5rem;font-size:.8rem;color:#b7c7df;"><span style="color:#ff8a00;">✉️</span> support@cscskb.online</div><div style="display:flex;align-items:center;gap:.5rem;font-size:.8rem;color:#b7c7df;"><span style="color:#ff8a00;">🕐</span> Mon – Sun: 9:00 AM – 7:00 PM</div></div></div><div><h4 style="font-size:.82rem;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.9rem;padding-bottom:.4rem;border-bottom:1px solid rgba(255,255,255,.08);">Follow Us</h4><div style="display:flex;gap:.5rem;flex-wrap:wrap;"><a href="#" style="width:34px;height:34px;border-radius:8px;background:rgba(24,119,242,.2);display:flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid rgba(255,255,255,.1);">📘</a><a href="#" style="width:34px;height:34px;border-radius:8px;background:rgba(37,211,102,.2);display:flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid rgba(255,255,255,.1);">💬</a><a href="#" style="width:34px;height:34px;border-radius:8px;background:rgba(255,0,0,.2);display:flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid rgba(255,255,255,.1);">▶️</a><a href="#" style="width:34px;height:34px;border-radius:8px;background:rgba(225,48,108,.2);display:flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid rgba(255,255,255,.1);">📸</a></div></div><div><h4 style="font-size:.82rem;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.9rem;padding-bottom:.4rem;border-bottom:1px solid rgba(255,255,255,.08);">Scan & Connect</h4><div style="background:#fff;border-radius:10px;padding:.6rem;width:80px;height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:.4rem;font-size:2rem;">📱</div><p style="font-size:.72rem;color:#b7c7df;margin:0;">Scan to open location in maps</p></div></div><div style="display:flex;align-items:center;justify-content:space-between;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.08);font-size:.78rem;color:#7a94b8;flex-wrap:wrap;gap:.5rem;"><span>© 2024 CSC Shikohabad. All rights reserved.</span><div style="display:flex;gap:1.5rem;"><a href="#" style="color:#b7c7df;text-decoration:none;">Privacy Policy</a><a href="#" style="color:#b7c7df;text-decoration:none;">Terms &amp; Conditions</a></div></div></div></div>
""",
        unsafe_allow_html=True,
    )


def main() -> None:
    render_css()
    render_sidebar()
    render_navbar()
    render_updates_bar()
    st.markdown('<div style="padding:1.5rem 1rem;">', unsafe_allow_html=True)
    render_hero()
    st.markdown('<div style="margin-top:2rem;"></div>', unsafe_allow_html=True)
    render_services()
    st.markdown('<div style="margin-top:2rem;"></div>', unsafe_allow_html=True)
    render_assistant_section()
    st.markdown('<div style="margin-top:2rem;"></div>', unsafe_allow_html=True)
    render_reviews_stats()
    st.markdown("</div>", unsafe_allow_html=True)
    render_footer()
    render_audio()


if __name__ == "__main__":
    main()
