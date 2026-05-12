"""
FastAPI Backend for PrepMeAI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import health, tutor, quiz
from db.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    print("🚀 Starting PrepMeAI API...")
    await init_db()
    print("✅ Database initialized")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down PrepMeAI API...")
    await close_db()
    print("✅ Cleanup complete")


app = FastAPI(
    title="PrepMeAI API",
    description="AI-powered personalized study platform backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration - Must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(tutor.router)
app.include_router(quiz.router)


@app.get("/")
async def root():
    return {
        "message": "PrepMeAI API",
        "version": "1.0.0",
        "docs": "/docs",
        "database": "SQLite with async support"
    }


# Explicit OPTIONS handler for CORS preflight
@app.options("/{full_path:path}")
async def options_handler():
    return {"message": "OK"}
