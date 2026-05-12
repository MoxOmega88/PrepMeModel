"""
components/charts.py
Analytics page – Plotly charts, light theme.
"""
from __future__ import annotations
import datetime
import streamlit as st

try:
    import plotly.graph_objects as go
    PLOTLY_OK = True
except ImportError:
    PLOTLY_OK = False

_LIGHT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="#f8fafc",
    font=dict(color="#374151", size=12),
    margin=dict(l=10, r=10, t=40, b=10),
)


def render_analytics_page():
    st.markdown("""
    <div style="margin-bottom:20px">
      <h1 style="margin:0;font-size:1.8rem;font-weight:800;color:#1e293b">📊 Analytics</h1>
      <p style="margin:4px 0 0;color:#64748b">Every chart answers a specific question — hover for exact values.</p>
    </div>
    """, unsafe_allow_html=True)

    if not PLOTLY_OK:
        st.error("Plotly not installed. Run: `pip install plotly`")
        return

    mastery = st.session_state.mastery_profile
    weights = st.session_state.exam_weightage
    plan    = st.session_state.study_plan
    log     = st.session_state.study_log
    history = st.session_state.feedback_history

    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "🕸️ Mastery Radar",
        "📊 Topic Heatmap",
        "📈 Performance Trend",
        "📅 Study vs Plan",
        "🎓 Bloom's Distribution",
    ])

    with tab1:
        st.markdown("**Am I balanced across topics?**")
        _mastery_radar(mastery)

    with tab2:
        st.markdown("**Which topics need the most work?**")
        _topic_heatmap(mastery)

    with tab3:
        st.markdown("**Am I improving over time?**")
        _performance_trend(history)

    with tab4:
        st.markdown("**Am I keeping up with my plan?**")
        _study_vs_plan(plan, log)

    with tab5:
        st.markdown("**Am I practising the right question types?**")
        _blooms_distribution(history)


def _mastery_radar(mastery: dict):
    topics   = list(mastery.keys())
    scores   = [mastery[t]["score"] * 100 for t in topics]
    topics_c = topics + [topics[0]]
    scores_c = scores + [scores[0]]

    fig = go.Figure()
    fig.add_trace(go.Scatterpolar(
        r=scores_c, theta=topics_c,
        fill="toself",
        fillcolor="rgba(79, 70, 229, 0.15)",
        line=dict(color="#4f46e5", width=2),
        name="Mastery",
    ))
    fig.update_layout(
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 100],
                            tickfont=dict(color="#94a3b8"), gridcolor="#e2e8f0"),
            angularaxis=dict(tickfont=dict(size=10, color="#374151")),
            bgcolor="rgba(0,0,0,0)",
        ),
        showlegend=False,
        **_LIGHT,
    )
    st.plotly_chart(fig, use_container_width=True)
    st.caption("Outer edge = 100% mastery. Gaps show which topics need more attention.")


def _topic_heatmap(mastery: dict):
    topics = list(mastery.keys())
    scores = [mastery[t]["score"] * 100 for t in topics]

    colours = []
    for s in scores:
        if s < 40:
            colours.append("#dc2626")
        elif s < 65:
            colours.append("#d97706")
        else:
            colours.append("#16a34a")

    fig = go.Figure(go.Bar(
        x=topics,
        y=scores,
        marker_color=colours,
        text=[f"{s:.0f}%" for s in scores],
        textposition="outside",
        hovertemplate="<b>%{x}</b><br>Mastery: %{y:.1f}%<extra></extra>",
    ))
    fig.update_layout(
        xaxis=dict(tickangle=-30, gridcolor="#e2e8f0"),
        yaxis=dict(range=[0, 115], title="Mastery (%)", gridcolor="#e2e8f0"),
        **_LIGHT,
    )
    st.plotly_chart(fig, use_container_width=True)
    st.caption("Red = weak (<40%), amber = developing (40–65%), green = strong (>65%).")


def _performance_trend(feedback_history: list):
    if len(feedback_history) < 2:
        st.info("Complete at least 2 quiz questions to see your performance trend.")
        return

    correct, accuracies, x = 0, [], []
    for i, item in enumerate(feedback_history):
        correct += int(item.get("is_correct", False))
        accuracies.append(round(correct / (i + 1) * 100, 1))
        x.append(i + 1)

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=x, y=accuracies,
        mode="lines+markers",
        line=dict(color="#4f46e5", width=2, shape="spline"),
        marker=dict(size=7, color="#4f46e5"),
        fill="tozeroy",
        fillcolor="rgba(79, 70, 229, 0.08)",
        hovertemplate="Answer #%{x}<br>Accuracy: %{y:.1f}%<extra></extra>",
    ))
    fig.update_layout(
        xaxis=dict(title="Questions answered", gridcolor="#e2e8f0"),
        yaxis=dict(title="Cumulative accuracy (%)", range=[0, 105], gridcolor="#e2e8f0"),
        **_LIGHT,
    )
    st.plotly_chart(fig, use_container_width=True)


def _study_vs_plan(plan: list, log: dict):
    if not plan:
        st.info("Generate a study plan first to see this chart.")
        return

    today = datetime.date.today()
    days  = [today - datetime.timedelta(days=i) for i in range(13, -1, -1)]

    planned_h, actual_h, labels = [], [], []
    for d in days:
        ds      = d.isoformat()
        planned = sum(s["duration_min"] for s in plan if s["date"] == ds) / 60
        actual  = log.get(ds, 0)
        planned_h.append(round(planned, 2))
        actual_h.append(round(actual, 2))
        labels.append(d.strftime("%d %b"))

    fig = go.Figure()
    fig.add_trace(go.Bar(x=labels, y=planned_h, name="Planned", marker_color="#c7d2fe"))
    fig.add_trace(go.Bar(x=labels, y=actual_h,  name="Actual",  marker_color="#4f46e5"))
    fig.update_layout(
        barmode="group",
        xaxis=dict(title="Date", gridcolor="#e2e8f0"),
        yaxis=dict(title="Hours", gridcolor="#e2e8f0"),
        legend=dict(orientation="h", y=1.1),
        **_LIGHT,
    )
    st.plotly_chart(fig, use_container_width=True)
    st.caption("Purple = actual study time. Light blue = planned. A gap means catch-up time!")


def _blooms_distribution(feedback_history: list):
    if not feedback_history:
        st.info("Complete some quiz questions to see Bloom's distribution.")
        return

    level_counts: dict[str, int] = {}
    for item in feedback_history:
        level = item.get("bloom_level", "Remember")
        level_counts[level] = level_counts.get(level, 0) + 1

    if not level_counts:
        level_counts = {"Remember": len(feedback_history)}

    labels  = list(level_counts.keys())
    values  = list(level_counts.values())
    colours = ["#6366f1", "#4f46e5", "#16a34a", "#d97706", "#dc2626", "#0891b2"]

    fig = go.Figure(go.Pie(
        labels=labels,
        values=values,
        hole=0.45,
        marker=dict(colors=colours[:len(labels)]),
        textinfo="label+percent",
        hovertemplate="%{label}<br>Count: %{value}<extra></extra>",
    ))
    fig.update_layout(**_LIGHT)
    st.plotly_chart(fig, use_container_width=True)
    st.caption("Bloom's: Remember → Understand → Apply → Analyse → Evaluate. Aim for a healthy mix!")
