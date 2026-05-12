"""
RAG (Retrieval-Augmented Generation) Service
Handles PDF ingestion, embedding, retrieval, and LLM generation
"""
import re
import json
import hashlib
import numpy as np
from typing import List, Dict, Tuple, Optional
from functools import lru_cache
import fitz  # PyMuPDF
from groq import Groq
from config import get_settings

settings = get_settings()


# ── PDF Extraction ─────────────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def extract_chunks(pdf_path: str, chunk_pages: int = 3) -> List[Dict]:
    """Extract paragraph-level chunks from PDF with metadata"""
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error loading PDF: {e}")
        return []

    chunks = []
    page_count = doc.page_count
    
    for start in range(0, page_count, chunk_pages):
        end = min(start + chunk_pages, page_count)
        text = "\n".join(doc.load_page(i).get_text() for i in range(start, end)).strip()
        
        if len(text) < 80:
            continue
            
        # Split into paragraphs
        paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if len(p.strip()) > 60]
        
        for para in paragraphs:
            chunks.append({
                "text": para,
                "pages": f"{start+1}–{end}",
                "chunk_hash": hashlib.md5(para.encode()).hexdigest()[:8],
            })
    
    doc.close()
    return chunks


# ── Embeddings ─────────────────────────────────────────────────────────────────
_embedder = None

def get_embedder():
    """Lazy load sentence transformer model"""
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


@lru_cache(maxsize=1)
def build_index(pdf_path: str) -> Tuple[List[Dict], Optional[np.ndarray]]:
    """Build vector index from PDF chunks"""
    chunks = extract_chunks(pdf_path)
    if not chunks:
        return chunks, None
    
    embedder = get_embedder()
    texts = [c["text"] for c in chunks]
    embeddings = embedder.encode(
        texts, 
        batch_size=64, 
        show_progress_bar=False,
        normalize_embeddings=True
    )
    
    return chunks, embeddings.astype("float32")


def cosine_scores(query_emb: np.ndarray, corpus_embs: np.ndarray) -> np.ndarray:
    """Compute cosine similarity scores"""
    return corpus_embs @ query_emb


def bm25_scores(query: str, chunks: List[Dict], k1: float = 1.5, b: float = 0.75) -> np.ndarray:
    """Lightweight BM25 scoring"""
    tokens_q = set(query.lower().split())
    avgdl = sum(len(c["text"].split()) for c in chunks) / max(len(chunks), 1)
    
    scores = []
    for c in chunks:
        tokens_d = c["text"].lower().split()
        dl = len(tokens_d)
        freq = {t: tokens_d.count(t) for t in tokens_q if t in tokens_d}
        s = sum(
            f * (k1 + 1) / (f + k1 * (1 - b + b * dl / avgdl))
            for f in freq.values()
        )
        scores.append(s)
    
    return np.array(scores, dtype="float32")


def retrieve(query: str, pdf_path: str, top_k: int = 5) -> List[Dict]:
    """Hybrid retrieval: 70% dense + 30% BM25"""
    chunks, embs = build_index(pdf_path)
    if not chunks:
        return []
    
    bm25 = bm25_scores(query, chunks)
    bm25_norm = bm25 / (bm25.max() + 1e-9)
    
    if embs is not None:
        embedder = get_embedder()
        q_emb = embedder.encode([query], normalize_embeddings=True)[0].astype("float32")
        dense = cosine_scores(q_emb, embs)
        hybrid = 0.7 * dense + 0.3 * bm25_norm
    else:
        hybrid = bm25_norm
    
    top_idx = np.argsort(hybrid)[::-1][:top_k]
    return [chunks[i] for i in top_idx]


# ── LLM Generation ─────────────────────────────────────────────────────────────
def groq_chat(messages: List[Dict], model: str = None, temperature: float = 0.4) -> str:
    """Call Groq API"""
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY not set")
    
    client = Groq(api_key=settings.groq_api_key)
    model = model or settings.groq_model_primary
    
    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=1200,
    )
    return resp.choices[0].message.content.strip()


def get_depth_instructions(mastery_score: float) -> str:
    """Return depth-aware instructions based on mastery"""
    if mastery_score < 0.5:
        return (
            "The student's mastery is LOW. Use simple language, everyday analogies, "
            "avoid jargon. Break explanations into clear numbered steps. "
            "End with a very easy check-question."
        )
    elif mastery_score <= 0.75:
        return (
            "The student has MODERATE mastery. Give a clear explanation with one "
            "worked example. Use standard terminology but explain technical words. "
            "End with a medium-difficulty practice question."
        )
    else:
        return (
            "The student has HIGH mastery. Skip basics; focus on edge cases, "
            "advanced applications, and conceptual depth. Challenge them with a hard question."
        )


def rag_answer(question: str, pdf_path: str, mastery_score: float = 0.5) -> Dict:
    """
    RAG pipeline: retrieve relevant chunks and generate answer
    Returns: {answer, sources, retrieved_chunks}
    """
    # Retrieve relevant chunks
    chunks = retrieve(question, pdf_path, top_k=5)
    
    if not chunks:
        return {
            "answer": "I couldn't find relevant information in the textbook. Please rephrase your question.",
            "sources": [],
            "retrieved_chunks": []
        }
    
    # Build context
    context = "\n\n".join([f"[Page {c['pages']}]\n{c['text']}" for c in chunks])
    depth_inst = get_depth_instructions(mastery_score)
    
    # Generate answer
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert NCERT Science tutor. Answer questions using ONLY the provided textbook content. "
                "Do not hallucinate or add information not in the context. "
                f"{depth_inst}\n\n"
                "If the context doesn't contain the answer, say so clearly."
            )
        },
        {
            "role": "user",
            "content": f"Context from NCERT Science Class 8:\n\n{context}\n\nQuestion: {question}\n\nAnswer:"
        }
    ]
    
    answer = groq_chat(messages, temperature=0.3)
    
    return {
        "answer": answer,
        "sources": [{"pages": c["pages"], "preview": c["text"][:150] + "..."} for c in chunks[:3]],
        "retrieved_chunks": len(chunks)
    }


def assess_answer(question: str, student_answer: str, pdf_path: str, difficulty_level: float) -> Dict:
    """
    Assess student's answer using RAG + LLM with semantic evaluation
    Returns detailed feedback with score, tags, and adaptive recommendations
    
    Difficulty levels:
    - 0.0-0.2: Very Easy (recall, definitions)
    - 0.2-0.4: Easy (basic understanding)
    - 0.4-0.6: Medium (application, examples)
    - 0.6-0.8: Hard (analysis, comparison)
    - 0.8-1.0: Very Hard (synthesis, evaluation)
    """
    # Retrieve relevant content
    chunks = retrieve(question, pdf_path, top_k=3)
    context = "\n\n".join([c["text"] for c in chunks]) if chunks else "No context found"
    
    # Difficulty-based rubric
    if difficulty_level < 0.2:
        rubric = "Very Easy: Award full marks for correct recall/definition. Partial for incomplete."
    elif difficulty_level < 0.4:
        rubric = "Easy: Needs correct concept + one example. Partial for concept only."
    elif difficulty_level < 0.6:
        rubric = "Medium: Needs explanation + application. Partial for explanation without application."
    elif difficulty_level < 0.8:
        rubric = "Hard: Needs analysis + comparison. Partial for surface-level analysis."
    else:
        rubric = "Very Hard: Needs synthesis of multiple concepts + evaluation. Partial for incomplete synthesis."
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are an NCERT examiner using SEMANTIC EVALUATION. Grade based on MEANING, not keyword matching.\n\n"
                f"Difficulty Level: {difficulty_level:.1f}\n"
                f"Rubric: {rubric}\n\n"
                "EVALUATION CRITERIA:\n"
                "1. Core Concept (50%): Did they capture the fundamental idea? (Even if informal language)\n"
                "2. Scientific Terminology (30%): Did they use correct vocabulary?\n"
                "3. Misconceptions (20%): Did they state facts that need unlearning?\n\n"
                "ADAPTIVE BRANCHING LOGIC:\n"
                "- If score >= 0.8: Recommend BRANCH UP (increase difficulty)\n"
                "- If score <= 0.4: Recommend BRANCH DOWN (decrease difficulty)\n"
                "- If 0.4 < score < 0.8: Recommend MAINTAIN (same difficulty)\n\n"
                "Provide assessment in JSON format:\n"
                "{\n"
                '  "overall_score": <0.0-1.0 float>,\n'
                '  "score_percentage": <0-100 int>,\n'
                '  "core_concept_score": <0.0-1.0>,\n'
                '  "terminology_score": <0.0-1.0>,\n'
                '  "misconceptions_score": <0.0-1.0>,\n'
                '  "correctness": "<correct|partially_correct|incorrect>",\n'
                '  "tags": [<list of understanding tags like "understood_nucleus", "missing_vocab_membrane">],\n'
                '  "feedback_for_student": "<conversational feedback acknowledging what they got right, then gently correcting>",\n'
                '  "key_points_covered": [<concepts student understood>],\n'
                '  "key_points_missed": [<concepts student missed>],\n'
                '  "misconceptions_detected": [<any wrong facts that need unlearning>],\n'
                '  "improvement_suggestions": "<specific actionable advice>",\n'
                '  "model_answer": "<concise correct answer from textbook>",\n'
                '  "adaptive_recommendation": "<branch_up|branch_down|maintain>",\n'
                '  "next_difficulty_suggestion": <0.0-1.0 float>,\n'
                '  "mastery_status": "<strong|moderate|weak>"\n'
                "}"
            )
        },
        {
            "role": "user",
            "content": (
                f"Textbook Content:\n{context}\n\n"
                f"Question: {question}\n\n"
                f"Student's Answer: {student_answer}\n\n"
                "Assess this answer using SEMANTIC EVALUATION (meaning over keywords):"
            )
        }
    ]
    
    try:
        response = groq_chat(messages, temperature=0.2)
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            assessment = json.loads(json_match.group())
        else:
            assessment = json.loads(response)
        
        # Add metadata
        assessment["difficulty_level"] = difficulty_level
        assessment["sources_used"] = len(chunks)
        assessment["evaluation_method"] = "semantic"
        
        # Ensure all required fields exist
        if "score_percentage" not in assessment and "overall_score" in assessment:
            assessment["score_percentage"] = int(assessment["overall_score"] * 100)
        
        return assessment
    except Exception as e:
        print(f"Assessment error: {e}")
        return {
            "overall_score": 0.0,
            "score_percentage": 0,
            "core_concept_score": 0.0,
            "terminology_score": 0.0,
            "misconceptions_score": 0.0,
            "correctness": "error",
            "tags": ["error_processing"],
            "feedback_for_student": "Error processing assessment. Please try again.",
            "key_points_covered": [],
            "key_points_missed": [],
            "misconceptions_detected": [],
            "improvement_suggestions": "Please rephrase your answer and try again.",
            "model_answer": "",
            "adaptive_recommendation": "maintain",
            "next_difficulty_suggestion": difficulty_level,
            "mastery_status": "unknown",
            "difficulty_level": difficulty_level,
            "sources_used": 0,
            "evaluation_method": "semantic"
        }


def generate_question(topic: str, difficulty_level: float, pdf_path: str) -> Dict:
    """
    Generate a question from the PDF content at specified difficulty
    """
    chunks = retrieve(topic, pdf_path, top_k=3)
    if not chunks:
        return {"error": "Topic not found in textbook"}
    
    context = "\n\n".join([c["text"] for c in chunks])
    
    if difficulty_level < 0.2:
        q_type = "a simple recall or definition question"
    elif difficulty_level < 0.4:
        q_type = "a basic understanding question requiring an example"
    elif difficulty_level < 0.6:
        q_type = "an application question with a real-world scenario"
    elif difficulty_level < 0.8:
        q_type = "an analysis question requiring comparison or reasoning"
    else:
        q_type = "a synthesis question combining multiple concepts"
    
    messages = [
        {
            "role": "system",
            "content": (
                "You are an NCERT question paper setter. Generate questions ONLY from the provided textbook content. "
                f"Create {q_type} at difficulty level {difficulty_level:.1f}.\n\n"
                "Return JSON:\n"
                "{\n"
                '  "question": "<the question>",\n'
                '  "difficulty": <0.0-1.0>,\n'
                '  "expected_answer_length": "<short|medium|long>",\n'
                '  "key_concepts": [<list of concepts being tested>]\n'
                "}"
            )
        },
        {
            "role": "user",
            "content": f"Textbook Content:\n{context}\n\nGenerate a question about: {topic}"
        }
    ]
    
    try:
        response = groq_chat(messages, temperature=0.7)
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            question_data = json.loads(json_match.group())
        else:
            question_data = json.loads(response)
        
        question_data["sources"] = [{"pages": c["pages"]} for c in chunks[:2]]
        return question_data
    except Exception as e:
        print(f"Question generation error: {e}")
        return {"error": str(e)}
