"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mic, MicOff, Send, Volume2, CheckCircle2, XCircle, AlertCircle,
  BookOpen, Target, TrendingUp, Sparkles
} from "lucide-react"

const API_BASE = "http://localhost:8000"

// Topics from NCERT Science Class 8 - Chapter: Stars and the Solar System
const CHAPTER_TOPICS = [
  { value: "full_chapter", label: "Full Chapter - Stars and the Solar System" },
  { value: "celestial_objects", label: "Celestial Objects and Motion" },
  { value: "moon_phases", label: "Moon and Its Phases" },
  { value: "stars_constellations", label: "Stars and Constellations" },
  { value: "solar_system", label: "Solar System and Planets" },
  { value: "eclipses", label: "Eclipses (Solar and Lunar)" },
]

// Quiz duration options
const QUIZ_DURATIONS = [
  { questions: 5, minutes: 3, label: "Quick Quiz - 5 questions (3 mins)" },
  { questions: 10, minutes: 6, label: "Standard Quiz - 10 questions (6 mins)" },
  { questions: 15, minutes: 10, label: "Extended Quiz - 15 questions (10 mins)" },
  { questions: 20, minutes: 15, label: "Full Quiz - 20 questions (15 mins)" },
]

// Difficulty levels with granular classification
const DIFFICULTY_LEVELS = [
  { value: 0.1, label: "Very Easy", color: "bg-green-500", description: "Recall & Definitions" },
  { value: 0.3, label: "Easy", color: "bg-blue-500", description: "Basic Understanding" },
  { value: 0.5, label: "Medium", color: "bg-yellow-500", description: "Application" },
  { value: 0.7, label: "Hard", color: "bg-orange-500", description: "Analysis" },
  { value: 0.9, label: "Very Hard", color: "bg-red-500", description: "Synthesis" },
]

interface Question {
  question: string
  difficulty: number
  expected_answer_length: string
  key_concepts: string[]
  sources?: Array<{ pages: string }>
}

interface Assessment {
  overall_score: number
  score_percentage: number
  core_concept_score: number
  terminology_score: number
  misconceptions_score: number
  correctness: string
  tags: string[]
  feedback_for_student: string
  key_points_covered: string[]
  key_points_missed: string[]
  misconceptions_detected: string[]
  improvement_suggestions: string
  model_answer: string
  adaptive_recommendation: string
  next_difficulty_suggestion: number
  mastery_status: string
  difficulty_level: number
  sources_used: number
  evaluation_method: string
}

export default function EnhancedQuizPage() {
  const [selectedTopic, setSelectedTopic] = useState("full_chapter")
  const [selectedDuration, setSelectedDuration] = useState(1) // Index in QUIZ_DURATIONS
  const [topic, setTopic] = useState("Stars and the Solar System")
  const [difficulty, setDifficulty] = useState(0.5)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [sessionScore, setSessionScore] = useState(0)
  const [questionsAttempted, setQuestionsAttempted] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizReport, setQuizReport] = useState<any>(null)
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([])
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const maxQuestions = QUIZ_DURATIONS[selectedDuration].questions
  const totalMinutes = QUIZ_DURATIONS[selectedDuration].minutes

  // Timer effect
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false)
            completeQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [timerActive, timeRemaining])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setAnswer(prev => prev + " " + transcript)
      }
    }
  }, [])

  const generateQuestion = async () => {
    // Check if quiz should end (but not on first question)
    if (quizStarted && questionsAttempted >= maxQuestions) {
      completeQuiz()
      return
    }

    if (!quizStarted) {
      // Start quiz
      setQuizStarted(true)
      setQuestionsAttempted(0)
      setSessionScore(0)
      setAllAssessments([])
      setTimeRemaining(totalMinutes * 60)
      setTimerActive(true)
    }

    setIsLoading(true)
    setAssessment(null)
    setAnswer("")
    
    // Get topic text based on selection
    const topicText = selectedTopic === "full_chapter" 
      ? "Stars and the Solar System" 
      : CHAPTER_TOPICS.find(t => t.value === selectedTopic)?.label || topic
    
    try {
      const response = await fetch(`${API_BASE}/api/quiz/generate-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicText, difficulty })
      })
      
      if (!response.ok) throw new Error("Failed to generate question")
      
      const data = await response.json()
      setCurrentQuestion(data)
    } catch (error) {
      console.error("Error generating question:", error)
      alert("Failed to generate question. Make sure the backend is running.")
      setQuizStarted(false)
      setTimerActive(false)
    } finally {
      setIsLoading(false)
    }
  }

  const completeQuiz = () => {
    setTimerActive(false)
    setQuizCompleted(true)
    
    // Generate comprehensive report
    const avgScore = questionsAttempted > 0 ? sessionScore / questionsAttempted : 0
    
    // Analyze topics
    const topicScores: Record<string, { total: number; count: number; tags: string[] }> = {}
    allAssessments.forEach(a => {
      const topic = currentQuestion?.question || "Unknown"
      if (!topicScores[topic]) {
        topicScores[topic] = { total: 0, count: 0, tags: [] }
      }
      topicScores[topic].total += a.score_percentage
      topicScores[topic].count += 1
      topicScores[topic].tags.push(...(a.tags || []))
    })
    
    // Find strong and weak topics
    const strongTopics = allAssessments
      .filter(a => a.score_percentage >= 70)
      .map(a => a.key_points_covered || [])
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5)
    
    const weakTopics = allAssessments
      .filter(a => a.score_percentage < 50)
      .map(a => a.key_points_missed || [])
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5)
    
    const report = {
      totalQuestions: questionsAttempted,
      averageScore: Math.round(avgScore),
      totalTime: totalMinutes * 60 - timeRemaining,
      strongTopics,
      weakTopics,
      difficultyProgression: allAssessments.map(a => a.difficulty_level),
      masteryDistribution: {
        strong: allAssessments.filter(a => a.mastery_status === "strong").length,
        moderate: allAssessments.filter(a => a.mastery_status === "moderate").length,
        weak: allAssessments.filter(a => a.mastery_status === "weak").length,
      },
      recommendations: avgScore >= 70 
        ? "Excellent performance! Continue practicing advanced topics."
        : avgScore >= 50
        ? "Good effort! Focus on weak areas identified below."
        : "Keep practicing! Review the concepts you missed and try again."
    }
    
    setQuizReport(report)
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) {
      alert("Please provide an answer")
      return
    }

    // Prevent submission if quiz is completed
    if (quizCompleted) {
      alert("Quiz has ended. Please view your report.")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_BASE}/api/quiz/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: answer.trim(),
          difficulty: currentQuestion.difficulty
        })
      })
      
      if (!response.ok) throw new Error("Failed to assess answer")
      
      const data: Assessment = await response.json()
      setAssessment(data)
      setAllAssessments(prev => [...prev, data])
      setSessionScore(prev => prev + data.score_percentage)
      setQuestionsAttempted(prev => prev + 1)
      
      // Adaptive difficulty adjustment based on AI recommendation
      if (data.adaptive_recommendation === "branch_up") {
        setDifficulty(data.next_difficulty_suggestion)
      } else if (data.adaptive_recommendation === "branch_down") {
        setDifficulty(data.next_difficulty_suggestion)
      }
      // If "maintain", keep current difficulty
    } catch (error) {
      console.error("Error assessing answer:", error)
      alert("Failed to assess answer. Make sure the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const getDifficultyInfo = (value: number) => {
    return DIFFICULTY_LEVELS.reduce((prev, curr) => 
      Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
    )
  }

  const currentDifficultyInfo = getDifficultyInfo(difficulty)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Adaptive Quiz</h1>
          <p className="text-muted-foreground">RAG-powered assessment with granular difficulty</p>
        </div>
        <div className="flex gap-4">
          {quizStarted && (
            <Card className="px-4 py-2">
              <div className="text-sm text-muted-foreground">Time Remaining</div>
              <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-500' : ''}`}>
                {formatTime(timeRemaining)}
              </div>
            </Card>
          )}
          {questionsAttempted > 0 && (
            <Card className="px-4 py-2">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-2xl font-bold">
                {questionsAttempted}/{maxQuestions}
              </div>
              <div className="text-xs text-muted-foreground">
                Avg: {Math.round(sessionScore / questionsAttempted)}%
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Configuration - Only show if quiz not started */}
      {!quizStarted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quiz Setup
            </CardTitle>
            <CardDescription>Choose your topic and quiz duration. AI will automatically adjust difficulty.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Topic Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {CHAPTER_TOPICS.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  From NCERT Science Class 8 - Chapter 17
                </p>
              </div>

              {/* Duration Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quiz Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {QUIZ_DURATIONS.map((duration, idx) => (
                    <option key={idx} value={idx}>
                      {duration.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {QUIZ_DURATIONS[selectedDuration].questions} questions in {QUIZ_DURATIONS[selectedDuration].minutes} minutes
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Starting Difficulty</span>
                <Badge className={currentDifficultyInfo.color}>
                  {currentDifficultyInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                The AI will automatically adjust difficulty up or down based on your performance
              </p>
            </div>

            <Button onClick={generateQuestion} disabled={isLoading} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? "Generating..." : "Start Adaptive Quiz"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Question Display */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {currentQuestion.expected_answer_length} answer
                </Badge>
                <Badge className={getDifficultyInfo(currentQuestion.difficulty).color}>
                  {getDifficultyInfo(currentQuestion.difficulty).label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg">{currentQuestion.question}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speakText(currentQuestion.question)}
                className="mt-2"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Read Aloud
              </Button>
            </div>

            {currentQuestion.key_concepts && currentQuestion.key_concepts.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Key Concepts:</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.key_concepts.map((concept, idx) => (
                    <Badge key={idx} variant="secondary">{concept}</Badge>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.sources && (
              <div className="text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3 inline mr-1" />
                Source: NCERT Science Class 8, Pages {currentQuestion.sources.map(s => s.pages).join(", ")}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Answer Input */}
      {currentQuestion && !assessment && (
        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
            <CardDescription>Type or speak your answer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here..."
              className="min-h-[150px]"
              disabled={isLoading}
            />

            <div className="flex gap-2">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                onClick={toggleRecording}
                disabled={isLoading}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Input
                  </>
                )}
              </Button>

              <Button
                onClick={submitAnswer}
                disabled={isLoading || !answer.trim()}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Assessing..." : "Submit Answer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Results */}
      {assessment && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {assessment.correctness === "correct" && (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                )}
                {assessment.correctness === "partially_correct" && (
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                )}
                {assessment.correctness === "incorrect" && (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                Semantic Assessment Results
              </CardTitle>
              <div className="text-right">
                <div className="text-3xl font-bold">{assessment.score_percentage}%</div>
                <Badge variant="outline" className="mt-1">
                  {assessment.mastery_status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Progress value={assessment.score_percentage} className="h-3" />
            </div>

            {/* Adaptive Recommendation */}
            <div className={`p-3 rounded-lg ${
              assessment.adaptive_recommendation === "branch_up" ? "bg-green-50 dark:bg-green-950" :
              assessment.adaptive_recommendation === "branch_down" ? "bg-orange-50 dark:bg-orange-950" :
              "bg-blue-50 dark:bg-blue-950"
            }`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Adaptive Recommendation: {
                  assessment.adaptive_recommendation === "branch_up" ? "Increasing difficulty - You're doing great!" :
                  assessment.adaptive_recommendation === "branch_down" ? "Decreasing difficulty - Let's build foundation" :
                  "Maintaining difficulty - Keep practicing"
                }
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-muted rounded text-center">
                <div className="text-xs text-muted-foreground">Core Concept</div>
                <div className="text-lg font-bold">{Math.round(assessment.core_concept_score * 100)}%</div>
              </div>
              <div className="p-2 bg-muted rounded text-center">
                <div className="text-xs text-muted-foreground">Terminology</div>
                <div className="text-lg font-bold">{Math.round(assessment.terminology_score * 100)}%</div>
              </div>
              <div className="p-2 bg-muted rounded text-center">
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="text-lg font-bold">{Math.round(assessment.misconceptions_score * 100)}%</div>
              </div>
            </div>

            <Tabs defaultValue="feedback">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="points">Key Points</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="model">Model Answer</TabsTrigger>
              </TabsList>

              <TabsContent value="feedback" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Personalized Feedback</h4>
                  <p className="text-sm">{assessment.feedback_for_student}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(assessment.feedback_for_student)}
                    className="mt-2"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Read Aloud
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Improvement Suggestions
                  </h4>
                  <p className="text-sm">{assessment.improvement_suggestions}</p>
                </div>
              </TabsContent>

              <TabsContent value="points" className="space-y-4">
                {assessment.key_points_covered.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Points Covered
                    </h4>
                    <ul className="space-y-1">
                      {assessment.key_points_covered.map((point, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {assessment.key_points_missed.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Points Missed
                    </h4>
                    <ul className="space-y-1">
                      {assessment.key_points_missed.map((point, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-red-500">✗</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {assessment.misconceptions_detected && assessment.misconceptions_detected.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Misconceptions to Unlearn
                    </h4>
                    <ul className="space-y-1">
                      {assessment.misconceptions_detected.map((point, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-orange-500">⚠</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tags">
                <div className="flex flex-wrap gap-2">
                  {(assessment.tags || []).map((tag, idx) => (
                    <Badge key={idx} variant={
                      tag.startsWith("understood") ? "default" :
                      tag.startsWith("missing") ? "destructive" :
                      "secondary"
                    }>
                      {tag.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  These tags help track your knowledge graph for personalized learning plans
                </p>
              </TabsContent>

              <TabsContent value="model">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Expected Answer (from NCERT)</h4>
                  <p className="text-sm whitespace-pre-wrap">{assessment.model_answer}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(assessment.model_answer)}
                    className="mt-2"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Read Aloud
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-xs text-muted-foreground text-center">
              Evaluation Method: {assessment.evaluation_method} | Sources: {assessment.sources_used} PDF chunks
            </div>

            <Button onClick={() => { setAssessment(null); generateQuestion(); }} className="w-full" disabled={quizCompleted}>
              {quizCompleted ? "Quiz Completed - View Report" : `Next Question (${questionsAttempted}/${maxQuestions})`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quiz Completion Modal */}
      {quizCompleted && quizReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8" />
                Quiz Completed!
              </CardTitle>
              <CardDescription className="text-white/90">
                Here's your comprehensive performance report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Overall Score */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                  {quizReport.averageScore}%
                </div>
                <div className="text-lg text-muted-foreground mt-2">Average Score</div>
                <div className="flex justify-center gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-semibold">{quizReport.totalQuestions}</span> Questions
                  </div>
                  <div>
                    <span className="font-semibold">{Math.floor(quizReport.totalTime / 60)}:{(quizReport.totalTime % 60).toString().padStart(2, '0')}</span> Time
                  </div>
                </div>
              </div>

              {/* Mastery Distribution */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Mastery Distribution
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{quizReport.masteryDistribution.strong}</div>
                    <div className="text-xs text-muted-foreground">Strong</div>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{quizReport.masteryDistribution.moderate}</div>
                    <div className="text-xs text-muted-foreground">Moderate</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{quizReport.masteryDistribution.weak}</div>
                    <div className="text-xs text-muted-foreground">Weak</div>
                  </div>
                </div>
              </div>

              {/* Strong Topics */}
              {quizReport.strongTopics.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    Strong Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {quizReport.strongTopics.map((topic: string, idx: number) => (
                      <Badge key={idx} variant="default" className="bg-green-500">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Topics */}
              {quizReport.weakTopics.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Areas for Improvement
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {quizReport.weakTopics.map((topic: string, idx: number) => (
                      <Badge key={idx} variant="destructive">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty Progression */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Difficulty Progression
                </h3>
                <div className="flex items-center gap-1">
                  {quizReport.difficultyProgression.map((diff: number, idx: number) => (
                    <div
                      key={idx}
                      className={`h-8 flex-1 rounded ${
                        diff < 0.3 ? 'bg-green-500' :
                        diff < 0.5 ? 'bg-blue-500' :
                        diff < 0.7 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      title={`Q${idx + 1}: ${getDifficultyInfo(diff).label}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  AI adapted difficulty based on your performance
                </p>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Recommendations
                </h3>
                <p className="text-sm">{quizReport.recommendations}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setQuizCompleted(false)
                    setQuizStarted(false)
                    setCurrentQuestion(null)
                    setAssessment(null)
                    setQuestionsAttempted(0)
                    setSessionScore(0)
                    setAllAssessments([])
                  }}
                  className="flex-1"
                >
                  Take Another Quiz
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1"
                >
                  Print Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
