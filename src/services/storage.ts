import {
  Task,
  Subject,
  StudySession,
  Workout,
  CustomEvent,
  UserProfile,
  AppSettings,
  ChatMessage,
  FocusTimerState,
} from "../types"

const STORAGE_KEYS = {
  TASKS: "lifetrack_tasks_v1",
  SUBJECTS: "lifetrack_subjects_v1",
  STUDY_SESSIONS: "lifetrack_study_sessions_v1",
  WORKOUTS: "lifetrack_workouts_v1",
  CUSTOM_EVENTS: "lifetrack_custom_events_v1",
  USER_PROFILE: "lifetrack_user_profile_v1",
  SETTINGS: "lifetrack_settings_v1",
  CHAT_MESSAGES: "lifetrack_chat_messages_v1",
  FOCUS_TIMER: "lifetrack_focus_timer_v1",
}

// Utility to get today's date formatted as YYYY-MM-DD
export function getTodayDateStr(): string {
  const d = new Date()
  return d.toISOString().split("T")[0]
}

// Utility to get relative date (offset in days)
export function getRelativeDateStr(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split("T")[0]
}

// Initial default seed dataset
export const initialProfile: UserProfile = {
  name: "Muhammad",
  email: "muhammad@email.com",
  avatar: "M",
  tier: "Premium",
  dailyStudyGoalHours: 4,
  pomodoroMinutes: 45,
  workoutGoalPerWeek: 4,
}

export const initialSettings: AppSettings = {
  theme: "dark",
  colorTheme: "default",
  notifications: {
    studyReminders: true,
    workoutReminders: true,
    taskDeadlines: true,
    aiWeeklyReview: true,
    streakAlerts: true,
  },
  aiPreferences: {
    coachSuggestions: true,
    autoGenerateTasks: true,
    personalizedInsights: true,
  },
}

export const initialFocusTimer: FocusTimerState = {
  isActive: false,
  isPaused: false,
  seconds: 0,
  subjectId: "",
  subjectName: "",
  topic: "",
  notes: "",
  startTimestamp: null,
  accumulatedSeconds: 0,
}

export const initialSubjects: Subject[] = []

export const initialStudySessions: StudySession[] = []

export const initialTasks: Task[] = []

export const initialWorkouts: Workout[] = []

export const initialCustomEvents: CustomEvent[] = []

export const initialChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "ai",
    text: "Hi! I'm your AI Coach. I've synced your tasks, study sessions, workouts, and streaks. What would you like to plan or analyze today?",
    timestamp: "8:00 AM",
  },
]

// Storage helpers
export const storageService = {
  loadTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS)
      return data ? JSON.parse(data) : initialTasks
    } catch {
      return initialTasks
    }
  },
  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    } catch (e) {
      console.error("Failed to save tasks", e)
    }
  },

  loadSubjects(): Subject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS)
      return data ? JSON.parse(data) : initialSubjects
    } catch {
      return initialSubjects
    }
  },
  saveSubjects(subjects: Subject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects))
    } catch (e) {
      console.error("Failed to save subjects", e)
    }
  },

  loadStudySessions(): StudySession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS)
      return data ? JSON.parse(data) : initialStudySessions
    } catch {
      return initialStudySessions
    }
  },
  saveStudySessions(sessions: StudySession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions))
    } catch (e) {
      console.error("Failed to save study sessions", e)
    }
  },

  loadWorkouts(): Workout[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS)
      return data ? JSON.parse(data) : initialWorkouts
    } catch {
      return initialWorkouts
    }
  },
  saveWorkouts(workouts: Workout[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts))
    } catch (e) {
      console.error("Failed to save workouts", e)
    }
  },

  loadCustomEvents(): CustomEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS)
      return data ? JSON.parse(data) : initialCustomEvents
    } catch {
      return initialCustomEvents
    }
  },
  saveCustomEvents(events: CustomEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(events))
    } catch (e) {
      console.error("Failed to save custom events", e)
    }
  },

  loadUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
      return data ? JSON.parse(data) : initialProfile
    } catch {
      return initialProfile
    }
  },
  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
    } catch (e) {
      console.error("Failed to save user profile", e)
    }
  },

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return data ? JSON.parse(data) : initialSettings
    } catch {
      return initialSettings
    }
  },
  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (e) {
      console.error("Failed to save settings", e)
    }
  },

  loadChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)
      return data ? JSON.parse(data) : initialChatMessages
    } catch {
      return initialChatMessages
    }
  },
  saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages))
    } catch (e) {
      console.error("Failed to save chat messages", e)
    }
  },

  loadFocusTimer(): FocusTimerState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOCUS_TIMER)
      if (!data) return initialFocusTimer
      const parsed: FocusTimerState = JSON.parse(data)
      // Recalculate seconds if active
      if (parsed.isActive && !parsed.isPaused && parsed.startTimestamp) {
        parsed.seconds = parsed.accumulatedSeconds + Math.floor((Date.now() - parsed.startTimestamp) / 1000)
      } else {
        parsed.seconds = parsed.accumulatedSeconds
      }
      return parsed
    } catch {
      return initialFocusTimer
    }
  },
  saveFocusTimer(timer: FocusTimerState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FOCUS_TIMER, JSON.stringify(timer))
    } catch (e) {
      console.error("Failed to save focus timer", e)
    }
  },

  exportAllDataJSON(): string {
    const backup = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      userProfile: this.loadUserProfile(),
      settings: this.loadSettings(),
      tasks: this.loadTasks(),
      subjects: this.loadSubjects(),
      studySessions: this.loadStudySessions(),
      workouts: this.loadWorkouts(),
      customEvents: this.loadCustomEvents(),
    }
    return JSON.stringify(backup, null, 2)
  },

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  },
}