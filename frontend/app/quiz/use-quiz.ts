"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import type { QuizConfig, QuizQuestion, QuizAttempt, QuizPhase, Difficulty, AnswerQuality, SummaryStats } from "./types"
import { getQuestions, MOCK_MASTERY } from "./mock-questions"
import { scoreAttempt, nextDifficulty, buildSummary } from "./scoring"

export interface QuizState {
  phase: QuizPhase
  config: QuizConfig | null
  questions: QuizQuestion[]
  currentIndex: number
  attempts: QuizAttempt[]
  currentAttempt: QuizAttempt | null
  elapsedS: number
  questionStartS: number
  adaptiveMessage: string
  summary: SummaryStats | null
  currentDifficulty: Difficulty
}

const INITIAL: QuizState = {
  phase: "config",
  config: null,
  questions: [],
  currentIndex: 0,
  attempts: [],
  currentAttempt: null,
  elapsedS: 0,
  questionStartS: 0,
  adaptiveMessage: "",
  summary: null,
  currentDifficulty: "medium",
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>(INITIAL)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── elapsed timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === "question") {
      timerRef.current = setInterval(() => {
        setState((s) => ({ ...s, elapsedS: s.elapsedS + 1 }))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [state.phase])

  // ── start quiz ─────────────────────────────────────────────────────────────
  const startQuiz = useCallback((config: QuizConfig) => {
    const qs = getQuestions(config.topic, config.difficulty, config.num_questions)
    setState({
      ...INITIAL,
      phase: "question",
      config,
      questions: qs,
      currentIndex: 0,
      currentDifficulty: config.difficulty,
      questionStartS: Date.now(),
    })
  }, [])

  // ── submit answer ──────────────────────────────────────────────────────────
  const submitAnswer = useCallback((
    studentAnswer: string,
    quality: AnswerQuality,
    feedback: string
  ) => {
    setState((s) => {
      if (!s.config || s.phase !== "question") return s
      const q = s.questions[s.currentIndex]
      const timeTaken = Math.round((Date.now() - s.questionStartS) / 1000)
      const mastery = MOCK_MASTERY[s.config.topic] ?? 0.5
      const scored = scoreAttempt(q, quality, timeTaken, mastery)
      const attempt: QuizAttempt = {
        question: q,
        student_answer: studentAnswer,
        quality,
        feedback,
        time_taken_s: timeTaken,
        ...scored,
      }
      return { ...s, phase: "result", currentAttempt: attempt }
    })
  }, [])

  // ── next question ──────────────────────────────────────────────────────────
  const nextQuestion = useCallback((selfExplanation?: string) => {
    setState((s) => {
      if (!s.currentAttempt || !s.config) return s

      // Apply partial credit from self-explanation
      let attempt = s.currentAttempt
      if (selfExplanation && selfExplanation.trim().length > 20 && !attempt.is_correct) {
        attempt = {
          ...attempt,
          quality: "partial",
          base_score: Math.round(attempt.question.base_points * 0.5),
          total_score: Math.round(attempt.question.base_points * 0.5),
          partial_multiplier: 0.5,
        }
      }

      const newAttempts = [...s.attempts, attempt]
      const nextIdx = s.currentIndex + 1

      if (nextIdx >= s.questions.length) {
        const mastery = MOCK_MASTERY[s.config.topic] ?? 0.5
        const summary = buildSummary(newAttempts, mastery, s.config.topic)
        return { ...s, phase: "summary", attempts: newAttempts, currentAttempt: null, summary }
      }

      // Adaptive difficulty
      const { difficulty: newDiff, message } = nextDifficulty(
        s.currentDifficulty,
        attempt.is_correct
      )

      // Swap in a question of the new difficulty if available
      const remaining = s.questions.slice(nextIdx)
      const betterQ = remaining.find((q) => q.difficulty === newDiff)
      let newQuestions = [...s.questions]
      if (betterQ) {
        const betterIdx = newQuestions.indexOf(betterQ)
        ;[newQuestions[nextIdx], newQuestions[betterIdx]] = [newQuestions[betterIdx], newQuestions[nextIdx]]
      }

      return {
        ...s,
        phase: "question",
        attempts: newAttempts,
        currentAttempt: null,
        currentIndex: nextIdx,
        questions: newQuestions,
        currentDifficulty: newDiff,
        adaptiveMessage: message,
        questionStartS: Date.now(),
      }
    })
  }, [])

  // ── reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => setState(INITIAL), [])

  return { state, startQuiz, submitAnswer, nextQuestion, reset }
}

// ── format seconds as m:ss ────────────────────────────────────────────────────
export function fmtTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, "0")}`
}
