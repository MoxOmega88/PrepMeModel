"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Settings, BookOpen, Bell, Palette } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Student",
    email: "student@example.com",
    grade: "8",
    board: "CBSE",
    subjects: ["Science", "Mathematics", "Social Science"],
  })

  const [preferences, setPreferences] = useState({
    dailyGoal: 60,
    sessionDuration: 45,
    difficulty: "adaptive",
    voiceEnabled: true,
    notifications: true,
    theme: "system",
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="learning">
            <BookOpen className="h-4 w-4 mr-2" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={profile.grade} onValueChange={(v: string) => setProfile({ ...profile, grade: v })}>
                    <SelectTrigger id="grade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                        <SelectItem key={g} value={g.toString()}>
                          Class {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="board">Board</Label>
                  <Select value={profile.board} onValueChange={(v: string) => setProfile({ ...profile, board: v })}>
                    <SelectTrigger id="board">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="ICSE">ICSE</SelectItem>
                      <SelectItem value="State">State Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>Subjects you're currently studying</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.subjects.map((subject, idx) => (
                  <Badge key={idx} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Tab */}
        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Goals</CardTitle>
              <CardDescription>Set your daily and session targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Daily Study Goal</Label>
                  <span className="text-sm font-medium">{preferences.dailyGoal} minutes</span>
                </div>
                <Slider
                  value={[preferences.dailyGoal]}
                  onValueChange={([v]: number[]) => setPreferences({ ...preferences, dailyGoal: v })}
                  min={15}
                  max={180}
                  step={15}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Session Duration</Label>
                  <span className="text-sm font-medium">{preferences.sessionDuration} minutes</span>
                </div>
                <Slider
                  value={[preferences.sessionDuration]}
                  onValueChange={([v]: number[]) => setPreferences({ ...preferences, sessionDuration: v })}
                  min={15}
                  max={90}
                  step={15}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Difficulty Settings</CardTitle>
              <CardDescription>Control how questions adapt to your level</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.difficulty}
                onValueChange={(v: string) => setPreferences({ ...preferences, difficulty: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy - Focus on basics</SelectItem>
                  <SelectItem value="adaptive">Adaptive - Adjusts to performance</SelectItem>
                  <SelectItem value="hard">Hard - Challenge yourself</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Voice Input</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable voice-to-text for questions
                  </p>
                </div>
                <Switch
                  checked={preferences.voiceEnabled}
                  onCheckedChange={(v: boolean) => setPreferences({ ...preferences, voiceEnabled: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for study sessions
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(v: boolean) => setPreferences({ ...preferences, notifications: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Palette className="h-5 w-5 inline mr-2" />
                Appearance
              </CardTitle>
              <CardDescription>Choose your theme preference</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.theme}
                onValueChange={(v: string) => setPreferences({ ...preferences, theme: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
