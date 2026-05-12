"""
AI Tutor API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from services.rag_service import rag_answer
from config import get_settings

router = APIRouter(prefix="/api/tutor", tags=["Tutor"])
settings = get_settings()


class TutorRequest(BaseModel):
    question: str
    mastery_score: Optional[float] = 0.5  # 0.0 to 1.0


@router.post("/ask")
async def ask_tutor(req: TutorRequest):
    """Ask the AI tutor a question"""
    # Get absolute path to PDF
    backend_dir = os.path.dirname(os.path.dirname(__file__))
    pdf_path = os.path.join(backend_dir, "..", "ncert_science_8.pdf")
    pdf_path = os.path.abspath(pdf_path)
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail=f"PDF not found at: {pdf_path}")
    
    if not req.question or len(req.question.strip()) < 3:
        raise HTTPException(status_code=400, detail="Question is too short")
    
    mastery = max(0.0, min(1.0, req.mastery_score))
    result = rag_answer(req.question, pdf_path, mastery)
    
    return result
