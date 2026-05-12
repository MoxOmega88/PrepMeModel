export type SessionType = "study" | "revision" | "mock" | "practice"
export type SessionStatus = "pending" | "done" | "missed"
export type Difficulty = "easy" | "medium" | "hard"

export interface StudySession {
  id: string
  date: string
  topic: string
  planned_min: number
  actual_min: number
  type: SessionType
  status: SessionStatus
  difficulty: Difficulty
  mastery: number
  prerequisites: string[]
  dependents: string[]
  description: string
}

export interface RevisionEntry {
  topic: string
  last_reviewed: string
  next_review_due: string
  times_reviewed: number
  mastery: number
}

export interface TopicProgress {
  topic: string
  planned_min: number
  completed_min: number
  revision_min: number
  mastery: number
  target: number
  next_revision: string
}

// ── date helper — called at runtime, not module load ──────────────────────────
function iso(daysFromToday: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toISOString().slice(0, 10)
}

// ── factory functions so dates are always relative to "today" ─────────────────

function getMockSessions(): StudySession[] {
  return [
    { id:"s1",  date:iso(-6), topic:"Celestial Bodies & Motion",     planned_min:45, actual_min:45, type:"study",    status:"done",    difficulty:"easy",   mastery:0.72, prerequisites:[],                                                       dependents:["Solar System & Planets","Stars & Constellations"],   description:"Introduction to celestial bodies, their types and basic motion patterns." },
    { id:"s2",  date:iso(-5), topic:"Earth's Rotation & Revolution", planned_min:45, actual_min:40, type:"study",    status:"done",    difficulty:"medium", mastery:0.60, prerequisites:["Celestial Bodies & Motion"],                            dependents:["Seasons & Solstices","Time Zones & Standard Time"],  description:"How Earth's rotation causes day/night and revolution causes seasons." },
    { id:"s3",  date:iso(-5), topic:"Celestial Bodies & Motion",     planned_min:20, actual_min:20, type:"revision", status:"done",    difficulty:"easy",   mastery:0.72, prerequisites:[],                                                       dependents:[],                                                    description:"First spaced-repetition review of celestial bodies." },
    { id:"s4",  date:iso(-4), topic:"Solar System & Planets",        planned_min:45, actual_min:30, type:"study",    status:"missed",  difficulty:"medium", mastery:0.45, prerequisites:["Celestial Bodies & Motion"],                            dependents:["Eclipses (Solar & Lunar)"],                          description:"Planets, their order, characteristics and orbital periods." },
    { id:"s5",  date:iso(-3), topic:"Moon Phases & Lunar Calendar",  planned_min:45, actual_min:45, type:"study",    status:"done",    difficulty:"medium", mastery:0.55, prerequisites:["Earth's Rotation & Revolution"],                        dependents:["Calendars (Solar & Lunar)","Eclipses (Solar & Lunar)"], description:"Waxing, waning, new moon, full moon and the lunar month cycle." },
    { id:"s6",  date:iso(-3), topic:"Earth's Rotation & Revolution", planned_min:20, actual_min:0,  type:"revision", status:"missed",  difficulty:"medium", mastery:0.60, prerequisites:[],                                                       dependents:[],                                                    description:"Spaced review of rotation and revolution concepts." },
    { id:"s7",  date:iso(-2), topic:"Seasons & Solstices",           planned_min:45, actual_min:45, type:"study",    status:"done",    difficulty:"hard",   mastery:0.38, prerequisites:["Earth's Rotation & Revolution"],                        dependents:["Calendars (Solar & Lunar)"],                         description:"Why seasons occur, solstices, equinoxes and their dates." },
    { id:"s8",  date:iso(-1), topic:"Time Zones & Standard Time",    planned_min:45, actual_min:20, type:"study",    status:"done",    difficulty:"medium", mastery:0.42, prerequisites:["Earth's Rotation & Revolution"],                        dependents:[],                                                    description:"How time zones are defined, IST, GMT and international date line." },
    { id:"s9",  date:iso(-1), topic:"Moon Phases & Lunar Calendar",  planned_min:20, actual_min:0,  type:"revision", status:"missed",  difficulty:"medium", mastery:0.55, prerequisites:[],                                                       dependents:[],                                                    description:"Review of lunar phases and calendar." },
    { id:"s10", date:iso(0),  topic:"Calendars (Solar & Lunar)",     planned_min:45, actual_min:0,  type:"study",    status:"pending", difficulty:"hard",   mastery:0.30, prerequisites:["Moon Phases & Lunar Calendar","Seasons & Solstices"],   dependents:[],                                                    description:"Gregorian, Hindu and Islamic calendars — differences and history." },
    { id:"s11", date:iso(0),  topic:"Seasons & Solstices",           planned_min:20, actual_min:0,  type:"revision", status:"pending", difficulty:"hard",   mastery:0.38, prerequisites:[],                                                       dependents:[],                                                    description:"Quick revision of solstices and equinoxes with diagram recall." },
    { id:"s12", date:iso(0),  topic:"Time Zones & Standard Time",    planned_min:20, actual_min:0,  type:"practice", status:"pending", difficulty:"medium", mastery:0.42, prerequisites:[],                                                       dependents:[],                                                    description:"Adaptive practice questions on time zone calculations." },
    { id:"s13", date:iso(1),  topic:"Eclipses (Solar & Lunar)",      planned_min:45, actual_min:0,  type:"study",    status:"pending", difficulty:"hard",   mastery:0.28, prerequisites:["Solar System & Planets","Moon Phases & Lunar Calendar"], dependents:[],                                                    description:"Geometry of solar and lunar eclipses, umbra, penumbra, saros cycle." },
    { id:"s14", date:iso(1),  topic:"Solar System & Planets",        planned_min:20, actual_min:0,  type:"revision", status:"pending", difficulty:"medium", mastery:0.45, prerequisites:[],                                                       dependents:[],                                                    description:"Catch-up revision for missed Solar System session." },
    { id:"s15", date:iso(2),  topic:"Stars & Constellations",        planned_min:45, actual_min:0,  type:"study",    status:"pending", difficulty:"medium", mastery:0.50, prerequisites:["Celestial Bodies & Motion"],                            dependents:[],                                                    description:"Major constellations, star classification, magnitude and distance." },
    { id:"s16", date:iso(2),  topic:"Calendars (Solar & Lunar)",     planned_min:20, actual_min:0,  type:"revision", status:"pending", difficulty:"hard",   mastery:0.30, prerequisites:[],                                                       dependents:[],                                                    description:"First review of calendar systems." },
    { id:"s17", date:iso(3),  topic:"Historical Astronomy",          planned_min:45, actual_min:0,  type:"study",    status:"pending", difficulty:"easy",   mastery:0.65, prerequisites:[],                                                       dependents:[],                                                    description:"Contributions of Aryabhata, Copernicus, Galileo and Kepler." },
    { id:"s18", date:iso(3),  topic:"Eclipses (Solar & Lunar)",      planned_min:20, actual_min:0,  type:"practice", status:"pending", difficulty:"hard",   mastery:0.28, prerequisites:[],                                                       dependents:[],                                                    description:"Practice questions on eclipse geometry and prediction." },
    { id:"s19", date:iso(4),  topic:"Celestial Bodies & Motion",     planned_min:20, actual_min:0,  type:"revision", status:"pending", difficulty:"easy",   mastery:0.72, prerequisites:[],                                                       dependents:[],                                                    description:"Second spaced review — orbital mechanics and body types." },
    { id:"s20", date:iso(4),  topic:"Stars & Constellations",        planned_min:20, actual_min:0,  type:"practice", status:"pending", difficulty:"medium", mastery:0.50, prerequisites:[],                                                       dependents:[],                                                    description:"Practice identifying constellations and star properties." },
    { id:"s21", date:iso(5),  topic:"Historical Astronomy",          planned_min:20, actual_min:0,  type:"revision", status:"pending", difficulty:"easy",   mastery:0.65, prerequisites:[],                                                       dependents:[],                                                    description:"Review key astronomers and their discoveries." },
    { id:"s22", date:iso(6),  topic:"Full Mock Test",                planned_min:90, actual_min:0,  type:"mock",     status:"pending", difficulty:"hard",   mastery:0.50, prerequisites:[],                                                       dependents:[],                                                    description:"Full chapter mock test covering all topics." },
  ]
}

function getMockRevisionLog(): RevisionEntry[] {
  return [
    { topic:"Celestial Bodies & Motion",     last_reviewed:iso(-5), next_review_due:iso(5),  times_reviewed:2, mastery:0.72 },
    { topic:"Earth's Rotation & Revolution", last_reviewed:iso(-5), next_review_due:iso(-1), times_reviewed:1, mastery:0.60 },
    { topic:"Moon Phases & Lunar Calendar",  last_reviewed:iso(-3), next_review_due:iso(1),  times_reviewed:1, mastery:0.55 },
    { topic:"Solar System & Planets",        last_reviewed:iso(-4), next_review_due:iso(0),  times_reviewed:1, mastery:0.45 },
    { topic:"Seasons & Solstices",           last_reviewed:iso(-2), next_review_due:iso(2),  times_reviewed:1, mastery:0.38 },
    { topic:"Time Zones & Standard Time",    last_reviewed:iso(-1), next_review_due:iso(4),  times_reviewed:1, mastery:0.42 },
    { topic:"Eclipses (Solar & Lunar)",      last_reviewed:iso(-8), next_review_due:iso(-2), times_reviewed:1, mastery:0.28 },
  ]
}

function getMockTopicProgress(): TopicProgress[] {
  return [
    { topic:"Eclipses (Solar & Lunar)",      planned_min:65, completed_min:0,  revision_min:0,  mastery:0.28, target:0.75, next_revision:iso(-2) },
    { topic:"Calendars (Solar & Lunar)",     planned_min:65, completed_min:0,  revision_min:0,  mastery:0.30, target:0.75, next_revision:iso(2)  },
    { topic:"Seasons & Solstices",           planned_min:65, completed_min:45, revision_min:20, mastery:0.38, target:0.75, next_revision:iso(2)  },
    { topic:"Time Zones & Standard Time",    planned_min:65, completed_min:20, revision_min:20, mastery:0.42, target:0.75, next_revision:iso(4)  },
    { topic:"Solar System & Planets",        planned_min:65, completed_min:30, revision_min:20, mastery:0.45, target:0.75, next_revision:iso(1)  },
    { topic:"Stars & Constellations",        planned_min:65, completed_min:0,  revision_min:0,  mastery:0.50, target:0.75, next_revision:iso(7)  },
    { topic:"Moon Phases & Lunar Calendar",  planned_min:65, completed_min:45, revision_min:0,  mastery:0.55, target:0.75, next_revision:iso(1)  },
    { topic:"Earth's Rotation & Revolution", planned_min:65, completed_min:40, revision_min:20, mastery:0.60, target:0.75, next_revision:iso(-1) },
    { topic:"Historical Astronomy",          planned_min:65, completed_min:0,  revision_min:0,  mastery:0.65, target:0.75, next_revision:iso(5)  },
    { topic:"Celestial Bodies & Motion",     planned_min:85, completed_min:65, revision_min:20, mastery:0.72, target:0.75, next_revision:iso(5)  },
  ]
}

export { getMockSessions, getMockRevisionLog, getMockTopicProgress }
