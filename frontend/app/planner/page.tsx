"use client"

import { useState, useMemo, useEffect } from "react"
import {
  CalendarDays, Clock, Target, AlertTriangle, AlertCircle,
  CheckCircle2, Sparkles, RotateCcw, BookOpen, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  getMockSessions, getMockRevisionLog, getMockTopicProgress,
  type StudySession, type TopicProgress, type RevisionEntry,
} from "./mock-data"
import {
  SessionCard, SessionDrawer, RevisionRow, TopicProgressBar, TopicDetailPanel, fmtDate,
} from "./components"

// ── date helpers ──────────────────────────────────────────────────────────────

function getWeekDays(offset = 0): Date[] {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// ── missed sessions ───────────────────────────────────────────────────────────

function getMissed(sessions: StudySession[]) {
  if (!sessions) return []
  return sessions.filter((s) => s.status === "missed")
}

// ── low-mastery topics ────────────────────────────────────────────────────────

function getLowMastery(sessions: StudySession[]) {
  if (!sessions) return []
  const seen = new Set<string>()
  return sessions
    .filter((s) => s.mastery < 0.6 && !seen.has(s.topic) && seen.add(s.topic))
    .slice(0, 4)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  // ── form state ──────────────────────────────────────────────────────────────
  const defaultExam = new Date()
  defaultExam.setDate(defaultExam.getDate() + 30)
  const [examDate, setExamDate]       = useState(toISO(defaultExam))
  const [dailyHours, setDailyHours]   = useState(3)
  const [adherence, setAdherence]     = useState(80)
  const [planGenerated, setPlanGenerated] = useState(false)

  // ── sessions state ──────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
  const [revisionLog, setRevisionLog] = useState<RevisionEntry[]>([])
  
  // Initialize data on mount
  useEffect(() => {
    setSessions(getMockSessions())
    setTopicProgress(getMockTopicProgress())
    setRevisionLog(getMockRevisionLog())
  }, [])

  // ── drawer state ────────────────────────────────────────────────────────────
  const [drawerSession, setDrawerSession] = useState<StudySession | null>(null)
  const [drawerOpen, setDrawerOpen]       = useState(false)

  // ── topic detail state ──────────────────────────────────────────────────────
  const [selectedTopic, setSelectedTopic] = useState<TopicProgress | null>(null)

  // ── week navigation ─────────────────────────────────────────────────────────
  const [weekOffset, setWeekOffset] = useState(0)
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset])
  const todayISO = toISO(new Date())

  // ── derived ─────────────────────────────────────────────────────────────────
  const missed     = useMemo(() => getMissed(sessions), [sessions])
  const lowMastery = useMemo(() => getLowMastery(sessions), [sessions])
  const missedMin  = (missed ?? []).reduce((a: number, s: StudySession) => a + s.planned_min, 0)

  // ── handlers ────────────────────────────────────────────────────────────────
  function handleMarkComplete(id: string) {
    setSessions((prev: StudySession[]) =>
      prev.map((s: StudySession) => s.id === id ? { ...s, status: "done" as const, actual_min: s.planned_min } : s)
    )
  }

  function handleReschedule(id: string, newDate: string) {
    setSessions((prev: StudySession[]) =>
      prev.map((s: StudySession) => s.id === id ? { ...s, date: newDate } : s)
    )
  }

  function openDrawer(s: StudySession) {
    setDrawerSession(s)
    setDrawerOpen(true)
  }

  // ── sorted topic progress ────────────────────────────────────────────────────
  const sortedTopics = useMemo(() => {
    if (topicProgress.length === 0) return []
    const today = new Date().toISOString().slice(0, 10)
    return topicProgress.sort((a, b) => {
      const aOverdue = a.next_revision < today ? 1 : 0
      const bOverdue = b.next_revision < today ? 1 : 0
      if (aOverdue !== bOverdue) return bOverdue - aOverdue
      return a.mastery - b.mastery
    })
  }, [topicProgress])

  // ── revision log sorted ──────────────────────────────────────────────────────
  const sortedRevisions = useMemo(() => {
    if (revisionLog.length === 0) return []
    return revisionLog.sort((a, b) => {
      const da = new Date(a.next_review_due).getTime()
      const db = new Date(b.next_review_due).getTime()
      return da - db
    })
  }, [revisionLog])

  // ── group revisions by topic ─────────────────────────────────────────────────
  const revisionsByTopic = useMemo(() => {
    const map: Record<string, RevisionEntry[]> = {}
    sortedRevisions.forEach((r: RevisionEntry) => {
      if (!map[r.topic]) map[r.topic] = []
      map[r.topic].push(r)
    })
    return map
  }, [sortedRevisions])

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Study Planner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Personalised learning + spaced revision — adapted to your mastery in real time.
        </p>
      </div>

      {/* ── Plan generator form ── */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Generate Adaptive Plan
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">

          {/* Exam date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              min={toISO(new Date())}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              {Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))} days away
            </p>
          </div>

          {/* Daily hours */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Daily Study Hours
              <span className="ml-auto font-bold text-primary">{dailyHours}h</span>
            </label>
            <div className="pt-2 pb-1">
              <Slider
                min={1} max={8} step={0.5}
                value={[dailyHours]}
                onValueChange={([v]: number[]) => setDailyHours(v)}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1h</span><span>8h</span>
            </div>
          </div>

          {/* Adherence */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-muted-foreground" /> Adherence Rate
              <span className="ml-auto font-bold text-primary">{adherence}%</span>
            </label>
            <div className="pt-2 pb-1">
              <Slider
                min={50} max={100} step={5}
                value={[adherence]}
                onValueChange={([v]: number[]) => setAdherence(v)}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50%</span><span>100%</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={() => setPlanGenerated(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Adaptive Plan
          </Button>
          {planGenerated && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Plan active
            </span>
          )}
        </div>
      </div>

      {/* ── Banners (always visible once plan generated) ── */}
      {planGenerated && (
        <div className="space-y-3">

          {/* Low adherence banner */}
          {adherence < 50 && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Your adherence is low. We have adjusted your plan to 2 hours/day.</p>
                <p className="text-xs text-red-600 mt-0.5">You can increase it anytime using the slider above.</p>
              </div>
            </div>
          )}

          {/* Missed sessions banner */}
          {missed.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">
                    You missed {missed.length} session{missed.length > 1 ? "s" : ""} ({missedMin} minutes). Here is what to prioritise:
                  </p>
                  <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                    {missed.slice(0, 3).map((s: StudySession) => (
                      <div key={s.id} className="rounded-lg bg-white border border-amber-200 px-3 py-2">
                        <p className="text-xs font-semibold text-foreground">{s.topic}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.planned_min} min · {s.type}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7 border-amber-400 text-amber-700 hover:bg-amber-100">
                      Absorb into this week
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 border-amber-400 text-amber-700 hover:bg-amber-100">
                      Extend to next week
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart revision recommendations */}
          {lowMastery.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">
                    Based on your quiz performance, you need revision on:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lowMastery.map((s: StudySession) => (
                      <div key={s.id} className="flex items-center gap-2 rounded-lg bg-white border border-green-200 px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="text-xs font-medium text-foreground">{s.topic}</span>
                        <span className="text-[10px] text-muted-foreground">{Math.round(s.mastery * 100)}%</span>
                        <Button
                          size="sm"
                          className="h-5 text-[10px] px-2 ml-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const match = sessions.find((x: StudySession) => x.topic === s.topic && x.type === "revision")
                            if (match) openDrawer(match)
                          }}
                        >
                          Start 15-min revision
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tabs (only after plan generated) ── */}
      {planGenerated && (
        <Tabs defaultValue="week" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="week" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Week View
            </TabsTrigger>
            <TabsTrigger value="revision" className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Revision Schedule
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Progress by Topic
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════════
              TAB 1 — Adaptive Week View
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="week">
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

              {/* Week nav */}
              <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/60">
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset((o: number) => o - 1)}>
                  ← Prev
                </Button>
                <p className="text-sm font-semibold text-foreground">
                  {weekDays[0].toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                  {" – "}
                  {weekDays[6].toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                </p>
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset((o: number) => o + 1)}>
                  Next →
                </Button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 px-5 py-2.5 border-b text-[11px] font-medium text-muted-foreground">
                {[
                  { colour:"bg-blue-500",   label:"New Topic"  },
                  { colour:"bg-amber-500",  label:"Revision"   },
                  { colour:"bg-red-500",    label:"Mock Test"  },
                  { colour:"bg-green-500",  label:"Practice"   },
                ].map(({ colour, label }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-full", colour)} /> {label}
                  </span>
                ))}
              </div>

              {/* 7-column grid */}
              <div className="grid grid-cols-7 divide-x min-h-[420px]">
                {weekDays.map((day: Date, idx: number) => {
                  const iso = toISO(day)
                  const isToday = iso === todayISO
                  const daySessions = sessions.filter((s: StudySession) => s.date === iso)

                  return (
                    <div
                      key={iso}
                      className={cn(
                        "flex flex-col min-h-[420px]",
                        isToday && "border-l-4 border-l-indigo-500 bg-indigo-50/30"
                      )}
                    >
                      {/* Day header */}
                      <div className={cn(
                        "px-2 py-2.5 text-center border-b",
                        isToday ? "bg-indigo-50" : "bg-gray-50/40"
                      )}>
                        <p className={cn(
                          "text-[11px] font-semibold uppercase tracking-wide",
                          isToday ? "text-indigo-600" : "text-muted-foreground"
                        )}>
                          {DAY_NAMES[idx]}
                        </p>
                        <p className={cn(
                          "text-lg font-bold mt-0.5",
                          isToday ? "text-indigo-700" : "text-foreground"
                        )}>
                          {day.getDate()}
                        </p>
                        {isToday && (
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Today</span>
                        )}
                      </div>

                      {/* Sessions */}
                      <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
                        {daySessions.length === 0 ? (
                          <p className="text-[10px] text-center text-muted-foreground/50 mt-4">—</p>
                        ) : (
                          daySessions.map((s: StudySession) => (
                            <SessionCard key={s.id} session={s} onClick={openDrawer} />
                          ))
                        )}
                      </div>

                      {/* Day total */}
                      {daySessions.length > 0 && (
                        <div className="px-2 py-1.5 border-t bg-gray-50/40 text-[10px] text-muted-foreground text-center">
                          {daySessions.reduce((a: number, s: StudySession) => a + s.planned_min, 0)} min planned
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2 — Revision Schedule
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="revision">
            <div className="space-y-6">

              {/* Status legend */}
              <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                {[
                  { dot:"bg-red-500",    label:"Overdue"   },
                  { dot:"bg-amber-500",  label:"Due soon (≤2 days)" },
                  { dot:"bg-green-500",  label:"On schedule" },
                ].map(({ dot, label }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-full", dot)} /> {label}
                  </span>
                ))}
              </div>

              {/* Grouped by topic */}
              {Object.entries(revisionsByTopic).map(([topic, entries]) => {
                const revEntries = entries as RevisionEntry[]
                const today = new Date().toISOString().slice(0, 10)
                const isOverdue = revEntries.some((e: RevisionEntry) => e.next_review_due < today)
                const isDueSoon = revEntries.some((e: RevisionEntry) => {
                  const diff = Math.ceil((new Date(e.next_review_due).getTime() - new Date(today).getTime()) / 86400000)
                  return diff >= 0 && diff <= 2
                })

                return (
                  <div key={topic} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                    <div className={cn(
                      "flex items-center justify-between px-5 py-3 border-b",
                      isOverdue ? "bg-red-50" : isDueSoon ? "bg-amber-50" : "bg-gray-50/60"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          isOverdue ? "bg-red-500" : isDueSoon ? "bg-amber-500" : "bg-green-500"
                        )} />
                        <p className="font-semibold text-sm text-foreground">{topic}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {revEntries[0].times_reviewed}× reviewed &nbsp;·&nbsp; {Math.round(revEntries[0].mastery * 100)}% mastery
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Spaced repetition timeline */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {revEntries.map((e: RevisionEntry, i: number) => {
                          const today2 = new Date().toISOString().slice(0, 10)
                          const isPast = e.last_reviewed <= today2
                          return (
                            <div key={i} className="flex items-center gap-2 shrink-0">
                              <div className={cn(
                                "rounded-lg border px-3 py-2 text-center min-w-[100px]",
                                isPast ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                              )}>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  Review {i + 1}
                                </p>
                                <p className="text-xs font-bold text-foreground mt-0.5">
                                  {fmtDate(e.last_reviewed)}
                                </p>
                                {isPast && (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mx-auto mt-1" />
                                )}
                              </div>
                              <div className="text-muted-foreground text-xs">→</div>
                            </div>
                          )
                        })}
                        {/* Next due */}
                        <div className="shrink-0">
                          <RevisionRow entry={revEntries[revEntries.length - 1]} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3 — Progress by Topic
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="progress">
            <div className="space-y-4">

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                {[
                  { colour:"bg-blue-500",   label:"Studied"  },
                  { colour:"bg-violet-500", label:"Revised"  },
                  { colour:"bg-gray-200",   label:"Planned"  },
                ].map(({ colour, label }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-full", colour)} /> {label}
                  </span>
                ))}
                <span className="ml-auto text-[11px]">
                  Sorted by: revision urgency → mastery
                </span>
              </div>

              {/* Topic bars */}
              <div className="space-y-2">
                {sortedTopics.map((tp: TopicProgress) => (
                  <div key={tp.topic}>
                    <TopicProgressBar
                      tp={tp}
                      onClick={(t) => setSelectedTopic(selectedTopic?.topic === t.topic ? null : t)}
                    />
                    {selectedTopic?.topic === tp.topic && (
                      <div className="mt-2">
                        <TopicDetailPanel
                          tp={selectedTopic}
                          onClose={() => setSelectedTopic(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* ── Empty state before plan generation ── */}
      {!planGenerated && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-base font-semibold text-muted-foreground">No plan yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Fill in the form above and click Generate Adaptive Plan to get started.
          </p>
        </div>
      )}

      {/* ── Session drawer ── */}
      <SessionDrawer
        session={drawerSession}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onMarkComplete={handleMarkComplete}
        onReschedule={handleReschedule}
      />
    </div>
  )
}
