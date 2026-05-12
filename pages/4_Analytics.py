"""
pages/4_Analytics.py
"""
import streamlit as st
from core.session import init_session
from components.charts import render_analytics_page

st.set_page_config(page_title="Analytics – PrepMeAI", page_icon="📊", layout="wide")
init_session()
render_analytics_page()
