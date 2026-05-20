"""
pages/3_Study_Planner.py - Enhanced Study Planner with AI Recommendations
"""
import streamlit as st
from core.db import get_student_quiz_history
from datetime import datetime, timedelta
import json

st.set_page_config(
    page_title="Study Planner – PrepMeAI",
    page_icon="📅",
    layout="wide"
)

# Auth check
if 'student' not in st.session_state or not st.session_state.student:
    st.warning("🔒 Please sign in to access PrepMeAI")
    if st.button("Go to Sign In"):
        st.switch_page("pages/0_Auth.py")
    st.stop()

student = st.session_state.student

# Professional Study Planner CSS
st.markdown("""
<style>
    .main {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .planner-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 1rem;
        color: white;
        margin-bottom: 2rem;
        text-align: center;
    }
    
    .recommendation-card {
        background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
        padding: 1.5rem;
        border-radius: 1rem;
        margin: 1rem 0;
        border-left: 4px solid #2196f3;
    }
    
    .topic-card {
        background: white;
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
        border-left: 4px solid #667eea;
        transition: transform 0.3s ease;
    }
    
    .topic-card:hover {
        transform: translateY(-3px);
    }
    
    .mastery-bar {
        width: 100%;
        height: 10px;
        background: #e0e0e0;
        border-radius: 5px;
        overflow: hidden;
        margin: 0.5rem 0;
    }
    
    .mastery-fill {
        height: 100%;
        transition: width 0.3s ease;
    }
    
    .mastery-low { background: #f44336; }
    .mastery-medium { background: #ff9800; }
    .mastery-high { background: #4caf50; }
    
    .stButton>button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="planner-header">
    <h1>📅 Personalized Study Planner</h1>
    <p>AI-curated learning path based on your quiz performance</p>
</div>
""", unsafe_allow_html=True)

# Subject and Chapter Selection
col1, col2 = st.columns([1, 1])

with col1:
    selected_subject = st.selectbox(
        "📚 Select Subject",
        options=student['subjects'],
        index=0
    )

with col2:
    # Chapter options based on subject
    chapter_options = {
        "Science": [
            "Stars and the Solar System",
            "Coal and Petroleum", 
            "Combustion and Flame",
            "Conservation of Plants and Animals",
            "Cell Structure and Functions",
            "Reproduction in Animals",
            "Reaching the Age of Adolescence",
            "Force and Pressure",
            "Friction",
            "Sound",
            "Chemical Effects of Electric Current",
            "Some Natural Phenomena",
            "Light",
            "Pollution of Air and Water"
        ],
        "Mathematics": [
            "Rational Numbers",
            "Linear Equations in One Variable",
            "Understanding Quadrilaterals",
            "Practical Geometry",
            "Data Handling",
            "Squares and Square Roots",
            "Cubes and Cube Roots",
            "Comparing Quantities",
            "Algebraic Expressions and Identities",
            "Mensuration",
            "Exponents and Powers",
            "Direct and Inverse Proportions",
            "Factorisation",
            "Introduction to Graphs",
            "Playing with Numbers"
        ],
        "Social Science": [
            "How, When and Where",
            "From Trade to Territory",
            "Ruling the Countryside",
            "Tribals, Dikus and the Vision of a Golden Age",
            "When People Rebel",
            "Colonialism and the City",
            "Weavers, Iron Smelters and Factory Owners",
            "Civilising the Native, Educating the Nation",
            "Resources",
            "Land, Soil, Water, Natural Vegetation and Wildlife Resources",
            "Mineral and Power Resources",
            "Agriculture",
            "Industries",
            "Human Resources"
        ]
    }
    
    chapters = chapter_options.get(selected_subject, ["Chapter 1", "Chapter 2", "Chapter 3"])
    selected_chapter = st.selectbox(
        "📖 Select Chapter",
        options=chapters,
        index=0
    )

# Get quiz performance for recommendations
quiz_history = get_student_quiz_history(student['id'], subject=selected_subject, limit=10)

# Generate AI recommendations based on quiz performance
if quiz_history:
    # Analyze weak topics
    weak_topics = []
    strong_topics = []
    
    for quiz in quiz_history:
        if quiz.get('weak_topics'):
            try:
                topics = json.loads(quiz['weak_topics']) if isinstance(quiz['weak_topics'], str) else quiz['weak_topics']
                weak_topics.extend(topics)
            except:
                pass
        if quiz.get('strong_topics'):
            try:
                topics = json.loads(quiz['strong_topics']) if isinstance(quiz['strong_topics'], str) else quiz['strong_topics']
                strong_topics.extend(topics)
            except:
                pass
    
    # Remove duplicates and get top 5
    weak_topics = list(set(weak_topics))[:5]
    strong_topics = list(set(strong_topics))[:5]
    
    avg_score = sum(q['score_percentage'] for q in quiz_history) / len(quiz_history)
    
    # AI Recommendations
    st.markdown("""
    <div class="recommendation-card">
        <h3>🤖 AI Recommendations</h3>
        <p><strong>Based on your recent quiz performance:</strong></p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        if weak_topics:
            st.markdown("**🎯 Focus Areas (Needs Improvement):**")
            for topic in weak_topics:
                st.markdown(f"• {topic}")
        else:
            st.success("🎉 No weak areas identified!")
    
    with col2:
        if strong_topics:
            st.markdown("**✅ Strong Areas (Keep Practicing):**")
            for topic in strong_topics:
                st.markdown(f"• {topic}")
    
    # Performance-based recommendations
    if avg_score >= 80:
        recommendation = "🚀 Excellent performance! Try advanced topics and challenge yourself with harder questions."
    elif avg_score >= 60:
        recommendation = "📈 Good progress! Focus on weak areas and practice more questions."
    else:
        recommendation = "📚 Need more practice! Start with basics and build your foundation."
    
    st.info(recommendation)

else:
    st.info("📊 Take some quizzes to get personalized recommendations!")

# Study Plan for Selected Chapter
st.markdown(f"### 📖 Study Plan: {selected_subject} - {selected_chapter}")

# Mock study plan based on chapter
topics_by_chapter = {
    "Stars and the Solar System": [
        {"name": "Celestial Objects and Motion", "mastery": 75, "priority": "medium"},
        {"name": "Moon and Its Phases", "mastery": 60, "priority": "high"},
        {"name": "Stars and Constellations", "mastery": 85, "priority": "low"},
        {"name": "Solar System Structure", "mastery": 50, "priority": "high"},
        {"name": "Planets and Their Characteristics", "mastery": 70, "priority": "medium"}
    ],
    "Coal and Petroleum": [
        {"name": "Formation of Coal", "mastery": 65, "priority": "medium"},
        {"name": "Petroleum Refining", "mastery": 55, "priority": "high"},
        {"name": "Natural Gas", "mastery": 80, "priority": "low"},
        {"name": "Conservation of Resources", "mastery": 45, "priority": "high"}
    ],
    "Rational Numbers": [
        {"name": "Properties of Rational Numbers", "mastery": 70, "priority": "medium"},
        {"name": "Operations on Rational Numbers", "mastery": 60, "priority": "high"},
        {"name": "Representation on Number Line", "mastery": 85, "priority": "low"},
        {"name": "Rational Numbers between Two Numbers", "mastery": 55, "priority": "high"}
    ]
}

# Get topics for selected chapter or use default
topics = topics_by_chapter.get(selected_chapter, [
    {"name": "Topic 1: Introduction", "mastery": 70, "priority": "medium"},
    {"name": "Topic 2: Core Concepts", "mastery": 60, "priority": "high"},
    {"name": "Topic 3: Applications", "mastery": 50, "priority": "high"},
    {"name": "Topic 4: Advanced Topics", "mastery": 40, "priority": "high"}
])

# Display topics with mastery levels
for i, topic in enumerate(topics, 1):
    mastery = topic['mastery']
    mastery_class = "mastery-high" if mastery >= 70 else "mastery-medium" if mastery >= 50 else "mastery-low"
    priority_emoji = "🔴" if topic['priority'] == "high" else "🟡" if topic['priority'] == "medium" else "🟢"
    
    st.markdown(f"""
    <div class="topic-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>{priority_emoji} {topic['name']}</strong>
            </div>
            <div style="text-align: right;">
                <span style="color: #667eea; font-weight: 600;">{mastery}% Mastery</span>
            </div>
        </div>
        <div class="mastery-bar">
            <div class="mastery-fill {mastery_class}" style="width: {mastery}%;"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        if st.button(f"📝 Take Quiz", key=f"quiz_{i}"):
            st.session_state.selected_subject = selected_subject
            st.session_state.selected_chapter = selected_chapter
            st.switch_page("pages/2_Quiz.py")
    with col2:
        if st.button(f"🤖 Ask Tutor", key=f"tutor_{i}"):
            st.session_state.tutor_topic = topic['name']
            st.switch_page("pages/1_AI_Tutor.py")
    with col3:
        if st.button(f"📚 Study Material", key=f"study_{i}"):
            st.info(f"Study material for {topic['name']} coming soon!")

# Weekly Study Schedule
st.markdown("---")
st.markdown("### 📆 Suggested Weekly Schedule")

days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
schedule = {
    "Monday": f"{selected_subject} - {topics[0]['name'] if topics else 'Topic 1'}",
    "Tuesday": f"{selected_subject} - {topics[1]['name'] if len(topics) > 1 else 'Topic 2'}",
    "Wednesday": "Revision Day - Review weak topics",
    "Thursday": f"{selected_subject} - {topics[2]['name'] if len(topics) > 2 else 'Topic 3'}",
    "Friday": f"{selected_subject} - {topics[3]['name'] if len(topics) > 3 else 'Topic 4'}",
    "Saturday": "Practice Day - Take quizzes",
    "Sunday": "Rest & Light Revision"
}

cols = st.columns(7)
for i, day in enumerate(days):
    with cols[i]:
        is_today = datetime.now().strftime("%A") == day
        card_style = "background: #e3f2fd; border: 2px solid #2196f3;" if is_today else "background: white;"
        
        st.markdown(f"""
        <div style="{card_style} padding: 1rem; border-radius: 0.5rem; text-align: center; min-height: 120px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">{day}</div>
            <div style="font-size: 0.85rem; color: #666;">{schedule[day]}</div>
        </div>
        """, unsafe_allow_html=True)

# Study Tips
st.markdown("---")
st.markdown("### 💡 Study Tips")

col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    **🎯 Effective Study Strategies:**
    - Focus on weak topics first
    - Practice regularly with quizzes
    - Use AI Tutor for doubts
    - Review strong topics weekly
    - Take breaks between sessions
    """)

with col2:
    st.markdown("""
    **📊 Track Your Progress:**
    - Complete daily study goals
    - Monitor mastery levels
    - Review quiz performance
    - Adjust plan based on results
    - Celebrate achievements
    """)
