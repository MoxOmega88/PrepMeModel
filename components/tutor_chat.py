"""
components/tutor_chat.py
AI Tutor chat UI – light theme.
"""
from __future__ import annotations
import streamlit as st
from core.rag_tutor import ask_tutor
from core.personalization import get_depth_flag


def render_tutor_chat():
    st.markdown("""
    <div style="margin-bottom:20px">
      <h1 style="margin:0;font-size:1.8rem;font-weight:800;color:#1e293b">🤖 AI Tutor</h1>
      <p style="margin:4px 0 0;color:#64748b">
        Ask anything about your syllabus. I answer from your textbook and adapt to your mastery level.
      </p>
    </div>
    """, unsafe_allow_html=True)

    mastery = st.session_state.mastery_profile
    history = st.session_state.chat_history

    # ── Topic selector ─────────────────────────────────────────────────────────
    topics       = list(mastery.keys())
    active_topic = st.selectbox(
        "Topic context (sets explanation depth):",
        ["— General —"] + topics,
        key="tutor_topic_selector",
    )

    if active_topic == "— General —":
        mastery_score = sum(v["score"] for v in mastery.values()) / max(len(mastery), 1)
    else:
        mastery_score = mastery[active_topic]["score"]

    depth_flag = get_depth_flag(mastery_score)
    depth_info = {
        "basic":    ("🟢", "Basic — step-by-step, no jargon",    "#dcfce7", "#16a34a"),
        "balanced": ("🟡", "Balanced — worked examples",          "#fef9c3", "#ca8a04"),
        "advanced": ("🔴", "Advanced — edge cases & tricky bits", "#fee2e2", "#dc2626"),
    }
    di = depth_info[depth_flag]
    st.markdown(
        f'<div style="display:inline-flex;align-items:center;gap:8px;'
        f'background:{di[2]};border-radius:8px;padding:6px 14px;'
        f'font-size:0.82rem;font-weight:600;color:{di[3]};margin-bottom:12px">'
        f'{di[0]} {di[1]} &nbsp;·&nbsp; Mastery: {mastery_score:.0%}</div>',
        unsafe_allow_html=True,
    )

    st.divider()

    # ── Chat history ───────────────────────────────────────────────────────────
    if not history:
        st.markdown("""
        <div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;
                    border:1px solid #c7d2fe;color:#3730a3;font-size:0.95rem">
          💡 <b>Try asking:</b><br>
          • "What causes seasons on Earth?"<br>
          • "Explain the difference between solar and lunar calendars"<br>
          • "How do solar eclipses occur?"
        </div>
        """, unsafe_allow_html=True)

    for i, msg in enumerate(history):
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            
            # Add Read Aloud button for assistant messages
            if msg["role"] == "assistant":
                col1, col2 = st.columns([1, 5])
                with col1:
                    if st.button("🔊 Read Aloud", key=f"tts_{i}"):
                        try:
                            import pyttsx3
                            engine = pyttsx3.init()
                            engine.setProperty('rate', 150)
                            engine.say(msg["content"])
                            engine.runAndWait()
                            st.success("✅ Played!")
                        except Exception as e:
                            st.error(f"TTS error: {e}")
            
            if msg.get("citations"):
                st.caption("📚 Sources: " + ", ".join(msg["citations"]))
            if msg.get("followup"):
                st.markdown(
                    f'<div style="background:#f0f4ff;border-radius:8px;padding:8px 12px;'
                    f'margin-top:8px;font-size:0.88rem;color:#4f46e5">💭 {msg["followup"]}</div>',
                    unsafe_allow_html=True,
                )

    # ── Input ──────────────────────────────────────────────────────────────────
    st.markdown("### 💬 Ask Your Question")
    
    col1, col2 = st.columns([4, 1])
    
    with col1:
        user_input = st.text_input("Type your question:", key="text_input", label_visibility="collapsed", placeholder="Ask your tutor…")
    
    with col2:
        use_voice = st.button("🎤 Voice", help="Record your question")
    
    # Voice input handling
    if use_voice:
        st.info("🎤 Recording... Speak your question now!")
        try:
            import speech_recognition as sr
            recognizer = sr.Recognizer()
            with sr.Microphone() as source:
                st.write("Listening...")
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
                st.write("Processing...")
                user_input = recognizer.recognize_google(audio)
                st.success(f"✅ You said: {user_input}")
        except sr.WaitTimeoutError:
            st.error("⏱️ No speech detected. Please try again.")
            user_input = None
        except sr.UnknownValueError:
            st.error("❌ Could not understand audio. Please try again.")
            user_input = None
        except Exception as e:
            st.error(f"❌ Voice input error: {e}")
            user_input = None
    
    if st.button("📤 Send", type="primary") and user_input:
        history.append({"role": "user", "content": user_input})
        st.session_state.chat_history = history
        st.rerun()

    # Generate reply if last message is from user
    if history and history[-1]["role"] == "user" and (
        len(history) < 2 or history[-2]["role"] != "user"
    ):
        last_q = history[-1]["content"]
        with st.spinner("Thinking…"):
            from core.config import PDF_PATH
            result = ask_tutor(
                question=last_q,
                chat_history=history[:-1],
                mastery_score=mastery_score,
                pdf_path=PDF_PATH,
            )
        history.append({
            "role":      "assistant",
            "content":   result["answer"],
            "citations": result["citations"],
            "followup":  result["followup"],
        })
        st.session_state.chat_history = history
        st.rerun()

    # ── Sidebar ────────────────────────────────────────────────────────────────
    with st.sidebar:
        st.subheader("Tutor Controls")
        if st.button("🗑️ Clear Chat"):
            st.session_state.chat_history = []
            st.rerun()

        if active_topic != "— General —":
            st.divider()
            st.subheader("📝 Practice Questions")
            if st.button("Generate Questions", type="primary"):
                with st.spinner("Generating…"):
                    from core.rag_tutor import generate_practice_questions
                    from core.config import PDF_PATH
                    pqs = generate_practice_questions(active_topic, mastery_score, PDF_PATH)
                if pqs:
                    st.session_state["sidebar_pqs"] = pqs
                else:
                    st.warning("Could not generate questions. Check GROQ_API_KEY.")

            if st.session_state.get("sidebar_pqs"):
                for i, q in enumerate(st.session_state["sidebar_pqs"], 1):
                    bloom = q.get("bloom_level", "?")
                    with st.expander(f"Q{i} · {bloom}"):
                        st.write(q["question"])
                        with st.expander("Show Answer"):
                            st.write(q["reference_answer"])
