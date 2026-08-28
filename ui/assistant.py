# ui/assistant.py
import streamlit as st
from core.answer_engine import generate_answer
from core.confidence import ConfidenceLevel

def render_assistant() -> None:
    st.markdown('<div id="ai-assistant"></div>', unsafe_allow_html=True)
    st.markdown("<h2>AI Knowledge Assistant</h2>", unsafe_allow_html=True)
    
    question = st.text_input("Ask CSC guidance (e.g., PAN card ke liye documents?)")
    
    if question:
        with st.spinner("Analyzing..."):
            result = generate_answer(question)
            
            if result['confidence'] == ConfidenceLevel.HIGH.name:
                st.success(result['answer'])
            elif result['confidence'] == ConfidenceLevel.MEDIUM.name:
                st.warning(result['answer'])
            else:
                st.info(result['answer'])
                
            if result['source']:
                st.markdown(f"**Official Source:** [{result['source']}]({result['source']})")
