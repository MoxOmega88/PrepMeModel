"""
pages/1_AI_Tutor.py
"""
import streamlit as st
from core.session import init_session
from components.tutor_chat import render_tutor_chat

st.set_page_config(page_title="AI Tutor – PrepMeAI", page_icon="🤖", layout="wide")
init_session()
render_tutor_chat()
