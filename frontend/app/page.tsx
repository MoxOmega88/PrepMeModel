'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Mock student data - replace with actual auth/API
const student = {
  id: 1,
  name: 'Student',
  grade: 8,
  board: 'CBSE',
  subjects: ['Science', 'Mathematics', 'Social Science']
}

// Mock stats - replace with API call
const stats = {
  total_quizzes: 12,
  avg_score: 78,
  total_questions: 156,
  total_doubts: 8
}

// Mock recent quizzes - replace with API call
const recentQuizzes = [
  { id: 1, subject: 'Science', chapter: 'Stars and Solar System', score_percentage: 85, total_questions: 10, created_at: '2026-05-18' },
  { id: 2, subject: 'Mathematics', chapter: 'Rational Numbers', score_percentage: 72, total_questions: 15, created_at: '2026-05-17' },
  { id: 3, subject: 'Science', chapter: 'Coal and Petroleum', score_percentage: 90, total_questions: 12, created_at: '2026-05-16' }
]

export default function Home() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {student.name}</h1>
        <div className="flex gap-8 mt-4 text-sm opacity-90">
          <span>Class {student.grade}</span>
          <span>{student.board}</span>
          <span>{student.subjects.length} Subjects</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.total_quizzes}</div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Quizzes Taken</div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.avg_score}%</div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Average Score</div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.total_questions}</div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Questions Solved</div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.total_doubts}</div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Doubts Cleared</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Take Quiz</h3>
            <p className="text-sm text-gray-600 mb-4">Test your knowledge with adaptive questions</p>
            <Button 
              onClick={() => router.push('/quiz')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Start Quiz
            </Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">AI Tutor</h3>
            <p className="text-sm text-gray-600 mb-4">Get instant help with your doubts</p>
            <Button 
              onClick={() => router.push('/tutor')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Ask Tutor
            </Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Study Plan</h3>
            <p className="text-sm text-gray-600 mb-4">View your personalized learning path</p>
            <Button 
              onClick={() => router.push('/planner')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              View Plan
            </Button>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        {recentQuizzes.length > 0 ? (
          <Card className="divide-y">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-indigo-600">
                  Q
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{quiz.subject} - {quiz.chapter}</div>
                  <div className="text-sm text-gray-600">
                    Score: {quiz.score_percentage}% • {quiz.total_questions} questions • {quiz.created_at}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <Card className="p-8 text-center text-gray-600">
            No recent activity. Start with a quiz or ask the AI tutor!
          </Card>
        )}
      </div>

      {/* Subject Progress */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Subjects</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {student.subjects.map((subject, index) => {
            const subjectScores = [85, 72, 78] // Mock data
            const quizCounts = [5, 4, 3] // Mock data
            
            return (
              <Card key={subject} className="p-6 text-center border-l-4 border-l-indigo-500">
                <div className="font-semibold mb-2 text-lg">{subject}</div>
                <div className="text-3xl font-bold text-indigo-600 mb-1">{subjectScores[index]}%</div>
                <div className="text-sm text-gray-600">{quizCounts[index]} quizzes</div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline"
          onClick={() => {
            // Handle logout
            router.push('/auth')
          }}
          className="px-8"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}
