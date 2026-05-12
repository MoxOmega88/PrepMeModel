"""
components/profile_settings.py
Student profile + mastery editor – light theme.
"""
from __future__ import annotations
import datetime
import streamlit as st


def render_profile_page():
    st.markdown("""
    <div style="margin-bottom:20px">
      <h1 style="margin:0;font-size:1.8rem;font-weight:800;color:#1e293b">👤 Profile & Settings</h1>
      <p style="margin:4px 0 0;color:#64748b">
        Set your exam details and initial mastery levels. Everything adapts to your profile.
      </p>
    </div>
    """, unsafe_allow_html=True)

    profile = st.session_state.student_profile
    mastery = st.session_state.mastery_profile
    weights = st.session_state.exam_weightage

    # ── Basic profile ──────────────────────────────────────────────────────────
    st.subheader("📋 Profile")
    c1, c2 = st.columns(2)
    with c1:
        name    = st.text_input("Your Name",       value=profile.get("name", "Student"))
        subject = st.text_input("Subject / Class", value=profile.get("subject", "NCERT Science"))
    with c2:
        exam_date_val = datetime.date.fromisoformat(profile["exam_date"])
        exam_date = st.date_input("Exam Date", value=exam_date_val,
                                   min_value=datetime.date.today())
        daily_h   = st.slider("Daily Study Hours", 1.0, 8.0,
                               float(profile.get("daily_hours", 3)), 0.5)

    adherence = st.slider(
        "Expected Adherence Rate", 0.5, 1.0,
        float(profile.get("adherence_rate", 0.8)), 0.05,
        help="How reliably you'll follow the plan. 0.8 = 80% of sessions completed.",
    )

    if st.button("💾 Save Profile", type="primary"):
        st.session_state.student_profile = {
            "name":           name,
            "subject":        subject,
            "exam_date":      exam_date.isoformat(),
            "days_to_exam":   (exam_date - datetime.date.today()).days,
            "daily_hours":    daily_h,
            "adherence_rate": adherence,
        }
        st.success("✅ Profile saved! Head to Study Planner to regenerate your plan.")

    st.divider()

    # ── Mastery editor ─────────────────────────────────────────────────────────
    st.subheader("🎯 Initial Mastery Levels")
    st.caption("Drag sliders to set your starting mastery. Run the Quiz to get AI-assessed mastery.")

    updated_mastery = {}
    cols   = st.columns(2)
    topics = list(mastery.keys())
    for i, topic in enumerate(topics):
        with cols[i % 2]:
            score = st.slider(
                topic, 0.0, 1.0,
                float(mastery[topic]["score"]),
                0.05,
                key=f"mastery_slider_{topic}",
                format="%.0f%%",
            )
            m_colour = "#dc2626" if score < 0.4 else ("#d97706" if score < 0.65 else "#16a34a")
            st.markdown(
                f'<div style="font-size:0.75rem;color:{m_colour};'
                f'font-weight:600;margin-top:-8px;margin-bottom:8px">'
                f'{"Weak" if score < 0.4 else ("Building" if score < 0.65 else "Strong")}'
                f'</div>',
                unsafe_allow_html=True,
            )
            updated_mastery[topic] = {**mastery[topic], "score": score}

    if st.button("💾 Save Mastery Profile"):
        st.session_state.mastery_profile = updated_mastery
        st.success("✅ Mastery profile updated!")

    st.divider()

    # ── Exam weightage ─────────────────────────────────────────────────────────
    st.subheader("⚖️ Exam Topic Weightage")
    st.caption("Set how much each topic counts in your exam (should sum to 100%).")

    updated_weights = {}
    total_w = 0
    cols2   = st.columns(2)
    for i, (topic, w) in enumerate(weights.items()):
        with cols2[i % 2]:
            new_w = st.number_input(
                f"{topic} (%)", min_value=0, max_value=100,
                value=int(w * 100), step=1, key=f"weight_{topic}",
            )
            updated_weights[topic] = new_w / 100
            total_w += new_w

    colour_total = "#16a34a" if total_w == 100 else "#dc2626"
    st.markdown(
        f'<div style="font-weight:700;color:{colour_total};margin:8px 0">'
        f'Total: {total_w}% {"✅" if total_w == 100 else "(aim for 100%)"}</div>',
        unsafe_allow_html=True,
    )

    if st.button("💾 Save Weightage"):
        st.session_state.exam_weightage = updated_weights
        st.success("✅ Exam weightage updated!")

    st.divider()

    # ── Reset ──────────────────────────────────────────────────────────────────
    st.subheader("⚠️ Reset")
    st.caption("This clears all quiz history, study plan, and chat history.")
    if st.button("🔄 Reset All Data", type="secondary"):
        for key in ["mastery_profile", "study_plan", "chat_history",
                    "feedback_history", "questions", "evaluations",
                    "study_log", "streak"]:
            if key in st.session_state:
                del st.session_state[key]
        from core.session import init_session
        init_session()
        st.success("All data reset to defaults.")
        st.rerun()
