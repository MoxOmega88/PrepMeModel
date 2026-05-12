"use client"

import { useRouter } from "next/navigation"
import { Star, Clock, BookOpen, RotateCcw, CheckCircle2, Calendar, ChevronRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet"
import type { StudySession, RevisionEntry, TopicProgress, Difficulty } from "./mock-data"

// ── helpers ───────────────────────────────────────────────────────────────────

export function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  })
}

export function diffLabel(d: Difficulty) {
  return d === "easy" ? "Easy" : d === "medium" ? "Medium" : "Hard"
}

export function DifficultyStars({ d }: { d: Difficulty }) {
  const n = d === "easy" ? 1 : d === "medium" ? 2 : 3
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={cn("h-3 w-3", i <= n ? "fill-amber-400 text-amber-400" : "text-gray-200")}
        />
      ))}
    </span>
  )
}

// ── Session card colours ───────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, { border: string; bg: string; badge: string; label: string }> = {
  study:    { border:"border-l-blue-500",   bg:"bg-blue-50",   badge:"bg-blue-100 text-blue-700",   label:"New Topic"  },
  revision: { border:"border-l-amber-500",  bg:"bg-amber-50",  badge:"bg-amber-100 text-amber-700", label:"Revision"   },
  mock:     { border:"border-l-red-500",    bg:"bg-red-50",    badge:"bg-red-100 text-red-700",     label:"Mock Test"  },
  practice: { border:"border-l-green-500",  bg:"bg-green-50",  badge:"bg-green-100 text-green-700", label:"Practice"   },
}

// ── Session Card ──────────────────────────────────────────────────────────────

export function SessionCard({
  session,
  onClick,
}: {
  session: StudySession
  onClick: (s: StudySession) => void
}) {
  const s = TYPE_STYLES[session.type]
  const isDone   = session.status === "done"
  const isMissed = session.status === "missed"

  return (
    <button
      onClick={() => onClick(session)}
      className={cn(
        "w-full text-left rounded-lg border-l-4 p-2.5 transition-all hover:shadow-md hover:-translate-y-0.5",
        s.border, s.bg,
        isDone   && "opacity-60",
        isMissed && "opacity-50 border-l-gray-400 bg-gray-50",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <p className={cn("text-xs font-semibold leading-tight line-clamp-2", isMissed && "line-through text-gray-400")}>
          {session.topic}
        </p>
        {isDone && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500 mt-0.5" />}
        {isMissed && <span className="text-[10px] text-red-500 font-bold shrink-0">MISSED</span>}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", s.badge)}>
          {s.label}
        </span>
        <DifficultyStars d={session.difficulty} />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" /> {session.planned_min} min
      </p>
    </button>
  )
}

// ── Session Drawer ────────────────────────────────────────────────────────────

export function SessionDrawer({
  session,
  open,
  onClose,
  onMarkComplete,
  onReschedule,
}: {
  session: StudySession | null
  open: boolean
  onClose: () => void
  onMarkComplete: (id: string) => void
  onReschedule: (id: string, newDate: string) => void
}) {
  if (!session) return null
  const s = TYPE_STYLES[session.type]

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className={cn("inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full w-fit", s.badge)}>
            {s.label}
          </div>
          <SheetTitle className="text-xl leading-tight">{session.topic}</SheetTitle>
          <SheetDescription>{session.description}</SheetDescription>
        </SheetHeader>

        {/* Mastery */}
        <div className="mb-5 rounded-xl border bg-muted/40 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Current Mastery
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", session.mastery >= 0.75 ? "bg-green-500" : session.mastery >= 0.5 ? "bg-amber-500" : "bg-red-500")}
                style={{ width: `${session.mastery * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold">{Math.round(session.mastery * 100)}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Target: 75% &nbsp;·&nbsp; {session.mastery < 0.75 ? `${Math.round((0.75 - session.mastery) * 100)}% to go` : "Target reached!"}
          </p>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
            <div className="flex items-center gap-1.5">
              <DifficultyStars d={session.difficulty} />
              <span className="text-sm font-semibold">{diffLabel(session.difficulty)}</span>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="text-sm font-semibold flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {session.planned_min} min
            </p>
          </div>
        </div>

        {/* Prerequisites */}
        {session.prerequisites.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Prerequisites
            </p>
            <div className="flex flex-wrap gap-1.5">
              {session.prerequisites.map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Dependents */}
        {session.dependents.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Unlocks Topics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {session.dependents.map((d) => (
                <Badge key={d} variant="outline" className="text-xs text-primary border-primary/30">{d}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reschedule */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Reschedule to
          </p>
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            defaultValue={session.date}
            onChange={(e) => onReschedule(session.id, e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t">
          {session.status !== "done" && (
            <Button
              className="w-full"
              onClick={() => { onMarkComplete(session.id); onClose() }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
            </Button>
          )}
          {session.status === "done" && (
            <div className="flex items-center justify-center gap-2 py-2 text-green-600 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" /> Completed
            </div>
          )}
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Revision Row ──────────────────────────────────────────────────────────────

export function RevisionRow({ entry }: { entry: RevisionEntry }) {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)
  const due   = entry.next_review_due
  const diff  = Math.ceil((new Date(due).getTime() - new Date(today).getTime()) / 86400000)

  const status =
    diff < 0  ? "overdue" :
    diff <= 2 ? "due_soon" : "scheduled"

  const colours = {
    overdue:   { row:"bg-red-50 border-red-200",    badge:"bg-red-100 text-red-700",    dot:"bg-red-500",    label:"Overdue"  },
    due_soon:  { row:"bg-amber-50 border-amber-200", badge:"bg-amber-100 text-amber-700", dot:"bg-amber-500", label:"Due soon" },
    scheduled: { row:"bg-green-50 border-green-200", badge:"bg-green-100 text-green-700", dot:"bg-green-500", label:"On track" },
  }
  const c = colours[status]

  return (
    <div className={cn("flex items-center justify-between rounded-xl border p-3.5 transition-all hover:shadow-sm", c.row)}>
      <div className="flex items-center gap-3">
        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", c.dot)} />
        <div>
          <p className="text-sm font-semibold text-foreground">{entry.topic}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last reviewed: {fmtDate(entry.last_reviewed)} &nbsp;·&nbsp; {entry.times_reviewed}× reviewed
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", c.badge)}>
            {c.label}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {diff < 0 ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `Due in ${diff}d`}
          </p>
        </div>
        {(status === "overdue" || status === "due_soon") && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 border-primary/40 text-primary hover:bg-primary hover:text-white"
            onClick={() => router.push(`/tutor?topic=${encodeURIComponent(entry.topic)}&mode=revision`)}
          >
            Revise <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Topic Progress Bar ────────────────────────────────────────────────────────

export function TopicProgressBar({
  tp,
  onClick,
}: {
  tp: TopicProgress
  onClick: (tp: TopicProgress) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const dueDate = tp.next_revision
  const diff = Math.ceil((new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000)
  const isOverdue = diff < 0

  const total = tp.planned_min || 1
  const completedPct = Math.min((tp.completed_min / total) * 100, 100)
  const revisionPct  = Math.min((tp.revision_min  / total) * 100, 100)
  const masteryPct   = Math.round(tp.mastery * 100)

  return (
    <button
      onClick={() => onClick(tp)}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all hover:shadow-md hover:border-primary/30",
        isOverdue ? "border-red-200 bg-red-50/50" : "bg-white"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-foreground">{tp.topic}</p>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
              REVISION OVERDUE
            </span>
          )}
          <span className={cn(
            "text-xs font-bold",
            tp.mastery >= 0.75 ? "text-green-600" : tp.mastery >= 0.5 ? "text-amber-600" : "text-red-600"
          )}>
            {masteryPct}%
          </span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden flex">
        <div className="h-full bg-blue-500 transition-all"   style={{ width: `${completedPct}%` }} />
        <div className="h-full bg-violet-500 transition-all" style={{ width: `${revisionPct}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> {tp.completed_min}m studied</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500 inline-block" /> {tp.revision_min}m revised</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-200 inline-block" /> {tp.planned_min}m planned</span>
        </div>
        <span>Target: 75%</span>
      </div>

      {/* Mastery bar */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", tp.mastery >= 0.75 ? "bg-green-500" : tp.mastery >= 0.5 ? "bg-amber-500" : "bg-red-500")}
          style={{ width: `${masteryPct}%` }}
        />
      </div>
    </button>
  )
}

// ── Topic Detail Panel ────────────────────────────────────────────────────────

export function TopicDetailPanel({
  tp,
  onClose,
}: {
  tp: TopicProgress
  onClose: () => void
}) {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)
  const diff  = Math.ceil((new Date(tp.next_revision).getTime() - new Date(today).getTime()) / 86400000)
  const hoursStudied = Math.round((tp.completed_min + tp.revision_min) / 60 * 10) / 10
  const targetHours  = 3
  const moreHours    = Math.max(targetHours - hoursStudied, 0)

  const needed: string[] = []
  if (tp.mastery < 0.4)  needed.push("Easy recall", "Medium application")
  else if (tp.mastery < 0.6) needed.push("Medium application", "Hard analysis")
  else if (tp.mastery < 0.75) needed.push("Hard analysis", "Exam-style questions")

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-foreground">{tp.topic}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {Math.round(tp.mastery * 100)}% mastery &nbsp;·&nbsp; Target: 75%
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">✕</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-white border p-3">
          <p className="text-xs text-muted-foreground">Hours studied</p>
          <p className="font-bold text-foreground mt-0.5">{hoursStudied}h</p>
          <p className="text-xs text-muted-foreground">{moreHours > 0 ? `${moreHours}h more to reach mastery` : "Mastery target reached!"}</p>
        </div>
        <div className="rounded-lg bg-white border p-3">
          <p className="text-xs text-muted-foreground">Next revision</p>
          <p className="font-bold text-foreground mt-0.5">{fmtDate(tp.next_revision)}</p>
          <p className="text-xs text-muted-foreground">
            {diff < 0 ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `In ${diff} days`}
          </p>
        </div>
      </div>

      {needed.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Practice needed
          </p>
          <div className="flex flex-wrap gap-1.5">
            {needed.map((n) => (
              <Badge key={n} variant="outline" className="text-xs">{n}</Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        size="sm"
        className="w-full"
        onClick={() => router.push(`/tutor?topic=${encodeURIComponent(tp.topic)}&mode=revision`)}
      >
        <Zap className="h-3.5 w-3.5 mr-1.5" /> Start Revision Session
      </Button>
    </div>
  )
}
