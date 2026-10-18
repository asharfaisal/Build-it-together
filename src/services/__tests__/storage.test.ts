import { describe, it, expect, vi, beforeEach } from "vitest"
import { storageService, getTodayDateStr, getRelativeDateStr } from "../storage"
import type { Task, Subject, StudySession, Workout } from "../../types"

describe("storageService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage using the actual API
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("lifetrack_")) {
        localStorage.removeItem(key)
      }
    })
  })

  describe("getTodayDateStr", () => {
    it("returns today in YYYY-MM-DD format", () => {
      const result = getTodayDateStr()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe("getRelativeDateStr", () => {
    it("returns correct date for offset", () => {
      const today = getTodayDateStr()
      const tomorrow = getRelativeDateStr(1)
      const yesterday = getRelativeDateStr(-1)

      expect(tomorrow).not.toBe(today)
      expect(yesterday).not.toBe(today)
    })
  })

  describe("loadTasks", () => {
    it("returns empty array when localStorage is empty (new users start fresh)", () => {
      // Ensure clean state
      localStorage.removeItem("lifetrack_tasks_v1")
      const tasks = storageService.loadTasks()
      expect(tasks).toHaveLength(0) // initialTasks is now empty for fresh start
    })

    it("returns parsed tasks from localStorage", () => {
      const customTasks: Task[] = [
        {
          id: "custom-1",
          title: "Custom Task",
          desc: "",
          priority: "High",
          dueDate: getTodayDateStr(),
          estMinutes: 30,
          done: false,
          createdAt: getTodayDateStr(),
        },
      ]
      localStorage.setItem("lifetrack_tasks_v1", JSON.stringify(customTasks))

      const tasks = storageService.loadTasks()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe("Custom Task")
    })
  })

  describe("saveTasks", () => {
    it("saves tasks to localStorage", () => {
      const tasks: Task[] = [
        {
          id: "test-1",
          title: "Test Task",
          desc: "",
          priority: "Medium",
          dueDate: getTodayDateStr(),
          estMinutes: 60,
          done: false,
          createdAt: getTodayDateStr(),
        },
      ]
      storageService.saveTasks(tasks)

      const saved = localStorage.getItem("lifetrack_tasks_v1")
      expect(saved).toBeTruthy()
      expect(JSON.parse(saved!)).toEqual(tasks)
    })
  })

  describe("clearAllData", () => {
    it("removes all storage keys", () => {
      localStorage.setItem("lifetrack_tasks_v1", "[]")
      localStorage.setItem("lifetrack_subjects_v1", "[]")

      storageService.clearAllData()

      expect(localStorage.getItem("lifetrack_tasks_v1")).toBeNull()
      expect(localStorage.getItem("lifetrack_subjects_v1")).toBeNull()
    })
  })

  describe("exportAllDataJSON", () => {
    it("exports valid JSON with all data", () => {
      const jsonStr = storageService.exportAllDataJSON()
      const data = JSON.parse(jsonStr)

      expect(data).toHaveProperty("version")
      expect(data).toHaveProperty("exportedAt")
      expect(data).toHaveProperty("userProfile")
      expect(data).toHaveProperty("settings")
      expect(data).toHaveProperty("tasks")
      expect(data).toHaveProperty("subjects")
      expect(data).toHaveProperty("studySessions")
      expect(data).toHaveProperty("workouts")
      expect(data).toHaveProperty("customEvents")
    })
  })
})
