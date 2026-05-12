"""
pages/2_Quiz.py
"""
import streamlit as st
from core.session import init_session
from components.quiz_view import render_quiz_page

st.set_page_config(page_title="Quiz – PrepMeAI", page_icon="📝", layout="wide")
init_session()
render_quiz_page()
