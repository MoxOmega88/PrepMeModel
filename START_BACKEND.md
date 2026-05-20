# Backend Setup & Startup Guide

## Prerequisites

Make sure you have:
- Python 3.8+ installed
- Virtual environment activated
- All dependencies installed

## Step 1: Install Backend Dependencies

```cmd
cd backend
pip install -r requirements.txt
```

## Step 2: Check Environment Variables

Make sure `backend/.env` has:
```
GROQ_API_KEY=your_groq_api_key_here
```

## Step 3: Start the Backend Server

```cmd
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the shortcut:
```cmd
cd backend
uvicorn main:app --reload
```

## Step 4: Verify Backend is Running

Open your browser and go to:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

You should see the FastAPI interactive documentation.

## Available Endpoints

### Quiz Endpoints
- `POST /api/quiz/generate-question` - Generate a new question
- `POST /api/quiz/assess` - Assess student's answer

### Tutor Endpoints
- `POST /api/tutor/ask` - Ask the AI tutor a question

### Health Endpoints
- `GET /api/health` - Check if backend is running

## Troubleshooting

### Error: "PDF not found"
Make sure `ncert_science_8.pdf` is in the root directory (not in backend folder).

### Error: "GROQ_API_KEY not found"
1. Get your API key from https://console.groq.com/
2. Add it to `backend/.env`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

### Error: "Module not found"
Install dependencies:
```cmd
cd backend
pip install -r requirements.txt
```

### Port 8000 already in use
Kill the process or use a different port:
```cmd
uvicorn main:app --reload --port 8001
```

Then update `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## Testing the Backend

### Test Quiz Generation
```bash
curl -X POST http://localhost:8000/api/quiz/generate-question \
  -H "Content-Type: application/json" \
  -d '{"topic": "Stars and Solar System", "difficulty": 0.5}'
```

### Test Tutor
```bash
curl -X POST http://localhost:8000/api/tutor/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are stars?", "mastery_score": 0.5}'
```

## Running Full Stack

### Terminal 1 - Backend
```cmd
cd backend
uvicorn main:app --reload
```

### Terminal 2 - Frontend
```cmd
cd frontend
npm run dev
```

Now open http://localhost:3000 and everything should work!

## Common Issues

### Voice Input Not Working
Voice input requires HTTPS or localhost. It works on:
- ✅ http://localhost:3000
- ✅ https://your-domain.com
- ❌ http://192.168.x.x:3000 (IP address)

### Backend Connection Failed
1. Check if backend is running: http://localhost:8000/docs
2. Check CORS is enabled (it is by default)
3. Check frontend `.env.local` has correct API URL

### Quiz Not Loading
1. Make sure backend is running
2. Check browser console for errors (F12)
3. Verify PDF file exists in root directory
4. Check Groq API key is valid

## Success Indicators

When everything is working:
- ✅ Backend shows "✅ Database initialized" on startup
- ✅ Frontend loads without errors
- ✅ Quiz generates questions
- ✅ Tutor responds to questions
- ✅ Voice input button appears (microphone icon)

---

**Need help?** Check the logs in both terminals for error messages.
