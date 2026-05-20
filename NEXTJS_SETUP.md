# Next.js Frontend Setup Guide

## 🎯 Overview

Your PrepMeAI project now has **both** Streamlit and Next.js frontends:
- **Streamlit**: Python-based UI (existing pages in root directory)
- **Next.js**: Modern React frontend (in `frontend/` directory)

## 📁 Project Structure

```
PrepMeAI/
├── frontend/                    # Next.js Application
│   ├── app/
│   │   ├── page.tsx            # ✅ Enhanced Home Dashboard
│   │   ├── planner/page.tsx    # Advanced Planner (existing)
│   │   ├── planner-simple/     # ✅ Simplified Planner (Streamlit-style)
│   │   ├── quiz/page.tsx       # Quiz Page
│   │   ├── tutor/page.tsx      # AI Tutor Page
│   │   └── layout.tsx          # Main Layout
│   ├── components/             # Reusable Components
│   └── package.json
│
├── Home.py                     # Streamlit Home (Python)
├── pages/                      # Streamlit Pages
│   ├── 0_Auth.py
│   ├── 1_AI_Tutor.py
│   ├── 2_Quiz.py
│   └── 3_Study_Planner.py     # ✅ Enhanced Streamlit Planner
│
└── backend/                    # FastAPI Backend
    └── main.py
```

## 🚀 Running the Applications

### Option 1: Run Next.js Frontend (Recommended)

```cmd
cd frontend
npm install
npm run dev
```

The app will open at: **http://localhost:3000**

### Option 2: Run Streamlit (Python)

```cmd
streamlit run Home.py
```

The app will open at: **http://localhost:8501**

### Option 3: Run Both (Full Stack)

**Terminal 1 - Backend:**
```cmd
cd backend
python -m uvicorn main:app --reload
```

**Terminal 2 - Next.js Frontend:**
```cmd
cd frontend
npm run dev
```

**Terminal 3 - Streamlit (Optional):**
```cmd
streamlit run Home.py
```

## 📋 What's Been Converted

### ✅ Home Page (Dashboard)
- **Streamlit**: `Home.py` 
- **Next.js**: `frontend/app/page.tsx`

**Features:**
- Welcome header with gradient background
- Stats cards (quizzes, scores, questions, doubts)
- Quick action cards (Quiz, Tutor, Planner)
- Recent activity feed
- Subject progress overview
- Logout button

### ✅ Study Planner
- **Streamlit**: `pages/3_Study_Planner.py`
- **Next.js**: `frontend/app/planner-simple/page.tsx`

**Features:**
- Subject & chapter selection dropdowns
- AI-powered recommendations (weak/strong topics)
- Topic mastery tracking with progress bars
- Priority indicators (🔴 High, 🟡 Medium, 🟢 Low)
- Quick actions per topic (Quiz, Tutor, Study Material)
- Weekly study schedule
- Study tips

## 🎨 Design System

Both frontends use similar styling:

### Colors
- **Primary**: Indigo/Purple gradient (`#667eea` → `#764ba2`)
- **Background**: Light gray (`#f5f7fa`)
- **Cards**: White with subtle shadows
- **Borders**: Soft gray (`#e2e8f0`)

### Components
- **Tailwind CSS** (Next.js)
- **Custom CSS** (Streamlit)
- **shadcn/ui** components (Next.js)

## 🔗 API Integration

The Next.js frontend currently uses **mock data**. To connect to your backend:

1. **Create API client** (`frontend/lib/api.ts`):
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getStudentStats(studentId: number) {
  const res = await fetch(`${API_URL}/api/students/${studentId}/stats`)
  return res.json()
}

export async function getQuizHistory(studentId: number) {
  const res = await fetch(`${API_URL}/api/students/${studentId}/quizzes`)
  return res.json()
}
```

2. **Update pages to use real data**:
```typescript
// In frontend/app/page.tsx
import { getStudentStats } from '@/lib/api'

export default async function Home() {
  const stats = await getStudentStats(1)
  // ... rest of component
}
```

3. **Add environment variables** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📦 Dependencies

### Next.js Frontend
```json
{
  "next": "14.2.15",
  "react": "^18.3.1",
  "tailwindcss": "^3.4.14",
  "@radix-ui/react-*": "Latest",
  "lucide-react": "^0.454.0"
}
```

### Streamlit
```
streamlit
pandas
plotly
```

## 🔄 Migration Path

To fully migrate from Streamlit to Next.js:

1. ✅ **Home Dashboard** - Done
2. ✅ **Study Planner** - Done
3. ⏳ **Quiz Page** - Partially done (needs backend integration)
4. ⏳ **AI Tutor** - Partially done (needs backend integration)
5. ⏳ **Auth Page** - Needs conversion
6. ⏳ **Profile Settings** - Needs conversion

## 🛠️ Development Tips

### Hot Reload
- **Next.js**: Auto-reloads on file save
- **Streamlit**: Click "Rerun" or enable auto-rerun

### Debugging
- **Next.js**: Use browser DevTools + React DevTools
- **Streamlit**: Use `st.write()` for debugging

### Styling
- **Next.js**: Edit Tailwind classes directly
- **Streamlit**: Edit CSS in `st.markdown()` blocks

## 📱 Responsive Design

Both frontends are mobile-responsive:
- **Desktop**: Full grid layouts
- **Tablet**: 2-column grids
- **Mobile**: Single column, stacked cards

## 🚦 Next Steps

1. **Test the Next.js frontend**:
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```

2. **Visit pages**:
   - Home: http://localhost:3000
   - Planner (Simple): http://localhost:3000/planner-simple
   - Planner (Advanced): http://localhost:3000/planner
   - Quiz: http://localhost:3000/quiz
   - Tutor: http://localhost:3000/tutor

3. **Connect to backend** (when ready):
   - Start backend: `cd backend && uvicorn main:app --reload`
   - Update API URLs in frontend
   - Replace mock data with real API calls

4. **Choose your frontend**:
   - Keep Streamlit for rapid prototyping
   - Use Next.js for production deployment
   - Or run both in parallel!

## 💡 Benefits of Next.js

- ⚡ **Faster**: Better performance and SEO
- 🎨 **Flexible**: Full control over UI/UX
- 📱 **Modern**: Latest React features
- 🔧 **Scalable**: Easy to add features
- 🌐 **Production-ready**: Deploy to Vercel/Netlify

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Need help?** Check the code comments or ask your team!
