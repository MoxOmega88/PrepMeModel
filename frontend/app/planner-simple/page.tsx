'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Mock student data
const student = {
  id: 1,
  name: 'Rahul Kumar',
  subjects: ['Science', 'Mathematics', 'Social Science']
}

// Chapter options by subject
const chapterOptions: Record<string, string[]> = {
  'Science': [
    'Stars and the Solar System',
    'Coal and Petroleum',
    'Combustion and Flame',
    'Conservation of Plants and Animals',
    'Cell Structure and Functions',
    'Reproduction in Animals',
    'Reaching the Age of Adolescence',
    'Force and Pressure',
    'Friction',
    'Sound',
    'Chemical Effects of Electric Current',
    'Some Natural Phenomena',
    'Light',
    'Pollution of Air and Water'
  ],
  'Mathematics': [
    'Rational Numbers',
    'Linear Equations in One Variable',
    'Understanding Quadrilaterals',
    'Practical Geometry',
    'Data Handling',
    'Squares and Square Roots',
    'Cubes and Cube Roots',
    'Comparing Quantities',
    'Algebraic Expressions and Identities',
    'Mensuration',
    'Exponents and Powers',
    'Direct and Inverse Proportions',
    'Factorisation',
    'Introduction to Graphs',
    'Playing with Numbers'
  ],
  'Social Science': [
    'How, When and Where',
    'From Trade to Territory',
    'Ruling the Countryside',
    'Tribals, Dikus and the Vision of a Golden Age',
    'When People Rebel',
    'Colonialism and the City',
    'Weavers, Iron Smelters and Factory Owners',
    'Civilising the Native, Educating the Nation',
    'Resources',
    'Land, Soil, Water, Natural Vegetation and Wildlife Resources',
    'Mineral and Power Resources',
    'Agriculture',
    'Industries',
    'Human Resources'
  ]
}

// Mock topics by chapter
const topicsByChapter: Record<string, Array<{name: string, mastery: number, priority: string}>> = {
  'Stars and the Solar System': [
    { name: 'Celestial Objects and Motion', mastery: 75, priority: 'medium' },
    { name: 'Moon and Its Phases', mastery: 60, priority: 'high' },
    { name: 'Stars and Constellations', mastery: 85, priority: 'low' },
    { name: 'Solar System Structure', mastery: 50, priority: 'high' },
    { name: 'Planets and Their Characteristics', mastery: 70, priority: 'medium' }
  ],
  'Coal and Petroleum': [
    { name: 'Formation of Coal', mastery: 65, priority: 'medium' },
    { name: 'Petroleum Refining', mastery: 55, priority: 'high' },
    { name: 'Natural Gas', mastery: 80, priority: 'low' },
    { name: 'Conservation of Resources', mastery: 45, priority: 'high' }
  ],
  'Rational Numbers': [
    { name: 'Properties of Rational Numbers', mastery: 70, priority: 'medium' },
    { name: 'Operations on Rational Numbers', mastery: 60, priority: 'high' },
    { name: 'Representation on Number Line', mastery: 85, priority: 'low' },
    { name: 'Rational Numbers between Two Numbers', mastery: 55, priority: 'high' }
  ]
}

export default function PlannerSimplePage() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState(student.subjects[0])
  const [selectedChapter, setSelectedChapter] = useState(chapterOptions[student.subjects[0]][0])

  const chapters = chapterOptions[selectedSubject] || []
  const topics = topicsByChapter[selectedChapter] || [
    { name: 'Topic 1: Introduction', mastery: 70, priority: 'medium' },
    { name: 'Topic 2: Core Concepts', mastery: 60, priority: 'high' },
    { name: 'Topic 3: Applications', mastery: 50, priority: 'high' },
    { name: 'Topic 4: Advanced Topics', mastery: 40, priority: 'high' }
  ]

  // Mock AI recommendations
  const weakTopics = ['Planets', 'Moon Phases', 'Solar System'].slice(0, 5)
  const strongTopics = ['Stars', 'Constellations', 'Celestial Objects'].slice(0, 5)
  const avgScore = 78

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 70) return 'bg-green-500'
    if (mastery >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getPriorityEmoji = (priority: string) => {
    if (priority === 'high') return '🔴'
    if (priority === 'medium') return '🟡'
    return '🟢'
  }

  const getRecommendation = (score: number) => {
    if (score >= 80) return '🚀 Excellent performance! Try advanced topics and challenge yourself with harder questions.'
    if (score >= 60) return '📈 Good progress! Focus on weak areas and practice more questions.'
    return '📚 Need more practice! Start with basics and build your foundation.'
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const schedule: Record<string, string> = {
    'Monday': `${selectedSubject} - ${topics[0]?.name || 'Topic 1'}`,
    'Tuesday': `${selectedSubject} - ${topics[1]?.name || 'Topic 2'}`,
    'Wednesday': 'Revision Day - Review weak topics',
    'Thursday': `${selectedSubject} - ${topics[2]?.name || 'Topic 3'}`,
    'Friday': `${selectedSubject} - ${topics[3]?.name || 'Topic 4'}`,
    'Saturday': 'Practice Day - Take quizzes',
    'Sunday': 'Rest & Light Revision'
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 rounded-2xl p-8 text-white text-center shadow-xl">
        <h1 className="text-4xl font-bold mb-2">📅 Personalized Study Planner</h1>
        <p className="text-lg opacity-90">AI-curated learning path based on your quiz performance</p>
      </div>

      {/* Subject and Chapter Selection */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold mb-2">📚 Select Subject</label>
          <Select value={selectedSubject} onValueChange={(value) => {
            setSelectedSubject(value)
            setSelectedChapter(chapterOptions[value][0])
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {student.subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">📖 Select Chapter</label>
          <Select value={selectedChapter} onValueChange={setSelectedChapter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-l-blue-500">
        <h3 className="text-xl font-bold mb-4">🤖 AI Recommendations</h3>
        <p className="font-semibold mb-4">Based on your recent quiz performance:</p>
        
        <div className="grid gap-6 md:grid-cols-2 mb-4">
          <div>
            {weakTopics.length > 0 ? (
              <>
                <p className="font-semibold mb-2">🎯 Focus Areas (Needs Improvement):</p>
                <ul className="space-y-1">
                  {weakTopics.map((topic, i) => (
                    <li key={i} className="text-sm">• {topic}</li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="text-green-600 font-semibold">🎉 No weak areas identified!</div>
            )}
          </div>

          <div>
            {strongTopics.length > 0 && (
              <>
                <p className="font-semibold mb-2">✅ Strong Areas (Keep Practicing):</p>
                <ul className="space-y-1">
                  {strongTopics.map((topic, i) => (
                    <li key={i} className="text-sm">• {topic}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
          {getRecommendation(avgScore)}
        </div>
      </Card>

      {/* Study Plan Topics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📖 Study Plan: {selectedSubject} - {selectedChapter}</h2>
        <div className="space-y-4">
          {topics.map((topic, index) => (
            <Card key={index} className="p-6 border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold">
                  {getPriorityEmoji(topic.priority)} {topic.name}
                </div>
                <div className="text-indigo-600 font-semibold">{topic.mastery}% Mastery</div>
              </div>
              
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full ${getMasteryColor(topic.mastery)} transition-all`}
                  style={{ width: `${topic.mastery}%` }}
                />
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <Button 
                  onClick={() => router.push('/quiz')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  📝 Take Quiz
                </Button>
                <Button 
                  onClick={() => router.push('/tutor')}
                  variant="outline"
                >
                  🤖 Ask Tutor
                </Button>
                <Button variant="outline">
                  📚 Study Material
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📆 Suggested Weekly Schedule</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {days.map((day) => (
            <Card 
              key={day}
              className={`p-4 text-center min-h-[120px] ${
                day === today ? 'bg-blue-50 border-2 border-blue-500' : ''
              }`}
            >
              <div className="font-semibold mb-2">{day}</div>
              <div className="text-sm text-gray-600">{schedule[day]}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">🎯 Effective Study Strategies:</h3>
          <ul className="space-y-2 text-sm">
            <li>• Focus on weak topics first</li>
            <li>• Practice regularly with quizzes</li>
            <li>• Use AI Tutor for doubts</li>
            <li>• Review strong topics weekly</li>
            <li>• Take breaks between sessions</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">📊 Track Your Progress:</h3>
          <ul className="space-y-2 text-sm">
            <li>• Complete daily study goals</li>
            <li>• Monitor mastery levels</li>
            <li>• Review quiz performance</li>
            <li>• Adjust plan based on results</li>
            <li>• Celebrate achievements</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
