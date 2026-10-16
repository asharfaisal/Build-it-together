import { storageService, getTodayDateStr } from "./storage"
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
} from "./supabase"
import type {
  Task,
  Subject,
  StudySession,
  Workout,
  CustomEvent,
  AppSettings,
  ChatMessage,
  FocusTimerState,
  UserProfile,
} from "../types"

export interface MigrationPreview {
  tasks: number
  subjects: number
  studySessions: number
  workouts: number
  customEvents: number
  chatMessages: number
  hasProfile: boolean
  hasSettings: boolean
  hasFocusTimer: boolean
}

export interface MigrationResult {
  success: boolean
  imported: {
    tasks: number
    subjects: number
    studySessions: number
    workouts: number
    customEvents: number
    chatMessages: number
    profile: boolean
    settings: boolean
    focusTimer: boolean
  }
  errors: string[]
}

export const dataMigrationService = {
  getPreview(): MigrationPreview {
    return {
      tasks: storageService.loadTasks().length,
      subjects: storageService.loadSubjects().length,
      studySessions: storageService.loadStudySessions().length,
      workouts: storageService.loadWorkouts().length,
      customEvents: storageService.loadCustomEvents().length,
      chatMessages: storageService.loadChatMessages().length,
      hasProfile: true, // Always has profile (initial or saved)
      hasSettings: true, // Always has settings (initial or saved)
      hasFocusTimer: true, // Always has focus timer (initial or saved)
    }
  },

  async migrateAll(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      imported: {
        tasks: 0,
        subjects: 0,
        studySessions: 0,
        workouts: 0,
        customEvents: 0,
        chatMessages: 0,
        profile: false,
        settings: false,
        focusTimer: false,
      },
      errors: [],
    }

    try {
      // 1. Migrate profile first
      try {
        const profile = storageService.loadUserProfile()
        await userProfileService.update(profile)
        result.imported.profile = true
      } catch (e) {
        result.errors.push(
          `Profile: ${e instanceof Error ? e.message : "Unknown error"}`,
        )
      }

      // 2. Migrate settings
      try {
        const settings = storageService.loadSettings()
        await userSettingsService.update(settings)
        result.imported.settings = true
      } catch (e) {
        result.errors.push(
          `Settings: ${e instanceof Error ? e.message : "Unknown error"}`,
        )
      }

      // 3. Migrate subjects (needed for study sessions and focus timer)
      const subjects = storageService.loadSubjects()
      const subjectIdMap = new Map<string, string>()

      for (const subject of subjects) {
        try {
          const created = await subjectsService.create({
            name: subject.name,
            color: subject.color,
            targetHours: subject.targetHours,
            topics: subject.topics,
            notes: subject.notes,
          })
          subjectIdMap.set(subject.id, created.id)
          result.imported.subjects++
        } catch (e) {
          result.errors.push(
            `Subject "${subject.name}": ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
          )
        }
      }

      // 4. Migrate tasks
      const tasks = storageService.loadTasks()
      for (const task of tasks) {
        try {
          await tasksService.create({
            title: task.title,
            desc: task.desc,
            priority: task.priority,
            dueDate: task.dueDate,
            estMinutes: task.estMinutes,
            done: task.done,
            ai: task.ai,
            completedAt: task.completedAt,
          })
          result.imported.tasks++
        } catch (e) {
          result.errors.push(
            `Task "${task.title}": ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
          )
        }
      }

      // 5. Migrate study sessions
      const studySessions = storageService.loadStudySessions()
      for (const session of studySessions) {
        try {
          const newSubjectId =
            subjectIdMap.get(session.subjectId) || session.subjectId
          await studySessionsService.create({
            subjectId: newSubjectId,
            subjectName: session.subjectName,
            topic: session.topic,
            durationMinutes: session.durationMinutes,
            date: session.date,
            notes: session.notes,
          })
          result.imported.studySessions++
        } catch (e) {
          result.errors.push(
            `Study session "${session.topic}": ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
          )
        }
      }

      // 6. Migrate workouts
      const workouts = storageService.loadWorkouts()
      for (const workout of workouts) {
        try {
          await workoutsService.create({
            name: workout.name,
            category: workout.category,
            durationMinutes: workout.durationMinutes,
            status: workout.status,
            date: workout.date,
            color: workout.color,
            completedAt: workout.completedAt,
            exercises: workout.exercises.map((ex) => ({
              id: ex.id,
              name: ex.name,
              personalBestKg: ex.personalBestKg,
              sets: ex.sets.map((s) => ({
                id: s.id,
                setNumber: s.setNumber,
                weightKg: s.weightKg,
                reps: s.reps,
                completed: s.completed,
              })),
            })),
          })
          result.imported.workouts++
        } catch (e) {
          result.errors.push(
            `Workout "${workout.name}": ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
          )
        }
      }

      // 7. Migrate custom events
      const customEvents = storageService.loadCustomEvents()
      for (const event of customEvents) {
        try {
          await customEventsService.create({
            title: event.title,
            date: event.date,
            time: event.time,
            type: event.type,
            color: event.color,
            notes: event.notes,
          })
          result.imported.customEvents++
        } catch (e) {
          result.errors.push(
            `Event "${event.title}": ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
          )
        }
      }

      // 8. Migrate chat messages (keep only recent 50 to avoid clutter)
      const chatMessages = storageService.loadChatMessages().slice(-50)
      if (chatMessages.length > 0) {
        try {
          await chatMessagesService.addBatch(
            chatMessages.map((m) => ({
              role: m.role,
              text: m.text,
              timestamp: m.timestamp,
            })),
          )
          result.imported.chatMessages = chatMessages.length
        } catch (e) {
          result.errors.push(
            `Chat messages: ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
          )
        }
      }

      // 9. Migrate focus timer
      try {
        const timer = storageService.loadFocusTimer()
        if (timer.subjectId) {
          const newSubjectId =
            subjectIdMap.get(timer.subjectId) || timer.subjectId
          await focusTimerService.update({
            subjectId: newSubjectId,
            subjectName: timer.subjectName,
            topic: timer.topic,
            notes: timer.notes,
          })
        }
        result.imported.focusTimer = true
      } catch (e) {
        result.errors.push(
          `Focus timer: ${e instanceof Error ? e.message : "Unknown error"}`,
        )
      }

      result.success = result.errors.length === 0
      return result
    } catch (e) {
      result.errors.push(
        `Migration failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      )
      return result
    }
  },

  // Create a backup of all local data before migration
  createBackup(): string {
    return storageService.exportAllDataJSON()
  },

  // Download backup as file
  downloadBackup(): void {
    const jsonStr = this.createBackup()
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `lifetrack-backup-${getTodayDateStr()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },
}
