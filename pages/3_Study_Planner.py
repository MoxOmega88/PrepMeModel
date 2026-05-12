"""
pages/3_Study_Planner.py
"""
import streamlit as st
from core.session import init_session
from components.planner_view import render_study_planner

st.set_page_config(page_title="Study Planner – PrepMeAI", page_icon="📅", layout="wide")
init_session()
render_study_planner()
