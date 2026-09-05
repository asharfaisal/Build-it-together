export type Priority = 'High' | 'Medium' | 'Low'
export type TaskCategory = 'Today' | 'Upcoming' | 'Completed' | 'Overdue'

export interface Task {
  id: string
  title: string
  desc: string
  priority: Priority
  dueDate: string // YYYY-MM-DD
  estMinutes: number
  done: boolean
  ai?: boolean
  completedAt?: string
  createdAt: string
}

export interface Subject {
  id: string
  name: string
  color: string
  targetHours: number
  studiedMinutes: number
  lastStudied?: string
  topics: string[]
  notes?: string
}

export interface StudySession {
  id: string
  subjectId: string
  subjectName: string
  topic: string
  durationMinutes: number
  date: string // YYYY-MM-DD
  timestamp: string // ISO string
  notes?: string
}

export interface ExerciseSet {
  id: string
  setNumber: number
  weightKg: number
  reps: number
  completed: boolean
}

export interface Exercise {
  id: string
  name: string
  sets: ExerciseSet[]
  personalBestKg?: number
}

export interface Workout {
  id: string
  name: string
  category: 'Upper Body' | 'Legs' | 'Cardio' | 'Core & Abs' | 'Full Body' | 'Push' | 'Pull' | 'Other'
  durationMinutes: number
  status: 'Completed' | 'Planned'
  date: string // YYYY-MM-DD
  color: string
  exercises: Exercise[]
  completedAt?: string
}

export interface CustomEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string
  type: 'study' | 'workout' | 'task' | 'uni' | 'ai' | 'other'
  color: string
  notes?: string
}

export interface UserProfile {
  name: string
  email: string
  avatar: string
  tier: 'Free' | 'Premium'
  dailyStudyGoalHours: number
  pomodoroMinutes: number
  workoutGoalPerWeek: number
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface NotificationSettings {
  studyReminders: boolean
  workoutReminders: boolean
  taskDeadlines: boolean
  aiWeeklyReview: boolean
  streakAlerts: boolean
}

export interface AIPreferences {
  coachSuggestions: boolean
  autoGenerateTasks: boolean
  personalizedInsights: boolean
}

export interface AppSettings {
  theme: ThemeMode
  notifications: NotificationSettings
  aiPreferences: AIPreferences
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  timestamp: string
}

export interface WeeklyReviewReport {
  weekRange: string
  whatWentWell: string
  whereStruggled: string
  bestDay: string
  biggestImprovement: string
  recommendation: string
  hasSufficientData: boolean
}
