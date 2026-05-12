"""
components/dashboard.py
Dashboard – student mission control (light theme).
"""
from __future__ import annotations
import datetime
import math
import streamlit as st
from core.personalization import compute_readiness_index, compute_priority_queue


def render_dashboard():
    profile  = st.session_state.student_profile
    mastery  = st.session_state.mastery_profile
    weights  = st.session_state.exam_weightage
    plan     = st.session_state.study_plan
    log      = st.session_state.study_log

    # Recompute days_to_exam
    try:
        exam_date    = datetime.date.fromisoformat(profile["exam_date"])
        days_to_exam = max((exam_date - datetime.date.today()).days, 0)
        profile["days_to_exam"] = days_to_exam
    except Exception:
        days_to_exam = profile.get("days_to_exam", 30)

    plan_hours = profile.get("daily_hours", 3) * profile.get("adherence_rate", 0.8)
    readiness  = compute_readiness_index(mastery, weights, days_to_exam, log, plan_hours)

    # ── Page header ────────────────────────────────────────────────────────────
    st.markdown(f"""
    <div style="margin-bottom:24px">
      <h1 style="margin:0;font-size:1.8rem;font-weight:800;color:#1e293b">
        Welcome back, {profile['name']} 👋
      </h1>
      <p style="margin:4px 0 0;color:#64748b;font-size:0.95rem">
        {profile['subject']} &nbsp;·&nbsp; {datetime.date.today().strftime('%A, %d %B %Y')}
      </p>
    </div>
    """, unsafe_allow_html=True)

    # ── KPI row ────────────────────────────────────────────────────────────────
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("🎯 Readiness Index",  f"{readiness:.0f} / 100",
                help="Weighted mastery + adherence + time buffer")
    col2.metric("📅 Days to Exam",     days_to_exam)
    col3.metric("🔥 Study Streak",     f"{st.session_state.streak} days")
    col4.metric("📖 Sessions Done",
                sum(v.get("sessions_done", 0) for v in mastery.values()))

    st.divider()

    # ── Gauge + Priority queue ─────────────────────────────────────────────────
    left, right = st.columns([1, 1])

    with left:
        st.markdown("#### 📊 Readiness Gauge")
        _render_gauge(readiness)

        st.markdown("#### 🔝 What to Study Next")
        pq = compute_priority_queue(mastery, weights, days_to_exam)
        for i, (topic, score, reason) in enumerate(pq[:5], 1):
            m     = mastery[topic]["score"]
            badge = _mastery_badge(m)
            st.markdown(
                f"**{i}. {topic}** {badge}  \n"
                f"<span style='font-size:0.76rem;color:#94a3b8'>"
                f"Priority: {score:.3f} — {reason}</span>",
                unsafe_allow_html=True,
            )

    with right:
        st.markdown("#### 📈 Topic Mastery Overview")
        _render_mastery_bars(mastery)

    st.divider()

    # ── Today's sessions ───────────────────────────────────────────────────────
    st.markdown("#### 📋 Today's Study Plan")
    today_str      = datetime.date.today().isoformat()
    today_sessions = [s for s in plan if s["date"] == today_str]

    if not today_sessions:
        if plan:
            st.info("No sessions scheduled for today. Head to **📅 Study Planner** to adjust your plan.")
        else:
            st.info("Your study plan hasn't been generated yet. Go to **📅 Study Planner** to create it.")
    else:
        for s in today_sessions:
            status_icon = {"done": "✅", "pending": "⏳", "missed": "❌"}.get(s["status"], "⏳")
            type_colour = {"study": "#4f46e5", "revision": "#d97706", "mock": "#dc2626"}.get(s["type"], "#64748b")
            with st.expander(
                f"{status_icon} **{s['topic']}** — {s['duration_min']} min  "
                f"({s['type'].capitalize()})"
            ):
                st.markdown(f"**Resources:** {s['resources']}")
                if s["status"] == "pending":
                    if st.button("Mark Complete ✅", key=f"done_{s['date']}_{s['topic'][:10]}"):
                        from core.study_planner import mark_session_complete
                        st.session_state.study_plan = mark_session_complete(
                            st.session_state.study_plan, s["date"], s["topic"]
                        )
                        log[today_str] = log.get(today_str, 0) + round(s["duration_min"] / 60, 2)
                        st.session_state.study_log = log
                        st.rerun()

    st.divider()

    # ── Activity strip ─────────────────────────────────────────────────────────
    st.markdown("#### 🗓️ Study Activity (last 14 days)")
    _render_activity_strip(log, days=14)


# ── Sub-renderers ──────────────────────────────────────────────────────────────

def _render_gauge(value: float):
    v = max(0.0, min(float(value), 100.0))
    if v < 40:
        colour, label = "#dc2626", "Needs Work"
    elif v < 70:
        colour, label = "#d97706", "Building Up"
    else:
        colour, label = "#16a34a", "Looking Good"

    angle = v / 100 * 180
    rad   = math.radians(180 - angle)
    cx, cy, r = 110, 110, 80
    ex = cx + r * math.cos(rad)
    ey = cy - r * math.sin(rad)

    svg = f"""
    <svg viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg"
         style="width:100%;max-width:280px;display:block;margin:0 auto">
      <path d="M 30 110 A 80 80 0 0 1 190 110"
            fill="none" stroke="#e2e8f0" stroke-width="18" stroke-linecap="round"/>
      <path d="M 30 110 A 80 80 0 0 1 {ex:.2f} {ey:.2f}"
            fill="none" stroke="{colour}" stroke-width="18" stroke-linecap="round"/>
      <text x="110" y="102" text-anchor="middle"
            font-size="30" font-weight="800" fill="{colour}">{v:.0f}</text>
      <text x="110" y="120" text-anchor="middle"
            font-size="11" fill="#94a3b8">out of 100</text>
      <text x="110" y="136" text-anchor="middle"
            font-size="10" font-weight="600" fill="{colour}">{label}</text>
    </svg>
    """
    st.markdown(svg, unsafe_allow_html=True)


def _render_mastery_bars(mastery: dict):
    rows = sorted(mastery.items(), key=lambda x: x[1]["score"])
    for topic, info in rows:
        score  = info["score"]
        pct    = int(score * 100)
        colour = "#dc2626" if score < 0.4 else ("#d97706" if score < 0.65 else "#16a34a")
        bg     = "#fee2e2" if score < 0.4 else ("#fef9c3" if score < 0.65 else "#dcfce7")
        st.markdown(f"""
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;
                      font-size:0.8rem;margin-bottom:3px;color:#374151">
            <span>{topic}</span>
            <span style="font-weight:700;color:{colour}">{pct}%</span>
          </div>
          <div style="background:#f1f5f9;border-radius:6px;height:9px">
            <div style="width:{pct}%;background:{colour};border-radius:6px;
                        height:9px;transition:width 0.4s ease"></div>
          </div>
        </div>
        """, unsafe_allow_html=True)


def _render_activity_strip(log: dict, days: int = 14):
    today = datetime.date.today()
    cells = ""
    for i in range(days - 1, -1, -1):
        d   = today - datetime.timedelta(days=i)
        hrs = log.get(d.isoformat(), 0)
        if hrs == 0:
            colour = "#f1f5f9"
        elif hrs < 1:
            colour = "#bfdbfe"
        elif hrs < 2:
            colour = "#6366f1"
        else:
            colour = "#4f46e5"
        cells += (
            f'<div title="{d.strftime("%d %b")}: {hrs:.1f}h" '
            f'style="width:28px;height:28px;background:{colour};'
            f'border-radius:5px;display:inline-block;margin:2px;'
            f'border:1px solid #e2e8f0"></div>'
        )
    st.markdown(
        f'<div style="display:flex;flex-wrap:wrap;gap:2px">{cells}</div>'
        f'<div style="font-size:0.72rem;color:#94a3b8;margin-top:6px">'
        f'<span style="background:#f1f5f9;padding:2px 6px;border-radius:4px;border:1px solid #e2e8f0">0h</span> &nbsp;'
        f'<span style="background:#bfdbfe;padding:2px 6px;border-radius:4px">&lt;1h</span> &nbsp;'
        f'<span style="background:#6366f1;color:#fff;padding:2px 6px;border-radius:4px">1–2h</span> &nbsp;'
        f'<span style="background:#4f46e5;color:#fff;padding:2px 6px;border-radius:4px">2h+</span>'
        f'</div>',
        unsafe_allow_html=True,
    )


def _mastery_badge(score: float) -> str:
    if score < 0.4:
        return '<span class="badge badge-red">Weak</span>'
    elif score < 0.65:
        return '<span class="badge badge-yellow">Building</span>'
    else:
        return '<span class="badge badge-green">Strong</span>'
