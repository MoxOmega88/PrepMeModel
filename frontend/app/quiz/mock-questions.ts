import type { QuizQuestion, Difficulty, BloomLevel } from "./types"
import { BASE_POINTS } from "./scoring"

const TOPICS = [
  "Celestial Bodies & Motion",
  "Earth's Rotation & Revolution",
  "Moon Phases & Lunar Calendar",
  "Solar System & Planets",
  "Seasons & Solstices",
  "Time Zones & Standard Time",
  "Calendars (Solar & Lunar)",
  "Eclipses (Solar & Lunar)",
  "Stars & Constellations",
  "Historical Astronomy",
]

export { TOPICS }

interface RawQ {
  topic: string
  text: string
  reference_answer: string
  difficulty: Difficulty
  bloom_level: BloomLevel
}

const RAW: RawQ[] = [
  // ── Easy / Remember ──────────────────────────────────────────────────────
  { topic:"Celestial Bodies & Motion",     difficulty:"easy",   bloom_level:"Remember",   text:"What is a celestial body? Give two examples.",                                                                                                  reference_answer:"A celestial body is any natural object in space. Examples include the Sun, Moon, planets, stars, and comets." },
  { topic:"Earth's Rotation & Revolution", difficulty:"easy",   bloom_level:"Remember",   text:"How long does Earth take to complete one rotation on its axis?",                                                                                reference_answer:"Earth completes one rotation on its axis in approximately 24 hours (one day)." },
  { topic:"Moon Phases & Lunar Calendar",  difficulty:"easy",   bloom_level:"Remember",   text:"Name the four main phases of the Moon.",                                                                                                        reference_answer:"The four main phases are New Moon, First Quarter, Full Moon, and Last Quarter." },
  { topic:"Solar System & Planets",        difficulty:"easy",   bloom_level:"Remember",   text:"List the eight planets of the Solar System in order from the Sun.",                                                                             reference_answer:"Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune." },
  { topic:"Seasons & Solstices",           difficulty:"easy",   bloom_level:"Remember",   text:"What is a solstice?",                                                                                                                           reference_answer:"A solstice is the time when the Sun reaches its highest or lowest point in the sky at noon, resulting in the longest or shortest day of the year." },
  { topic:"Time Zones & Standard Time",    difficulty:"easy",   bloom_level:"Remember",   text:"What is the full form of IST and what is its offset from GMT?",                                                                                 reference_answer:"IST stands for Indian Standard Time. It is UTC+5:30, meaning it is 5 hours and 30 minutes ahead of Greenwich Mean Time." },
  { topic:"Calendars (Solar & Lunar)",     difficulty:"easy",   bloom_level:"Remember",   text:"How many days are in a lunar month?",                                                                                                           reference_answer:"A lunar month is approximately 29.5 days, which is the time between two consecutive new moons." },
  { topic:"Eclipses (Solar & Lunar)",      difficulty:"easy",   bloom_level:"Remember",   text:"What is a solar eclipse?",                                                                                                                      reference_answer:"A solar eclipse occurs when the Moon passes between the Earth and the Sun, blocking the Sun's light from reaching Earth." },
  { topic:"Stars & Constellations",        difficulty:"easy",   bloom_level:"Remember",   text:"What is a constellation? Name one example.",                                                                                                    reference_answer:"A constellation is a group of stars that form a recognisable pattern. Examples include Orion, Ursa Major, and Scorpius." },
  { topic:"Historical Astronomy",          difficulty:"easy",   bloom_level:"Remember",   text:"Who proposed the heliocentric model of the Solar System?",                                                                                      reference_answer:"Nicolaus Copernicus proposed the heliocentric model, which places the Sun at the centre of the Solar System." },

  // ── Easy / Understand ────────────────────────────────────────────────────
  { topic:"Celestial Bodies & Motion",     difficulty:"easy",   bloom_level:"Understand", text:"Explain in your own words why the Sun appears to rise in the east and set in the west.",                                                       reference_answer:"The Sun appears to rise in the east and set in the west because Earth rotates from west to east on its axis. This rotation makes it look as if the Sun is moving across the sky." },
  { topic:"Earth's Rotation & Revolution", difficulty:"easy",   bloom_level:"Understand", text:"What is the difference between rotation and revolution of the Earth?",                                                                          reference_answer:"Rotation is Earth spinning on its own axis, causing day and night. Revolution is Earth orbiting around the Sun, taking about 365.25 days and causing the seasons." },

  // ── Medium / Apply ───────────────────────────────────────────────────────
  { topic:"Time Zones & Standard Time",    difficulty:"medium", bloom_level:"Apply",      text:"If it is 12:00 noon in London (GMT), what time is it in India (IST, UTC+5:30)?",                                                               reference_answer:"It would be 5:30 PM in India. IST is 5 hours and 30 minutes ahead of GMT, so 12:00 + 5:30 = 17:30 (5:30 PM)." },
  { topic:"Moon Phases & Lunar Calendar",  difficulty:"medium", bloom_level:"Apply",      text:"A new moon occurred on 1st May. Approximately when will the next full moon occur?",                                                             reference_answer:"The next full moon will occur approximately 14–15 days later, around 15th May, since a full moon occurs halfway through the lunar cycle of ~29.5 days." },
  { topic:"Seasons & Solstices",           difficulty:"medium", bloom_level:"Apply",      text:"Australia experiences summer in December. Using your knowledge of Earth's revolution, explain why.",                                            reference_answer:"Australia is in the Southern Hemisphere. In December, Earth's axis tilts the Southern Hemisphere toward the Sun, so it receives more direct sunlight and experiences summer, while the Northern Hemisphere has winter." },
  { topic:"Eclipses (Solar & Lunar)",      difficulty:"medium", bloom_level:"Apply",      text:"Why does a lunar eclipse only occur during a full moon and not every month?",                                                                   reference_answer:"A lunar eclipse requires the Earth to be directly between the Sun and Moon. This alignment only happens during a full moon. However, because the Moon's orbit is tilted about 5° to Earth's orbit, the alignment is not perfect every month, so eclipses don't occur every full moon." },
  { topic:"Calendars (Solar & Lunar)",     difficulty:"medium", bloom_level:"Apply",      text:"A solar calendar has 365 days but Earth takes 365.25 days to orbit the Sun. How do we account for this difference?",                          reference_answer:"We add an extra day every four years, creating a leap year with 366 days. This extra day (29th February) compensates for the accumulated quarter-day difference." },
  { topic:"Solar System & Planets",        difficulty:"medium", bloom_level:"Apply",      text:"Mars takes about 687 Earth days to orbit the Sun. How many Earth years is one Martian year?",                                                  reference_answer:"One Martian year is approximately 687 ÷ 365.25 ≈ 1.88 Earth years, meaning Mars takes nearly two Earth years to complete one orbit around the Sun." },

  // ── Hard / Analyse ───────────────────────────────────────────────────────
  { topic:"Eclipses (Solar & Lunar)",      difficulty:"hard",   bloom_level:"Analyse",    text:"Compare and contrast a total solar eclipse and a total lunar eclipse in terms of visibility, duration, and the geometry involved.",             reference_answer:"A total solar eclipse is visible only from a narrow path on Earth (the umbra), lasts a few minutes, and requires Moon between Earth and Sun. A total lunar eclipse is visible from the entire night side of Earth, can last over an hour, and requires Earth between Sun and Moon. In both cases, the three bodies must be nearly perfectly aligned." },
  { topic:"Seasons & Solstices",           difficulty:"hard",   bloom_level:"Analyse",    text:"Analyse why regions near the equator experience less seasonal variation than regions near the poles.",                                          reference_answer:"Near the equator, the Sun's rays strike at a consistently high angle throughout the year because the axial tilt has minimal effect on equatorial regions. Near the poles, the tilt causes extreme variation — from nearly 24 hours of daylight in summer to near-total darkness in winter — resulting in dramatic seasonal temperature changes." },
  { topic:"Celestial Bodies & Motion",     difficulty:"hard",   bloom_level:"Analyse",    text:"Explain why planets closer to the Sun orbit faster than those farther away, using Kepler's laws.",                                             reference_answer:"According to Kepler's Second Law, a planet sweeps equal areas in equal times, meaning it moves faster when closer to the Sun. Kepler's Third Law states that the square of the orbital period is proportional to the cube of the semi-major axis, so planets farther from the Sun have longer orbital periods and lower average speeds." },
  { topic:"Historical Astronomy",          difficulty:"hard",   bloom_level:"Analyse",    text:"Analyse the significance of Aryabhata's contributions to astronomy and how they differed from the prevailing geocentric view.",                 reference_answer:"Aryabhata (476 CE) proposed that Earth rotates on its axis, explaining the apparent movement of stars — a revolutionary idea when the geocentric model was dominant. He also calculated the length of a sidereal year as 365.358 days and gave a remarkably accurate value for Earth's circumference. His work predated Copernicus by over 1000 years in suggesting Earth's motion." },

  // ── Hard / Evaluate ──────────────────────────────────────────────────────
  { topic:"Calendars (Solar & Lunar)",     difficulty:"hard",   bloom_level:"Evaluate",   text:"Evaluate the advantages and disadvantages of a purely lunar calendar compared to a solar calendar for agricultural societies.",                reference_answer:"A lunar calendar tracks the Moon's phases (useful for tides and religious observances) but drifts ~11 days per year relative to seasons, making it unreliable for agriculture. A solar calendar aligns with seasons (critical for planting/harvesting) but ignores lunar cycles. Lunisolar calendars (like the Hindu calendar) add intercalary months to reconcile both, offering the best of both systems for agricultural societies." },
  { topic:"Stars & Constellations",        difficulty:"hard",   bloom_level:"Evaluate",   text:"Evaluate whether constellations are scientifically meaningful groupings of stars or merely cultural constructs.",                              reference_answer:"Constellations are largely cultural constructs — the stars within them are at vastly different distances from Earth and have no physical relationship. However, they are scientifically useful as a coordinate system for locating objects in the sky. The IAU officially recognises 88 constellations as regions of the sky, making them a practical tool for astronomy despite lacking physical significance." },
]

let _id = 1
export const MOCK_QUESTIONS: QuizQuestion[] = RAW.map((r) => ({
  id:               String(_id++),
  topic:            r.topic,
  text:             r.text,
  reference_answer: r.reference_answer,
  difficulty:       r.difficulty,
  bloom_level:      r.bloom_level,
  base_points:      BASE_POINTS[r.difficulty],
}))

export function getQuestions(
  topic: string,
  difficulty: Difficulty,
  count: number
): QuizQuestion[] {
  const pool = MOCK_QUESTIONS.filter(
    (q) => q.topic === topic && q.difficulty === difficulty
  )
  // If not enough, fill from same topic any difficulty
  const fallback = MOCK_QUESTIONS.filter((q) => q.topic === topic)
  const combined = [...new Map([...pool, ...fallback].map((q) => [q.id, q])).values()]
  const shuffled = combined.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Mastery per topic (mock)
export const MOCK_MASTERY: Record<string, number> = {
  "Celestial Bodies & Motion":     0.72,
  "Earth's Rotation & Revolution": 0.60,
  "Moon Phases & Lunar Calendar":  0.55,
  "Solar System & Planets":        0.45,
  "Seasons & Solstices":           0.38,
  "Time Zones & Standard Time":    0.42,
  "Calendars (Solar & Lunar)":     0.30,
  "Eclipses (Solar & Lunar)":      0.28,
  "Stars & Constellations":        0.50,
  "Historical Astronomy":          0.65,
}
