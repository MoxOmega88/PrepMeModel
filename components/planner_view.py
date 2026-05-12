"""
components/planner_view.py
Study Planner UI – light theme.
"""
from __future__ import annotations
import datetime
import streamlit as st
import pandas as pd
from core.study_planner import (
    generate_study_plan, get_missed_sessions, adaptive_recovery, mark_session_complete
)


def render_study_planner():
    st.markdown("""
    <div style="margin-bottom:20px">
      <h1 style="margin:0;font-size:1.8rem;font-weight:800;color:#1e293b">📅 Study Planner</h1>
      <p style="margin:4px 0 0;color:#64748b">
        Your adaptive, personalised study schedule — regenerates when you update your profile.
      </p>
    </div>
    """, unsafe_allow_html=True)

    profile = st.session_state.student_profile
    mastery = st.session_state.mastery_profile
    weights = st.session_state.exam_weightage

    # ── Settings ───────────────────────────────────────────────────────────────
    with st.expander("⚙️ Planner Settings", expanded=not bool(st.session_state.study_plan)):
        c1, c2, c3 = st.columns(3)
        with c1:
            exam_date_val = datetime.date.fromisoformat(profile["exam_date"])
            new_exam = st.date_input("Exam Date", value=exam_date_val,
                                     min_value=datetime.date.today())
        with c2:
            daily_h = st.slider("Daily Study Hours", 1.0, 8.0,
                                 float(profile["daily_hours"]), 0.5)
        with c3:
            adherence = st.slider("Adherence Rate", 0.5, 1.0,
                                   float(profile.get("adherence_rate", 0.8)), 0.05,
                                   help="How reliably you stick to the plan")

        if st.button("🔄 Generate / Regenerate Plan", type="primary"):
            profile["exam_date"]      = new_exam.isoformat()
            profile["days_to_exam"]   = (new_exam - datetime.date.today()).days
            profile["daily_hours"]    = daily_h
            profile["adherence_rate"] = adherence
            st.session_state.student_profile = profile

            with st.spinner("Building your personalised study plan…"):
                plan = generate_study_plan(
                    mastery_profile=mastery,
                    exam_weightage=weights,
                    exam_date_str=new_exam.isoformat(),
                    daily_hours=daily_h,
                    adherence_rate=adherence,
                )
                st.session_state.study_plan = plan
            st.success(f"✅ Plan generated — {len(plan)} sessions scheduled.")
            st.rerun()

    plan = st.session_state.study_plan
    if not plan:
        st.info("Click **Generate Plan** above to create your personalised study schedule.")
        return

    # ── Adaptive recovery ──────────────────────────────────────────────────────
    missed = get_missed_sessions(plan)
    if missed:
        recovery = adaptive_recovery(plan, missed)
        st.warning(recovery["message"])
        st.session_state.study_plan = plan

    # ── Summary stats ──────────────────────────────────────────────────────────
    total     = len(plan)
    done      = sum(1 for s in plan if s["status"] == "done")
    pending   = sum(1 for s in plan if s["status"] == "pending")
    total_min = sum(s["duration_min"] for s in plan)

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Sessions", total)
    m2.metric("✅ Completed",    done)
    m3.metric("⏳ Pending",      pending)
    m4.metric("⏱️ Total Hours",  f"{total_min//60}h {total_min%60}m")

    st.divider()

    view = st.radio("View:", ["📆 Week View", "📋 Full List", "📊 Progress by Topic"],
                    horizontal=True)

    if view == "📆 Week View":
        _render_week_view(plan)
    elif view == "📋 Full List":
        _render_full_list(plan)
    else:
        _render_topic_progress(plan, mastery)


def _render_week_view(plan: list):
    today  = datetime.date.today()
    monday = today - datetime.timedelta(days=today.weekday())
    days   = [monday + datetime.timedelta(days=i) for i in range(7)]

    st.subheader(f"Week of {monday.strftime('%d %b %Y')}")

    by_date: dict[str, list] = {}
    for s in plan:
        by_date.setdefault(s["date"], []).append(s)

    cols      = st.columns(7)
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for col, day, dname in zip(cols, days, day_names):
        with col:
            is_today = day == today
            hdr_style = "color:#4f46e5;font-weight:800" if is_today else "color:#374151;font-weight:600"
            st.markdown(
                f'<div style="{hdr_style};font-size:0.85rem;text-align:center">'
                f'{dname}<br><span style="font-size:1.1rem">{day.strftime("%d")}</span></div>',
                unsafe_allow_html=True,
            )
            sessions = by_date.get(day.isoformat(), [])
            if not sessions:
                st.markdown("<div style='color:#cbd5e1;font-size:0.75rem;text-align:center'>—</div>",
                            unsafe_allow_html=True)
            for s in sessions:
                icon = {"done": "✅", "pending": "⬜", "missed": "❌"}.get(s["status"], "⬜")
                tc   = {"study": "#4f46e5", "revision": "#d97706", "mock": "#dc2626"}.get(s["type"], "#64748b")
                st.markdown(
                    f'<div style="background:#ffffff;border-left:3px solid {tc};'
                    f'border-radius:6px;padding:5px 7px;margin:3px 0;font-size:0.7rem;'
                    f'border:1px solid #e2e8f0;box-shadow:0 1px 2px rgba(0,0,0,0.04)">'
                    f'{icon} {s["topic"][:18]}<br>'
                    f'<span style="color:#94a3b8">{s["duration_min"]}min</span></div>',
                    unsafe_allow_html=True,
                )


def _render_full_list(plan: list):
    today_str = datetime.date.today().isoformat()
    weeks: dict[str, list] = {}
    for s in plan:
        d   = datetime.date.fromisoformat(s["date"])
        mon = d - datetime.timedelta(days=d.weekday())
        weeks.setdefault(mon.isoformat(), []).append(s)

    for week_start, sessions in sorted(weeks.items()):
        label = datetime.date.fromisoformat(week_start).strftime("Week of %d %b")
        with st.expander(label, expanded=(week_start <= today_str)):
            for s in sessions:
                icon = {"done": "✅", "pending": "⏳", "missed": "❌"}.get(s["status"], "⏳")
                c1, c2 = st.columns([4, 1])
                with c1:
                    tc = {"study": "#4f46e5", "revision": "#d97706", "mock": "#dc2626"}.get(s["type"], "#64748b")
                    st.markdown(
                        f'<div style="border-left:3px solid {tc};padding-left:10px;margin:4px 0">'
                        f'<b>{icon} {s["date"]}</b> · {s["topic"]} '
                        f'<span style="color:#94a3b8;font-size:0.82rem">({s["duration_min"]} min, {s["type"]})</span>'
                        f'<br><span style="font-size:0.78rem;color:#64748b">{s["resources"]}</span></div>',
                        unsafe_allow_html=True,
                    )
                with c2:
                    if s["status"] == "pending" and s["date"] <= today_str:
                        if st.button("Done ✅", key=f"ls_{s['date']}_{s['topic'][:8]}"):
                            st.session_state.study_plan = mark_session_complete(
                                st.session_state.study_plan, s["date"], s["topic"]
                            )
                            log = st.session_state.study_log
                            log[s["date"]] = log.get(s["date"], 0) + round(s["duration_min"] / 60, 2)
                            st.session_state.study_log = log
                            st.rerun()


def _render_topic_progress(plan: list, mastery: dict):
    topic_planned, topic_completed = {}, {}
    for s in plan:
        t = s["topic"]
        topic_planned[t]   = topic_planned.get(t, 0) + s["duration_min"]
        if s["status"] == "done":
            topic_completed[t] = topic_completed.get(t, 0) + s["duration_min"]

    rows = [
        {"Topic": t, "Planned (min)": topic_planned[t],
         "Completed (min)": topic_completed.get(t, 0)}
        for t in topic_planned
    ]
    df = pd.DataFrame(rows).sort_values("Planned (min)", ascending=False)
    st.dataframe(df, use_container_width=True, hide_index=True)

    for _, row in df.iterrows():
        pct    = int(row["Completed (min)"] / max(row["Planned (min)"], 1) * 100)
        colour = "#16a34a" if pct >= 70 else ("#d97706" if pct >= 30 else "#dc2626")
        st.markdown(
            f'<div style="margin-bottom:8px">'
            f'<div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#374151">'
            f'<span>{row["Topic"]}</span>'
            f'<span style="font-weight:700;color:{colour}">{pct}%</span></div>'
            f'<div style="background:#f1f5f9;border-radius:6px;height:8px">'
            f'<div style="width:{pct}%;background:{colour};border-radius:6px;height:8px"></div>'
            f'</div></div>',
            unsafe_allow_html=True,
        )
