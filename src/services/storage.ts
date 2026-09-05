import {
  Task,
  Subject,
  StudySession,
  Workout,
  CustomEvent,
  UserProfile,
  AppSettings,
  ChatMessage,
} from '../types'

const STORAGE_KEYS = {
  TASKS: 'lifetrack_tasks_v1',
  SUBJECTS: 'lifetrack_subjects_v1',
  STUDY_SESSIONS: 'lifetrack_study_sessions_v1',
  WORKOUTS: 'lifetrack_workouts_v1',
  CUSTOM_EVENTS: 'lifetrack_custom_events_v1',
  USER_PROFILE: 'lifetrack_user_profile_v1',
  SETTINGS: 'lifetrack_settings_v1',
  CHAT_MESSAGES: 'lifetrack_chat_messages_v1',
}

// Utility to get today's date formatted as YYYY-MM-DD
export function getTodayDateStr(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

// Utility to get relative date (offset in days)
export function getRelativeDateStr(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

// Initial default seed dataset
export const initialProfile: UserProfile = {
  name: 'Muhammad',
  email: 'muhammad@email.com',
  avatar: 'M',
  tier: 'Premium',
  dailyStudyGoalHours: 4,
  pomodoroMinutes: 45,
  workoutGoalPerWeek: 4,
}

export const initialSettings: AppSettings = {
  theme: 'dark',
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

export const initialSubjects: Subject[] = [
  {
    id: 'sub-1',
    name: 'SQL & Databases',
    color: '#19b88f',
    targetHours: 12,
    studiedMinutes: 520, // 8h 40m
    lastStudied: getTodayDateStr(),
    topics: ['JOIN Operations', 'Window Functions', 'Query Optimization', 'Indexes & Views'],
    notes: 'Focus on complex CTEs and subquery indexing.',
  },
  {
    id: 'sub-2',
    name: 'Power BI & DAX',
    color: '#5b8def',
    targetHours: 10,
    studiedMinutes: 340, // 5h 40m
    lastStudied: getRelativeDateStr(-1),
    topics: ['CALCULATE & Filter Context', 'Time Intelligence', 'Data Modeling Star Schema'],
    notes: 'Master CALCULATE filter context transitions.',
  },
  {
    id: 'sub-3',
    name: 'Database Systems',
    color: '#f59e0b',
    targetHours: 8,
    studiedMinutes: 420, // 7h
    lastStudied: getRelativeDateStr(-2),
    topics: ['ACID Properties', 'B+ Trees', 'Distributed Transactions', 'Concurrency Control'],
    notes: 'Prepare slides for Thursday presentation.',
  },
  {
    id: 'sub-4',
    name: 'Mathematics',
    color: '#e45b5b',
    targetHours: 6,
    studiedMinutes: 235, // 3h 55m
    lastStudied: getRelativeDateStr(-3),
    topics: ['Differential Equations', 'Linear Algebra', 'Eigenvalues', 'Fourier Transform'],
    notes: 'Practice problem sets 5 and 6.',
  },
  {
    id: 'sub-5',
    name: 'Programming & Algorithms',
    color: '#a78bfa',
    targetHours: 15,
    studiedMinutes: 760, // 12h 40m
    lastStudied: getTodayDateStr(),
    topics: ['Dynamic Programming', 'Graph Algorithms', 'Trees & Tries', 'Python OOP'],
    notes: 'Finish assignment 3 on linked lists.',
  },
]

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Complete SQL Assignment #4',
    desc: 'Finish all advanced JOIN exercises and submit to portal',
    priority: 'High',
    dueDate: getTodayDateStr(),
    estMinutes: 90,
    done: false,
    ai: true,
    createdAt: getRelativeDateStr(-1),
  },
  {
    id: 'task-2',
    title: 'Review Power BI Sales Dashboard',
    desc: 'Audit KPI accuracy and refine DAX measure formatting',
    priority: 'High',
    dueDate: getTodayDateStr(),
    estMinutes: 45,
    done: false,
    createdAt: getRelativeDateStr(-2),
  },
  {
    id: 'task-3',
    title: 'Study Mathematics Chapter 5',
    desc: 'Solve second-order differential equations practice set',
    priority: 'Medium',
    dueDate: getTodayDateStr(),
    estMinutes: 60,
    done: true,
    completedAt: `${getTodayDateStr()}T11:30:00Z`,
    createdAt: getRelativeDateStr(-1),
  },
  {
    id: 'task-4',
    title: 'Prepare Database Presentation',
    desc: 'Create 12 slides on distributed transaction protocols for seminar',
    priority: 'Medium',
    dueDate: getRelativeDateStr(2),
    estMinutes: 120,
    done: false,
    createdAt: getRelativeDateStr(-1),
  },
  {
    id: 'task-5',
    title: 'Programming Assignment #3 (Python)',
    desc: 'Implement doubly linked list and benchmark with pytest',
    priority: 'High',
    dueDate: getRelativeDateStr(3),
    estMinutes: 180,
    done: false,
    ai: true,
    createdAt: getTodayDateStr(),
  },
  {
    id: 'task-6',
    title: 'Lab Report — Data Warehousing',
    desc: 'Document ETL pipeline benchmark results and cluster metrics',
    priority: 'Low',
    dueDate: getRelativeDateStr(-2),
    estMinutes: 45,
    done: false,
    createdAt: getRelativeDateStr(-4),
  },
  {
    id: 'task-7',
    title: 'Read Academic Paper on Raft Consensus',
    desc: 'Summarize leader election and log replication guarantees',
    priority: 'Low',
    dueDate: getRelativeDateStr(4),
    estMinutes: 60,
    done: false,
    createdAt: getTodayDateStr(),
  },
  {
    id: 'task-8',
    title: 'Optimize Database Indexing Benchmark',
    desc: 'Profile query execution plans using EXPLAIN ANALYZE',
    priority: 'Medium',
    dueDate: getTodayDateStr(),
    estMinutes: 50,
    done: true,
    completedAt: `${getTodayDateStr()}T09:15:00Z`,
    createdAt: getRelativeDateStr(-1),
  },
]

export const initialStudySessions: StudySession[] = [
  {
    id: 'ss-1',
    subjectId: 'sub-1',
    subjectName: 'SQL & Databases',
    topic: 'JOIN Operations & Indexing',
    durationMinutes: 90,
    date: getTodayDateStr(),
    timestamp: `${getTodayDateStr()}T08:00:00Z`,
    notes: 'Practiced multiple table joins and execution plans.',
  },
  {
    id: 'ss-2',
    subjectId: 'sub-5',
    subjectName: 'Programming & Algorithms',
    topic: 'Graph Traversal (BFS / DFS)',
    durationMinutes: 65,
    date: getTodayDateStr(),
    timestamp: `${getTodayDateStr()}T14:00:00Z`,
    notes: 'Implemented recursive and iterative depth-first search.',
  },
  {
    id: 'ss-3',
    subjectId: 'sub-2',
    subjectName: 'Power BI & DAX',
    topic: 'CALCULATE filter modifier functions',
    durationMinutes: 75,
    date: getRelativeDateStr(-1),
    timestamp: `${getRelativeDateStr(-1)}T19:00:00Z`,
    notes: 'Tested USERELATIONSHIP and ALLSELECTED functions.',
  },
  {
    id: 'ss-4',
    subjectId: 'sub-3',
    subjectName: 'Database Systems',
    topic: 'Two-Phase Locking & Isolation Levels',
    durationMinutes: 110,
    date: getRelativeDateStr(-2),
    timestamp: `${getRelativeDateStr(-2)}T10:30:00Z`,
    notes: 'Understood phantom reads and snapshot isolation.',
  },
  {
    id: 'ss-5',
    subjectId: 'sub-1',
    subjectName: 'SQL & Databases',
    topic: 'Window Functions (ROW_NUMBER, DENSE_RANK)',
    durationMinutes: 120,
    date: getRelativeDateStr(-3),
    timestamp: `${getRelativeDateStr(-3)}T15:00:00Z`,
    notes: 'Solved 10 LeetCode SQL hard problems.',
  },
  {
    id: 'ss-6',
    subjectId: 'sub-4',
    subjectName: 'Mathematics',
    topic: 'Matrix Decomposition & SVD',
    durationMinutes: 80,
    date: getRelativeDateStr(-4),
    timestamp: `${getRelativeDateStr(-4)}T09:00:00Z`,
    notes: 'Linear algebra review for machine learning.',
  },
  {
    id: 'ss-7',
    subjectId: 'sub-5',
    subjectName: 'Programming & Algorithms',
    topic: 'Dynamic Programming on Trees',
    durationMinutes: 130,
    date: getRelativeDateStr(-5),
    timestamp: `${getRelativeDateStr(-5)}T16:00:00Z`,
    notes: 'Tree DP maximum path sum problem.',
  },
  {
    id: 'ss-8',
    subjectId: 'sub-1',
    subjectName: 'SQL & Databases',
    topic: 'PostgreSQL JSONB queries & GIN indexes',
    durationMinutes: 95,
    date: getRelativeDateStr(-6),
    timestamp: `${getRelativeDateStr(-6)}T11:00:00Z`,
    notes: 'Configured inverted indexing on document fields.',
  },
]

export const initialWorkouts: Workout[] = [
  {
    id: 'wo-1',
    name: 'Upper Body Power',
    category: 'Upper Body',
    durationMinutes: 55,
    status: 'Completed',
    date: getTodayDateStr(),
    color: '#19b88f',
    completedAt: `${getTodayDateStr()}T17:30:00Z`,
    exercises: [
      {
        id: 'ex-1',
        name: 'Bench Press',
        personalBestKg: 85,
        sets: [
          { id: 's-1', setNumber: 1, weightKg: 60, reps: 10, completed: true },
          { id: 's-2', setNumber: 2, weightKg: 70, reps: 8, completed: true },
          { id: 's-3', setNumber: 3, weightKg: 80, reps: 6, completed: true },
          { id: 's-4', setNumber: 4, weightKg: 85, reps: 4, completed: true },
        ],
      },
      {
        id: 'ex-2',
        name: 'Lat Pulldown',
        personalBestKg: 75,
        sets: [
          { id: 's-5', setNumber: 1, weightKg: 55, reps: 12, completed: true },
          { id: 's-6', setNumber: 2, weightKg: 65, reps: 10, completed: true },
          { id: 's-7', setNumber: 3, weightKg: 75, reps: 8, completed: true },
        ],
      },
      {
        id: 'ex-3',
        name: 'Shoulder Overhead Press',
        personalBestKg: 55,
        sets: [
          { id: 's-8', setNumber: 1, weightKg: 40, reps: 10, completed: true },
          { id: 's-9', setNumber: 2, weightKg: 50, reps: 8, completed: true },
          { id: 's-10', setNumber: 3, weightKg: 55, reps: 6, completed: true },
        ],
      },
      {
        id: 'ex-4',
        name: 'Incline Dumbbell Curl',
        personalBestKg: 18,
        sets: [
          { id: 's-11', setNumber: 1, weightKg: 14, reps: 12, completed: true },
          { id: 's-12', setNumber: 2, weightKg: 16, reps: 10, completed: true },
          { id: 's-13', setNumber: 3, weightKg: 18, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'wo-2',
    name: 'Lower Body Strength',
    category: 'Legs',
    durationMinutes: 50,
    status: 'Completed',
    date: getRelativeDateStr(-2),
    color: '#5b8def',
    completedAt: `${getRelativeDateStr(-2)}T18:00:00Z`,
    exercises: [
      {
        id: 'ex-5',
        name: 'Barbell Squat',
        personalBestKg: 110,
        sets: [
          { id: 's-14', setNumber: 1, weightKg: 80, reps: 8, completed: true },
          { id: 's-15', setNumber: 2, weightKg: 95, reps: 6, completed: true },
          { id: 's-16', setNumber: 3, weightKg: 110, reps: 4, completed: true },
        ],
      },
      {
        id: 'ex-6',
        name: 'Romanian Deadlift',
        personalBestKg: 100,
        sets: [
          { id: 's-17', setNumber: 1, weightKg: 70, reps: 10, completed: true },
          { id: 's-18', setNumber: 2, weightKg: 85, reps: 8, completed: true },
          { id: 's-19', setNumber: 3, weightKg: 100, reps: 6, completed: true },
        ],
      },
      {
        id: 'ex-7',
        name: 'Standing Calf Raise',
        personalBestKg: 60,
        sets: [
          { id: 's-20', setNumber: 1, weightKg: 50, reps: 15, completed: true },
          { id: 's-21', setNumber: 2, weightKg: 60, reps: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'wo-3',
    name: 'HIIT & Core Conditioning',
    category: 'Cardio',
    durationMinutes: 35,
    status: 'Completed',
    date: getRelativeDateStr(-4),
    color: '#f59e0b',
    completedAt: `${getRelativeDateStr(-4)}T07:30:00Z`,
    exercises: [
      {
        id: 'ex-8',
        name: 'Treadmill Interval Sprints',
        sets: [
          { id: 's-22', setNumber: 1, weightKg: 0, reps: 10, completed: true },
        ],
      },
      {
        id: 'ex-9',
        name: 'Hanging Leg Raise',
        sets: [
          { id: 's-23', setNumber: 1, weightKg: 0, reps: 15, completed: true },
          { id: 's-24', setNumber: 2, weightKg: 0, reps: 15, completed: true },
          { id: 's-25', setNumber: 3, weightKg: 0, reps: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'wo-4',
    name: 'Push Hypertrophy',
    category: 'Push',
    durationMinutes: 45,
    status: 'Completed',
    date: getRelativeDateStr(-6),
    color: '#a78bfa',
    completedAt: `${getRelativeDateStr(-6)}T17:00:00Z`,
    exercises: [
      {
        id: 'ex-10',
        name: 'Incline Dumbbell Press',
        personalBestKg: 32,
        sets: [
          { id: 's-26', setNumber: 1, weightKg: 24, reps: 10, completed: true },
          { id: 's-27', setNumber: 2, weightKg: 28, reps: 8, completed: true },
          { id: 's-28', setNumber: 3, weightKg: 32, reps: 6, completed: true },
        ],
      },
      {
        id: 'ex-11',
        name: 'Cable Lateral Raise',
        personalBestKg: 14,
        sets: [
          { id: 's-29', setNumber: 1, weightKg: 10, reps: 15, completed: true },
          { id: 's-30', setNumber: 2, weightKg: 12, reps: 12, completed: true },
          { id: 's-31', setNumber: 3, weightKg: 14, reps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'wo-5',
    name: 'Pull & Back Focus',
    category: 'Pull',
    durationMinutes: 45,
    status: 'Planned',
    date: getRelativeDateStr(1),
    color: '#19b88f',
    exercises: [
      {
        id: 'ex-12',
        name: 'Weighted Pull-ups',
        personalBestKg: 15,
        sets: [
          { id: 's-32', setNumber: 1, weightKg: 0, reps: 10, completed: false },
          { id: 's-33', setNumber: 2, weightKg: 10, reps: 6, completed: false },
          { id: 's-34', setNumber: 3, weightKg: 15, reps: 4, completed: false },
        ],
      },
      {
        id: 'ex-13',
        name: 'Barbell Bent Over Row',
        personalBestKg: 70,
        sets: [
          { id: 's-35', setNumber: 1, weightKg: 50, reps: 10, completed: false },
          { id: 's-36', setNumber: 2, weightKg: 60, reps: 8, completed: false },
          { id: 's-37', setNumber: 3, weightKg: 70, reps: 6, completed: false },
        ],
      },
    ],
  },
]

export const initialCustomEvents: CustomEvent[] = [
  {
    id: 'ce-1',
    title: 'University Database Systems Lecture',
    date: getTodayDateStr(),
    time: '10:30 AM',
    type: 'uni',
    color: '#5b8def',
    notes: 'Hall B - Prof. Henderson on Query Optimization',
  },
  {
    id: 'ce-2',
    title: 'AI Lab Discussion & Standup',
    date: getRelativeDateStr(2),
    time: '02:00 PM',
    type: 'ai',
    color: '#a78bfa',
    notes: 'Review neural graph architecture progress',
  },
]

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'ai',
    text: "Hi Muhammad! I'm your AI Coach. I've synced your real tasks, study sessions, workouts, and streaks. What would you like to plan or analyze today?",
    timestamp: '8:00 AM',
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
      console.error('Failed to save tasks', e)
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
      console.error('Failed to save subjects', e)
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
      console.error('Failed to save study sessions', e)
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
      console.error('Failed to save workouts', e)
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
      console.error('Failed to save custom events', e)
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
      console.error('Failed to save user profile', e)
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
      console.error('Failed to save settings', e)
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
      console.error('Failed to save chat messages', e)
    }
  },

  exportAllDataJSON(): string {
    const backup = {
      version: '1.0.0',
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
