"""
PrepMeAI – Home / Dashboard
Entry point: streamlit run Home.py
"""
import streamlit as st
from core.session import init_session
from components.dashboard import render_dashboard

st.set_page_config(
    page_title="PrepMeAI – Smart Study Companion",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Authentication Check ──────────────────────────────────────────────────────
if 'student' not in st.session_state or not st.session_state.student:
    st.warning("🔒 Please sign in to access PrepMeAI")
    if st.button("Go to Sign In"):
        st.switch_page("pages/0_Auth.py")
    st.stop()

# ── Global light-theme CSS ─────────────────────────────────────────────────────
st.markdown("""
<style>
  /* ── Base resets ── */
  html, body, [data-testid="stAppViewContainer"] {
    background: #f8fafc !important;
    color: #1e293b !important;
  }

  /* ── Sidebar ── */
  [data-testid="stSidebar"] {
    background: #ffffff !important;
    border-right: 1px solid #e2e8f0 !important;
  }
  [data-testid="stSidebarNav"] a {
    font-size: 0.92rem;
    color: #475569 !important;
    border-radius: 8px;
    padding: 6px 10px;
  }
  [data-testid="stSidebarNav"] a:hover {
    background: #f0f4ff !important;
    color: #4f46e5 !important;
  }

  /* ── Metric cards ── */
  [data-testid="metric-container"] {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    padding: 1rem 1.2rem !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
  }
  [data-testid="metric-container"] label {
    color: #64748b !important;
    font-size: 0.8rem !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
  }
  [data-testid="metric-container"] [data-testid="stMetricValue"] {
    color: #1e293b !important;
    font-size: 1.8rem !important;
    font-weight: 700 !important;
  }

  /* ── Buttons ── */
  .stButton > button[kind="primary"] {
    background: #4f46e5 !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    padding: 0.5rem 1.2rem !important;
    transition: background 0.2s !important;
  }
  .stButton > button[kind="primary"]:hover {
    background: #4338ca !important;
  }
  .stButton > button[kind="secondary"] {
    background: #ffffff !important;
    color: #4f46e5 !important;
    border: 1px solid #c7d2fe !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
  }

  /* ── Expanders ── */
  [data-testid="stExpander"] {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 10px !important;
  }

  /* ── Tabs ── */
  .stTabs [data-baseweb="tab-list"] {
    background: #f0f4ff !important;
    border-radius: 10px !important;
    padding: 4px !important;
  }
  .stTabs [data-baseweb="tab"] {
    border-radius: 8px !important;
    color: #64748b !important;
    font-weight: 500 !important;
  }
  .stTabs [aria-selected="true"] {
    background: #ffffff !important;
    color: #4f46e5 !important;
    font-weight: 700 !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  }

  /* ── Chat messages ── */
  [data-testid="stChatMessage"] {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
  }

  /* ── Info / success / warning / error boxes ── */
  [data-testid="stAlert"] {
    border-radius: 10px !important;
  }

  /* ── Divider ── */
  hr { border-color: #e2e8f0 !important; }

  /* ── Hide Streamlit chrome ── */
  #MainMenu { visibility: hidden; }
  footer    { visibility: hidden; }

  /* ── Pill badges ── */
  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }
  .badge-green  { background: #dcfce7; color: #16a34a; }
  .badge-red    { background: #fee2e2; color: #dc2626; }
  .badge-yellow { background: #fef9c3; color: #ca8a04; }
  .badge-blue   { background: #dbeafe; color: #2563eb; }
  .badge-purple { background: #ede9fe; color: #7c3aed; }

  /* ── Section cards ── */
  .section-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
</style>
""", unsafe_allow_html=True)

# ── Bootstrap session ──────────────────────────────────────────────────────────
init_session()

# ── Sidebar brand ──────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0 4px">
      <span style="font-size:1.8rem">🧠</span>
      <div>
        <div style="font-size:1.1rem;font-weight:800;color:#1e293b">PrepMeAI</div>
        <div style="font-size:0.72rem;color:#64748b">AI Study Companion</div>
      </div>
    </div>
    """, unsafe_allow_html=True)
    st.divider()

    profile = st.session_state.student_profile
    st.markdown(f"""
    <div style="background:#f0f4ff;border-radius:10px;padding:10px 14px;margin-bottom:8px">
      <div style="font-weight:700;color:#1e293b">👤 {profile['name']}</div>
      <div style="font-size:0.78rem;color:#64748b;margin-top:2px">
        📘 {profile['subject']}<br>
        📅 Exam in <b style="color:#4f46e5">{profile['days_to_exam']} days</b>
      </div>
    </div>
    """, unsafe_allow_html=True)
    st.divider()
    st.caption("Use the pages above to navigate →")

# ── Dashboard ──────────────────────────────────────────────────────────────────
render_dashboard()
