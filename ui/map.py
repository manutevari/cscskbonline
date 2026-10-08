# ui/map.py
import streamlit as st
import streamlit.components.v1 as components

def render_map() -> None:
    st.markdown('<article class="panel"><h2>Map Location</h2></article>', unsafe_allow_html=True)
    # The requirement specifically mentions removing 'Ankit Tiwari CSC Center' and using the precise location:
    # Purana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad, Uttar Pradesh 283135
    map_query = "Purana+Bijli+Office,+Agra+Road,+near+Roadways+Bus+Stand,+Shikohabad,+Uttar+Pradesh+283135"
    components.iframe(
        f"https://www.google.com/maps?q={map_query}&output=embed",
        height=320,
        scrolling=False,
    )
