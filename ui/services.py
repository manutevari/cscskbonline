# ui/services.py
import html
import streamlit as st

SERVICES = [
    ("Service", "Government Forms", "Eligibility, documents, fees, and processing time explained clearly."),
    ("AI", "Knowledge Assistant", "Hindi/English help for CSC services, schemes, FAQs, and documents."),
    ("Trust", "Reviews", "Original testimonials and local proof improve confidence and conversions."),
    ("Local", "Map Location", "One-tap directions and contact actions for mobile visitors."),
]

def render_services() -> None:
    st.markdown('<div id="services"></div>', unsafe_allow_html=True)
    cols = st.columns(4, gap="medium")
    for col, (badge, title, body) in zip(cols, SERVICES):
        col.markdown(
            f'<article class="card"><span class="badge">{html.escape(badge)}</span><h3>{html.escape(title)}</h3><p>{html.escape(body)}</p></article>',
            unsafe_allow_html=True,
        )
