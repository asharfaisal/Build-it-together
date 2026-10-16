import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import {
  Task,
  Subject,
  StudySession,
  Workout,
  CustomEvent,
  UserProfile,
  AppSettings,
  ChatMessage,
  ThemeMode,
  ThemeName,
  Priority,
  ExerciseSet,
  Exercise,
  FocusTimerState,
} from "../types"
import {
  storageService,
  initialTasks,
  initialSubjects,
  initialStudySessions,
  initialWorkouts,
  initialCustomEvents,
  initialProfile,
  initialSettings,
  initialChatMessages,
  initialFocusTimer,
  getTodayDateStr,
} from "../services/storage"
import {
  tasksService,
  subjectsService,
  studySessionsService,
  workoutsService,
  customEventsService,
  userSettingsService,
  chatMessagesService,
  focusTimerService,
  userProfileService,
} from "../services/supabase"
import { ToastItem, ToastType, ToastContainer } from "../components/ui/Toast"
import { requestAICoachResponse } from "../services/aiService"
import { useAuth } from "../contexts/AuthContext"

export type Page = "dashboard" | "study" | "workout" | "tasks" | "calendar" | "analytics" | "coach" | "settings" | "login" | "register" | "forgot-password" | "reset-password" | "verify-email"

interface AppContextType {
  // Navigation
  page: Page
  setPage: (p: Page) => void
  coachPrefillPrompt: string | null
  setCoachPrefillPrompt: (prompt: string | null) => void

  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void

  // Subjects
  subjects: Subject[]
  addSubject: (subject: Omit<Subject, "id" | "studiedMinutes">) => void
  updateSubject: (id: string, updates: Partial<Subject>) => void
  deleteSubject: (id: string) => void

  // Study Sessions
  studySessions: StudySession[]
  addStudySession: (session: Omit<StudySession, "id" | "timestamp">) => void
  deleteStudySession: (id: string) => void

  // Persistent Focus Timer
  focusTimer: FocusTimerState
  startFocusTimer: (
    subjectId?: string,
    subjectName?: string,
    topic?: string,
  ) => void
  pauseFocusTimer: () => void
  resumeFocusTimer: () => void
  resetFocusTimer: () => void
  finishFocusTimerSession: () => void
  updateFocusTimerDetails: (
    updates: Partial<Pick<FocusTimerState, "subjectId" | "subjectName" | "topic" | "notes">>,
  ) => void

  // Workouts
  workouts: Workout[]
  addWorkout: (workout: Omit<Workout, "id">) => void
  updateWorkout: (id: string, updates: Partial<Workout>) => void
  deleteWorkout: (id: string) => void
  toggleWorkoutStatus: (id: string) => void
  addExerciseToWorkout: (workoutId: string, exerciseName: string) => void
  addSetToExercise: (
    workoutId: string,
    exerciseId: string,
    set: Omit<ExerciseSet, "id">,
  ) => void
  deleteSetFromExercise: (
    workoutId: string,
    exerciseId: string,
    setId: string,
  ) => void
  updateSetInExercise: (
    workoutId: string,
    exerciseId: string,
    setId: string,
    updates: Partial<ExerciseSet>,
  ) => void

  // Custom Calendar Events
  customEvents: CustomEvent[]
  addCustomEvent: (event: Omit<CustomEvent, "id">) => void
  deleteCustomEvent: (id: string) => void

  // User Profile & Settings
  userProfile: UserProfile
  updateUserProfile: (updates: Partial<UserProfile>) => void
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  theme: ThemeMode
  colorTheme: ThemeName
  isDark: boolean
  setTheme: (theme: ThemeMode) => void
  setColorTheme: (colorTheme: ThemeName) => void
  toggleTheme: () => void

  // Chat / AI Coach
  chatMessages: ChatMessage[]
  sendMessageToCoach: (text: string) => void
  clearChatHistory: () => void
  isCoachTyping: boolean

  // Toasts
  showToast: (message: string, type?: ToastType, duration?: number) => void

  // Data management
  exportDataJSON: () => void
  clearAllData: () => void
  resetSampleData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()

  // Navigation State
  const [page, setPage] = useState<Page>("dashboard")
  const [coachPrefillPrompt, setCoachPrefillPrompt] = useState<string | null>(
    null,
  )
  const [dataLoaded, setDataLoaded] = useState(false)

  // Core Data State - initially empty, loaded from Supabase when authenticated
  const [tasks, setTasks] = useState<Task[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile)
  const [settings, setSettings] = useState<AppSettings>(initialSettings)
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(initialChatMessages)
  const [focusTimer, setFocusTimer] =
    useState<FocusTimerState>(initialFocusTimer)
  const [isCoachTyping, setIsCoachTyping] = useState(false)

  // Toasts State
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      setToasts((prev) => [...prev, { id, message, type, duration }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    },
    [],
  )

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Load data from Supabase when user authenticates
  useEffect(() => {
    let mounted = true

    const loadUserData = async () => {
      if (!user) {
        // User signed out - clear data
        setTasks([])
        setSubjects([])
        setStudySessions([])
        setWorkouts([])
        setCustomEvents([])
        setChatMessages(initialChatMessages)
        setFocusTimer(initialFocusTimer)
        setDataLoaded(true)
        return
      }

      try {
        const [
          tasksData,
          subjectsData,
          sessionsData,
          workoutsData,
          eventsData,
          profileData,
          settingsData,
          messagesData,
          timerData,
        ] = await Promise.all([
          tasksService.getAll(),
          subjectsService.getAll(),
          studySessionsService.getAll(),
          workoutsService.getAll(),
          customEventsService.getAll(),
          userProfileService.get(),
          userSettingsService.get(),
          chatMessagesService.getAll(),
          focusTimerService.get(),
        ])

        if (mounted) {
          setTasks(tasksData)
          setSubjects(subjectsData)
          setStudySessions(sessionsData)
          setWorkouts(workoutsData)
          setCustomEvents(eventsData)
          setUserProfile(profileData)
          setSettings(settingsData)
          setChatMessages(
            messagesData.length > 0 ? messagesData : initialChatMessages,
          )
          setFocusTimer(timerData)
          setDataLoaded(true)
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
        showToast("Failed to load your data. Using local storage.", "warning")
        // Fallback to localStorage
        setTasks(storageService.loadTasks())
        setSubjects(storageService.loadSubjects())
        setStudySessions(storageService.loadStudySessions())
        setWorkouts(storageService.loadWorkouts())
        setCustomEvents(storageService.loadCustomEvents())
        setUserProfile(storageService.loadUserProfile())
        setSettings(storageService.loadSettings())
        setChatMessages(storageService.loadChatMessages())
        setFocusTimer(storageService.loadFocusTimer())
        setDataLoaded(true)
      }
    }

    if (!authLoading) {
      loadUserData()
    }
  }, [user, authLoading, showToast])

  // Sync to localStorage as backup/cache (only when not using Supabase as primary)
  // This maintains backward compatibility for offline/guest usage
  useEffect(() => {
    if (!user && tasks.length > 0) storageService.saveTasks(tasks)
  }, [tasks, user])

  useEffect(() => {
    if (!user && subjects.length > 0) storageService.saveSubjects(subjects)
  }, [subjects, user])

  useEffect(() => {
    if (!user && studySessions.length > 0)
      storageService.saveStudySessions(studySessions)
  }, [studySessions, user])

  useEffect(() => {
    if (!user && workouts.length > 0) storageService.saveWorkouts(workouts)
  }, [workouts, user])

  useEffect(() => {
    if (!user && customEvents.length > 0)
      storageService.saveCustomEvents(customEvents)
  }, [customEvents, user])

  useEffect(() => {
    if (!user) storageService.saveUserProfile(userProfile)
  }, [userProfile, user])

  useEffect(() => {
    if (!user) storageService.saveSettings(settings)
  }, [settings, user])

  useEffect(() => {
    if (!user) storageService.saveChatMessages(chatMessages)
  }, [chatMessages, user])

  useEffect(() => {
    if (!user) storageService.saveFocusTimer(focusTimer)
  }, [focusTimer, user])

  // Real wall-clock timer tick interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (
      focusTimer.isActive &&
      !focusTimer.isPaused &&
      focusTimer.startTimestamp
    ) {
      interval = setInterval(() => {
        const now = Date.now()
        const currentSeconds =
          focusTimer.accumulatedSeconds +
          Math.floor((now - focusTimer.startTimestamp!) / 1000)
        setFocusTimer((prev) => {
          // Avoid unnecessary re-renders if second hasn't changed
          if (prev.seconds === currentSeconds) return prev
          return {
            ...prev,
            seconds: currentSeconds,
          }
        })
      }, 500)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [
    focusTimer.isActive,
    focusTimer.isPaused,
    focusTimer.startTimestamp,
    focusTimer.accumulatedSeconds,
  ])

  // Focus Timer Actions
  const startFocusTimer = useCallback(
    async (subjectId?: string, subjectName?: string, topic?: string) => {
      const now = Date.now()
      setFocusTimer((prevState) => ({
        ...prevState,
        isActive: true,
        isPaused: false,
        startTimestamp: now,
        subjectId: subjectId || prevState.subjectId || "",
        subjectName: subjectName || prevState.subjectName || "",
        topic: topic !== undefined ? topic : prevState.topic,
      }))

      if (user) {
        try {
          // Get current timer state for sync
          const currentTimer = focusTimer
          await focusTimerService.update({
            isActive: true,
            isPaused: false,
            startTimestamp: now,
            subjectId: subjectId || currentTimer.subjectId || "",
            subjectName: subjectName || currentTimer.subjectName || "",
            topic: topic !== undefined ? topic : currentTimer.topic,
          })
        } catch (error) {
          console.error("Failed to sync timer start:", error)
        }
      }

      showToast("Focus timer started! ⚡", "info")
    },
    [user, showToast, focusTimer],
  )

  const pauseFocusTimer = useCallback(async () => {
    const now = Date.now()
    setFocusTimer((prev) => {
      if (!prev.isActive || prev.isPaused) return prev
      const additional = prev.startTimestamp
        ? Math.floor((now - prev.startTimestamp) / 1000)
        : 0
      const totalAccumulated = prev.accumulatedSeconds + additional
      return {
        ...prev,
        isPaused: true,
        accumulatedSeconds: totalAccumulated,
        seconds: totalAccumulated,
        startTimestamp: null,
      }
    })

    if (user) {
      try {
        await focusTimerService.update({ isPaused: true, startTimestamp: null })
      } catch (error) {
        console.error("Failed to sync timer pause:", error)
      }
    }

    showToast("Focus timer paused", "info")
  }, [user, showToast])

  const resumeFocusTimer = useCallback(async () => {
    const now = Date.now()
    setFocusTimer((prev) => ({
      ...prev,
      isActive: true,
      isPaused: false,
      startTimestamp: now,
    }))

    if (user) {
      try {
        await focusTimerService.update({
          isActive: true,
          isPaused: false,
          startTimestamp: now,
        })
      } catch (error) {
        console.error("Failed to sync timer resume:", error)
      }
    }

    showToast("Focus timer resumed", "info")
  }, [user, showToast])

  const resetFocusTimer = useCallback(async () => {
    setFocusTimer((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      seconds: 0,
      accumulatedSeconds: 0,
      startTimestamp: null,
      notes: "",
    }))

    if (user) {
      try {
        await focusTimerService.reset()
      } catch (error) {
        console.error("Failed to sync timer reset:", error)
      }
    }

    showToast("Timer reset", "info")
  }, [user, showToast])

  const updateFocusTimerDetails = useCallback(
    async (
      updates: Partial<Pick<FocusTimerState, "subjectId" | "subjectName" | "topic" | "notes">>,
    ) => {
      setFocusTimer((prev) => ({
        ...prev,
        ...updates,
      }))

      if (user) {
        try {
          await focusTimerService.update(updates)
        } catch (error) {
          console.error("Failed to sync timer details:", error)
        }
      }
    },
    [user],
  )

  const finishFocusTimerSession = useCallback(() => {
    const now = Date.now()
    const currentElapsed =
      focusTimer.accumulatedSeconds +
      (focusTimer.isActive && !focusTimer.isPaused && focusTimer.startTimestamp
        ? Math.floor((now - focusTimer.startTimestamp) / 1000)
        : 0)

    if (currentElapsed < 1) {
      showToast("Timer stopped (no time recorded)", "info")
      setFocusTimer({
        ...initialFocusTimer,
        subjectId: focusTimer.subjectId || "sub-1",
        subjectName: focusTimer.subjectName || "SQL & Databases",
        topic: focusTimer.topic,
      })
      return
    }

    // Accurate duration calculation:
    // If under 60 seconds (e.g. 15-59s), record as 1 minute so testing/quick focus is preserved
    // If >= 60s, calculate rounded minutes
    const durationMins =
      currentElapsed < 60 ? 1 : Math.max(1, Math.round(currentElapsed / 60))

    const subName = focusTimer.subjectName || "General Focus"
    const subId = focusTimer.subjectId || "sub-1"
    const topic = focusTimer.topic.trim() || "General Study Session"

    const newSession: StudySession = {
      id: `ss-${Date.now()}`,
      subjectId: subId,
      subjectName: subName,
      topic: topic,
      durationMinutes: durationMins,
      date: getTodayDateStr(),
      timestamp: new Date().toISOString(),
      notes: focusTimer.notes.trim() || undefined,
    }

    setStudySessions((prev) => [newSession, ...prev])

    // Update subject studied minutes and lastStudied date
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subId || s.name.toLowerCase() === subName.toLowerCase()) {
          return {
            ...s,
            studiedMinutes: s.studiedMinutes + durationMins,
            lastStudied: getTodayDateStr(),
          }
        }
        return s
      }),
    )

    // Reset timer state cleanly
    setFocusTimer({
      ...initialFocusTimer,
      subjectId: subId,
      subjectName: subName,
      topic: topic,
    })

    const elapsedMins = Math.floor(currentElapsed / 60)
    const elapsedSecs = currentElapsed % 60
    showToast(
      `Saved ${durationMins}m study session for ${subName}! (${elapsedMins}m ${elapsedSecs}s elapsed)`,
      "success",
    )
  }, [focusTimer, showToast])

  // Theme resolution
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true,
  )

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const isDark =
    settings.theme === "system" ? systemDark : settings.theme === "dark"
  const colorTheme = settings.colorTheme || "default"

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }))
  }, [])

  const setColorTheme = useCallback((colorTheme: ThemeName) => {
    setSettings((prev) => ({ ...prev, colorTheme }))
  }, [])

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }))
  }, [])

  // Task Actions
  const addTask = useCallback(
    async (taskData: Omit<Task, "id" | "createdAt">) => {
      if (user) {
        try {
          const created = await tasksService.create(taskData)
          setTasks((prev) => [created, ...prev])
          showToast(`Added task: "${created.title}"`, "success")
          return
        } catch (error) {
          console.error("Failed to create task:", error)
          showToast("Failed to save task to cloud", "error")
        }
      }
      // Fallback to localStorage
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => [newTask, ...prev])
      showToast(`Added task: "${newTask.title}"`, "success")
    },
    [user, showToast],
  )

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      if (user) {
        try {
          const updated = await tasksService.update(id, updates)
          setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
          showToast("Task updated", "info")
          return
        } catch (error) {
          console.error("Failed to update task:", error)
          showToast("Failed to update task", "error")
        }
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      )
      showToast("Task updated", "info")
    },
    [user, showToast],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      if (user) {
        try {
          await tasksService.delete(id)
          setTasks((prev) => prev.filter((t) => t.id !== id))
          showToast("Task removed", "info")
          return
        } catch (error) {
          console.error("Failed to delete task:", error)
          showToast("Failed to delete task", "error")
        }
      }
      setTasks((prev) => prev.filter((t) => t.id !== id))
      showToast("Task removed", "info")
    },
    [user, showToast],
  )

  const toggleTask = useCallback(
    async (id: string) => {
      if (user) {
        try {
          const updated = await tasksService.toggle(id)
          setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
          return
        } catch (error) {
          console.error("Failed to toggle task:", error)
          showToast("Failed to update task", "error")
        }
      }
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const willBeDone = !t.done
            return {
              ...t,
              done: willBeDone,
              completedAt: willBeDone ? new Date().toISOString() : undefined,
            }
          }
          return t
        }),
      )
    },
    [user, showToast],
  )

  // Subject Actions
  const addSubject = useCallback(
    async (subjectData: Omit<Subject, "id" | "studiedMinutes">) => {
      if (user) {
        try {
          const created = await subjectsService.create(subjectData)
          setSubjects((prev) => [...prev, created])
          showToast(`Added subject: "${created.name}"`, "success")
          return
        } catch (error) {
          console.error("Failed to create subject:", error)
          showToast("Failed to save subject", "error")
        }
      }
      const newSub: Subject = {
        ...subjectData,
        id: `sub-${Date.now()}`,
        studiedMinutes: 0,
      }
      setSubjects((prev) => [...prev, newSub])
      showToast(`Added subject: "${newSub.name}"`, "success")
    },
    [user, showToast],
  )

  const updateSubject = useCallback(
    async (id: string, updates: Partial<Subject>) => {
      if (user) {
        try {
          const updated = await subjectsService.update(id, updates)
          setSubjects((prev) => prev.map((s) => (s.id === id ? updated : s)))
          showToast("Subject updated", "info")
          return
        } catch (error) {
          console.error("Failed to update subject:", error)
          showToast("Failed to update subject", "error")
        }
      }
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      )
      showToast("Subject updated", "info")
    },
    [user, showToast],
  )

  const deleteSubject = useCallback(
    async (id: string) => {
      if (user) {
        try {
          await subjectsService.delete(id)
          setSubjects((prev) => prev.filter((s) => s.id !== id))
          showToast("Subject deleted", "info")
          return
        } catch (error) {
          console.error("Failed to delete subject:", error)
          showToast("Failed to delete subject", "error")
        }
      }
      setSubjects((prev) => prev.filter((s) => s.id !== id))
      showToast("Subject deleted", "info")
    },
    [user, showToast],
  )

  // Study Session Actions (Manual)
  const addStudySession = useCallback(
    async (sessionData: Omit<StudySession, "id" | "timestamp">) => {
      if (user) {
        try {
          const created = await studySessionsService.create(sessionData)
          setStudySessions((prev) => [created, ...prev])

          // Update subject studied minutes
          await subjectsService.incrementStudiedMinutes(
            created.subjectId,
            created.durationMinutes,
          )
          setSubjects((prev) =>
            prev.map((s) => {
              if (s.id === created.subjectId) {
                return {
                  ...s,
                  studiedMinutes: s.studiedMinutes + created.durationMinutes,
                  lastStudied: created.date,
                }
              }
              return s
            }),
          )

          showToast(
            `Recorded ${created.durationMinutes}m study session for ${created.subjectName}!`,
            "success",
          )
          return
        } catch (error) {
          console.error("Failed to create study session:", error)
          showToast("Failed to save study session", "error")
        }
      }
      const newSession: StudySession = {
        ...sessionData,
        id: `ss-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
      setStudySessions((prev) => [newSession, ...prev])

      setSubjects((prev) =>
        prev.map((s) => {
          if (
            s.id === sessionData.subjectId ||
            s.name.toLowerCase() === sessionData.subjectName.toLowerCase()
          ) {
            return {
              ...s,
              studiedMinutes: s.studiedMinutes + sessionData.durationMinutes,
              lastStudied: sessionData.date || getTodayDateStr(),
            }
          }
          return s
        }),
      )

      showToast(
        `Recorded ${sessionData.durationMinutes}m study session for ${sessionData.subjectName}!`,
        "success",
      )
    },
    [showToast],
  )

  const deleteStudySession = useCallback(
    async (id: string) => {
      if (user) {
        try {
          const session = studySessions.find((s) => s.id === id)
          await studySessionsService.delete(id)
          setStudySessions((prev) => prev.filter((s) => s.id !== id))

          if (session) {
            // Decrement subject studied minutes
            await subjectsService.incrementStudiedMinutes(
              session.subjectId,
              -session.durationMinutes,
            )
            setSubjects((prev) =>
              prev.map((s) => {
                if (
                  s.id === session.subjectId ||
                  s.name.toLowerCase() === session.subjectName.toLowerCase()
                ) {
                  return {
                    ...s,
                    studiedMinutes: Math.max(
                      0,
                      s.studiedMinutes - session.durationMinutes,
                    ),
                  }
                }
                return s
              }),
            )
          }

          showToast("Study session deleted", "info")
          return
        } catch (error) {
          console.error("Failed to delete study session:", error)
          showToast("Failed to delete study session", "error")
        }
      }
      const session = studySessions.find((s) => s.id === id)
      if (session) {
        setSubjects((prev) =>
          prev.map((s) => {
            if (
              s.id === session.subjectId ||
              s.name.toLowerCase() === session.subjectName.toLowerCase()
            ) {
              return {
                ...s,
                studiedMinutes: Math.max(
                  0,
                  s.studiedMinutes - session.durationMinutes,
                ),
              }
            }
            return s
          }),
        )
      }
      setStudySessions((prev) => prev.filter((s) => s.id !== id))
      showToast("Study session deleted", "info")
    },
    [user, studySessions, showToast],
  )

  // Workout Actions
  const addWorkout = useCallback(
    async (workoutData: Omit<Workout, "id">) => {
      if (user) {
        try {
          const created = await workoutsService.create(workoutData)
          setWorkouts((prev) => [created, ...prev])
          showToast(`Created workout: "${created.name}"`, "success")
          return
        } catch (error) {
          console.error("Failed to create workout:", error)
          showToast("Failed to save workout", "error")
        }
      }
      const newWorkout: Workout = {
        ...workoutData,
        id: `wo-${Date.now()}`,
      }
      setWorkouts((prev) => [newWorkout, ...prev])
      showToast(`Created workout: "${newWorkout.name}"`, "success")
    },
    [user, showToast],
  )

  const updateWorkout = useCallback(
    async (id: string, updates: Partial<Workout>) => {
      if (user) {
        try {
          const updated = await workoutsService.update(id, updates)
          setWorkouts((prev) => prev.map((w) => (w.id === id ? updated : w)))
          showToast("Workout updated", "info")
          return
        } catch (error) {
          console.error("Failed to update workout:", error)
          showToast("Failed to update workout", "error")
        }
      }
      setWorkouts((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      )
      showToast("Workout updated", "info")
    },
    [user, showToast],
  )

  const deleteWorkout = useCallback(
    async (id: string) => {
      if (user) {
        try {
          await workoutsService.delete(id)
          setWorkouts((prev) => prev.filter((w) => w.id !== id))
          showToast("Workout deleted", "info")
          return
        } catch (error) {
          console.error("Failed to delete workout:", error)
          showToast("Failed to delete workout", "error")
        }
      }
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
      showToast("Workout deleted", "info")
    },
    [user, showToast],
  )

  const toggleWorkoutStatus = useCallback(
    async (id: string) => {
      if (user) {
        try {
          const updated = await workoutsService.toggleStatus(id)
          setWorkouts((prev) => prev.map((w) => (w.id === id ? updated : w)))
          showToast("Workout status updated", "success")
          return
        } catch (error) {
          console.error("Failed to toggle workout status:", error)
          showToast("Failed to update workout status", "error")
        }
      }
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id === id) {
            const newStatus = w.status === "Completed" ? "Planned" : "Completed"
            return {
              ...w,
              status: newStatus,
              completedAt:
                newStatus === "Completed"
                  ? new Date().toISOString()
                  : undefined,
            }
          }
          return w
        }),
      )
      showToast("Workout status updated", "success")
    },
    [showToast],
  )

  const addExerciseToWorkout = useCallback(
    async (workoutId: string, exerciseName: string) => {
      if (user) {
        try {
          const created = await workoutsService.addExercise(
            workoutId,
            exerciseName,
          )
          setWorkouts((prev) =>
            prev.map((w) =>
              w.id === workoutId
                ? { ...w, exercises: [...w.exercises, created] }
                : w,
            ),
          )
          showToast(`Added exercise: ${exerciseName}`, "info")
          return
        } catch (error) {
          console.error("Failed to add exercise:", error)
          showToast("Failed to add exercise", "error")
        }
      }
      const newExercise: Exercise = {
        id: `ex-${Date.now()}`,
        name: exerciseName,
        sets: [
          {
            id: `s-${Date.now()}-1`,
            setNumber: 1,
            weightKg: 20,
            reps: 10,
            completed: true,
          },
        ],
      }
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId
            ? { ...w, exercises: [...w.exercises, newExercise] }
            : w,
        ),
      )
      showToast(`Added exercise: ${exerciseName}`, "info")
    },
    [user, showToast],
  )

  const addSetToExercise = useCallback(
    async (
      workoutId: string,
      exerciseId: string,
      setData: Omit<ExerciseSet, "id">,
    ) => {
      if (user) {
        try {
          const created = await workoutsService.addSet(
            workoutId,
            exerciseId,
            setData,
          )
          setWorkouts((prev) =>
            prev.map((w) => {
              if (w.id === workoutId) {
                return {
                  ...w,
                  exercises: w.exercises.map((ex) =>
                    ex.id === exerciseId
                      ? { ...ex, sets: [...ex.sets, created] }
                      : ex,
                  ),
                }
              }
              return w
            }),
          )
          showToast(
            `Logged Set ${setData.setNumber}: ${setData.weightKg}kg × ${setData.reps}`,
            "success",
          )
          return
        } catch (error) {
          console.error("Failed to add set:", error)
          showToast("Failed to log set", "error")
        }
      }
      const newSet: ExerciseSet = { ...setData, id: `s-${Date.now()}` }
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id === workoutId) {
            return {
              ...w,
              exercises: w.exercises.map((ex) =>
                ex.id === exerciseId
                  ? { ...ex, sets: [...ex.sets, newSet] }
                  : ex,
              ),
            }
          }
          return w
        }),
      )
      showToast(
        `Logged Set ${setData.setNumber}: ${setData.weightKg}kg × ${setData.reps}`,
        "success",
      )
    },
    [user, showToast],
  )

  const deleteSetFromExercise = useCallback(
    async (workoutId: string, exerciseId: string, setId: string) => {
      if (user) {
        try {
          await workoutsService.deleteSet(workoutId, exerciseId, setId)
          setWorkouts((prev) =>
            prev.map((w) => {
              if (w.id === workoutId) {
                return {
                  ...w,
                  exercises: w.exercises.map((ex) =>
                    ex.id === exerciseId
                      ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
                      : ex,
                  ),
                }
              }
              return w
            }),
          )
          return
        } catch (error) {
          console.error("Failed to delete set:", error)
          showToast("Failed to delete set", "error")
        }
      }
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id === workoutId) {
            return {
              ...w,
              exercises: w.exercises.map((ex) =>
                ex.id === exerciseId
                  ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
                  : ex,
              ),
            }
          }
          return w
        }),
      )
    },
    [user],
  )

  const updateSetInExercise = useCallback(
    async (
      workoutId: string,
      exerciseId: string,
      setId: string,
      updates: Partial<ExerciseSet>,
    ) => {
      if (user) {
        try {
          const updated = await workoutsService.updateSet(
            workoutId,
            exerciseId,
            setId,
            updates,
          )
          setWorkouts((prev) =>
            prev.map((w) => {
              if (w.id === workoutId) {
                return {
                  ...w,
                  exercises: w.exercises.map((ex) =>
                    ex.id === exerciseId
                      ? {
                          ...ex,
                          sets: ex.sets.map((s) =>
                            s.id === setId ? updated : s,
                          ),
                        }
                      : ex,
                  ),
                }
              }
              return w
            }),
          )
          return
        } catch (error) {
          console.error("Failed to update set:", error)
          showToast("Failed to update set", "error")
        }
      }
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id === workoutId) {
            return {
              ...w,
              exercises: w.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map((s) =>
                        s.id === setId ? { ...s, ...updates } : s,
                      ),
                    }
                  : ex,
              ),
            }
          }
          return w
        }),
      )
    },
    [user],
  )

  // Custom Events
  const addCustomEvent = useCallback(
    async (eventData: Omit<CustomEvent, "id">) => {
      if (user) {
        try {
          const created = await customEventsService.create(eventData)
          setCustomEvents((prev) => [...prev, created])
          showToast(`Added event: "${created.title}"`, "success")
          return
        } catch (error) {
          console.error("Failed to create event:", error)
          showToast("Failed to save event", "error")
        }
      }
      const newEvent: CustomEvent = { ...eventData, id: `ce-${Date.now()}` }
      setCustomEvents((prev) => [...prev, newEvent])
      showToast(`Added event: "${newEvent.title}"`, "success")
    },
    [user, showToast],
  )

  const deleteCustomEvent = useCallback(
    async (id: string) => {
      if (user) {
        try {
          await customEventsService.delete(id)
          setCustomEvents((prev) => prev.filter((e) => e.id !== id))
          showToast("Event removed", "info")
          return
        } catch (error) {
          console.error("Failed to delete event:", error)
          showToast("Failed to delete event", "error")
        }
      }
      setCustomEvents((prev) => prev.filter((e) => e.id !== id))
      showToast("Event removed", "info")
    },
    [user, showToast],
  )

  // Profile & Settings
  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (user) {
        try {
          const updated = await userProfileService.update(updates)
          setUserProfile(updated)
          showToast("Profile updated", "success")
          return
        } catch (error) {
          console.error("Failed to update profile:", error)
          showToast("Failed to update profile", "error")
        }
      }
      setUserProfile((prev) => ({ ...prev, ...updates }))
      showToast("Profile updated", "success")
    },
    [user, showToast],
  )

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      if (user) {
        try {
          const updated = await userSettingsService.update(updates)
          setSettings(updated)
          showToast("Settings saved", "info")
          return
        } catch (error) {
          console.error("Failed to update settings:", error)
          showToast("Failed to save settings", "error")
        }
      }
      setSettings((prev) => ({ ...prev, ...updates }))
      showToast("Settings saved", "info")
    },
    [user, showToast],
  )

  // AI Chat / Coach
  const sendMessageToCoach = useCallback(
    async (text: string) => {
      if (!text.trim()) return
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      setChatMessages((prev) => [...prev, userMsg])
      setIsCoachTyping(true)

      try {
        const aiResponseText = await requestAICoachResponse(
          text,
          tasks,
          studySessions,
          workouts,
          subjects,
          userProfile,
        )

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "ai",
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }

        setChatMessages((prev) => [...prev, aiMsg])
      } catch (err) {
        console.error("Failed to get coach response:", err)
        const errMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "ai",
          text: "I encountered an issue analyzing your metrics. Please check your connection and try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        setChatMessages((prev) => [...prev, errMsg])
      } finally {
        setIsCoachTyping(false)
      }
    },
    [tasks, studySessions, workouts, subjects, userProfile],
  )

  const clearChatHistory = useCallback(async () => {
    if (user) {
      try {
        await chatMessagesService.clear()
        setChatMessages([initialChatMessages[0]])
        showToast("Chat history cleared", "info")
        return
      } catch (error) {
        console.error("Failed to clear chat history:", error)
        showToast("Failed to clear chat history", "error")
      }
    }
    setChatMessages([initialChatMessages[0]])
    showToast("Chat history cleared", "info")
  }, [user, showToast])

  // Data management
  const exportDataJSON = useCallback(async () => {
    try {
      let jsonStr: string
      if (user) {
        // Export from Supabase
        const [
          tasksData,
          subjectsData,
          sessionsData,
          workoutsData,
          eventsData,
          profileData,
          settingsData,
        ] = await Promise.all([
          tasksService.getAll(),
          subjectsService.getAll(),
          studySessionsService.getAll(),
          workoutsService.getAll(),
          customEventsService.getAll(),
          userProfileService.get(),
          userSettingsService.get(),
        ])

        const backup = {
          version: "1.0.0",
          exportedAt: new Date().toISOString(),
          userProfile: profileData,
          settings: settingsData,
          tasks: tasksData,
          subjects: subjectsData,
          studySessions: sessionsData,
          workouts: workoutsData,
          customEvents: eventsData,
        }
        jsonStr = JSON.stringify(backup, null, 2)
      } else {
        // Fallback to localStorage
        jsonStr = storageService.exportAllDataJSON()
      }

      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `lifetrack-ai-backup-${getTodayDateStr()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showToast("Exported all LifeTrack data as JSON", "success")
    } catch (error) {
      console.error("Failed to export data:", error)
      showToast("Failed to export data", "error")
    }
  }, [user, showToast])

  const clearAllData = useCallback(async () => {
    if (user) {
      // For authenticated users, we don't clear cloud data - only local cache
      // This is a safety measure to prevent accidental data loss
      showToast("Cloud data preserved. Local cache cleared.", "info")
      setTasks([])
      setSubjects([])
      setStudySessions([])
      setWorkouts([])
      setCustomEvents([])
      setChatMessages([initialChatMessages[0]])
      setFocusTimer(initialFocusTimer)
      return
    }

    storageService.clearAllData()
    setTasks([])
    setSubjects([])
    setStudySessions([])
    setWorkouts([])
    setCustomEvents([])
    setChatMessages([])
    setFocusTimer(initialFocusTimer)
    showToast("Local application data wiped", "warning")
  }, [user, showToast])

  const resetSampleData = useCallback(() => {
    if (user) {
      showToast(
        "Cannot reset demo data while signed in. Sign out first.",
        "warning",
      )
      return
    }

    storageService.clearAllData()
    setTasks(initialTasks)
    setSubjects(initialSubjects)
    setStudySessions(initialStudySessions)
    setWorkouts(initialWorkouts)
    setCustomEvents(initialCustomEvents)
    setUserProfile(initialProfile)
    setSettings(initialSettings)
    setChatMessages(initialChatMessages)
    setFocusTimer(initialFocusTimer)
    showToast("Reset data to default demonstration dataset", "success")
  }, [user, showToast])

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        coachPrefillPrompt,
        setCoachPrefillPrompt,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        studySessions,
        addStudySession,
        deleteStudySession,
        focusTimer,
        startFocusTimer,
        pauseFocusTimer,
        resumeFocusTimer,
        resetFocusTimer,
        finishFocusTimerSession,
        updateFocusTimerDetails,
        workouts,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        toggleWorkoutStatus,
        addExerciseToWorkout,
        addSetToExercise,
        deleteSetFromExercise,
        updateSetInExercise,
        customEvents,
        addCustomEvent,
        deleteCustomEvent,
        userProfile,
        updateUserProfile,
        settings,
        updateSettings,
        theme: settings.theme,
        colorTheme,
        isDark,
        setTheme,
        setColorTheme,
        toggleTheme,
        chatMessages,
        sendMessageToCoach,
        clearChatHistory,
        isCoachTyping,
        showToast,
        exportDataJSON,
        clearAllData,
        resetSampleData,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
