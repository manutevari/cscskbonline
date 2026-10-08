# ui/hero.py
import streamlit as st

def render_hero() -> None:
    hero, aside = st.columns([1.2, 0.8], gap="large")
    with hero:
        st.markdown(
            """
            <section class="panel">
              <span class="badge">CSC Verified</span>
              <h1>Fast, trusted CSC help with AI guidance.</h1>
              <p>Experience the new AI-powered CSC Knowledge Platform. Get instant answers to your service questions, eligibility, required documents, and process steps with high accuracy.</p>
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
