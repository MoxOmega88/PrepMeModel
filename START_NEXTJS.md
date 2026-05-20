# 🚀 Quick Start - Next.js Frontend

## Step 1: Install Dependencies

```cmd
cd frontend
npm install
```

## Step 2: Start Development Server

```cmd
npm run dev
```

## Step 3: Open in Browser

The app will automatically open at:
```
http://localhost:3000
```

## 📄 Available Pages

| Page | URL | Description |
|------|-----|-------------|
| **Home Dashboard** | http://localhost:3000 | Main dashboard with stats & quick actions |
| **Study Planner (Simple)** | http://localhost:3000/planner-simple | Streamlit-style planner |
| **Study Planner (Advanced)** | http://localhost:3000/planner | Advanced planner with calendar |
| **Quiz** | http://localhost:3000/quiz | Take quizzes |
| **AI Tutor** | http://localhost:3000/tutor | Chat with AI tutor |
| **Analytics** | http://localhost:3000/analytics | View performance analytics |
| **Profile** | http://localhost:3000/profile | User profile settings |

## 🎯 What You'll See

### Home Page Features:
- ✅ Gradient header with welcome message
- ✅ 4 stat cards (Quizzes, Score, Questions, Doubts)
- ✅ 3 quick action cards (Quiz, Tutor, Planner)
- ✅ Recent activity feed
- ✅ Subject progress cards
- ✅ Logout button

### Study Planner Features:
- ✅ Subject dropdown (Science, Math, Social Science)
- ✅ Chapter dropdown (NCERT chapters)
- ✅ AI recommendations (weak/strong topics)
- ✅ Topic cards with mastery bars
- ✅ Priority indicators (🔴🟡🟢)
- ✅ Weekly schedule calendar
- ✅ Study tips

## 🔄 Making Changes

1. **Edit any file** in `frontend/app/` or `frontend/components/`
2. **Save the file**
3. **Browser auto-refreshes** with your changes!

## 🛑 Stop the Server

Press `Ctrl + C` in the terminal

## 🐛 Troubleshooting

### Port already in use?
```cmd
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Dependencies not installing?
```cmd
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors?
```cmd
# Check for TypeScript errors
npm run build
```

## 📊 Compare with Streamlit

Want to see the Streamlit version?

```cmd
# In a new terminal
streamlit run Home.py
```

Opens at: http://localhost:8501

## 🎨 Customization

### Change Colors
Edit `frontend/app/globals.css`:
```css
:root {
  --primary: 243 75% 59%;  /* Indigo */
  --accent: 258 90% 66%;   /* Purple */
}
```

### Add New Pages
Create file: `frontend/app/your-page/page.tsx`
```typescript
export default function YourPage() {
  return <div>Your content</div>
}
```

Access at: http://localhost:3000/your-page

## 🔗 Connect to Backend

1. **Start backend** (in new terminal):
```cmd
cd backend
python -m uvicorn main:app --reload
```

2. **Backend runs at**: http://localhost:8000

3. **Update frontend** to call backend APIs (see NEXTJS_SETUP.md)

## ✨ Pro Tips

- Use **React DevTools** browser extension for debugging
- Check **browser console** for errors (F12)
- Use **Tailwind CSS IntelliSense** VS Code extension
- Hot reload works for CSS and TypeScript!

---

**Ready to code?** Run `npm run dev` and start building! 🚀
