# Quick Start Guide - PrepMeAI

## One-Command Startup

```cmd
start-fullstack.bat
```

This starts both backend and frontend automatically!

---

## Manual Startup

### Step 1: Start Backend
```cmd
cd backend
uvicorn main:app --reload
```

### Step 2: Start Frontend
```cmd
cd frontend
npm run dev
```

---

## Access URLs

- **App**: http://localhost:3000
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

---

## First Time Setup

### 1. Install Dependencies

**Backend:**
```cmd
cd backend
pip install -r requirements.txt
```

**Frontend:**
```cmd
cd frontend
npm install
```

### 2. Add API Key

Create `backend/.env`:
```
GROQ_API_KEY=your_key_here
```

Get your key from: https://console.groq.com/

### 3. Verify PDF

Make sure `ncert_science_8.pdf` is in the root directory.

---

## Features

### Home Dashboard
- Student stats (quizzes, scores, questions)
- Quick actions (Quiz, Tutor, Planner)
- Recent activity
- Subject progress

### Quiz Page
- Adaptive difficulty
- Voice input (microphone button)
- Text-to-speech (speaker button)
- Detailed feedback
- Progress tracking

### AI Tutor
- RAG-powered answers from PDF
- Voice input support
- Source citations
- Chat history

### Study Planner
- Subject/chapter selection
- AI recommendations
- Topic mastery tracking
- Weekly schedule

---

## Troubleshooting

### Backend won't start?
```cmd
cd backend
pip install -r requirements.txt
```

### Frontend won't start?
```cmd
cd frontend
npm install
```

### Voice input not working?
- Use Chrome or Edge
- Allow microphone permission
- Use localhost (not IP address)

### Quiz shows 400 error?
- Make sure backend is running
- Check http://localhost:8000/docs
- Verify GROQ_API_KEY in backend/.env

---

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **AI**: Groq LLM + ChromaDB (RAG)
- **Database**: SQLite

---

## Need Help?

Check these files:
- `FIXES_APPLIED.md` - What was changed
- `START_BACKEND.md` - Backend setup details
- `NEXTJS_SETUP.md` - Frontend setup details
- `STREAMLIT_VS_NEXTJS.md` - Comparison guide

---

**Ready to go? Run `start-fullstack.bat` now!** 🚀
