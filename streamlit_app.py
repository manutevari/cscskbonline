from __future__ import annotations

import html

import streamlit as st
import streamlit.components.v1 as components

CSC_LINKS = [
    ("Official CSC Portal", "https://csc.gov.in/", "CSC Official"),
    ("Digital Seva service updates", "https://digitalseva.csc.gov.in/", "Digital Seva"),
    ("Visit Ankit Tiwari CSC Center", "https://maps.app.goo.gl/WNidZh1cEukiXna88", "Location"),
]

SERVICES = [
    ("Service", "Government Forms", "Eligibility, documents, fees, and processing time explained clearly."),
    ("AI", "Knowledge Assistant", "Hindi/English help for CSC services, schemes, FAQs, and documents."),
    ("Trust", "Reviews", "Original testimonials and local proof improve confidence and conversions."),
    ("Local", "Map Location", "One-tap directions and contact actions for mobile visitors."),
]

FAQ_ANSWERS = {
    "ayushman": "For Ayushman/PM-JAY help, bring Aadhaar, mobile number, ration card/family ID if available, and any existing health card details.",
    "pan": "For PAN support, keep Aadhaar, mobile number linked with Aadhaar, passport-size photo if required, and applicant details ready.",
    "certificate": "For certificate services, bring Aadhaar, address proof, applicant photo, and any old certificate or supporting document related to the request.",
    "payment": "For payments and receipts, keep your reference number, mobile number, and the original message or document shared by the department.",
}

st.set_page_config(
    page_title="CSCSKB Online | AI Powered CSC Platform",
    page_icon="🧾",
    layout="wide",
)


def inject_css() -> None:
    st.markdown(
        """
        <style>
          :root{--navy:#06142d;--blue:#0b72e7;--orange:#ff8a00;--green:#78d64b;--text:#f8fbff;--muted:#b7c7df;--card:rgba(255,255,255,.09)}
          .stApp{background:radial-gradient(circle at top left,rgba(255,138,0,.18),transparent 28%),linear-gradient(135deg,#06142d,#082449 48%,#06142d);color:var(--text)}
          [data-testid="stHeader"]{background:rgba(2,8,23,.72)}
          .block-container{padding-top:1.2rem;max-width:1180px}.top{padding:.75rem 1rem;background:#020817;border:1px solid rgba(255,255,255,.16);border-radius:18px;display:flex;gap:1rem;justify-content:center;align-items:center;flex-wrap:wrap;margin-bottom:1rem}
          .brand{font-size:clamp(1.4rem,3.8vw,3rem);font-weight:900;text-align:center;letter-spacing:.02em;line-height:1.15}.brand b{color:var(--orange)}.brand span{color:#76d8ff}.brand em{color:var(--green);font-style:normal}
          .marquee{margin:1rem auto;display:flex;gap:1rem;align-items:center;overflow:hidden;padding:.75rem 1rem;border-radius:999px;background:#020817;box-shadow:0 10px 30px rgba(0,0,0,.25)}.marquee strong{color:var(--orange);white-space:nowrap}.track{display:flex;gap:2rem;white-space:nowrap;animation:scroll 32s linear infinite}.track a{color:white!important;text-decoration:none}.track span{color:var(--green);margin-left:.35rem}@keyframes scroll{from{transform:translateX(12%)}to{transform:translateX(-100%)}}
          .panel{background:var(--card);border:1px solid rgba(255,255,255,.18);border-radius:24px;padding:1.5rem;backdrop-filter:blur(10px);height:100%;box-shadow:0 18px 50px rgba(0,0,0,.22)}h1{font-size:clamp(2rem,5vw,4.5rem)!important;line-height:1!important;margin:.25rem 0!important;color:white!important} h2,h3{color:white!important} p, li{color:var(--muted);font-size:1.05rem}.cta{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1.25rem}.btn{display:inline-block;padding:.85rem 1rem;border-radius:999px;text-decoration:none!important;font-weight:800}.primary{background:var(--orange);color:#120800!important}.secondary{background:#12335f;color:white!important;border:1px solid rgba(255,255,255,.2)}
          .card{background:var(--card);border:1px solid rgba(255,255,255,.16);border-radius:20px;padding:1rem;min-height:210px}.badge{display:inline-flex;border-radius:999px;background:rgba(120,214,75,.15);color:#9cf56f;padding:.3rem .55rem;font-size:.8rem;font-weight:800}.review{border-left:4px solid var(--orange)}.metric-row{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-top:1rem}.mini{background:rgba(2,8,23,.62);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:.8rem;text-align:center}.mini b{display:block;color:white;font-size:1.35rem}.footer{text-align:center;padding:2rem;color:var(--muted);border-top:1px solid rgba(255,255,255,.12);margin-top:2rem}
          @media(max-width:700px){.metric-row{grid-template-columns:1fr}.marquee{border-radius:18px;align-items:flex-start}.track{animation:none;overflow:auto}.card{min-height:auto}}
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_header() -> None:
    links = "".join(
        f'<a href="{url}" target="_blank">{html.escape(label)} <span>{html.escape(tag)}</span></a>'
        for label, url, tag in CSC_LINKS
    )
    st.markdown(
        f"""
        <header class="top">
          <div class="brand"><b>CSCSKB ONLINE</b> – <span>AI Powered CSC</span> <em>Knowledge & Service Platform</em></div>
        </header>
        <nav class="marquee" aria-label="Latest CSC updates">
          <strong>Latest CSC Updates</strong>
          <div class="track">{links}</div>
        </nav>
        """,
        unsafe_allow_html=True,
    )


def render_hero() -> None:
    hero, aside = st.columns([1.2, 0.8], gap="large")
    with hero:
        st.markdown(
            """
            <section class="panel">
              <span class="badge">Streamlit Cloud ready</span>
              <h1>Fast, trusted CSC help with AI guidance.</h1>
              <p>Deploy this CSCSKB Online landing page directly on Streamlit Cloud with the same high-conversion CSC style: official update links, service shortcuts, local trust proof, and map route actions.</p>
              <div class="cta">
                <a class="btn primary" href="#services">Explore Services</a>
                <a class="btn secondary" href="https://maps.app.goo.gl/WNidZh1cEukiXna88" target="_blank">Get Directions</a>
                <a class="btn secondary" href="#ai-assistant">Ask AI Assistant</a>
              </div>
              <div class="metric-row">
                <div class="mini"><b>4+</b>Service groups</div>
                <div class="mini"><b>24/7</b>Online guidance</div>
                <div class="mini"><b>1-tap</b>Map route</div>
              </div>
            </section>
            """,
            unsafe_allow_html=True,
        )
    with aside:
        st.markdown(
            """
            <aside class="panel">
              <span class="badge">Local CSC Center</span>
              <h2>Ankit Tiwari CSC Center</h2>
              <p>Digital India • Power To Empower</p>
              <ul>
                <li>Government forms and certificates</li>
                <li>Scheme/document guidance</li>
                <li>Payment and application support</li>
              </ul>
            </aside>
            """,
            unsafe_allow_html=True,
        )


def render_services() -> None:
    st.markdown('<div id="services"></div>', unsafe_allow_html=True)
    cols = st.columns(4, gap="medium")
    for col, (badge, title, body) in zip(cols, SERVICES):
        col.markdown(
            f'<article class="card"><span class="badge">{html.escape(badge)}</span><h3>{html.escape(title)}</h3><p>{html.escape(body)}</p></article>',
            unsafe_allow_html=True,
        )


def render_assistant() -> None:
    st.markdown('<div id="ai-assistant"></div>', unsafe_allow_html=True)
    left, right = st.columns(2, gap="large")
    with left:
        st.markdown(
            """
            <article class="panel review">
              <h2>Original Review</h2>
              <p>“Very helpful CSC center for online government services. The guidance was clear, the process was transparent, and my work was completed on time.”</p>
            </article>
            """,
            unsafe_allow_html=True,
        )
        question = st.text_input("Ask quick CSC guidance", placeholder="Example: documents for PAN or Ayushman card")
        if question:
            answer = next((text for key, text in FAQ_ANSWERS.items() if key in question.lower()), None)
            st.success(answer or "Please visit the CSC center with Aadhaar, mobile number, and any related document so the exact service requirement can be checked.")
    with right:
        st.markdown('<article class="panel"><h2>Map Location</h2></article>', unsafe_allow_html=True)
        components.iframe(
            "https://www.google.com/maps?q=Ankit%20Tiwari%20CSC%20Center&output=embed",
            height=320,
            scrolling=False,
        )


def render_sidebar() -> None:
    with st.sidebar:
        st.title("CSCSKB Online")
        st.caption("Streamlit deployment controls")
        st.link_button("Official CSC Portal", "https://csc.gov.in/", use_container_width=True)
        st.link_button("Digital Seva", "https://digitalseva.csc.gov.in/", use_container_width=True)
        st.link_button("Get Directions", "https://maps.app.goo.gl/WNidZh1cEukiXna88", use_container_width=True)
        st.info("Deploy on Streamlit Cloud with main file path: `streamlit_app.py`.")


inject_css()
render_sidebar()
render_header()
render_hero()
render_services()
render_assistant()
st.markdown('<div class="footer">Streamlit deployment build — ready for Streamlit Cloud from <code>streamlit_app.py</code>.</div>', unsafe_allow_html=True)
