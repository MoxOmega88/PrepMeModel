"""
pages/5_Profile.py
"""
import streamlit as st
from core.session import init_session
from components.profile_settings import render_profile_page

st.set_page_config(page_title="Profile – PrepMeAI", page_icon="👤", layout="wide")
init_session()
render_profile_page()
