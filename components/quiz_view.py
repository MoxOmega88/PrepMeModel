"""
components/quiz_view.py
Quiz page UI – text mode (voice mode requires Colab Whisper URL).
"""
from __future__ import annotations
import streamlit as st
from core.quiz_engine import (
    generate_questions_full_book,
    generate_questions_for_topic,
    grade_answer,
)
from core.personalization import update_mastery_after_quiz


def render_quiz_page():
    st.title("📝 Quiz")
    st.caption("Test your knowledge. The AI grades your answers and updates your mastery profile instantly.")

    mastery = st.session_state.mastery_profile

    # ── Sidebar controls ───────────────────────────────────────────────────────
    with st.sidebar:
        st.subheader("Quiz Settings")
        mode = st.radio("Mode", ["Full Book", "Topic-Specific"], index=0)
        topic_choice = None
        if mode == "Topic-Specific":
            topic_choice = st.selectbox("Topic", list(mastery.keys()))
        n_questions = st.slider("Number of Questions", 1, 10, 3)

        if st.button("🆕 New Quiz", type="primary"):
            st.session_state.questions      = []
            st.session_state.current_q_index = 0
            st.session_state.total_score    = 0
            st.session_state.quiz_complete  = False
            st.session_state.feedback_history = []
            st.session_state.evaluations    = {}
            st.session_state["quiz_topic"]  = topic_choice
            st.session_state["quiz_mode"]   = mode
            with st.spinner("Generating questions…"):
                try:
                    if mode == "Topic-Specific" and topic_choice:
                        qs = generate_questions_for_topic(topic_choice, n_questions)
                    else:
                        qs = generate_questions_full_book(n_questions)
                    st.session_state.questions = qs
                except Exception as e:
                    st.error(f"Could not generate questions: {e}")
            st.rerun()

        if st.session_state.questions:
            st.divider()
            done  = sum(1 for e in st.session_state.evaluations.values())
            total = len(st.session_state.questions)
            st.metric("Progress", f"{done} / {total}")
            st.metric("Score",    f"{st.session_state.total_score} / {done}" if done else "—")

    # ── No quiz loaded ─────────────────────────────────────────────────────────
    if not st.session_state.questions:
        st.info("Click **New Quiz** in the sidebar to start.")
        return

    # ── Quiz complete ──────────────────────────────────────────────────────────
    if st.session_state.quiz_complete:
        _render_results()
        return

    # ── Active question ────────────────────────────────────────────────────────
    idx  = st.session_state.current_q_index
    qs   = st.session_state.questions
    if idx >= len(qs):
        st.session_state.quiz_complete = True
        st.rerun()
        return

    item = qs[idx]
    st.subheader(f"Question {idx + 1} of {len(qs)}")

    # Progress bar
    st.progress((idx) / len(qs))

    st.markdown(
        f"""<div style="background:#f0f4ff;border-left:4px solid #4f46e5;
        border-radius:8px;padding:16px 20px;margin:12px 0;
        font-size:1.05rem;color:#1e1b4b;font-weight:500">
        {item['question']}
        </div>""",
        unsafe_allow_html=True,
    )
    
    # Read question aloud button
    col1, col2 = st.columns([1, 5])
    with col1:
        if st.button("🔊 Read Question", key=f"read_q_{idx}"):
            try:
                import pyttsx3
                engine = pyttsx3.init()
                engine.setProperty('rate', 150)
                engine.say(item['question'])
                engine.runAndWait()
                st.success("✅ Played!")
            except Exception as e:
                st.error(f"TTS error: {e}")

    # Already evaluated?
    current_eval = st.session_state.evaluations.get(idx)

    if current_eval is None:
        # Text answer input
        answer_text = st.text_area(
            "Your Answer",
            placeholder="Type your answer here…",
            height=120,
            key=f"answer_{idx}",
        )
        if st.button("✅ Submit Answer", type="primary", disabled=not answer_text.strip()):
            with st.spinner("Grading…"):
                result = grade_answer(item["question"], item["reference_answer"], answer_text.strip())
            st.session_state.evaluations[idx] = {
                "transcript": answer_text.strip(),
                **result,
            }
            st.session_state.feedback_history.append({
                "question":         item["question"],
                "reference_answer": item["reference_answer"],
                "transcript":       answer_text.strip(),
                "is_correct":       result["is_correct"],
                "feedback_speech":  result["feedback_speech"],
                "bloom_level":      "Remember",
            })
            if result["is_correct"]:
                st.session_state.total_score += 1
            st.rerun()
    else:
        # Show result
        st.markdown(f"**Your answer:** {current_eval['transcript']}")
        if current_eval["is_correct"]:
            st.success(f"✅ Correct!  {current_eval['feedback_speech']}")
        else:
            st.error(f"❌ Incorrect.  {current_eval['feedback_speech']}")
        if current_eval.get("score_explanation"):
            st.info(current_eval["score_explanation"])

        with st.expander("📖 Reference Answer"):
            st.write(item["reference_answer"])

        # Next / Finish
        is_last = (idx + 1 >= len(qs))
        btn_label = "🏁 View Results" if is_last else "➡️ Next Question"
        if st.button(btn_label, type="primary"):
            st.session_state.current_q_index += 1
            if is_last:
                st.session_state.quiz_complete = True
                # Update mastery
                _update_mastery_from_quiz()
            st.rerun()


def _update_mastery_from_quiz():
    topic = st.session_state.get("quiz_topic")
    if not topic:
        return
    evals   = st.session_state.evaluations
    correct = sum(1 for e in evals.values() if e.get("is_correct"))
    total   = len(evals)
    if total == 0:
        return
    st.session_state.mastery_profile = update_mastery_after_quiz(
        st.session_state.mastery_profile, topic, correct, total
    )


def _render_results():
    evals   = st.session_state.evaluations
    history = st.session_state.feedback_history
    total   = len(st.session_state.questions)
    score   = st.session_state.total_score
    pct     = int(score / max(total, 1) * 100)

    if pct >= 70:
        colour, emoji = "#16a34a", "🎉"
    elif pct >= 40:
        colour, emoji = "#d97706", "👍"
    else:
        colour, emoji = "#dc2626", "📚"

    st.markdown(
        f"""<div style="text-align:center;padding:32px;background:#f8fafc;
        border-radius:16px;border:1px solid #e2e8f0;margin-bottom:24px">
        <div style="font-size:3rem">{emoji}</div>
        <div style="font-size:2.5rem;font-weight:700;color:{colour}">{score}/{total}</div>
        <div style="font-size:1.1rem;color:#64748b;margin-top:4px">{pct}% accuracy</div>
        </div>""",
        unsafe_allow_html=True,
    )

    st.subheader("Question Review")
    for i, item in enumerate(history):
        icon = "✅" if item["is_correct"] else "❌"
        with st.expander(f"{icon} Q{i+1}: {item['question'][:80]}…"):
            st.markdown(f"**Your answer:** {item['transcript']}")
            st.markdown(f"**Feedback:** {item['feedback_speech']}")
            st.markdown(f"**Reference:** {item['reference_answer']}")

    if st.button("🔄 Start New Quiz"):
        st.session_state.quiz_complete   = False
        st.session_state.questions       = []
        st.session_state.current_q_index = 0
        st.session_state.total_score     = 0
        st.session_state.evaluations     = {}
        st.session_state.feedback_history = []
        st.rerun()
