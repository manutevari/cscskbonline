# ui/header.py
import html
import streamlit as st

CSC_LINKS = [
    ("Official CSC Portal", "https://csc.gov.in/", "CSC Official"),
    ("Digital Seva service updates", "https://digitalseva.csc.gov.in/", "Digital Seva"),
    ("Visit CSC Shikohabad", "https://maps.app.goo.gl/WNidZh1cEukiXna88", "Location"),
]

def render_header() -> None:
    links = "".join(
        f'<a href="{url}" target="_blank">{html.escape(label)} <span>{html.escape(tag)}</span></a>'
        for label, url, tag in CSC_LINKS
    )
    st.markdown(
        f"""
        <header class="top">
          <div class="brand"><b>CSC</b><br><span style="font-size: 0.5em; color: var(--muted); font-weight: 500;">Ankit Tiwari CSC Center</span></div>
        </header>
        <nav class="marquee" aria-label="Latest CSC updates">
          <strong>Latest CSC Updates</strong>
          <div class="track">{links}</div>
        </nav>
        """,
        unsafe_allow_html=True,
    )
