"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  Calendar,
  BarChart3,
  Activity,
} from "lucide-react"

export default function AnalyticsPage() {
  const stats = {
    totalStudyTime: 285,
    weeklyGoal: 420,
    averageMastery: 0.52,
    streakDays: 7,
    completedSessions: 12,
    missedSessions: 3,
  }

  const topicPerformance = [
    { topic: "Celestial Bodies & Motion", mastery: 0.72, trend: "up", sessions: 3 },
    { topic: "Historical Astronomy", mastery: 0.65, trend: "up", sessions: 1 },
    { topic: "Earth's Rotation & Revolution", mastery: 0.60, trend: "stable", sessions: 2 },
    { topic: "Moon Phases & Lunar Calendar", mastery: 0.55, trend: "down", sessions: 2 },
    { topic: "Stars & Constellations", mastery: 0.50, trend: "up", sessions: 1 },
    { topic: "Solar System & Planets", mastery: 0.45, trend: "down", sessions: 2 },
    { topic: "Time Zones & Standard Time", mastery: 0.42, trend: "up", sessions: 2 },
    { topic: "Seasons & Solstices", mastery: 0.38, trend: "stable", sessions: 2 },
    { topic: "Calendars (Solar & Lunar)", mastery: 0.30, trend: "stable", sessions: 0 },
    { topic: "Eclipses (Solar & Lunar)", mastery: 0.28, trend: "down", sessions: 1 },
  ]

  const weeklyActivity = [
    { day: "Mon", minutes: 45 },
    { day: "Tue", minutes: 65 },
    { day: "Wed", minutes: 30 },
    { day: "Thu", minutes: 45 },
    { day: "Fri", minutes: 40 },
    { day: "Sat", minutes: 60 },
    { day: "Sun", minutes: 0 },
  ]

  const maxMinutes = Math.max(...weeklyActivity.map((d) => d.minutes))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your learning progress and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudyTime} min</div>
            <Progress value={(stats.totalStudyTime / stats.weeklyGoal) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.weeklyGoal - stats.totalStudyTime} min to weekly goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mastery</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.averageMastery * 100).toFixed(0)}%</div>
            <Progress value={stats.averageMastery * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: 75%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakDays} days</div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep it up! 🔥
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSessions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.missedSessions} missed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="topics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Topics
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Topic Performance</CardTitle>
              <CardDescription>Mastery levels across all topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicPerformance.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.topic}</span>
                        {item.trend === "up" && (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        )}
                        {item.trend === "down" && (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.sessions} sessions
                        </Badge>
                        <span className="text-sm font-bold w-12 text-right">
                          {(item.mastery * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={item.mastery * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Study time distribution this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyActivity.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm font-medium w-12">{item.day}</span>
                    <div className="flex-1">
                      <div
                        className="bg-primary h-8 rounded flex items-center justify-end px-2"
                        style={{ width: `${(item.minutes / maxMinutes) * 100}%` }}
                      >
                        {item.minutes > 0 && (
                          <span className="text-xs text-primary-foreground font-medium">
                            {item.minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
