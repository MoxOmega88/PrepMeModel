"""
Quiz API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from services.rag_service import generate_question, assess_answer
from config import get_settings

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])
settings = get_settings()


class QuestionRequest(BaseModel):
    topic: str
    difficulty: float  # 0.0 to 1.0


class AssessmentRequest(BaseModel):
    question: str
    answer: str
    difficulty: float


@router.post("/generate-question")
async def create_question(req: QuestionRequest):
    """Generate a question from PDF content"""
    # Get absolute path to PDF
    backend_dir = os.path.dirname(os.path.dirname(__file__))
    pdf_path = os.path.join(backend_dir, "..", "ncert_science_8.pdf")
    pdf_path = os.path.abspath(pdf_path)
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail=f"PDF not found at: {pdf_path}")
    
    # Clamp difficulty to 0.0-1.0
    difficulty = max(0.0, min(1.0, req.difficulty))
    
    result = generate_question(req.topic, difficulty, pdf_path)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/assess")
async def assess_student_answer(req: AssessmentRequest):
    """Assess student's answer using RAG"""
    # Get absolute path to PDF
    backend_dir = os.path.dirname(os.path.dirname(__file__))
    pdf_path = os.path.join(backend_dir, "..", "ncert_science_8.pdf")
    pdf_path = os.path.abspath(pdf_path)
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail=f"PDF not found at: {pdf_path}")
    
    if not req.answer or len(req.answer.strip()) < 5:
        return {
            "score": 0,
            "max_score": 100,
            "correctness": "incorrect",
            "remarks": "Answer is too short. Please provide a more detailed response.",
            "key_points_covered": [],
            "key_points_missed": ["Complete answer required"],
            "improvement_suggestions": "Try to explain the concept in at least 2-3 sentences.",
            "model_answer": "",
            "difficulty_level": req.difficulty,
            "sources_used": 0
        }
    
    difficulty = max(0.0, min(1.0, req.difficulty))
    assessment = assess_answer(req.question, req.answer, pdf_path, difficulty)
    
    return assessment
