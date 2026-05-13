"""
Authentication Page - Sign Up / Sign In
"""
import streamlit as st
from core.db import create_student, authenticate_student, init_database

# Initialize database
init_database()

# Page config
st.set_page_config(
    page_title="PrepMeAI - Login",
    page_icon="🎓",
    layout="centered"
)

# Custom CSS for professional look
st.markdown("""
<style>
    .main {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .stApp {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    div[data-testid="stForm"] {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .auth-header {
        text-align: center;
        color: white;
        margin-bottom: 2rem;
    }
    .auth-header h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .auth-header p {
        font-size: 1.2rem;
        opacity: 0.9;
    }
    .stButton>button {
        width: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: none;
        font-size: 1rem;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    .stSelectbox, .stMultiSelect, .stTextInput, .stNumberInput {
        background: white;
    }
    .success-msg {
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #28a745;
        margin: 1rem 0;
    }
    .error-msg {
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #dc3545;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="auth-header">
    <h1>🎓 PrepMeAI</h1>
    <p>Your Personalized Learning Companion</p>
</div>
""", unsafe_allow_html=True)

# Check if already logged in
if 'student' in st.session_state and st.session_state.student:
    st.success(f"✅ Already logged in as {st.session_state.student['name']}")
    if st.button("Go to Dashboard"):
        st.switch_page("Home.py")
    if st.button("Logout"):
        st.session_state.student = None
        st.rerun()
    st.stop()

# Tabs for Sign In / Sign Up
tab1, tab2 = st.tabs(["🔐 Sign In", "📝 Sign Up"])

# ── SIGN IN TAB ──────────────────────────────────────────────────────────────
with tab1:
    with st.form("signin_form"):
        st.subheader("Welcome Back!")
        
        email = st.text_input("Email", placeholder="student@example.com")
        password = st.text_input("Password", type="password", placeholder="Enter your password")
        
        submitted = st.form_submit_button("Sign In")
        
        if submitted:
            if not email or not password:
                st.markdown('<div class="error-msg">⚠️ Please fill in all fields</div>', unsafe_allow_html=True)
            else:
                student = authenticate_student(email, password)
                if student:
                    st.session_state.student = student
                    st.markdown(f'<div class="success-msg">✅ Welcome back, {student["name"]}!</div>', unsafe_allow_html=True)
                    st.balloons()
                    st.rerun()
                else:
                    st.markdown('<div class="error-msg">❌ Invalid email or password</div>', unsafe_allow_html=True)

# ── SIGN UP TAB ──────────────────────────────────────────────────────────────
with tab2:
    with st.form("signup_form"):
        st.subheader("Create Your Account")
        
        col1, col2 = st.columns(2)
        
        with col1:
            name = st.text_input("Full Name", placeholder="John Doe")
            email = st.text_input("Email", placeholder="student@example.com", key="signup_email")
        
        with col2:
            password = st.text_input("Password", type="password", placeholder="Min 6 characters", key="signup_password")
            confirm_password = st.text_input("Confirm Password", type="password", placeholder="Re-enter password")
        
        st.markdown("---")
        st.markdown("### 📚 Academic Details")
        
        col3, col4 = st.columns(2)
        
        with col3:
            grade = st.selectbox(
                "Class/Grade",
                options=[6, 7, 8, 9, 10, 11, 12],
                index=2  # Default to Class 8
            )
            
            board = st.selectbox(
                "Board",
                options=["CBSE", "ICSE", "State Board", "IB", "IGCSE"],
                index=0
            )
        
        with col4:
            subjects = st.multiselect(
                "Select Subjects",
                options=[
                    "Mathematics",
                    "Science",
                    "Physics",
                    "Chemistry",
                    "Biology",
                    "Social Science",
                    "History",
                    "Geography",
                    "English",
                    "Hindi",
                    "Computer Science"
                ],
                default=["Mathematics", "Science"]
            )
        
        submitted = st.form_submit_button("Create Account")
        
        if submitted:
            # Validation
            if not all([name, email, password, confirm_password]):
                st.markdown('<div class="error-msg">⚠️ Please fill in all fields</div>', unsafe_allow_html=True)
            elif len(password) < 6:
                st.markdown('<div class="error-msg">⚠️ Password must be at least 6 characters</div>', unsafe_allow_html=True)
            elif password != confirm_password:
                st.markdown('<div class="error-msg">⚠️ Passwords do not match</div>', unsafe_allow_html=True)
            elif not subjects:
                st.markdown('<div class="error-msg">⚠️ Please select at least one subject</div>', unsafe_allow_html=True)
            else:
                # Create student
                student_id = create_student(email, password, name, grade, board, subjects)
                
                if student_id:
                    st.markdown(f'<div class="success-msg">✅ Account created successfully! Welcome, {name}!</div>', unsafe_allow_html=True)
                    st.balloons()
                    
                    # Auto login
                    student = authenticate_student(email, password)
                    if student:
                        st.session_state.student = student
                        st.success("🎉 Redirecting to dashboard...")
                        st.rerun()
                else:
                    st.markdown('<div class="error-msg">❌ Email already exists. Please sign in instead.</div>', unsafe_allow_html=True)

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: white; opacity: 0.8; padding: 1rem;">
    <p>PrepMeAI - Powered by RAG & Adaptive Learning</p>
    <p style="font-size: 0.9rem;">🔒 Your data is secure and encrypted</p>
</div>
""", unsafe_allow_html=True)
