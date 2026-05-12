# PrepMeAI - Smart Study Companion

AI-powered personalized study platform for NCERT Science Class 8.

## Project Structure

```
prepmeai/
├── frontend/          # Next.js 14 (App Router) + TypeScript
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities
│   └── public/       # Static assets
│
├── backend/          # FastAPI + Python 3.11
│   ├── routers/      # API endpoints
│   ├── models/       # Pydantic models
│   ├── services/     # Business logic
│   └── db/           # Database layer
│
└── ncert_science_8.pdf  # Study material
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Font**: Inter

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **AI/ML**: Groq (Llama 3.3), sentence-transformers
- **PDF Processing**: PyMuPDF
- **Data**: Pandas, NumPy

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Groq API key (free at https://console.groq.com)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local and add your API URL
npm run dev
```

Frontend runs at: http://localhost:3000

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

## Features

- 🧠 **AI Tutor**: RAG-powered chat with mastery-aware explanations
- 📝 **Quiz**: Adaptive question generation and grading
- 📅 **Study Planner**: Priority-based scheduling with adaptive recovery
- 📊 **Analytics**: Performance tracking and visualization
- 👤 **Profile**: Personalized mastery tracking

## Development

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend Commands
```bash
uvicorn main:app --reload          # Development server
uvicorn main:app --host 0.0.0.0    # Production server
pytest                              # Run tests
```

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- More endpoints coming soon...

## License

MIT

## Team

Built with ❤️ by the PrepMeAI Team
