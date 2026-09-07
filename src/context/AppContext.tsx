import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
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
  Priority,
  ExerciseSet,
  Exercise,
  FocusTimerState,
} from '../types'
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
} from '../services/storage'
import { ToastItem, ToastType, ToastContainer } from '../components/ui/Toast'
import { generateAICoachResponse } from '../services/aiService'

export type Page =
  | 'dashboard'
  | 'study'
  | 'workout'
  | 'tasks'
  | 'calendar'
  | 'analytics'
  | 'coach'
  | 'settings'

interface AppContextType {
  // Navigation
  page: Page
  setPage: (p: Page) => void
  coachPrefillPrompt: string | null
  setCoachPrefillPrompt: (prompt: string | null) => void

  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void

  // Subjects
  subjects: Subject[]
  addSubject: (subject: Omit<Subject, 'id' | 'studiedMinutes'>) => void
  updateSubject: (id: string, updates: Partial<Subject>) => void
  deleteSubject: (id: string) => void

  // Study Sessions
  studySessions: StudySession[]
  addStudySession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void
  deleteStudySession: (id: string) => void

  // Persistent Focus Timer
  focusTimer: FocusTimerState
  startFocusTimer: (subjectId?: string, subjectName?: string, topic?: string) => void
  pauseFocusTimer: () => void
  resumeFocusTimer: () => void
  resetFocusTimer: () => void
  finishFocusTimerSession: () => void
  updateFocusTimerDetails: (
    updates: Partial<Pick<FocusTimerState, 'subjectId' | 'subjectName' | 'topic' | 'notes'>>
  ) => void

  // Workouts
  workouts: Workout[]
  addWorkout: (workout: Omit<Workout, 'id'>) => void
  updateWorkout: (id: string, updates: Partial<Workout>) => void
  deleteWorkout: (id: string) => void
  toggleWorkoutStatus: (id: string) => void
  addExerciseToWorkout: (workoutId: string, exerciseName: string) => void
  addSetToExercise: (workoutId: string, exerciseId: string, set: Omit<ExerciseSet, 'id'>) => void
  deleteSetFromExercise: (workoutId: string, exerciseId: string, setId: string) => void
  updateSetInExercise: (workoutId: string, exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void

  // Custom Calendar Events
  customEvents: CustomEvent[]
  addCustomEvent: (event: Omit<CustomEvent, 'id'>) => void
  deleteCustomEvent: (id: string) => void

  // User Profile & Settings
  userProfile: UserProfile
  updateUserProfile: (updates: Partial<UserProfile>) => void
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  theme: ThemeMode
  isDark: boolean
  setTheme: (theme: ThemeMode) => void
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
  // Navigation State
  const [page, setPage] = useState<Page>('dashboard')
  const [coachPrefillPrompt, setCoachPrefillPrompt] = useState<string | null>(null)

  // Core Data State loaded from localStorage
  const [tasks, setTasks] = useState<Task[]>(() => storageService.loadTasks())
  const [subjects, setSubjects] = useState<Subject[]>(() => storageService.loadSubjects())
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => storageService.loadStudySessions())
  const [workouts, setWorkouts] = useState<Workout[]>(() => storageService.loadWorkouts())
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>(() => storageService.loadCustomEvents())
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.loadUserProfile())
  const [settings, setSettings] = useState<AppSettings>(() => storageService.loadSettings())
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => storageService.loadChatMessages())
  const [focusTimer, setFocusTimer] = useState<FocusTimerState>(() => storageService.loadFocusTimer())
  const [isCoachTyping, setIsCoachTyping] = useState(false)

  // Toasts State
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    setToasts((prev) => [...prev, { id, message, type, duration }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Sync to localStorage
  useEffect(() => {
    storageService.saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    storageService.saveSubjects(subjects)
  }, [subjects])

  useEffect(() => {
    storageService.saveStudySessions(studySessions)
  }, [studySessions])

  useEffect(() => {
    storageService.saveWorkouts(workouts)
  }, [workouts])

  useEffect(() => {
    storageService.saveCustomEvents(customEvents)
  }, [customEvents])

  useEffect(() => {
    storageService.saveUserProfile(userProfile)
  }, [userProfile])

  useEffect(() => {
    storageService.saveSettings(settings)
  }, [settings])

  useEffect(() => {
    storageService.saveChatMessages(chatMessages)
  }, [chatMessages])

  useEffect(() => {
    storageService.saveFocusTimer(focusTimer)
  }, [focusTimer])

  // Real wall-clock timer tick interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (focusTimer.isActive && !focusTimer.isPaused && focusTimer.startTimestamp) {
      interval = setInterval(() => {
        const now = Date.now()
        const currentSeconds = focusTimer.accumulatedSeconds + Math.floor((now - focusTimer.startTimestamp!) / 1000)
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
  }, [focusTimer.isActive, focusTimer.isPaused, focusTimer.startTimestamp, focusTimer.accumulatedSeconds])

  // Focus Timer Actions
  const startFocusTimer = useCallback(
    (subjectId?: string, subjectName?: string, topic?: string) => {
      const now = Date.now()
      setFocusTimer((prev) => ({
        ...prev,
        isActive: true,
        isPaused: false,
        startTimestamp: now,
        subjectId: subjectId || prev.subjectId || 'sub-1',
        subjectName: subjectName || prev.subjectName || 'SQL & Databases',
        topic: topic !== undefined ? topic : prev.topic,
      }))
      showToast('Focus timer started! ⚡', 'info')
    },
    [showToast]
  )

  const pauseFocusTimer = useCallback(() => {
    const now = Date.now()
    setFocusTimer((prev) => {
      if (!prev.isActive || prev.isPaused) return prev
      const additional = prev.startTimestamp ? Math.floor((now - prev.startTimestamp) / 1000) : 0
      const totalAccumulated = prev.accumulatedSeconds + additional
      return {
        ...prev,
        isPaused: true,
        accumulatedSeconds: totalAccumulated,
        seconds: totalAccumulated,
        startTimestamp: null,
      }
    })
    showToast('Focus timer paused', 'info')
  }, [showToast])

  const resumeFocusTimer = useCallback(() => {
    const now = Date.now()
    setFocusTimer((prev) => ({
      ...prev,
      isActive: true,
      isPaused: false,
      startTimestamp: now,
    }))
    showToast('Focus timer resumed', 'info')
  }, [showToast])

  const resetFocusTimer = useCallback(() => {
    setFocusTimer((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      seconds: 0,
      accumulatedSeconds: 0,
      startTimestamp: null,
      notes: '',
    }))
    showToast('Timer reset', 'info')
  }, [showToast])

  const updateFocusTimerDetails = useCallback(
    (updates: Partial<Pick<FocusTimerState, 'subjectId' | 'subjectName' | 'topic' | 'notes'>>) => {
      setFocusTimer((prev) => ({
        ...prev,
        ...updates,
      }))
    },
    []
  )

  const finishFocusTimerSession = useCallback(() => {
    const now = Date.now()
    const currentElapsed =
      focusTimer.accumulatedSeconds +
      (focusTimer.isActive && !focusTimer.isPaused && focusTimer.startTimestamp
        ? Math.floor((now - focusTimer.startTimestamp) / 1000)
        : 0)

    if (currentElapsed < 1) {
      showToast('Timer stopped (no time recorded)', 'info')
      setFocusTimer({
        ...initialFocusTimer,
        subjectId: focusTimer.subjectId || 'sub-1',
        subjectName: focusTimer.subjectName || 'SQL & Databases',
        topic: focusTimer.topic,
      })
      return
    }

    // Accurate duration calculation:
    // If under 60 seconds (e.g. 15-59s), record as 1 minute so testing/quick focus is preserved
    // If >= 60s, calculate rounded minutes
    const durationMins = currentElapsed < 60 ? 1 : Math.max(1, Math.round(currentElapsed / 60))

    const subName = focusTimer.subjectName || 'General Focus'
    const subId = focusTimer.subjectId || 'sub-1'
    const topic = focusTimer.topic.trim() || 'General Study Session'

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
      })
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
      'success'
    )
  }, [focusTimer, showToast])

  // Theme resolution
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const isDark = settings.theme === 'system' ? systemDark : settings.theme === 'dark'

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }))
  }, [])

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }, [])

  // Task Actions
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt'>) => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => [newTask, ...prev])
      showToast(`Added task: "${newTask.title}"`, 'success')
    },
    [showToast]
  )

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      )
      showToast('Task updated', 'info')
    },
    [showToast]
  )

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      showToast('Task removed', 'info')
    },
    [showToast]
  )

  const toggleTask = useCallback(
    (id: string) => {
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
        })
      )
    },
    []
  )

  // Subject Actions
  const addSubject = useCallback(
    (subjectData: Omit<Subject, 'id' | 'studiedMinutes'>) => {
      const newSub: Subject = {
        ...subjectData,
        id: `sub-${Date.now()}`,
        studiedMinutes: 0,
      }
      setSubjects((prev) => [...prev, newSub])
      showToast(`Added subject: "${newSub.name}"`, 'success')
    },
    [showToast]
  )

  const updateSubject = useCallback(
    (id: string, updates: Partial<Subject>) => {
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      )
      showToast('Subject updated', 'info')
    },
    [showToast]
  )

  const deleteSubject = useCallback(
    (id: string) => {
      setSubjects((prev) => prev.filter((s) => s.id !== id))
      showToast('Subject deleted', 'info')
    },
    [showToast]
  )

  // Study Session Actions (Manual)
  const addStudySession = useCallback(
    (sessionData: Omit<StudySession, 'id' | 'timestamp'>) => {
      const newSession: StudySession = {
        ...sessionData,
        id: `ss-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
      setStudySessions((prev) => [newSession, ...prev])

      // Update subject studied minutes and lastStudied date
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id === sessionData.subjectId || s.name.toLowerCase() === sessionData.subjectName.toLowerCase()) {
            return {
              ...s,
              studiedMinutes: s.studiedMinutes + sessionData.durationMinutes,
              lastStudied: sessionData.date || getTodayDateStr(),
            }
          }
          return s
        })
      )

      showToast(
        `Recorded ${sessionData.durationMinutes}m study session for ${sessionData.subjectName}!`,
        'success'
      )
    },
    [showToast]
  )

  const deleteStudySession = useCallback(
    (id: string) => {
      const session = studySessions.find((s) => s.id === id)
      if (session) {
        setSubjects((prev) =>
          prev.map((s) => {
            if (s.id === session.subjectId || s.name.toLowerCase() === session.subjectName.toLowerCase()) {
              return {
                ...s,
                studiedMinutes: Math.max(0, s.studiedMinutes - session.durationMinutes),
              }
            }
            return s
          })
        )
      }
      setStudySessions((prev) => prev.filter((s) => s.id !== id))
      showToast('Study session deleted', 'info')
    },
    [studySessions, showToast]
  )

  // Workout Actions
  const addWorkout = useCallback(
    (workoutData: Omit<Workout, 'id'>) => {
      const newWorkout: Workout = {
        ...workoutData,
        id: `wo-${Date.now()}`,
      }
      setWorkouts((prev) => [newWorkout, ...prev])
      showToast(`Created workout: "${newWorkout.name}"`, 'success')
    },
    [showToast]
  )

  const updateWorkout = useCallback(
    (id: string, updates: Partial<Workout>) => {
      setWorkouts((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
      )
      showToast('Workout updated', 'info')
    },
    [showToast]
  )

  const deleteWorkout = useCallback(
    (id: string) => {
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
      showToast('Workout deleted', 'info')
    },
    [showToast]
  )

  const toggleWorkoutStatus = useCallback(
    (id: string) => {
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id === id) {
            const newStatus = w.status === 'Completed' ? 'Planned' : 'Completed'
            return {
              ...w,
              status: newStatus,
              completedAt: newStatus === 'Completed' ? new Date().toISOString() : undefined,
            }
          }
          return w
        })
      )
      showToast('Workout status updated', 'success')
    },
    [showToast]
  )

  const addExerciseToWorkout = useCallback(
    (workoutId: string, exerciseName: string) => {
      const newExercise: Exercise = {
        id: `ex-${Date.now()}`,
        name: exerciseName,
        sets: [
          { id: `s-${Date.now()}-1`, setNumber: 1, weightKg: 20, reps: 10, completed: true },
        ],
      }
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId
            ? { ...w, exercises: [...w.exercises, newExercise] }
            : w
        )
      )
      showToast(`Added exercise: ${exerciseName}`, 'info')
    },
    [showToast]
  )

  const addSetToExercise = useCallback(
    (workoutId: string, exerciseId: string, setData: Omit<ExerciseSet, 'id'>) => {
      const newSet: ExerciseSet = {
        ...setData,
        id: `s-${Date.now()}`,
      }
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id === workoutId) {
            return {
              ...w,
              exercises: w.exercises.map((ex) => {
                if (ex.id === exerciseId) {
                  return {
                    ...ex,
                    sets: [...ex.sets, newSet],
                  }
                }
                return ex
              }),
            }
          }
          return w
        })
      )
      showToast(`Logged Set ${setData.setNumber}: ${setData.weightKg}kg × ${setData.reps}`, 'success')
    },
    [showToast]
  )

  const deleteSetFromExercise = useCallback(
    (workoutId: string, exerciseId: string, setId: string) => {
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id === workoutId) {
            return {
              ...w,
              exercises: w.exercises.map((ex) => {
                if (ex.id === exerciseId) {
                  return {
                    ...ex,
                    sets: ex.sets.filter((s) => s.id !== setId),
                  }
                }
                return ex
              }),
            }
          }
          return w
        })
      )
    },
    []
  )

  const updateSetInExercise = useCallback(
    (workoutId: string, exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id === workoutId) {
            return {
              ...w,
              exercises: w.exercises.map((ex) => {
                if (ex.id === exerciseId) {
                  return {
                    ...ex,
                    sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
                  }
                }
                return ex
              }),
            }
          }
          return w
        })
      )
    },
    []
  )

  // Custom Events
  const addCustomEvent = useCallback(
    (eventData: Omit<CustomEvent, 'id'>) => {
      const newEvent: CustomEvent = {
        ...eventData,
        id: `ce-${Date.now()}`,
      }
      setCustomEvents((prev) => [...prev, newEvent])
      showToast(`Added event: "${newEvent.title}"`, 'success')
    },
    [showToast]
  )

  const deleteCustomEvent = useCallback(
    (id: string) => {
      setCustomEvents((prev) => prev.filter((e) => e.id !== id))
      showToast('Event removed', 'info')
    },
    [showToast]
  )

  // Profile & Settings
  const updateUserProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setUserProfile((prev) => ({ ...prev, ...updates }))
      showToast('Profile updated', 'success')
    },
    [showToast]
  )

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }))
      showToast('Settings saved', 'info')
    },
    [showToast]
  )

  // AI Chat / Coach
  const sendMessageToCoach = useCallback(
    (text: string) => {
      if (!text.trim()) return
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setChatMessages((prev) => [...prev, userMsg])
      setIsCoachTyping(true)

      // Compute contextual response based on actual current state
      setTimeout(() => {
        const aiResponseText = generateAICoachResponse(
          text,
          tasks,
          studySessions,
          workouts,
          subjects,
          userProfile
        )

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }

        setChatMessages((prev) => [...prev, aiMsg])
        setIsCoachTyping(false)
      }, 750)
    },
    [tasks, studySessions, workouts, subjects, userProfile]
  )

  const clearChatHistory = useCallback(() => {
    setChatMessages([initialChatMessages[0]])
    showToast('Chat history cleared', 'info')
  }, [showToast])

  // Data management
  const exportDataJSON = useCallback(() => {
    const jsonStr = storageService.exportAllDataJSON()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lifetrack-ai-backup-${getTodayDateStr()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Exported all LifeTrack data as JSON', 'success')
  }, [showToast])

  const clearAllData = useCallback(() => {
    storageService.clearAllData()
    setTasks([])
    setSubjects([])
    setStudySessions([])
    setWorkouts([])
    setCustomEvents([])
    setChatMessages([])
    setFocusTimer(initialFocusTimer)
    showToast('Local application data wiped', 'warning')
  }, [showToast])

  const resetSampleData = useCallback(() => {
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
    showToast('Reset data to default demonstration dataset', 'success')
  }, [showToast])

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
        isDark,
        setTheme,
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
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
