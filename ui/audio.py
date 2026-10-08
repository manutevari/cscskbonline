# ui/audio.py
import streamlit as st
import streamlit.components.v1 as components
import base64
import os

def render_audio() -> None:
    audio_path = "assets/audio/TIWARIJIKCSCCENTER.mp3"
    
    if not os.path.exists(audio_path):
        # Fallback to the original path if for some reason the file didn't move correctly
        audio_path = "frontend/public/audio/TIWARIJIKCSCCENTER.mp3"
        
    if not os.path.exists(audio_path):
        return
        
    with open(audio_path, "rb") as f:
        audio_bytes = f.read()
    
    b64_audio = base64.b64encode(audio_bytes).decode()
    audio_src = f"data:audio/mp3;base64,{b64_audio}"

    # We use session state to ensure we only try to autoplay once
    # and we provide a fallback UI
    if 'audio_rendered' not in st.session_state:
        st.session_state.audio_rendered = True
    
    html_code = f"""
    <div id="audio-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: rgba(2, 8, 23, 0.8); padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(5px);">
        <audio id="csc-audio" loop>
            <source src="{audio_src}" type="audio/mp3">
            Your browser does not support the audio element.
        </audio>
        <button id="audio-toggle" style="background: transparent; border: none; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold;">
            <span id="audio-icon">🔇</span> <span id="audio-text">Play Music</span>
        </button>
    </div>

    <script>
        const audio = document.getElementById("csc-audio");
        const toggle = document.getElementById("audio-toggle");
        const icon = document.getElementById("audio-icon");
        const text = document.getElementById("audio-text");
        
        let isPlaying = false;
        
        function updateUI(playing) {{
            if (playing) {{
                icon.textContent = "🔊";
                text.textContent = "Pause Music";
            }} else {{
                icon.textContent = "🔇";
                text.textContent = "Play Music";
            }}
        }}

        // Attempt autoplay
        const playPromise = audio.play();
        if (playPromise !== undefined) {{
            playPromise.then(_ => {{
                // Autoplay started!
                isPlaying = true;
                updateUI(true);
            }}).catch(error => {{
                // Autoplay was prevented.
                isPlaying = false;
                updateUI(false);
            }});
        }}

        toggle.addEventListener("click", () => {{
            if (isPlaying) {{
                audio.pause();
                isPlaying = false;
            }} else {{
                audio.play();
                isPlaying = true;
            }}
            updateUI(isPlaying);
        }});
    </script>
    """
    
    components.html(html_code, height=60)
