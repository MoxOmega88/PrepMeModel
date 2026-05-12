import type { Difficulty, AnswerQuality, QuizAttempt, QuizQuestion, SummaryStats } from "./types"

// ── Points per difficulty ─────────────────────────────────────────────────────
export const BASE_POINTS: Record<Difficulty, number> = {
  easy:   5,
  medium: 10,
  hard:   15,
}

// ── Time bonus: max 5 pts, earned if answered in < 30s ───────────────────────
export function calcTimeBonus(timeTakenS: number): number {
  if (timeTakenS >= 30) return 0
  return Math.min(5, Math.round((30 - timeTakenS) / 6))
}

// ── Difficulty bonus: +5 if question is 1 level above current mastery ─────────
export function calcDifficultyBonus(
  difficulty: Difficulty,
  masteryScore: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return 0
  const masteryLevel: Difficulty =
    masteryScore < 0.4 ? "easy" : masteryScore < 0.7 ? "medium" : "hard"
  const order: Difficulty[] = ["easy", "medium", "hard"]
  const qIdx = order.indexOf(difficulty)
  const mIdx = order.indexOf(masteryLevel)
  return qIdx > mIdx ? 5 : 0
}

// ── Partial credit multiplier ─────────────────────────────────────────────────
export const QUALITY_MULTIPLIER: Record<AnswerQuality, number> = {
  correct: 1.0,
  typo:    0.75,
  partial: 0.5,
  wrong:   0.0,
}

// ── Score a single attempt ────────────────────────────────────────────────────
export function scoreAttempt(
  question: QuizQuestion,
  quality: AnswerQuality,
  timeTakenS: number,
  masteryScore: number
): Pick<QuizAttempt, "base_score" | "time_bonus" | "difficulty_bonus" | "partial_multiplier" | "total_score" | "is_correct"> {
  const isCorrect = quality === "correct" || quality === "typo"
  const base      = question.base_points
  const mult      = QUALITY_MULTIPLIER[quality]
  const timeBonus = isCorrect ? calcTimeBonus(timeTakenS) : 0
  const diffBonus = calcDifficultyBonus(question.difficulty, masteryScore, isCorrect)
  const total     = Math.round(base * mult) + timeBonus + diffBonus

  return {
    base_score:          Math.round(base * mult),
    time_bonus:          timeBonus,
    difficulty_bonus:    diffBonus,
    partial_multiplier:  mult,
    total_score:         total,
    is_correct:          isCorrect,
  }
}

// ── Adaptive difficulty: next question difficulty ─────────────────────────────
export function nextDifficulty(
  current: Difficulty,
  isCorrect: boolean
): { difficulty: Difficulty; message: string } {
  const order: Difficulty[] = ["easy", "medium", "hard"]
  const idx = order.indexOf(current)

  if (isCorrect && idx < 2) {
    return {
      difficulty: order[idx + 1],
      message: idx === 1
        ? "Excellent! That was challenging. Here is a harder one."
        : "Great work! Moving up a level.",
    }
  }
  if (!isCorrect && idx > 0) {
    return {
      difficulty: order[idx - 1],
      message: "Let us build up. Here is an easier one.",
    }
  }
  return {
    difficulty: current,
    message: isCorrect
      ? "Well done! Keeping the same difficulty."
      : "Keep going — same difficulty, you can do it.",
  }
}

// ── Mastery update (Bayesian-style) ──────────────────────────────────────────
export function updateMastery(
  current: number,
  attempts: QuizAttempt[],
  alpha = 0.3
): number {
  const accuracy = attempts.filter((a) => a.is_correct).length / Math.max(attempts.length, 1)
  return Math.min(1, Math.max(0, (1 - alpha) * current + alpha * accuracy))
}

// ── Build summary stats ───────────────────────────────────────────────────────
export function buildSummary(
  attempts: QuizAttempt[],
  masteryBefore: number,
  topic: string
): SummaryStats {
  const masteryAfter = updateMastery(masteryBefore, attempts)

  const byDiff: SummaryStats["by_difficulty"] = {
    easy:   { correct: 0, total: 0, points: 0, max_points: 0 },
    medium: { correct: 0, total: 0, points: 0, max_points: 0 },
    hard:   { correct: 0, total: 0, points: 0, max_points: 0 },
  }

  let totalScore = 0
  let maxScore   = 0

  for (const a of attempts) {
    const d = a.question.difficulty
    byDiff[d].total      += 1
    byDiff[d].max_points += a.question.base_points
    byDiff[d].points     += a.total_score
    maxScore             += a.question.base_points
    totalScore           += a.total_score
    if (a.is_correct) byDiff[d].correct += 1
  }

  // Recommendation logic
  const hardAcc = byDiff.hard.total > 0
    ? byDiff.hard.correct / byDiff.hard.total : null
  const medAcc  = byDiff.medium.total > 0
    ? byDiff.medium.correct / byDiff.medium.total : null

  let recommended_next = topic
  let recommended_action: SummaryStats["recommended_action"] = "practice"

  if (masteryAfter >= 0.75) {
    recommended_action = "harder"
    recommended_next   = "a harder topic"
  } else if (masteryAfter < 0.5 || (medAcc !== null && medAcc < 0.5)) {
    recommended_action = "revision"
    recommended_next   = topic
  } else {
    recommended_action = "practice"
    recommended_next   = topic
  }

  return {
    total_score:    totalScore,
    max_score:      maxScore,
    by_difficulty:  byDiff,
    mastery_before: masteryBefore,
    mastery_after:  masteryAfter,
    topic,
    recommended_next,
    recommended_action,
  }
}
